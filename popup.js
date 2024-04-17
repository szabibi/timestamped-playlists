function breakUpTimestamp(timestamp) {
    let hours;
    let minutes;
    let seconds;

    hours = Math.floor(timestamp / 3600);
    const remainder = timestamp % 3600;

    minutes = Math.floor(remainder / 60);
    seconds = remainder % 60;

    return {
        "hours" : hours,
        "minutes" : minutes,
        "seconds" : seconds
    }
}

function formatTimestamp(timestamp) {
    const data = breakUpTimestamp(timestamp);

    const hoursZero = data.hours < 10 ? "0" : "";
    const minutesZero = data.minutes < 10 ? "0" : "";
    const secondsZero = data.seconds < 10 ? "0" : "";

    return hoursZero + data.hours + ":" + minutesZero + data.minutes + ":" + secondsZero + data.seconds + "s";
}

function storeInputs() {
    const link = document.getElementById("link").value;
    const startTimestamp = document.getElementById("startTimestamp").value;
    const endTimestamp = document.getElementById("endTimestamp").value;

    const inputValues = {
        link: link,
        start: startTimestamp,
        end: endTimestamp
    }

    chrome.storage.session.set({inputValues});
}

function retrievePreviousInputValues() {
    const link = document.getElementById("link");
    const startTimestamp = document.getElementById("startTimestamp");
    const endTimestamp = document.getElementById("endTimestamp");
    
    chrome.storage.session.get(['inputValues'], function(result) {
        const values = result.inputValues;
        if (values) {
            link.value = values.link;
            startTimestamp.value = values.start;
            endTimestamp.value = values.end;
        }

    });
}

document.addEventListener('DOMContentLoaded', function() {
    retrievePreviousInputValues();
});

document.getElementById('add-video-form').addEventListener('change', storeInputs);

function addVideoToPlaylist() {
    const link = document.getElementById("link").value;

    const errorMsg = document.getElementById("link-error-message");
    if (link.indexOf("youtube.com/watch?v=") === -1 && link.indexOf("youtu.be/") === -1) {
        errorMsg.style.display = "";
        return;
    } else {
        errorMsg.style.display = "none";
    }


    startTimestamp = document.getElementById("startTimestamp").value;
    const endTimestamp = document.getElementById("endTimestamp").value;
    const p = document.getElementById("info");

    const html = "<div><h3>" + link + "</h3><p>from " + formatTimestamp(startTimestamp) + " to " + formatTimestamp(endTimestamp) + "</p></div>";
    document.getElementById("added-videos-list").innerHTML += html;

    chrome.runtime.sendMessage({ action: "queueVideo", url: link, start: startTimestamp, end: endTimestamp });
}

document.getElementById("addToPlaylistBtn").addEventListener("click", addVideoToPlaylist);

function startPlaylist() {
    chrome.runtime.sendMessage({ action: "startPlaylist" });
}

document.getElementById("openVideoBtn").addEventListener("click", startPlaylist);
