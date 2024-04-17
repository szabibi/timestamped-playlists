// a single video's data
let videoURL;
let startTimestamp;
let endTimestamp;
let currentTimestamp;
let currentVideoDuration;

let tabId;

// playlist playing data
let playlistIdx = 0;
const addedVideos = [];

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "setCurrentTime") {
        currentTimestamp = message.timestamp;
        if ((endTimestamp === "" && currentTimestamp >= currentVideoDuration) || (endTimestamp !== "" && currentTimestamp >= endTimestamp && Math.abs(currentTimestamp - endTimestamp) <= 1)) {
            console.log("condition2");
            console.log(endTimestamp !== "");
            console.log(endTimestamp);
            if (playlistIdx + 1 < addedVideos.length) {
                playNextVideo();
            } else { // end of playlist
                pauseVideo();
            }
        }
    } else if (message.action === "setVideoDuration") {
        currentVideoDuration = message.duration;
        console.log("duration: " + currentVideoDuration);
    } else if (message.action === "queueVideo") {
        const video = {
            url: message.url,
            start: message.start,
            end: message.end
        }
        addedVideos.push(video);
    } else if (message.action === "startPlaylist") {
        if (addedVideos.length > 0) {
            startPlaylist();
        }
    } else
    {
        console.log(message.action);
    }
});

function assembleCompleteURL() {
    let completeURL = videoURL;
    if (startTimestamp !== "") {
        completeURL += "&t=" + startTimestamp + "s";
    }

    return completeURL;
}

function setCurrentVideoData() {
    currentTimestamp = 0;

    const videoData = addedVideos[playlistIdx];
    videoURL = videoData.url;
    startTimestamp = videoData.start;
    endTimestamp = videoData.end;
    console.log("endTimestamp changed to: " + endTimestamp);
}

function startPlaylist() {

    playlistIdx = 0;
    setCurrentVideoData();

    chrome.tabs.create({ url: assembleCompleteURL() }, function(tab) {
        tabId = tab.id;
    });


}
function pauseVideo() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabId, { action: "pauseVideo"});
    });
}

function playNextVideo() {

    playlistIdx += 1;
    const previousURL = videoURL;

    setCurrentVideoData();

    const videoData = addedVideos[playlistIdx];
    if (videoData.url === previousURL) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabId, { action: "fastForwardTo", timestamp: videoData.start});
        });
    } else {
        pauseVideo();
        chrome.tabs.update(tabId, { url: assembleCompleteURL() });
    }

}

