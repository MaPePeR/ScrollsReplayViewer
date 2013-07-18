/*jslint vars: true*/
/*global replayreader, $:false*/
function fillBoard() {
    "use strict";
    var fw = $('#fieldwhite'), rowW, scrollW;
    var fb = $('#fieldblack'), rowB, scrollB;
    var y, x;
    for (y = 0; y < 5; y += 1) {
        rowW = $('<div class="fieldrow"></div>');
        rowB = $('<div class="fieldrow"></div>');
        for (x = 0; x < 3; x += 1) {
            scrollW = $('<img class="fieldscroll" src="http://www.scrollsguide.com/app/low_res/810.png">');
            scrollB = $('<img class="fieldscroll" src="http://www.scrollsguide.com/app/low_res/719.png">');
            rowW.append(scrollW);
            rowB.append(scrollB);
        }
        fw.append(rowW);
        fb.append(rowB);
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
    var currentRessources;
    function handleNextMessage() {
        var m = replayreader.getNextMessage();
        if (m.msg === "ActiveResources") {
            currentRessources = m.types;
        } else if(m.msg === "NewEffects") {

        }
        console.log(m);
    }
    var but = $("<input type='button' value='next!'></input");
    but.on('click', handleNextMessage);

    $("#debugcontrols").append(but);
}
$(handleNextMessageTest);

