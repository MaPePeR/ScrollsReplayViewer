/*global $: false*/
(function (exports) {
    //TODO: rename module
    "use strict";
    var source = "local", scrollsData;

    $.getJSON("http://a.scrollsguide.com/scrolls", function (data) {
        scrollsData = {};
        var scrollindex, scroll;
        for (scrollindex in data.data) {
            scroll = data.data[scrollindex];
          //  console.log(scroll)
            scrollsData[parseInt(scroll.id, 10)] = scroll;
        }
        console.log("Loaded ScrollsGuide-Data");
    });

    exports.isRanged = function (typeId) {
        var passives = scrollsData[typeId].passiverules, i;
        for (i = 0; i < passives.length; i += 1) {
            if (passives[i].name === "Ranged attack") {
                return true;
            }
        }
        return false;
    };

    exports.isLobber = function (typeId) {
        var passives = scrollsData[typeId].passiverules, i;
        for (i = 0; i < passives.length; i += 1) {
            if (passives[i].name === "Lobber") {
                return true;
            }
        }
        return false;
    };

    exports.isRangedOrLobber = function (typeId) {
        var passives = scrollsData[typeId].passiverules, i;
        for (i = 0; i < passives.length; i += 1) {
            if (passives[i].name === "Lobber" || passives[i].name === "Ranged attack") {
                return true;
            }
        }
        return false;
    };

    if (source === "local") {
        exports.getScrollImageURL = function (scrollid) {
            return "./scrollimages/" + scrollid + ".png";
        };

        exports.getMainImageURLForScroll = function (scrollid) {
            return "./mainimages/" + scrollsData[scrollid].image + ".png";
        };

        exports.getAnimationPreviewURLForScroll = function (scrollid) {
            return "./animationimages/" + scrollsData[scrollid].animationpreview + '.png';
        };

    } else if (source === "sg") {
        exports.getScrollImageURL = function (scrollid) {
            return "http://a.scrollsguide.com/image/screen?name=" + encodeURIComponent(scrollsData[scrollid].name) + "&size=small";
        };

        exports.getMainImageURLForScroll = function (scrollid) {
            return "http://www.scrollsguide.com/app/low_res/" + scrollsData[scrollid].image + ".png";
        };

        exports.getAnimationPreviewURLForScroll = function (scrollid) {
            return "http://www.scrollsguide.com/app/animationimages/" + scrollsData[scrollid].animationpreview;
        };
    }
}(this.images = {}));