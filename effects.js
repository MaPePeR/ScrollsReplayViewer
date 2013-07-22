/*jslint browser: true, vars: true*/
/*global images, $, replayreader, board: false*/


//Handcards module - assumes, that cards are always added to the right.
(function (exports) {
    "use strict";

    var currentHandCards = [], currentHandCardsElem = [];
    var lastDepleteAction, lastDepleteColor;

    function createSacFunctionFor(resource) {
        return function (elem) {
            //TODO: create resouce-icon and move it to the corresponding resource-div
            elem.hide();
        };
    }

    var possibleDepleteActions = {
        "SacGROWTH": createSacFunctionFor('GROWTH'),
        "SacORDER": createSacFunctionFor('ORDER'),
        "SacENERGY": createSacFunctionFor('ENERGY'),
        "SacCards": function (elem) {

        },
        "CardPlayed": function (elem) {

        }

    };

    function arrayRemove(array, index) {
        return array.splice(index, 1);
    }

    function removeCard(index) {
        if (lastDepleteAction !== undefined && lastDepleteAction in possibleDepleteActions) {
            possibleDepleteActions[lastDepleteAction](currentHandCardsElem[index]);
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

    exports.setDepleteAction = function (type, color) {
        if (type !== undefined && type in possibleDepleteActions) {
            lastDepleteAction = type;
            lastDepleteColor = color;
        } else {
            throw "not a possible deplete action: " + type;
        }
    };

    exports.handupdate = function (cards) {
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

    var effectHandler = {
        "TurnBegin": function (e) {
            $("#roundcounter").text(e.turn);
            $("#playernamewhite, #playernameblack").removeClass("playernameactive");
            $("#playername" + e.color).addClass("playernameactive");
        },
        "ResourcesUpdate": function (e) {
            generateResourcesFromAssets($("#resourceswhite"), e.whiteAssets);
            generateResourcesFromAssets($("#resourcesblack"), e.blackAssets);
        },
        "IdolUpdate": function (e) {
            $("#" + e.idol.color + "idol" + e.idol.position).text(e.idol.hp);
        },
        "HandUpdate": function (e) {
            handcards.handupdate(e.cards);
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
        },
        "SummonUnit": function (e) {
            var elem = $('<img class="fieldscroll" src="' + images.getMainImageURLForScroll(e.unit.cardTypeId) + '"/>');
            var width = board.lastwidth, height = board.lastheight, y = parseInt(e.target.position.split(',')[0]), x = parseInt(e.target.position.split(',')[1]);
            var isBackRow = y % 2 === 1, color = e.target.color;
            console.log(width, height, isBackRow, color, y, x);
            elem.width(width / 4).css('top', y * height / 5).css('left', (isBackRow ? width / 8 : width / 4) + x * width / 4);
            $("#field" + color).append(elem);
            board[color + 'field'][y][x] = elem;
        }
        //TODO: SummonUnit, StatsUpdate, CardPlayed
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
            //Make this an error
        }
    }

    exports.readMessage = function (m) {
        if (m.msg !== "NewEffects") {
            throw "wrong message type";
        }
        var i;
        for (i = 0; i < m.effects.length; i += 1) {
            playEffect(m.effects[i]);
        }
    };
}(this.effects = {}));