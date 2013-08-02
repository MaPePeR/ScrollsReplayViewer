/*jslint browser: true, vars: true*/
/*global images, $, replayreader, board, handcards: false*/


//Effects module to handle NewEffect-Messages
(function (exports) {
    "use strict";

    var nextEffect;

    function generateResourcesFromAssets(element, assets, color) {
        var rtype, output = "", activeResources = replayreader.getResources(color);
        for (rtype in assets.availableResources) {
            if (assets.outputResources[rtype] > 0 || activeResources.indexOf(rtype) >= 0) {
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
            generateResourcesFromAssets($("#resourceswhite"), e.whiteAssets, 'white');
            generateResourcesFromAssets($("#resourcesblack"), e.blackAssets, 'black');
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
                displayMessage(replayreader.getName(e.color) + " sacrified for " + e.resource, nextEffect);
            } else {
                displayMessage(replayreader.getName(e.color) + " sacrified for Cards", nextEffect);
            }
        },
        "SummonUnit": function (e) {
            var target = getTarget(e.target);
            if (e.unit) { //Old Format <= 0.95.1 (?)
                board.summonUnit(target, e.unit.cardTypeId, nextEffect);
            } else if (e.card) { //New Format = 0.96.0
                board.summonUnit(target, e.card.typeId, nextEffect);
            }
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
        },
        "CardPlayed": function (e) {
            var elem = $('<img class="playedscroll" src="' + images.getScrollImageURL(e.card.typeId) + '"/>');
            var animLayer = $('#animationlayer');
            elem.css('left', $('#handcards').offset().left - animLayer.offset().left + $('#handcards').width() / 2)
                .css('top', $('#handcards').offset().top - animLayer.offset().top);
            animLayer.append(elem);
            elem.animate({
                'left': $('#' + e.color + 'idol2').offset().left - animLayer.offset().left,
                'top': $('#' + e.color + 'idol2').offset().top - animLayer.offset().top
            }, 500, function () {
                $(this).remove();
                nextEffect();
            });
            //Todo keep played scrolls shown.
        },
        "UnitAttackTile": function (e) {
            board.unitAttackTile(getTarget(e.source), getTarget(e.target), nextEffect);
        },
        "UnitAttackIdol": function (e) {
            board.unitAttackIdol(getTarget(e.attacker), e.idol, nextEffect);
        },
        "UnitAttackDone": function (e) {
            board.unitAttackDone(getTarget(e.source), nextEffect);
        },
        "EndGame": function (e) {
            var animLayer = $('#animationlayer');
            var w = e.winner, l = invertColor(e.winner);
            var wStats = e[w + 'Stats'], lStats = e[l + 'Stats'];
            var wReward = e[w + 'GoldReward'], lReward = e[l + 'GoldReward'];
            var elem = $(
                '<div class="endgame"><table class="endgamestats"><tr><td></td><th>Winner</th><th></th></tr><tr><td></td><td>' + replayreader.getName(w) + '</td><td>' + replayreader.getName(l) + '</td></tr><tr><th>Idol Damage:</th><td>' + wStats.idolDamage + '</td><td>' + lStats.idolDamage + '</td></tr><tr><th>Unit Damage:</th><td>' + wStats.unitDamage + '</td><td>' + lStats.unitDamage + '</td></tr><tr><th>Units Played:</th><td>' + wStats.unitsPlayed + '</td><td>' + lStats.unitsPlayed + '</td></tr><tr><th>Spells Played:</th><td>' + wStats.spellsPlayed + '</td><td>' + lStats.spellsPlayed + '</td></tr><tr><th>Enchantments Played:</th><td>' + wStats.enchantmentsPlayed + '</td><td>' + lStats.enchantmentsPlayed + '</td></tr><tr><th>Scrolls Drawn:</th><td>' + wStats.scrollsDrawn + '</td><td>' + lStats.scrollsDrawn + '</td></tr><tr><th>Seconds Taken:</th><td>' + wStats.totalMs / 1000.0 + '</td><td>' + lStats.totalMs / 1000.0 + '</td></tr><tr><th>Most Damage Unit:</th><td>' + wStats.mostDamageUnit + '</td><td>' + lStats.mostDamageUnit + '</td></tr><tr><th>Idols Destroyed:</th><td>' + wStats.idolsDestroyed + '</td><td>' + lStats.idolsDestroyed + '</td></tr><tr><th>Rewards:</th></tr><tr><th>Match:</th><td>' + wReward.matchReward + '</td><td>' + lReward.matchReward + '</td></tr><tr><th>Match Completion:</th><td>' + wReward.matchCompletionReward + '</td><td>' + lReward.matchCompletionReward + '</td></tr><tr><th>Idols Destroyed</th><td>' + wReward.idolsDestroyedReward + '</td><td>' + lReward.idolsDestroyedReward + '</td></tr><tr><th>Total: </th><td>' + wReward.totalReward + '</td><td>' + lReward.totalReward + '</td></table></div>'
            );
            elem.width($('#game').width()).height($('#game').height());
            animLayer.append(elem);
        }
        //TODO: EnchantUnit, TargetTiles
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
    var currentCallback;
    nextEffect = function nextEffect(waittime) {
        if (currentEffects.length > 0) {
            setTimeout(function () {
                var effect = currentEffects.shift();
                playEffect(effect);
            }, waittime !== undefined ? waittime : 0);
        } else {
            //All Effects where played
            if (currentCallback !== undefined) {
                currentCallback();
            }
        }
    };

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