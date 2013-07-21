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
$(fillBoard);

function testHandCards() {
    "use strict";
    var but = $("<input type='button' value='Add Card'></input>");
    but.on('click', function () {
        var scroll = $('<div class="handscrollcontainer"><img class="handscroll" src="http://www.scrollsguide.com/wiki/images/thumb/6/6d/Beast_Rat.png/215px-Beast_Rat.png"/></div>');
        $('#handcards').append(scroll);
    });
    $("#debugcontrols").append(but);
}
$(testHandCards);

function handleNextMessageTest() {
    "use strict";
    function handleNextMessage() {
        var m = replayreader.getNextMessage();
        while (m.msg === "CardInfo") {
            m = replayreader.getNextMessage();
        }
        console.log(JSON.stringify(m));
        effects.readMessage(m);
    }
    var but = $("<input type='button' value='next!'></input");
    but.on('click', handleNextMessage);

    $("#debugcontrols").append(but);
}
$(handleNextMessageTest);

