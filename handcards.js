/*jslint browser: true, vars: true*/
/*global scrollsdata, $: false*/

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
            currentHandCardsElem[index].hide();
        }
        arrayRemove(currentHandCards, index);
        arrayRemove(currentHandCardsElem, index);
    }

    function addCard(card) {
        var elem = $('<img class="handscroll" src="' + scrollsdata.getScrollImageURL(card.typeId) + '"/>');
        elem.hide();
        $("#handcards").append(elem);
        currentHandCards.push(card);
        currentHandCardsElem.push(elem);
    }

    function moveCards() {
        var i, width = $('#handcards').width();

        for (i = 0; i < currentHandCardsElem.length; i += 1) {
            currentHandCardsElem[i].css('left', (i + 0.25) * width / currentHandCardsElem.length).show();
        }
    }
    $(window).resize(moveCards);

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