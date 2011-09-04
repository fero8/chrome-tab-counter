Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return this.getItem(key) && JSON.parse(this.getItem(key));
}

function share(network) {

    if (network == 'twitter') {
        window.open('http://twitter.com/home?status=' + encodeURIComponent('I have ' + localStorage.tabsOpen + ' opened browser tabs. Who\'s got more? //via bit.ly/ptSWJu'));
    } else {
        window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent('http://bit.ly/ptSWJu') + '&t=' + encodeURIComponent('I have ' + localStorage.tabsOpen + ' opened browser tabs.'));
    }

    return false;
}

function init() {

	localStorage.setObject("tabsOpen", 0);

	var tabsTotal = localStorage.getObject('tabsTotal')
	if (!tabsTotal)
		localStorage.setObject("tabsTotal", 0);

	chrome.tabs.onCreated.addListener(function(tab) {
		incrementTabOpenCount(1);
	});

	chrome.tabs.onRemoved.addListener(function(tab) {
		decrementTabOpenCount(1);
	});

	updateTabTotalCount();
}

function incrementTabOpenCount(count) {

    if (!count)
        count = 1;

	localStorage.setObject('tabsOpen', localStorage.getObject('tabsOpen') + count);
    localStorage.setObject('tabsTotal', localStorage.getObject('tabsTotal') + count);
	updateTabOpenCount();
}

function decrementTabOpenCount() {
	localStorage.setObject('tabsOpen', localStorage.getObject('tabsOpen') - 1);
	updateTabOpenCount();
}

function updateTabOpenCount() {
	chrome.browserAction.setBadgeText({text: localStorage.getObject('tabsOpen').toString()});
	chrome.browserAction.setBadgeBackgroundColor({ "color": [89, 65, 0, 255] });
}

function resetTabOpenCount() {
    localStorage.setObject('tabsOpen', 0);
    updateTabOpenCount();
}

function resetTabTotalCount() {
    localStorage.setObject('tabsTotal', 0);
}

function updateTabTotalCount() {
    chrome.windows.getAll({ 'populate': true}, function(windows) {
        windows.each(function(window) {
            incrementTabOpenCount(window.tabs.size());
        });
    });
}

function initPopup() {
    $$('.totalCounter').invoke('update', localStorage.tabsTotal);
    $$('.totalOpen').invoke('update', localStorage.tabsOpen);
}