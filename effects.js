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
        var b = targetObject.position.split(',');
        return {
            'x': 2 - parseInt(b[1], 10),
            'y': parseInt(b[0], 10),
            'color': targetObject.color
        };
    }

    var effectHandler = {
        "TurnBegin": function (e) {
            $("#roundcounter").text(e.turn);
            $("#playernamewhite, #playernameblack").removeClass("playernameactive");
            $("#playername" + e.color).addClass("playernameactive");
            displayMessage("Next Turn: " + replayreader.getName(e.color), nextEffect);
        },
        "ResourcesUpdate": function (e) {
            generateResourcesFromAssets($("#resourceswhite"), e.whiteAssets);
            generateResourcesFromAssets($("#resourcesblack"), e.blackAssets);
            nextEffect();
        },
        "IdolUpdate": function (e) {
            board.idolUpdate(e.idol.color, e.idol.position, e.idol.hp);
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
            board.moveUnit(getTarget(e.from), getTarget(e.to), nextEffect);
        },
        "RemoveUnit": function (e) {
            var target = getTarget(e.tile);
            board.removeUnit(target, nextEffect);
        },
        "DamageUnit": function (e) {
            var target = getTarget(e.targetTile);
            board.statsUpdate(target, {'health': e.kill ? 0 : e.hp});
            board.damageUnit(target, e.amount);
            nextEffect();
        },
        "DamageIdol": function (e) {
            board.idolUpdate(e.idol.color, e.idol.position, e.idol.hp);
            board.damageIdol(e.idol.color, e.idol.position, e.amount);
            nextEffect();
        }
        //TODO: CardPlayed, UnitAttackTile, UnitAttackIdol, UnitAttackDone, EnchantUnit, TargetTiles
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
    function nextEffect(waittime) {
        if (currentEffects.length > 0) {
            setTimeout(function () {
                var effect = currentEffects.shift();
                playEffect(effect);
            }, waittime !== undefined ? waittime : 0);
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