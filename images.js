/*global $: false*/
(function (exports) {
    "use strict";
    var source = "local", scrollsData;

    $.getJSON("http://a.scrollsguide.com/scrolls?norules", function (data) {
        scrollsData = {};
        var scrollindex, scroll;
        for (scrollindex in data.data) {
            scroll = data.data[scrollindex];
          //  console.log(scroll)
            scrollsData[parseInt(scroll.id, 10)] = scroll;
        }
        console.log("Loaded ScrollsGuide-Data");
    });

    if (source === "local") {
        exports.getScrollImageURL = function (scrollid) {
            return "./scrollimages/" + scrollid + ".png";
        };

        exports.getMainImageURLForScroll = function (scrollid) {
            return "./mainimages/" + scrollsData[scrollid].image + ".png";
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