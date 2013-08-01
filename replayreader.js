/*jslint vars: true*/

function invertColor(color) {
    "use strict";
    if (color === "black") {
        return "white";
    } else if (color === "white") {
        return "black";
    } else {
        throw "invalid color: " + color;
    }
}

(function (exports) {
    "use strict";



    function SgrReader(plaintext) {
        this.messages = plaintext.split("\n\n\n");
        this.messagecount = 3; //Skip ServerInfo + 2xGameInfo
        this.parseMessage = function (i) {
            return JSON.parse(this.messages[i]);
        };
        this.nextMessage = function () {
            if (this.messagecount === this.messages.length) {
                throw "no messages left";
            }
            this.messagecount += 1;
            return this.parseMessage(this.messagecount - 1);
        };
        this.getHeaders = function () {
            var servInfo = this.parseMessage(0), gameInfo = this.parseMessage(1);
            return {
                "version": servInfo.version,
                "black" : gameInfo.black,
                "white": gameInfo.white,
                "perspective": gameInfo.color,
                "id": gameInfo.gameId,
                "gameType" : gameInfo.gameType
            };
        };
    }
    function SprReader(plaintext) {
        this.messages = plaintext.split("\n");
        this.messagecount = 2; //Skip metadata-line and GameInfo
        this.parseMessage = function (i) {
            return JSON.parse(this.messages[i].split('|')[2]);
        };
        this.nextMessage = function () {
            if (this.messagecount === this.messages.length) {
                throw "no messages left";
            }
            this.messagecount += 1;
            return this.parseMessage(this.messagecount - 1);
        };
        this.getHeaders = function () {
            var metadata = JSON.parse(this.messages[0].split('|')[1]); //Read the metadata from the first line.
            return {
                "version": metadata.version,
                "black" : metadata['black-name'],
                "white": metadata['white-name'],
                "perspective": metadata.perspective,
                "id": metadata['game-id'],
                "gameType" : this.parseMessage(1).gameType
            };
        };
    }

    function getReaderForFile(fileobject, callback) {
        var reader = new FileReader();
        reader.onload = function (e) {
            if (fileobject.name.charAt(fileobject.name.length - 2) ===  'g') {//ScrollsGuide .sgr replay
                callback(new SgrReader(e.target.result));
            } else if (fileobject.name.charAt(fileobject.name.length - 2) ===  'p') {//ScrollsPost .spr replay
                callback(new SprReader(e.target.result));
            } else {
                throw "wrong file format?";
            }
        };
        reader.readAsText(fileobject);
    }

    function mergeReplays() {

    }

    var singleReplayReader;
    function singleReplay() {
        var m = singleReplayReader.nextMessage();
        while (m.msg === "Ping") {
            m = singleReplayReader.nextMessage();
        }
        return m;
    }

    var headers;
    function readActiveResources(color, rreader) {
        var m = rreader.nextMessage();
        if (m.msg !== "ActiveResources") {
            throw "illegal packet";
        }
        headers[color + 'Resources'] = m.types;
    }

    exports.init = function (fileL, fileR, callback) {
        if (fileL !== undefined && fileR !== undefined) {
            //2 Replays - Merge!
            exports.getNextMessage = mergeReplays;
            //TODO
            throw "not yet implemented";
        } else if (fileL !== undefined) {
            exports.getNextMessage = singleReplay;
            getReaderForFile(fileL, function (reader) {
                singleReplayReader = reader;
                headers = reader.getHeaders();
                headers['seeCards' + headers.perspective] = true;
                headers['seeCards' + invertColor(headers.perspective)] = false;
                readActiveResources(headers.perspective, reader);
                headers[invertColor(headers.perspective) + 'Resources'] = [];
                callback();
            });
        } else if (fileR !== undefined) {
            exports.getNextMessage = singleReplay;
            getReaderForFile(fileR, function (reader) {
                singleReplayReader = reader;
                headers = reader.getHeaders();
                headers['seeCards' + headers.perspective] = true;
                headers['seeCards' + invertColor(headers.perspective)] = false;
                readActiveResources(headers.perspective, reader);
                headers[invertColor(headers.perspective) + 'Resources'] = [];
                //The User want's to see the loaded replay on the right side:
                headers.perspective = invertColor(headers.perspective);
                callback();
            });
        }
    };
    exports.getNextMessage = function () {
        throw "Not yet initialised! No replays loaded!";
    };

    exports.getWhiteName = function () {
        return headers.white;
    };
    exports.getBlackName = function () {
        return headers.black;
    };
    exports.getPerspective = function () {
        return headers.perspective;
    };
    exports.getWhiteResources = function () {
        return headers.whiteResources;
    };
    exports.getBlackResources = function () {
        return headers.blackResources;
    };
    exports.getResources = function (color) {
        return headers[color + 'Resources'];
    };
    exports.canSeeHandOfPlayer = function (color) {
        return headers['seeCards' + color];
    };
    exports.getName = function (color) {
        return headers[color];
    };
}(this.replayreader = {}));