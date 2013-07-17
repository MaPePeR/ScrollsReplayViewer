/*jslint browser: true, vars: true, eqeq: true*/
/*global alert: false, $: false, replayreader: false*/

if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
    alert('The File APIs are not fully supported in this browser.');
}

//global:

$(function () {
    "use strict";
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
            replayreader.getNextMessage();
        });

        //$("#replaychooser").hide();
    }
    $("#playButton").on('click', readFiles);
    validateReplayFiles();
});