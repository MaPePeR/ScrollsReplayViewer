/*jslint vars: true*/
/*global $:false*/
function fillBoard() {
    "use strict";
    var fw = $('#fieldwhite'), rowW, scrollW;
    var fb = $('#fieldblack'), rowB, scrollB;
    var y, x;
    for (y = 0; y < 5; y += 1) {
        rowW = $('<div class="fieldrow"></div>');
        rowB = $('<div class="fieldrow"></div>');
        for (x = 0; x < 3; x += 1) {
            scrollW = $('<img class="scroll" src="http://www.scrollsguide.com/app/low_res/810.png">');
            scrollB = $('<img class="scroll" src="http://www.scrollsguide.com/app/low_res/719.png">');
            rowW.append(scrollW);
            rowB.append(scrollB);
        }
        fw.append(rowW);
        fb.append(rowB);
    }
}
$(fillBoard);