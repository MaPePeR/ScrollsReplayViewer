/*jslint browser: true, vars: true, eqeq: true*/
/*global alert: false, $: false, replayreader: false*/

if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
    alert('The File APIs are not fully supported in this browser.');
}

$(function () {
    "use strict";

    var backgroundCtx = $("#fieldbackground")[0].getContext('2d');
    function drawBackground() {
        //Adjust canvas size
        var width  = backgroundCtx.canvas.width  = $('#gamefield').innerWidth();
        var height = backgroundCtx.canvas.height = $('#gamefield').innerHeight();
        var fwidth = width / 2.0;
        backgroundCtx.fillStyle = 'green';
        backgroundCtx.fillRect(0, 0, width, height);
        backgroundCtx.strokeStyle = 'black';
        var x, y;
        for (y = 0; y < 5; y += 1) {
            for (x = 0; x < 3; x += 1) {
                backgroundCtx.strokeRect((y % 2 === 1 ? fwidth / 8 : fwidth / 4) + x * fwidth / 4, y * height / 5, fwidth / 4, fwidth * 3 / 4 / 4);
            }
        }
    }

    function calcSize() {
        console.log('resize!');
        var y, x;
        var width = (board.lastwidth = $('#fieldwhite').width());
        var height = (board.lastheight = $('#fieldwhite').height());
        for (y = 0; y < 5; y += 1) {
            for (x = 0; x < 3; x += 1) {
                if (board.whitefield[y][x] !== undefined) {
                    board.whitefield[y][x].width(width / 4).height(width * 3 / 4 / 4).css('top', y * height / 5).css(replayreader.getPerspective() === 'white' ? 'left' : 'right', (y % 2 === 1 ? width / 8 : width / 4) + x * width / 4);
                }
                if (board.blackfield[y][x] !== undefined) {
                    board.blackfield[y][x].width(width / 4).height(width * 3 / 4 / 4).css('top', y * height / 5).css(replayreader.getPerspective() === 'black' ? 'left' : 'right', (y % 2 === 1 ? width / 8 : width / 4) + x * width / 4);
                }
            }
            board.blackIdols[y].height(height / 5).width(width / 8).css('top', y * height / 5);
            board.whiteIdols[y].height(height / 5).width(width / 8).css('top', y * height / 5);
        }
        handcards.moveCards();
        drawBackground();
    };
    $(window).resize(calcSize);

    board = emptyBoard();
    function generateIdols() {
        var idolW, idolB;
        var fw = board.whitefieldElem;
        var fb = board.blackfieldElem;
        var width = board.lastwidth, height = board.lastheight, y;
        width  = Math.min(width, 16 * height / 15);
        height = Math.min(height, 15 * width / 16);

        for (y = 0; y < 5; y += 1) {
            idolW = $('<div class="idol" id="whiteidol' + y + '"></div>');
            idolW.height(height / 5).width(width / 8).css('top', y * height / 5);
            board.whiteIdols[y] = idolW;
            fw.append(idolW);

            idolB = $('<div class="idol" id="blackidol' + y + '"></div>');
            idolB.height(height / 5).width(width / 8).css('top', y * height / 5);
            board.blackIdols[y] = idolB;
            fb.append(idolB);
        }
    }
    generateIdols();

    var filenamePattern = /\.s[gp]r$/; //For ScrollsGuide(.sgr) and ScrollsPost(.spr)-Replays
    function validateReplayFiles() {
        var fileL = $("#replayfileL").val() || "";
        var fileR = $("#replayfileR").val() || "";
        var errorText = "";
        if (fileL != "" && fileR != "") {
            errorText += "Viewing 2 replays is not yet implemented, sorry.";
        }
        if (fileL == "" && fileR == "") {
            errorText += "You need to select at least one replay file!<br/>";
        } else {
            if (fileL != "" && !filenamePattern.test(fileL)) {
                errorText += "Left Player Replay is not a known replay format.<br/>";
            }
            if (fileR != "" && !filenamePattern.test(fileR)) {
                errorText += "Right Player Replay is not a known replay format.<br/>";
            }
        }
        $('#error').html(errorText);
        $("#playButton").prop("disabled", errorText != ""); //Disable, if errorText is not empty
    }
    $("#replayfileL, #replayfileR").on('change', validateReplayFiles);
    function readFiles() {
        var fileL = document.getElementById("replayfileL").files[0];
        var fileR = document.getElementById("replayfileR").files[0];
        replayreader.init(fileL, fileR, function () {
            $("#replaychooser").hide();
            $("#game").show();
            calcSize();
            $("#playernamewhite").text(replayreader.getWhiteName());
            $("#playernameblack").text(replayreader.getBlackName());
            //Default: white player on the left. when perspective is 'black': swap postions of GUI elements
            if (replayreader.getPerspective() === "black") {
                $("#fieldwhite, #fieldblack").toggleClass("fieldleft fieldright");
                $("#playernamewhite, #playernameblack").toggleClass("playernameleft playernameright");
                $("#resourceswhite, #resourcesblack").toggleClass("playerresourcesright playerresourcesleft");
            }
        });
    }
    $("#playButton").on('click', readFiles);
    validateReplayFiles();

});