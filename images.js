/*global scrollsData: false*/
(function (exports) {
    "use strict";
    var source = "local";
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
    }
}(this.images = {}));