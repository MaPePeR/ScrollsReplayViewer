/*jslint vars: true*/
/*global $: false*/


//Handcards module - assumes, that cards are always added to the right.
(function (exports) {
    "use strict";

    var currentHandCards = [], currentHandCardsElem = [];
    var lastDepleteAction;
    var possibleDepleteActions = {
        "SacGROWTH": function () {

        },
        "SacORDER": function () {

        },
        "SacENERGY": function () {

        },
        "SacCards": function () {

        },
        "CardPlayed": function () {

        }

    };

    function arrayRemove(array, index) {
        return array.splice(index, 1);
    }

    function removeCard(index) {
    }

    function addCard(card) {

    }

    exports.setDepleteAction = function (type) {
        if (type !== undefined && type in possibleDepleteActions) {
            lastDepleteAction = type;
        } else {
            throw "not a possible deplete action!";
        }
    };

    exports.handupdate = function (cards) {
        //Diffing the hands
        var indexCurrent, indexNew = 0, cardsToRemove = [], cardsToAdd = [], i;

        for (indexCurrent = 0; indexCurrent < currentHandCards.length && indexNew < cards.length; indexCurrent += 1) {
            if (currentHandCards[indexCurrent].typeId !== cards[indexNew].typeId) {
                cardsToRemove.push(indexCurrent);
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
            cardsToRemove.add(currentHandCards[indexCurrent]);
            indexCurrent += 1;
        }

        for (i = 0; i < cardsToRemove.length; i += 1) {
            removeCard(cardsToRemove[i]);
        }

        for (i = 0; i < cardsToAdd.length; i += 1) {
            addCard(cardsToAdd[i]);
        }

        currentHandCards = cards;
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
        }
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