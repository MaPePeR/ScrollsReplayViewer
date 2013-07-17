(function (exports) {
    "use strict";

    function SgrReader(plaintext) {
        this.messages = plaintext.split("\n\n\n");
        this.messagecount = 0;
        this.nextMessage = function () {
            this.messagecount += 1;
            return JSON.parse(this.messages[this.messagecount - 1]);
        };
    }
    function SprReader(plaintext) {
        this.messages = plaintext.split("\n");
        this.messagecount = 1;
        this.nextMessage = function () {
            this.messagecount += 1;
            return JSON.parse(this.messages[this.messagecount - 1].split('|')[2]);
        };
    }

    function getReaderForFile(fileobject, callback) {
        console.log("getReaderForFile")
        var reader = new FileReader();
        reader.onload = function (e) {
            console.log("reader.onload")
            if (fileobject.name.charAt(fileobject.name.length - 2) ===  'g') {//ScrollsGuide .sgr replay
                callback(new SgrReader(e.target.result));
            } else if (fileobject.name.charAt(fileobject.name.length - 2) ===  'p') {//ScrollsPost .spr replay
                callback(new SgrReader(e.target.result));
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
        console.log(m);
        return m;
    }
    exports.init = function (fileL, fileR, callback) {
        console.log("replayreader.init")
        if (fileL !== undefined && fileR !== undefined) {
            //2 Replays - Merge!
            exports.getNextMessage = mergeReplays;
            //TODO
            throw "not yet implemented";
        } else if (fileL !== undefined) {
            exports.getNextMessage = singleReplay;
            getReaderForFile(fileL, function (reader) {
                singleReplayReader = reader;
                callback();
            });
        } else if (fileR !== undefined) {
            exports.getNextMessage = singleReplay;
            getReaderForFile(fileR, function (reader) {
                singleReplayReader = reader;
                callback();
            });
        }
    };
    exports.getNextMessage = function () {
        throw "Not yet initialised! No replays loaded!";
    };

    exports.getLName = function () {

    };
    exports.getRName = function () {

    };
    exports.getRound = function () {

    };

}(this.replayreader = {}));