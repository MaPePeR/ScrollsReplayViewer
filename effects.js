/*jslint browser: true, vars: true*/
/*global images, $, replayreader, board: false*/


//Handcards module - assumes, that cards are always added to the right.
(function (exports) {
    "use strict";

    var currentHandCards = [], currentHandCardsElem = [];
    var lastDepleteAction, lastDepleteColor;

    function createSacFunctionFor(resource) {
        return function (elem) {
            var animateElem = $('<img style="position: absolute" src="http://www.scrollsguide.com/deckbuilder/img/' + resource.toLowerCase() + '.png"/>').width(elem.width() / 2);
            var animLayer = $("#animationlayer");
            animLayer.append(animateElem);
            animateElem.css('top', elem.offset().top - animLayer.offset().top).css('left', elem.offset().left - animLayer.offset().left);
            elem.hide('slow', function () {
                animateElem.animate({'left': $('#resources' + lastDepleteColor).offset().left - animLayer.offset().left}, function () {
                    $(this).remove();
                });
            });
        };
    }

    var possibleDepleteActions = {
        "SacGROWTH": createSacFunctionFor('GROWTH'),
        "SacORDER": createSacFunctionFor('ORDER'),
        "SacENERGY": createSacFunctionFor('ENERGY'),
        "SacCards": function (elem) {
            elem.hide();
        },
        "CardPlayed": function (elem) {
            elem.hide();
        }

    };

    function arrayRemove(array, index) {
        return array.splice(index, 1);
    }

    function removeCard(index) {
        if (lastDepleteAction !== undefined && lastDepleteAction in possibleDepleteActions) {
            possibleDepleteActions[lastDepleteAction](currentHandCardsElem[index]);
            lastDepleteAction = undefined;
        } else {
            currentHandCardsElem[index].hide('slow');
        }
        arrayRemove(currentHandCards, index);
        arrayRemove(currentHandCardsElem, index);
    }

    function addCard(card) {
        var elem = $('<img class="handscroll" src="' + images.getScrollImageURL(card.typeId) + '"/>');
        elem.hide();
        $("#handcards").append(elem);
        currentHandCards.push(card);
        currentHandCardsElem.push(elem);
    }

    function moveCards() {
        var i, width = $('#handcards').width();

        for (i = 0; i < currentHandCardsElem.length; i += 1) {
            currentHandCardsElem[i].css('left', i * width / currentHandCardsElem.length).show();
        }
    }
    exports.moveCards = moveCards;

    exports.setDepleteAction = function (type, color) {
        if (type !== undefined && type in possibleDepleteActions) {
            lastDepleteAction = type;
            lastDepleteColor = color;
        } else {
            throw "not a possible deplete action: " + type;
        }
    };

    exports.handupdate = function (cards, callback) {
        //Diffing the hands
        var indexCurrent, indexNew = 0, cardsToRemove = [], elemsToRemove = [], cardsToAdd = [], i;

        for (indexCurrent = 0; indexCurrent < currentHandCards.length && indexNew < cards.length; indexCurrent += 1) {
            if (currentHandCards[indexCurrent].typeId !== cards[indexNew].typeId) {
                cardsToRemove.push(indexCurrent);
                elemsToRemove.push(currentHandCardsElem[indexCurrent]);
            } else {
                indexNew += 1;
            }
        }

        //New cards are added.
        while (indexNew < cards.length) {
            cardsToAdd.push(cards[indexNew]);
            indexNew += 1;
        }

        //Cards are removed from the right side
        while (indexCurrent < currentHandCards.length) {
            cardsToRemove.push(indexCurrent);
            elemsToRemove.push(currentHandCardsElem[indexCurrent]);
            indexCurrent += 1;
        }

        for (i = 0; i < cardsToRemove.length; i += 1) {
            removeCard(cardsToRemove[i]);
        }

        for (i = 0; i < cardsToAdd.length; i += 1) {
            addCard(cardsToAdd[i]);
        }

        $(".handscroll").promise().done(function () {
            moveCards();
            for (i = elemsToRemove.length - 1; i >= 0; i -= 1) {
                elemsToRemove[i].remove();
            }
            if (callback !== undefined) {
                callback();
            }
        });
    };
}(this.handcards = {}));

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

    function displayMessage(message) {
        //TODO: visible message
        console.log(message);
    }

    function getPosition(positionString) {
        var b = positionString.split(',');
        return {
            'x': 2 - parseInt(b[1], 10),
            'y': parseInt(b[0], 10)
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
            } else {
                if (e.resource !== undefined) {
                    displayMessage(replayreader.getName(e.color) + " sacrified for " + e.resource);
                } else {
                    displayMessage(replayreader.getName(e.color) + " sacrified for Cards");
                }
            }
            nextEffect();
        },
        "SummonUnit": function (e) {
            var elem = $('<div class="fieldscroll"><input type="text" class="attack" disabled/><input type="text" class="countdown" disabled/><input type="text" class="health" disabled/></div>').css('background-image', 'url(' + images.getMainImageURLForScroll(e.unit.cardTypeId) + ')');
            var width = board.lastwidth, height = board.lastheight, p = getPosition(e.target.position);
            var isBackRow = p.y % 2 === 1, color = e.target.color;
            elem.width(width / 4).height(width * 3 / 4 / 4).css('top', p.y * height / 5).css(replayreader.getPerspective() === color ? 'left' : 'right', (isBackRow ? width / 8 : width / 4) + p.x * width / 4);
            $("#field" + color).append(elem);
            board[color + 'field'][p.y][p.x] = elem;
            nextEffect();
        },
        "StatsUpdate": function (e) {
            var p = getPosition(e.target.position), elem = board[e.target.color + 'field'][p.y][p.x];
            elem.children('.attack').val(e.ap);
            elem.children('.countdown').val(e.ac);
            elem.children('.health').val(e.hp);
            //TODO: Handle e.buffs
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
            elem.animate(animateCss, nextEffect);
            //elem.css('top', toPos.y * board.lastheight / 5).css(replayreader.getPerspective() === e.to.color ? 'left' : 'right', (toPos.y % 2 === 1 ? board.lastwidth / 8 : board.lastwidth / 4) + toPos.x * board.lastwidth / 4);

        }, 
        "RemoveUnit": function (e) {
            var p = getPosition(e.tile.position), elem = board[e.tile.color + 'field'][p.y][p.x];
            elem.hide(function () {
                $(this).remove();
                nextEffect();
            });
            board[e.tile.color + 'field'][p.y][p.x] = undefined;
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
        //TODO: CardPlayed, UnitAttackTile, EnchantUnit, TargetTiles
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
            }, 1);
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