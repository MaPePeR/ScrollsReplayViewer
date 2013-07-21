/*global $: false*/
//Effects module to handle NewEffect-Messages
(function (exports) {
    "use strict";

    var effectHandler = {
        "TurnBegin": function (e) {
            $("#roundcounter").text(e.turn);
            $("#playernamewhite, #playernameblack").removeClass("playernameactive");
            $("#playername" + e.color).addClass("playernameactive");
        }
    };

    function playEffect(effect) {
        var key, handler;
        for (key in effectHandler) {
            if (effect[key] && handler === undefined) {
                handler = effectHandler[key];
                handler(effect[key]);
            } else if (handler !== undefined) {
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