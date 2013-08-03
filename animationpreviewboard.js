/*jslint browser: true, vars: true*/
/*global $, scrollsdata, replayreader: false*/

(function (exports) {
    "use strict";

    //Multi-dimensional array initialiser - thanks to http://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938
    function createArray(length) {
        var arr = new Array(length || 0),
            i = length;

        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while (i--) {
                arr[length - 1 - i] = createArray.apply(this, args);
            }
        }

        return arr;
    }


    function zIndexForRow(row) {
        return 100 + row * 100;
    }

    var board;
    function emptyBoard() {
        return {
            "white" : {
                "fieldElem": $('#fieldwhite'),
                "field": createArray(5, 3),
                "fieldIds": createArray(5, 3),
                "idols": createArray(5)
            },
            "black" : {
                "fieldElem": $('#fieldblack'),
                "field": createArray(5, 3),
                "fieldIds": createArray(5, 3),
                "idols": createArray(5)
            },
            "lastwidth": $('#fieldwhite').width(),
            "lastheight": $('#fieldwhite').height()
        };
    }

    function generateIdols() {
        var idolW, idolB;
        var fw = board.white.fieldElem;
        var fb = board.black.fieldElem;
        var width = board.lastwidth, height = board.lastheight, y;
        width  = Math.min(width, 16 * height / 15);
        height = Math.min(height, 15 * width / 16);

        for (y = 0; y < 5; y += 1) {
            idolW = $('<div class="idol" id="whiteidol' + y + '"></div>');
            idolW.height(height / 5).width(width / 8).css('top', y * height / 5);
            board.white.idols[y] = idolW;
            fw.append(idolW);

            idolB = $('<div class="idol" id="blackidol' + y + '"></div>');
            idolB.height(height / 5).width(width / 8).css('top', y * height / 5);
            board.black.idols[y] = idolB;
            fb.append(idolB);
        }
    }

    var backgroundCtx;
    function drawBackground() {
        //Adjust canvas size
        var width  = backgroundCtx.canvas.width  = $('#gamefield').innerWidth();
        var height = backgroundCtx.canvas.height = $('#gamefield').innerHeight();
        var fwidth = width / 2.0;
        backgroundCtx.fillStyle = 'green';
        backgroundCtx.fillRect(0, 0, width, height);
        backgroundCtx.strokeStyle = 'black';
        var x, y;
        /*for (y = 0; y < 5; y += 1) {
            for (x = 0; x < 3; x += 1) {
                backgroundCtx.strokeRect((y % 2 === 1 ? fwidth / 8 : fwidth / 4) + x * fwidth / 4, y * height / 5, fwidth / 4, fwidth * 3 / 4 / 4);
            }
        }*/
    }

    function calcSize() {
        var y, x;
        var width = (board.lastwidth = board.white.fieldElem.width());
        var height = (board.lastheight = board.white.fieldElem.height());
        for (y = 0; y < 5; y += 1) {
            for (x = 0; x < 3; x += 1) {
                if (board.white.field[y][x] !== undefined) {
                    board.white.field[y][x].width(width / 4).height(width * 3 / 4 / 4).css('top', y * height / 5).css(replayreader.getPerspective() === 'white' ? 'left' : 'right', (y % 2 === 1 ? width / 8 : width / 4) + x * width / 4);
                }
                if (board.black.field[y][x] !== undefined) {
                    board.black.field[y][x].width(width / 4).height(width * 3 / 4 / 4).css('top', y * height / 5).css(replayreader.getPerspective() === 'black' ? 'left' : 'right', (y % 2 === 1 ? width / 8 : width / 4) + x * width / 4);
                }
            }
            board.black.idols[y].height(height / 5).width(width / 8).css('top', y * height / 5);
            board.white.idols[y].height(height / 5).width(width / 8).css('top', y * height / 5);
        }
        drawBackground();
    }

    $(window).resize(calcSize);



    exports.init = function () {
        backgroundCtx = $("#fieldbackground")[0].getContext('2d');
        if (board !== undefined) {
            var x, y;
            for (y = 0; y < 5; y += 1) {
                for (x = 0; x < 3; x += 1) {
                    if (board.white.field[y][x] !== undefined) {
                        board.white.field[y][x].remove();
                        board.white.fieldIds[y][x] = undefined;
                    }
                    if (board.black.field[y][x] !== undefined) {
                        board.black.field[y][x].remove();
                        board.black.fieldIds[y][x] = undefined;
                    }
                }
                board.black.idols[y].remove();
                board.white.idols[y].remove();
            }
            board = undefined;
        }
        board = emptyBoard();
        generateIdols();
        calcSize();
    };
    /* 
        Effect functions
    */

    exports.summonUnit = function (target, cardTypeId, callback) {
        var elem = $('<div class="fieldscroll"><div class="buffs"></div><span class="attack stat"/><span class="countdown stat"/><span class="health stat"/><div class="animationpreview" style="background-image: url(' + scrollsdata.getAnimationPreviewURLForScroll(cardTypeId) + ');"></div></div>');
        var width = board.lastwidth, height = board.lastheight;
        var isBackRow = target.y % 2 === 1, color = target.color;
        elem.width(width / 4).height(width * 3 / 4 / 4).css('top', target.y * height / 5).css(replayreader.getPerspective() === color ? 'left' : 'right', (isBackRow ? width / 8 : width / 4) + target.x * width / 4);
        elem.css('z-index', zIndexForRow(target.y));
        board[color].fieldElem.append(elem);
        board[color].field[target.y][target.x] = elem;
        board[color].fieldIds[target.y][target.x] = cardTypeId;
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
        board[target.color].fieldIds[target.y][target.x] = undefined;
        board[target.color].field[target.y][target.x] = undefined;
    };

    var currentTurn;
    exports.turnBegin = function (color) {
        var x, y, elem, cd, ocolor = invertColor(color);
        currentTurn = color;

        for (y = 0; y < 5; y += 1) {
            for (x = 0; x < 3; x += 1) {
                //Current Player
                elem = board[color].field[y][x];
                if (elem !== undefined) {
                    cd = parseInt(elem.children('.countdown').text(), 10);
                    if (cd === 0) {
                        elem.addClass('attackingSoon');
                    } else {
                        elem.removeClass('attackingSoon');
                    }
                }
                //Other Player 
                elem = board[ocolor].field[y][x];
                if (elem !== undefined) {
                    cd = parseInt(elem.children('.countdown').text(), 10);
                    if (0 <= cd && cd <= 1) {
                        elem.addClass('attackingSoon');
                    } else {
                        elem.removeClass('attackingSoon');
                    }
                }
            }
        }
    };

    exports.statsUpdate = function (target, stats, callback) {
        var elem = board[target.color].field[target.y][target.x];
        if (stats.attack !== undefined) {
            elem.children('.attack').text(stats.attack);
        }
        if (stats.countdown !== undefined) {
            if (stats.countdown < 0) {
                elem.children('.countdown').hide();
            } else {
                elem.children('.countdown').show();
                if (stats.countdown === 0 || (currentTurn !== target.color && stats.countdown === 1)) {
                    elem.addClass('attackingSoon');
                } else {
                    elem.removeClass('attackingSoon');
                }
            }
            elem.children('.countdown').text(stats.countdown);
        }
        if (stats.health !== undefined) {
            elem.children('.health').text(stats.health);
        }
        if (stats.buffs !== undefined) {
            var buf = "", i;
            for (i = 0; i < stats.buffs.length; i += 1) {
                buf += '<div class="buff" title="' + stats.buffs[i].description + '">' + stats.buffs[i].name + '</div>';
            }
            elem.children('.buffs').html(buf);
        } else {
            elem.children('.buffs').html('');
        }
        if (callback !== undefined) {
            callback();
        }
    };

    exports.enchantUnit = function (target, callback) {
        var elem = board[target.color].field[target.y][target.x];
        elem.css('border-color', 'yellow').animate({"border-width": 5, "margin-left": -5, "margin-top": -5}, 'slow').animate({"border-width": 1, "margin-left": 0, "margin-top": 0}, 'slow', function () {
            $(this).css('border-color', 'black');
            if (callback !== undefined) {
                callback();
            }
        });
    };

    exports.damageUnit = function (target, damage, callback) {
        var animLayer = $('#animationlayer');
        var animateElem = $('<div class="damage">' + damage + '</div>');
        var elem = board[target.color].field[target.y][target.x];
        animateElem.css('top', elem.offset().top - animLayer.offset().top).css('left', elem.offset().left - animLayer.offset().left).width(elem.width()).height(elem.height());
        animLayer.append(animateElem);
        animateElem.animate({'top': '-=100px', 'opacity': 0}, 1000, function () {
            $(this).hide(function () {
                $(this).remove();
                if (callback !== undefined) {
                    callback();
                }
            });
        });
    };

    exports.healUnit = function (target, amount, callback) {
        var animLayer = $('#animationlayer');
        var animateElem = $('<div class="healunit">' + amount + '</div>');
        var elem = board[target.color].field[target.y][target.x];
        animateElem.css('top', elem.offset().top - animLayer.offset().top).css('left', elem.offset().left - animLayer.offset().left).width(elem.width()).height(elem.height());
        animLayer.append(animateElem);
        animateElem.animate({'top': '-=100px', 'opacity': 0}, 1000, function () {
            $(this).hide(function () {
                $(this).remove();
                if (callback !== undefined) {
                    callback();
                }
            });
        });
    };

    exports.damageIdol = function (color, idolRow, damage, callback) {
        var animLayer = $('#animationlayer');
        var animateElem = $('<div class="damage">' + damage + '</div>');
        var elem = board[color].idols[idolRow];
        animateElem.css('top', elem.offset().top - animLayer.offset().top).css('left', elem.offset().left - animLayer.offset().left).width(elem.width()).height(elem.height());
        animLayer.append(animateElem);
        animateElem.animate({'top': '-=100px', 'opacity': 0}, 1000, function () {
            $(this).hide(function () {
                $(this).remove();
                if (callback !== undefined) {
                    callback();
                }
            });
        });
    };

    exports.healIdol = function (color, idolRow, amount, callback) {
        var animLayer = $('#animationlayer');
        var animateElem = $('<div class="healunit">' + amount + '</div>');
        var elem = board[color].idols[idolRow];
        animateElem.css('top', elem.offset().top - animLayer.offset().top).css('left', elem.offset().left - animLayer.offset().left).width(elem.width()).height(elem.height());
        animLayer.append(animateElem);
        animateElem.animate({'top': '-=100px', 'opacity': 0}, 1000, function () {
            $(this).hide(function () {
                $(this).remove();
                if (callback !== undefined) {
                    callback();
                }
            });
        });
    };

    exports.moveUnit = function (fromTarget, toTarget, callback) {
        if (fromTarget.color !== toTarget.color) {
            throw "moving units across boards is not yet implemented";
        }
        var elem = board[fromTarget.color].field[fromTarget.y][fromTarget.x];
        board[toTarget.color].field[toTarget.y][toTarget.x] = elem;
        board[toTarget.color].fieldIds[toTarget.y][toTarget.x] = board[fromTarget.color].fieldIds[fromTarget.y][fromTarget.x];
        board[fromTarget.color].field[fromTarget.y][fromTarget.x] = undefined;
        board[fromTarget.color].fieldIds[fromTarget.y][fromTarget.x] = undefined;
        var animateCss = {'top': toTarget.y * board.lastheight / 5};
        animateCss[replayreader.getPerspective() === toTarget.color ? 'left' : 'right'] = (toTarget.y % 2 === 1 ? board.lastwidth / 8 : board.lastwidth / 4) + toTarget.x * board.lastwidth / 4;
        if (fromTarget.y <= toTarget.y) {//Moving down
            elem.css('z-index', zIndexForRow(toTarget.y));
            elem.animate(animateCss, callback);
        } else { //Moving up
            elem.animate(animateCss, function () {
                elem.css('z-index', zIndexForRow(toTarget.y));
                if (callback !== undefined) {
                    callback();
                }
            });
        }
        //elem.css('top', toPos.y * board.lastheight / 5).css(replayreader.getPerspective() === e.to.color ? 'left' : 'right', (toPos.y % 2 === 1 ? board.lastwidth / 8 : board.lastwidth / 4) + toPos.x * board.lastwidth / 4);
    };

    exports.idolUpdate = function (color, idolRow, health, callback) {
        board[color].idols[idolRow].text(health);
        if (callback !== undefined) {
            callback();
        }
    };

    var milisecondsPerPixels = 1; // Lower value = faster
    //Double the spead, when retreating from attack

    exports.unitAttackTile = function (attacker, attackedTile, callback) {
        var elem = board[attacker.color].field[attacker.y][attacker.x];
        if (scrollsdata.isRangedOrLobber(board[attacker.color].fieldIds[attacker.y][attacker.x])) {
            //TODO: ranged attack
            if (callback !== undefined) {
                callback();
            }
        } else {
            var animation = {};
            var dx = board.lastwidth * ((2 - attacker.x) + (2 - attackedTile.x) + (attacker.y % 2) + 0.5) / 4;
            animation[replayreader.getPerspective() === attacker.color ? 'left' : 'right'] = '+=' + dx + 'px';
            elem.css('z-index', zIndexForRow(attacker.y) + 50).animate(animation, dx * milisecondsPerPixels,  callback);
        }
    };

    exports.unitAttackIdol = function (attacker, idolRow, callback) {
        var elem = board[attacker.color].field[attacker.y][attacker.x];
        if (scrollsdata.isRangedOrLobber(board[attacker.color].fieldIds[attacker.y][attacker.x])) {
            //TODO: ranged attack
            if (callback !== undefined) {
                callback();
            }
        } else {
            var animation = {};
            var dx = board.lastwidth * ((2 - attacker.x) + 3 + (attacker.y % 2 === 1 ? 1 : 0.5) + 0.25) / 4;
            animation[replayreader.getPerspective() === attacker.color ? 'left' : 'right'] = '+=' + dx + 'px';
            elem.css('z-index', zIndexForRow(attacker.y) + 50).animate(animation, dx *  milisecondsPerPixels,  callback);
        }
    };

    exports.unitAttackDone = function (attacker, callback) {
        var elem = board[attacker.color].field[attacker.y][attacker.x];
        var animation = {};
        var direction = replayreader.getPerspective() === attacker.color ? 'left' : 'right';
        var newx = (attacker.y % 2 === 1 ? board.lastwidth / 8 : board.lastwidth / 4) + attacker.x * board.lastwidth / 4;
        animation[direction] = newx;
        elem.animate(animation, (parseInt(elem.css(direction), 10) - newx) * 0.5 * milisecondsPerPixels, function () {
            callback();
            elem.css('z-index', zIndexForRow(attacker.y));
        });
    };

}(this.board = {}));