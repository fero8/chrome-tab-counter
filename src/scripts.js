function incrementTabCount() {
	localStorage.tabsTotal++;
	updateTabCount();
}

function updateTabCount() {
	chrome.browserAction.setBadgeText({text: localStorage.tabsTotal});
	chrome.browserAction.setBadgeBackgroundColor({ "color": [89, 65, 0, 255] });
}

function resetCounter() {
    localStorage.tabsTotal = 0;
    updateTabCount();
}