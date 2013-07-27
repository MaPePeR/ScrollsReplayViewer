/*jslint browser: true, vars: true*/
/*global $, images, replayreader: false*/

(function (exports) {
    "use strict";

    //Multi-dimensional array initialiser - thanks to http://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938
    function createArray(length) {
        var arr = new Array(length || 0),
            i = length;

        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while(i--) arr[length-1 - i] = createArray.apply(this, args);
        }

        return arr;
    }


    var board;
    function emptyBoard() {
        return {
            "white" : {
                "fieldElem": $('#fieldwhite'),
                "field": createArray(5, 3),
                "idols": createArray(5)
            },
            "black" : {
                "fieldElem": $('#fieldblack'),
                "field": createArray(5, 3),
                "idols": createArray(5)
            },
            "lastwidth": $('#fieldwhite').width(),
            "lastheight": $('#fieldwhite').height()
        };
    }

    exports.summonUnit = function (target, cardTypeId, callback) {
        var elem = $('<div class="fieldscroll"><input type="text" class="attack" disabled/><input type="text" class="countdown" disabled/><input type="text" class="health" disabled/></div>').css('background-image', 'url(' + images.getMainImageURLForScroll(cardTypeId) + ')');
        var width = board.lastwidth, height = board.lastheight;
        var isBackRow = target.y % 2 === 1, color = target.color;
        elem.width(width / 4).height(width * 3 / 4 / 4).css('top', target.y * height / 5).css(replayreader.getPerspective() === color ? 'left' : 'right', (isBackRow ? width / 8 : width / 4) + target.x * width / 4);
        elem.css('z-index', 100 + target.y);
        board[color].fieldElem.append(elem);
        board[color].field[target.y][target.x] = elem;
        if (callback !== undefined) {
            callback();
        }
    };

    exports.removeUnit = function (target, callback) {
        var elem = board[target.color].field[target.y][target.x];

        elem.hide(function () {
            $(this).remove();
            if (callback !== undefined) {
                callback();
            }
        });
        board[target.color].field[target.y][target.x] = undefined;
    };

    exports.statsUpdate = function (target, stats, callback) {
        var elem = board[target.color].field[target.y][target.x];
        elem.children('.attack').val(stats.ap);
        elem.children('.countdown').val(stats.ac);
        elem.children('.health').val(stats.hp);
        if (stats.buffs !== undefined) {
            //TODO: Handle buffs
            console.log(stats.buffs);
        }
        if (callback !== undefined) {
            callback();
        }
    };

}(this.board = {}));