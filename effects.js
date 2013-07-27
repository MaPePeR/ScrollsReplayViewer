/*jslint browser: true, vars: true*/
/*global images, $, replayreader, board: false*/


//Effects module to handle NewEffect-Messages
(function (exports) {
    "use strict";

    function generateResourcesFromAssets(element, assets) {
        var rtype, output = "";
        for (rtype in assets.availableResources) {
            if (assets.outputResources[rtype] > 0) {
                output += '<img class="resourceicon" src="http://www.scrollsguide.com/deckbuilder/img/' + rtype.toLowerCase() + '.png"/>' + assets.availableResources[rtype] + '/' + assets.outputResources[rtype] + '<br/>';
            }
        }
        output += '<span style="clear: both">Handsize: ' + assets.handSize + '</span>';
        element.html(output);
    }

    function displayMessage(message, callback) {
        $('#message').text(message).css('font-size', '0px').show().animate({'font-size': '30px'}, function () {
            setTimeout(function () { /*Keep the message shown for x mseconds*/
                $('#message').hide();
                if (callback !== undefined) {
                    callback();
                }
            }, 500);
        });
    }

    function getPosition(positionString) {
        var b = positionString.split(',');
        return {
            'x': 2 - parseInt(b[1], 10),
            'y': parseInt(b[0], 10)
        };
    }
    function getTarget(targetObject) {
        return {
            'x': 2 - parseInt(targetObject[1], 10),
            'y': parseInt(targetObject[0], 10),
            'color': targetObject.color
        };
    }

    var effectHandler = {
        "TurnBegin": function (e) {
            $("#roundcounter").text(e.turn);
            $("#playernamewhite, #playernameblack").removeClass("playernameactive");
            $("#playername" + e.color).addClass("playernameactive");
            nextEffect();
        },
        "ResourcesUpdate": function (e) {
            generateResourcesFromAssets($("#resourceswhite"), e.whiteAssets);
            generateResourcesFromAssets($("#resourcesblack"), e.blackAssets);
            nextEffect();
        },
        "IdolUpdate": function (e) {
            $("#" + e.idol.color + "idol" + e.idol.position).text(e.idol.hp);
            nextEffect();
        },
        "HandUpdate": function (e) {
            handcards.handupdate(e.cards, nextEffect);
        },
        "CardSacrificed": function (e) {
            if (replayreader.canSeeHandOfPlayer(e.color)) {
                if (e.resource !== undefined) {
                    handcards.setDepleteAction("Sac" + e.resource, e.color);
                } else {
                    handcards.setDepleteAction("SacCards", e.color);
                }
            }
            if (e.resource !== undefined) {
                displayMessage(replayreader.getName(e.color) + " sacrified for " + e.resource);
            } else {
                displayMessage(replayreader.getName(e.color) + " sacrified for Cards");
            }
            nextEffect();
        },
        "SummonUnit": function (e) {
            var target = getTarget(e.target);
            board.summonUnit(target, e.unit.cardTypeId, nextEffect);
        },
        "StatsUpdate": function (e) {
            var target = getTarget(e.target);
            board.statsUpdate(target, {'attack': e.ap, 'countdown': e.ac, 'health': e.hp, 'buffs': e.buffs});
            nextEffect();
        },
        "MoveUnit": function (e) {
            var fromPos = getPosition(e.from.position), toPos = getPosition(e.to.position);
            var elem = board[e.from.color + 'field'][fromPos.y][fromPos.x];
            if (e.to.color !== e.from.color) {
                throw "moving units across boards is not yet implemented";
            }
            board[e.to.color + 'field'][toPos.y][toPos.x] = elem;
            board[e.from.color + 'field'][fromPos.y][fromPos.x] = undefined;
            var animateCss = {'top': toPos.y * board.lastheight / 5};
            animateCss[replayreader.getPerspective() === e.to.color ? 'left' : 'right'] = (toPos.y % 2 === 1 ? board.lastwidth / 8 : board.lastwidth / 4) + toPos.x * board.lastwidth / 4; 
            if (fromPos.y <= toPos.y) {//Moving down
                elem.css('z-index', 100 + toPos.y);
                elem.animate(animateCss, nextEffect);
            } else { //Moving up
                elem.animate(animateCss, function () {
                    elem.css('z-index', 100 + toPos.y);
                    nextEffect();
                });
            }
            //elem.css('top', toPos.y * board.lastheight / 5).css(replayreader.getPerspective() === e.to.color ? 'left' : 'right', (toPos.y % 2 === 1 ? board.lastwidth / 8 : board.lastwidth / 4) + toPos.x * board.lastwidth / 4);

        }, 
        "RemoveUnit": function (e) {
            var target = getTarget(e.tile);
            board.removeUnit(target, nextEffect);
        },
        "DamageUnit": function (e) {
            var p = getPosition(e.targetTile.position), elem = board[e.targetTile.color + 'field'][p.y][p.x];
            var animLayer = $('#animationlayer');
            var animateElem = $('<div class="damageunit">' + e.amount + '</div>');
            animateElem.css('top', elem.offset().top - animLayer.offset().top).css('left', elem.offset().left - animLayer.offset().left).width(elem.width()).height(elem.height());
            elem.children('.health').val(e.hp);
            animLayer.append(animateElem);
            animateElem.animate({'font-size': '0'}, 1000, function () {
                $(this).hide(function () {
                    $(this).remove();
                    nextEffect();
                });
            });
        }
        //TODO: CardPlayed, UnitAttackTile, UnitAttackDone, EnchantUnit, TargetTiles
    };

    function playEffect(effect) {
        var key, handler;
        for (key in effect) {
            if (effectHandler[key] !== undefined && handler === undefined) {
                handler = effectHandler[key];
                handler(effect[key]);
            } else if (effectHandler[key] !== undefined && handler !== undefined) {
                console.log("Handlers are ambigious!");
                //Make this an error
            }
        }
        if (handler === undefined) {
            console.log("No handler found!");
            nextEffect();
            //Make this an error
        }
    }
    var currentEffects = [];
    var currentCallback = function () {};
    function nextEffect() {
        if (currentEffects.length > 0) {
            setTimeout(function () {
                var effect = currentEffects.shift();
                playEffect(effect);
            }, 100);
        } else {
            //All Effects where played
            currentCallback();
        }
    }

    exports.readMessage = function (m, callback) {
        if (m.msg !== "NewEffects") {
            throw "wrong message type";
        }
        if (currentEffects.length > 0) {
            throw "effects are still in progress!!!";
        } else {
            currentEffects = m.effects;
            currentCallback = callback;
            nextEffect();
        }
    };
}(this.effects = {}));