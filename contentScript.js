let duration = 0;

function sendMessageAndWait(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.onMessage.addListener(function(response) {
            if (response && response.type === 'response') {
                resolve(response.data);
            }
        });

        chrome.runtime.sendMessage(message);

        // Set a timeout to reject the promise if no response is received after a certain time
        setTimeout(() => {
            reject(new Error('Timeout: No response received'));
        }, 8000);
    });
}

function getCurrentTime() {
	const player = document.querySelector('video');
	
	if (player && player.tagName.toLowerCase() === 'video') {
		const currentTime = player.currentTime;
		console.log(currentTime);
		chrome.runtime.sendMessage({action: "setCurrentTime", timestamp: currentTime});
	}
}

function getVideoDuration() {
	if (duration > 0) {
		return;
	}

	const player = document.querySelector('video');
	if (player && player.tagName.toLowerCase() === 'video') {
		duration = player.duration;
		console.log("duration: " + duration);
		chrome.runtime.sendMessage({action: "setVideoDuration", duration: duration});
	}
}


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	const player = document.querySelector('video');
	if (player && player.tagName.toLowerCase() === 'video') {
		if (message.action === "pauseVideo") {
			player.pause();
		} else if (message.action === "fastForwardTo") {
			player.currentTime = message.timestamp;;
		}
	}
});


setInterval(getVideoDuration, 1000);
setInterval(getCurrentTime, 1000);

const site = window.location.hostname;

console.log("I have been injected to " + site);
