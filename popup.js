let addedVideosCount = 0;

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

function storeAddedVideosList() {
    const list = document.getElementById("added-videos-list").innerHTML;

    chrome.storage.local.set({list});
}

function retrieveAddedVideosList() {
    const addedVideosList = document.getElementById("added-videos-list");

    chrome.storage.local.get(['list'], function(result) {
        const list = result.list;
        if (list) {
            addedVideosList.innerHTML = list;
        }
    });
}

function retrievePlaylist() {
    chrome.runtime.sendMessage({action: "retrievePlaylist"}, function(response) {
        if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError.message);
            return;
        }

        if (response && response.playlistLength) {
            addedVideosCount = response.playlistLength;
        } else {
            console.log("Error getting response.");
        }
    });
}

function clearLocalStorage() {
    const list = "";
    const addedVideos = [];

    addedVideosCount = 0;

    chrome.storage.local.set({list});
    document.getElementById("added-videos-list").innerHTML = "";

    chrome.runtime.sendMessage({action: "clearPlaylist"});

    chrome.storage.local.set({addedVideos});
}

document.getElementById("clearPlaylistBtn").addEventListener("click", clearLocalStorage);

document.addEventListener('DOMContentLoaded', function() {

    // clearLocalStorage();

    retrievePreviousInputValues();
    retrieveAddedVideosList();
    retrievePlaylist();
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

    let startTimestamp = document.getElementById("startTimestamp").value;

    if (startTimestamp === "") {
        startTimestamp = 0;
    }

    const endTimestamp = document.getElementById("endTimestamp").value;

    const endTimestampFormatted = endTimestamp !== '' ? formatTimestamp(endTimestamp) : "end";

    addedVideosCount++;

    const html = "<div><h3>" + addedVideosCount + ". " + link + "</h3><p>from " + formatTimestamp(startTimestamp) + " to " + endTimestampFormatted + "</p></div>";
    document.getElementById("added-videos-list").innerHTML += html;
    storeAddedVideosList();

    chrome.runtime.sendMessage({ action: "queueVideo", url: link, start: startTimestamp, end: endTimestamp });
}

document.getElementById("addToPlaylistBtn").addEventListener("click", addVideoToPlaylist);

function startPlaylist() {
    chrome.runtime.sendMessage({ action: "startPlaylist" });
}

document.getElementById("openVideoBtn").addEventListener("click", startPlaylist);
