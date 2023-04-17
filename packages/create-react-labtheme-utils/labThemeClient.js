/**
 * Copyright (c) 2023-present, https://github.com/ThiagoSGomes-Dev
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var labThemeClient = {
    hash: null,
    socket: null,
    start: function(wsHostProtocol, wsHostname, wsPort) {
        var hostProtocol = null;
        switch (wsHostProtocol) {
            case "ws":
            case "wss":
                hostProtocol = wsHostProtocol;
                break;
            default:
                console.log(`LABTHEME CLIENT: configHostProtocol is not "ws" or "wss": ` + new String(wsHostProtocol));
                console.error("This is a bug. Please report to: https://github.com/ThiagoSGomes-Dev/create-react-labtheme/issues");
                return;
        }

        if (wsHostname !== "__from-window__") {
            if (typeof wsHostname !== "string" && wsHostname.length <= 0) {
                console.log("LABTHEME CLIENT: hostname is not '__from-window__' or a non-empty string: ", wsHostname);
                return;
            }
        }

        var parsedConfigPort = null;
        if (wsPort !== "__from-window__") {
            parsedConfigPort = parseInt(wsPort, 10);
            if (typeof parsedConfigPort !== "number") {
                console.log("LABTHEME CLIENT: port is not '__from-window__' or a number: ", wsPort);
                return;
            }
        }

        var hostName = wsHostname === "__from-window__" ? window.location.hostname : wsHostname;
        var portNum = wsPort === "__from-window__" ? window.location.port : parsedConfigPort;
        var hostURL = hostProtocol + "://" + hostName + ":" + portNum;

        var newlyReloaded = true;

        labThemeClient.socket = new WebSocket(hostURL);
        labThemeClient.socket.onmessage = function(response) {
            if (response && typeof response.data === "string") {
                try {
                    var msg = JSON.parse(response.data);

                    if (msg) {
                        var msgHash = msg && msg.stats && msg.stats.hash;

                        if (msg.type === "content-changed") {
                            if (msg.stats.errors && msg.stats.errors.length > 0) {
                                msg.type = "errors";
                            }
                            if (msg.stats.warnings && msg.stats.warnings.length > 0) {
                                msg.type = "warnings";
                            }
                        }

                        switch (msg.type) {
                            case "content-changed":
                                if (!newlyReloaded || (labThemeClient.hash === null || (typeof msgHash === "string" && msgHash.length > 0 && msgHash !== labThemeClient.hash))) {
                                    // Webpack successfully creates a new compile if there are only warnings (unlike errors which do not compile at all).
                                    window.location.reload();
                                }
                                break;
                            case "errors":
                                try {
                                    labThemeErrorOverlay.handleErrors(msg.stats.errors);
                                } catch (err) {
                                    console.log("'errors' try block error:", err);
                                    console.log("Compile ERRORS", msg);
                                }
                                break;
                            case "hash-check":
                                if (labThemeClient.hash === null) {
                                    labThemeClient.hash = msgHash;
                                    setTimeout(() => {
                                        // In 500ms, let's double-check we have the latest hash... a build on the server may have gotten missed.
                                        if (labThemeClient.socket && labThemeClient.socket.send) {
                                            var msgJson = JSON.stringify({
                                                type: "hash-check"
                                            });

                                            labThemeClient.socket.send(msgJson);
                                        }
                                    }, 500);
                                } else if (!newlyReloaded && typeof labThemeClient.hash === "string" && labThemeClient.hash !== msgHash) {
                                    window.location.reload();
                                }
                                break;
                            case "warnings":
                                try {
                                    labThemeErrorOverlay.handleWarnings(msg.stats.warnings);
                                    if (!newlyReloaded) {
                                        // Webpack successfully creates a new compile if there are only warnings (unlike errors which do not compile at all).
                                        window.location.reload();
                                    }
                                } catch (err) {
                                    console.log("'warnings' try block error:", err);
                                    console.log("Compile WARNINGS", err, msg);
                                }
                                break;
                        }
                    }
                } catch (err) {
                    if (console && typeof console.error === "function") {
                        console.error(err);
                        console.log("Raw websocket message:", response);
                    }
                }

                newlyReloaded = false;
                labThemeClient.hash = typeof msgHash === "string" && msgHash.length > 0 ? msgHash : null;
            }
        };

        labThemeClient.socket.onclose = function() {
            if (console && typeof console.info === "function") {
                switch (labThemeClient.socket.readyState) {
                    case labThemeClient.socket.CLOSED:
                    case labThemeClient.socket.CLOSING:
                        setTimeout(() => {
                            console.info("It's possible the browser refresh server has disconnected.\nYou can manually refresh the page if necessary.");
                        }, 1000);
                        break;
                }
            }
        };

        labThemeClient.socket.onopen = function() {
            if (console && typeof console.clear === "function") {
                //console.clear();
                console.info("The browser refresh server is connected.");
            }
        };
    }
};
