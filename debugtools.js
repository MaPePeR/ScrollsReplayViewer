/*jslint vars: true*/
/*global replayreader, effects, $:false*/
function fillBoard() {
    "use strict";
    // width/height = 16/15
    var fw = $('#fieldwhite'), rowW, scrollW;
    var fb = $('#fieldblack'), rowB, scrollB;
    var y, x;
    var width = fw.width(), height = fw.height();
    width  = Math.min(width, 16 * height / 15);
    height = Math.min(height, 15 * width / 16);
    var isBackRow;
    for (y = 0; y < 5; y += 1) {
        isBackRow = y % 2 === 1;
        for (x = 0; x < 3; x += 1) {
            scrollW = $('<img class="fieldscroll" src="http://www.scrollsguide.com/app/low_res/810.png">');
            scrollW.width(width / 4).css('top', y * height / 5).css('left', (isBackRow ? width / 8 : width / 4) + x * width / 4);
            fw.append(scrollW);

            scrollB = $('<img class="fieldscroll" src="http://www.scrollsguide.com/app/low_res/719.png">');
            scrollB.width(width / 4).css('top', y * height / 5).css('right', (isBackRow ? width / 8 : width / 4) + x * width / 4);
            fb.append(scrollB);
        }
    }
}
//$(fillBoard);

function testHandCards() {
    "use strict";
    var but = $("<input type='button' value='Add Card'></input>");
    but.on('click', function () {
        var scroll = $('<div class="handscrollcontainer"><img class="handscroll" src="http://www.scrollsguide.com/wiki/images/thumb/6/6d/Beast_Rat.png/215px-Beast_Rat.png"/></div>');
        $('#handcards').append(scroll);
    });
    $("#debugcontrols").append(but);
}
//$(testHandCards);

function handleNextMessageTest() {
    "use strict";
    var but = $("<input type='button' value='next!'></input>");
    var checkbox = $('<input type="checkbox" title="autoplay" id="autoplay"></input>');

    function nextMessageIfAutoPlay() {
        if (checkbox[0].checked) { //We wan't autoplay, don't enable button, just continue
            setTimeout(handleNextMessage, 1000);
        } else {
            but.removeAttr("disabled"); //enable when effects ready
        }
    }

    function handleNextMessage() {
        var m = replayreader.getNextMessage();
        while (m.msg === "CardInfo" || m.msg === "AbilityInfo") {
            m = replayreader.getNextMessage();
        }
        console.log(JSON.stringify(m));
        if (m.msg === "GameChatMessage") {
            //TODO Show Chat Window
            console.log("CHAT: " + m.from + ":" + m.text);
            nextMessageIfAutoPlay();
        } else if (m.msg === "NewEffects") {
            but.attr("disabled", "disabled"); //disable
            effects.readMessage(m, nextMessageIfAutoPlay);
        } else {
            console.log("Unhandled Message: ", m);
        }
    }

    but.on('click', handleNextMessage);

    $("#debugcontrols").append(but);
    $("#debugcontrols").append(checkbox);
}
$(handleNextMessageTest);


