Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    return this.getItem(key) && JSON.parse(this.getItem(key));
};

function addListeners() {

	var storeURL = 'https://chrome.google.com/webstore/detail/fhnegjjodccfaliddboelcleikbmapik';

	$('social-fb').observe('click', function(event) {
		event.stop();

		chrome.windows.create({
			'url': 'http://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(storeURL) + '&t=' + encodeURIComponent('I have ' + localStorage.tabsOpen + ' open & ' + localStorage.tabsTotal + ' all-time-opened browser tabs.'),
			'type': 'popup'
		});
	});

	$('social-twitter').observe('click', function(event) {
		event.stop();

		chrome.windows.create({
			'url': 'http://twitter.com/home?status=' + encodeURIComponent('Current browser tabs count: ' + localStorage.tabsOpen + ' open & ' + localStorage.tabsTotal + ' all-time opened tabs. //via bit.ly/ptSWJu #chrome'),
			'type': 'popup'
		});
	});

	$('reset-all-tabs').observe('click', function(event) {
    event.stop();

    resetTabTotalCount();
  });
}

function init() {

	localStorage.setObject('windowsOpen', 0);
	localStorage.setObject('tabsOpen', 0);
  localStorage.setObject('tabsWindowCurrentOpen', 0);

	var tabsTotal = localStorage.getObject('tabsTotal');
	if (!tabsTotal)
		localStorage.setObject('tabsTotal', 0);

	chrome.tabs.onCreated.addListener(function(tab) {
		incrementTabOpenCount(1);
	});

	chrome.tabs.onRemoved.addListener(function(tab) {
		decrementTabOpenCount();
	});

	chrome.windows.onCreated.addListener(function(tab) {
		incrementWindowOpenCount();
	});

	chrome.windows.onRemoved.addListener(function(tab) {
		decrementWindowOpenCount();
	});

  chrome.windows.onFocusChanged.addListener(function(tab) {
    updateWindowCurrentCount();
  });

  getCurrentWindowTabCount();
	updateTabTotalCount();
}

function incrementWindowOpenCount(count) {

	if (!count)
		count = 1;

	localStorage.setObject('windowsOpen', localStorage.getObject('windowsOpen') + count);

	updateTabOpenCount();
}

function decrementWindowOpenCount() {
	localStorage.setObject('windowsOpen', localStorage.getObject('windowsOpen') - 1);

	updateTabOpenCount();
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

function resetTabTotalCount() {
	localStorage.setObject('tabsTotal', 0);

	updatePopupCounts();
}

function getCurrentWindowTabCount() {
  chrome.windows.getCurrent({ 'populate': true }, function(window) {
    localStorage.setObject('tabsWindowCurrentOpen', window.tabs.size());
  });
}
function updateWindowCurrentCount() {
  getCurrentWindowTabCount();

  updatePopupCounts();
}

function updateTabTotalCount() {
	chrome.windows.getAll({ 'populate': true }, function(windows) {
		incrementWindowOpenCount(windows.size());

		windows.each(function(window) {
			incrementTabOpenCount(window.tabs.size());
		});
	});
}

function updatePopupCounts() {
  $$('.totalCounter').invoke('update', localStorage.tabsTotal);
  $$('.totalOpen').invoke('update', localStorage.tabsOpen);
  $$('.windowsOpen').invoke('update', localStorage.windowsOpen);
  $$('.windowCurrentOpen').invoke('update', localStorage.tabsWindowCurrentOpen);
}

function initPopup() {
  updatePopupCounts();

	addListeners();
}
