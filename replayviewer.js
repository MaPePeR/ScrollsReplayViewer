/*jslint browser: true, vars: true, eqeq: true*/
/*global alert: false, $: false, replayreader: false*/

if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
    alert('The File APIs are not fully supported in this browser.');
}

//global:
var board;



$(function () {
    "use strict";

    //Multi-dimensional array initialiser - thanks to http://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938
    function createArray(length) {
        var arr = new Array(length || 0),
            i = length;

        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while(i--) arr[length-1 - i] = createArray.apply(this, args);
        }

        return arr;
    }

    function emptyBoard() {
        return {
            "whitefieldElem": $('#fieldwhite'),
            "blackfieldElem": $('#fieldblack'),
            "whitefield": createArray(5, 3),
            "blackfield": createArray(5, 3),
            "blackIdols": createArray(5),
            "whiteIdols": createArray(5),
            "lastwidth": $('#fieldwhite').width(),
            "lastheight": $('#fieldwhite').height()
        };
    }

    board = emptyBoard();
    function generateIdols() {
        var idolW, idolB;
        var fw = board.whitefieldElem;
        var fb = board.blackfieldElem;
        var width = board.lastwidth, height = board.lastheight, y;
        width  = Math.min(width, 16 * height / 15);
        height = Math.min(height, 15 * width / 16);

        for (y = 0; y < 5; y += 1) {
            idolW = $('<div class="idol" id="whiteidol' + y + '">20</div>');
            idolW.height(height / 5).width(width / 8).css('top', y * height / 5);
            board.whiteIdols[y] = idolW;
            fw.append(idolW);

            idolB = $('<div class="idol" id="blackidol' + y + '">20</div>');
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