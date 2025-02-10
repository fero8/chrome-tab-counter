async function setStorageItem(key, value) {
	await chrome.storage.local.set({ [key]: JSON.stringify(value) });
}

async function getStorageItem(key) {
	const result = await chrome.storage.local.get(key);
	return result[key] ? JSON.parse(result[key]) : null;
}

async function init() {
	try {
		// Add listeners for tab and window changes
		chrome.tabs.onCreated.addListener(async () => {
			await incrementTabOpenCount();
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
			await getCurrentWindowTabCount();
			await updateTabTotalCount();
		});

		await getCurrentWindowTabCount();
		await updateTabTotalCount();
		await updateBadge();
	} catch (error) {
		console.error('Error during initialization:', error);
	}
}

async function incrementWindowOpenCount() {
	updateTabTotalCount();
}

async function decrementWindowOpenCount() {
	updateTabTotalCount();
}

async function incrementTabOpenCount() {
	try {
		const tabsTotal = await getStorageItem('tabsTotal') || 0;
		if (tabsTotal >= 0) {
			await setStorageItem('tabsTotal', tabsTotal + 1);
		}

		await updateTabTotalCount();
		await updateBadge();

	} catch (error) {
		console.error('Error incrementing tab count:', error);
	}
}

async function decrementTabOpenCount() {
	try {
		await updateTabTotalCount();
		await updateBadge();
	} catch (error) {
		console.error('Error decrementing tab count:', error);
	}
}

async function resetTabTotalCount() {
	try {
		await setStorageItem('tabsTotal', 0);
		await updateTabTotalCount();
	} catch (error) {
		console.error('Error resetting total tab count:', error);
	}
}

async function resetTabMaxCount() {
	try {
		await setStorageItem('tabsMax', 0);
		await updateTabTotalCount();
	} catch (error) {
		console.error('Error resetting max tab count:', error);
	}
}

async function getCurrentWindowTabCount() {
	const window = await chrome.windows.getLastFocused({ 'populate': true });
	const pinnedTabs = window.tabs.filter(tab => tab.pinned).length;

	await setStorageItem('tabsWindowCurrentOpen', window.tabs.length);
	await setStorageItem('tabsWindowCurrentPinned', pinnedTabs);
}

async function updateTabTotalCount() {
	try {
		const windows = await chrome.windows.getAll({ populate: true });
		const totalOpenTabs = windows.reduce((sum, window) => sum + window.tabs.length, 0);
		
		const tabsMax = await getStorageItem('tabsMax') || 0;

		await Promise.all([
			setStorageItem('windowsOpen', windows.length),
			setStorageItem('tabsOpen', totalOpenTabs)
		]);
		
		if (!tabsMax || totalOpenTabs > tabsMax) {
			await setStorageItem('tabsMax', totalOpenTabs);
		}

		await updateBadge();
		await notifyPopup();
	} catch (error) {
		console.error('Error updating total tab count:', error);
	}
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

// Add this function to handle sending updates to popup
async function notifyPopup() {
	// Simply try to send the message, chrome.runtime will handle if popup exists
	await chrome.runtime.sendMessage({ action: 'updateCounts' }).catch(() => {
		// Silently fail if popup is closed
	});
}

// We do this only once, when the extension is opened
export async function migrateStorage(tabsTotal, tabsMax) {
	try {
		const oldTotal = parseInt(tabsTotal) || 0;
		const oldMax = parseInt(tabsMax) || 0;

		if (!isNaN(oldTotal) && oldTotal > 0) {
			const currentTotal = await getStorageItem('tabsTotal') || 0;
			const newTotal = currentTotal + oldTotal;

			if (newTotal >= 0) {
				await setStorageItem('tabsTotal', newTotal);
			}
		}

		if (!isNaN(oldMax) && oldMax > 0) {
			const currentMax = await getStorageItem('tabsMax') || 0;
			const newMax = Math.max(currentMax, oldMax);

			if (newMax >= 0) {
				await setStorageItem('tabsMax', newMax);
			}
		}
	} catch (error) {}
}

export {
	init,
	setStorageItem,
	getStorageItem,
	getCurrentWindowTabCount,
	updateTabTotalCount,
	resetTabTotalCount,
	resetTabMaxCount,
	updateIconBgColorInput,
	updateIconTextColorInput
};
