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
			'url': 'http://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(storeURL) + '&t=' + encodeURIComponent('I have ' + localStorage.getObject('tabsOpen').toString() + ' open & ' + localStorage.getObject('tabsTotal').toString() + ' all-time-opened browser tabs.'),
			'type': 'popup'
		});
	});

	$('social-twitter').observe('click', function(event) {
		event.stop();

		chrome.windows.create({
			'url': 'http://twitter.com/home?status=' + encodeURIComponent('Current browser tabs count: ' + localStorage.getObject('tabsOpen').toString() + ' open & ' + localStorage.getObject('tabsTotal').toString() + ' all-time opened tabs. //via bit.ly/ptSWJu #chrome'),
			'type': 'popup'
		});
	});

	$('reset-all-tabs').observe('click', function(event) {
		event.stop();

		resetTabTotalCount();
  	});

	$('reset-max-tabs').observe('click', function(event) {
		event.stop();
		  
  		resetTabMaxCount();
	});

  $('iconBgColor').observe('change', function(event) {
    event.stop();

    updateIconBgColorInput();
  });
}

function init() {

	localStorage.setObject('windowsOpen', 0);
	localStorage.setObject('tabsOpen', 0);
	localStorage.setObject('tabsWindowCurrentOpen', 0);

	var tabsTotal = localStorage.getObject('tabsTotal');
	if (!tabsTotal)
		localStorage.setObject('tabsTotal', 0);

	var tabsMax = localStorage.getObject('tabsMax');
	if (!tabsMax)
		localStorage.setObject('tabsMax', 0);

	chrome.tabs.onCreated.addListener(function() {
		incrementTabOpenCount(1);
	});

	chrome.tabs.onRemoved.addListener(function() {
		decrementTabOpenCount();
	});

	chrome.windows.onCreated.addListener(function() {
		incrementWindowOpenCount();
	});

	chrome.windows.onRemoved.addListener(function() {
		decrementWindowOpenCount();
	});

    chrome.windows.onFocusChanged.addListener(function() {
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

	var tabsOpen = localStorage.getObject('tabsOpen');
	var tabsMax = localStorage.getObject('tabsMax');
	if (tabsOpen > tabsMax) {
		localStorage.setObject('tabsMax', tabsOpen);
	}

	updateTabOpenCount();
}

function decrementTabOpenCount() {
	localStorage.setObject('tabsOpen', localStorage.getObject('tabsOpen') - 1);

	updateTabOpenCount();
}

function updateTabOpenCount() {
	chrome.browserAction.setBadgeText({text: localStorage.getObject('tabsOpen').toString()});
  //chrome.browserAction.setBadgeBackgroundColor({ "color": [89, 65, 0, 255] });
  chrome.browserAction.setBadgeBackgroundColor({ color: localStorage.getObject('iconBgColor').toString() });
}

function resetTabTotalCount() {
	localStorage.setObject('tabsTotal', 0);

	updatePopupCounts();
}

function resetTabMaxCount() {
	localStorage.setObject('tabsMax', 0);

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

function updateIconBgColorInput() {
  localStorage.setObject('iconBgColor', $('iconBgColor').value);
  updateTabOpenCount();
}

function updatePopupCounts() {
  $$('.maxCounter').invoke('update', localStorage.getObject('tabsMax'));
  $$('.totalCounter').invoke('update', localStorage.getObject('tabsTotal'));
  $$('.totalOpen').invoke('update', localStorage.getObject('tabsOpen'));
  $$('.windowsOpen').invoke('update', localStorage.getObject('windowsOpen'));
  $$('.windowCurrentOpen').invoke('update', localStorage.getObject('tabsWindowCurrentOpen'));

  var iconInput = $('iconBgColor');
  if (iconInput) {
    iconInput.value = localStorage.getObject('iconBgColor').toString();
  }
}

function initPopup() {
  updatePopupCounts();

	addListeners();
}
