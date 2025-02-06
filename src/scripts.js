async function setStorageItem(key, value) {
	await chrome.storage.local.set({ [key]: JSON.stringify(value) });
}

async function getStorageItem(key) {
	const result = await chrome.storage.local.get(key);
	return result[key] ? JSON.parse(result[key]) : null;
}

async function init() {
	try {
		const windows = await chrome.windows.getAll({ populate: true });
		const totalTabs = windows.reduce((sum, window) => sum + window.tabs.length, 0);
		
		await setStorageItem('windowsOpen', windows.length);
		await setStorageItem('tabsOpen', totalTabs);
		await setStorageItem('tabsWindowCurrentOpen', 0);

		const tabsTotal = await getStorageItem('tabsTotal');
		if (!tabsTotal || tabsTotal < totalTabs) {
			await setStorageItem('tabsTotal', totalTabs);
		}

		const tabsMax = await getStorageItem('tabsMax');
		if (!tabsMax || totalTabs > tabsMax) {
			await setStorageItem('tabsMax', totalTabs);
		}

		// Add listeners for tab and window changes
		chrome.tabs.onCreated.addListener(async () => {
			await incrementTabOpenCount(1);
		});

		chrome.tabs.onRemoved.addListener(async () => {
			await decrementTabOpenCount();
		});

		chrome.windows.onCreated.addListener(async () => {
			await incrementWindowOpenCount();
		});

		chrome.windows.onRemoved.addListener(async () => {
			await decrementWindowOpenCount();
		});

		chrome.windows.onFocusChanged.addListener(async () => {
			await updateWindowCurrentCount();
		});

		await getCurrentWindowTabCount();
		await updateTabTotalCount();
	} catch (error) {
		console.error('Error during initialization:', error);
	}
}

async function incrementWindowOpenCount(count) {
	if (!count)
		count = 1;
	const current = await getStorageItem('windowsOpen');
	await setStorageItem('windowsOpen', current + count);

	updateTabOpenCount();
}

async function decrementWindowOpenCount() {
	const current = await getStorageItem('windowsOpen');
	await setStorageItem('windowsOpen', current - 1);

	updateTabOpenCount();
}

async function incrementTabOpenCount(count) {
	if (!count) count = 1;
	
	const tabsOpen = await getStorageItem('tabsOpen') || 0;
	const tabsTotal = await getStorageItem('tabsTotal') || 0;
	const tabsMax = await getStorageItem('tabsMax') || 0;
	
	const newTabsOpen = tabsOpen + count;
	await setStorageItem('tabsOpen', newTabsOpen);
	await setStorageItem('tabsTotal', tabsTotal + count);
	
	if (newTabsOpen > tabsMax) {
		await setStorageItem('tabsMax', newTabsOpen);
	}
	
	await updateTabOpenCount();
}

async function decrementTabOpenCount() {
	const tabsOpen = await getStorageItem('tabsOpen') || 0;
	if (tabsOpen > 0) {  // Add check to prevent negative values
		await setStorageItem('tabsOpen', tabsOpen - 1);
		await updateTabOpenCount();
	}
}

async function updateTabOpenCount() {
	await updateBadge();
}

async function resetTabTotalCount() {
	try {
		const currentTabs = await getStorageItem('tabsOpen') || 0;
		await setStorageItem('tabsTotal', currentTabs);
		await updateBadge();
	} catch (error) {
		console.error('Error resetting total tab count:', error);
	}
}

async function resetTabMaxCount() {
	try {
		const currentTabs = await getStorageItem('tabsOpen') || 0;
		await setStorageItem('tabsMax', currentTabs);
		await updateBadge();
	} catch (error) {
		console.error('Error resetting max tab count:', error);
	}
}

async function getCurrentWindowTabCount() {
	const window = await chrome.windows.getLastFocused({ 'populate': true });
	const pinnedTabs = window.tabs.filter(tab => tab.pinned).length;

	await setStorageItem('tabsWindowCurrentOpen', window.tabs.length);
	await setStorageItem('tabsWindowCurrentPinned', pinnedTabs);
	
	//console.log('Current window ' + window.id + ' tab count:', window.tabs.length);
}

async function updateWindowCurrentCount() {
	await getCurrentWindowTabCount();
}

async function updateTabTotalCount() {
	const windows = await chrome.windows.getAll({ populate: true });
	const totalTabs = windows.reduce((sum, window) => sum + window.tabs.length, 0);
	
	await setStorageItem('windowsOpen', windows.length);
	await setStorageItem('tabsOpen', totalTabs);

	//console.log('All windows count: ' + windows.length);
	//console.log('Updated total tab count:', totalTabs);

	await updateTabOpenCount();
}

async function updateIconBgColorInput(color) {
	try {
		if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/i)) {
			throw new Error('Invalid color format');
		}
		await setStorageItem('iconBgColor', color.toUpperCase());
		await updateBadge();
	} catch (error) {
		console.error('Error updating badge background color:', error);
	}
}

async function updateIconTextColorInput(color) {
	try {
		if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/i)) {
			throw new Error('Invalid color format');
		}
		await setStorageItem('iconTextColor', color.toUpperCase());
		await updateBadge();
	} catch (error) {
		console.error('Error updating badge text color:', error);
	}
}

async function updateBadge() {
	try {
		const tabsOpen = await getStorageItem('tabsOpen') || 0;
		const bgColor = await getStorageItem('iconBgColor') || '#FF0000';
		const textColor = await getStorageItem('iconTextColor') || '#FFFFFF';

		await chrome.action.setBadgeText({
			text: tabsOpen.toString()
		});
		await chrome.action.setBadgeBackgroundColor({
			color: bgColor
		});
		await chrome.action.setBadgeTextColor({
			color: textColor
		});
	} catch (error) {
		console.error('Error updating badge:', error);
		// Set defaults if there's an error
		await Promise.all([
			chrome.action.setBadgeText({ text: '0' }),
			chrome.action.setBadgeBackgroundColor({ color: '#FF0000' }),
			chrome.action.setBadgeTextColor({ color: '#FFFFFF' })
		]);
	}
}

export {
	init,
	setStorageItem,
	getStorageItem,
	getCurrentWindowTabCount,
	updateTabOpenCount,
	updateTabTotalCount,
	resetTabTotalCount,
	resetTabMaxCount,
	updateIconBgColorInput,
	updateIconTextColorInput
};
