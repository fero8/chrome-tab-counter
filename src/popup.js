import { getStorageItem, setStorageItem, resetTabTotalCount, resetTabMaxCount, updateIconBgColorInput, updateIconTextColorInput, getCurrentWindowTabCount } from './scripts.js';

export async function updatePopupCounts() {
  const tabsMax = await getStorageItem('tabsMax');
  const tabsTotal = await getStorageItem('tabsTotal');
  const tabsOpen = await getStorageItem('tabsOpen');
  const windowsOpen = await getStorageItem('windowsOpen');
  const tabsWindowCurrentOpen = await getStorageItem('tabsWindowCurrentOpen');
  const tabsWindowCurrentPinned = await getStorageItem('tabsWindowCurrentPinned');
  const iconBgColor = await getStorageItem('iconBgColor') || '#FF0000';
  const iconTextColor = await getStorageItem('iconTextColor') || '#FFFFFF';

  document.querySelectorAll('.maxCounter').forEach(el => el.textContent = tabsMax || '0');
  document.querySelectorAll('.totalCounter').forEach(el => el.textContent = tabsTotal || '0');
  document.querySelectorAll('.totalOpen').forEach(el => el.textContent = tabsOpen || '0');
  document.querySelectorAll('.windowsOpen').forEach(el => el.textContent = windowsOpen || '0');
  document.querySelectorAll('.windowCurrentOpen').forEach(el => el.textContent = tabsWindowCurrentOpen || '0');
  document.querySelectorAll('.windowCurrentPinned').forEach(el => el.textContent = tabsWindowCurrentPinned || '0');

  // Update color pickers
  const bgColorPicker = document.getElementById('iconBgColorPicker');
  const textColorPicker = document.getElementById('iconTextColorPicker');
  if (bgColorPicker) bgColorPicker.value = iconBgColor;
  if (textColorPicker) textColorPicker.value = iconTextColor;
}

async function initPopupStorage() {
  try {
    const color = await getStorageItem('iconBgColor');
    
    if (typeof color != 'string' || !color) {
      await setStorageItem('iconBgColor', '#FF0000');
    }
  } catch (error) {
    console.error('Failed to initialize popup storage:', error);
  }
}

async function addListeners() {
	const storeURL = 'https://chrome.google.com/webstore/detail/chrome-tab-counter/fhnegjjodccfaliddboelcleikbmapik';

	// Social sharing
	/* document.getElementById('social-fb').addEventListener('click', async (event) => {
		event.preventDefault();
    const windowsOpen = await getStorageItem('windowsOpen');
		const tabsOpen = await getStorageItem('tabsOpen');
		const tabsTotal = await getStorageItem('tabsTotal');
		
    const fbUrl = 'https://www.facebook.com/dialog/share?' + new URLSearchParams({
      app_id: '145634995501895', // You'll need to replace this with your Facebook App ID
      display: 'popup',
      href: storeURL,
      quote: `I've got ${windowsOpen} windows open with ${tabsOpen} tabs & ${tabsTotal} all-time-opened browser tabs.`,
      hashtag: '#ChromeTabCounter'
    }).toString();

		chrome.tabs.create({
			url: fbUrl,
			active: true
		});
	}); */

	document.getElementById('social-twitter').addEventListener('click', async (event) => {
		event.preventDefault();
    const windowsOpen = await getStorageItem('windowsOpen');
		const tabsOpen = await getStorageItem('tabsOpen');
		const tabsTotal = await getStorageItem('tabsTotal');
		
		const twitterUrl = 'https://twitter.com/intent/tweet?' + new URLSearchParams({
			text: `I've got ${windowsOpen} windows open with ${tabsOpen} tabs & ${tabsTotal} all-time-opened browser tabs.`,
			via: 'ChromeTabCounter'
		}).toString();

		chrome.tabs.create({
			url: twitterUrl,
			active: true
		});
	});

	document.getElementById('reset-all-tabs').addEventListener('click', async (event) => {
		event.preventDefault();
		await resetTabTotalCount();
		await updatePopupCounts();
	});

	document.getElementById('reset-max-tabs').addEventListener('click', async (event) => {
		event.preventDefault();
		await resetTabMaxCount();
		await updatePopupCounts();
	});

  // Color pickers
	document.getElementById('iconBgColorPicker').addEventListener('input', async (event) => {
		event.preventDefault();
		const color = event.target.value.toUpperCase();
		await updateIconBgColorInput(color);
	});

  document.getElementById('iconTextColorPicker').addEventListener('input', async (event) => {
    event.preventDefault();
    const color = event.target.value.toUpperCase();
    await updateIconTextColorInput(color);
  });
}

async function initializePopup() {
  try {
    await initPopupStorage();
    await getCurrentWindowTabCount();
    await updatePopupCounts();
    await addListeners();
  } catch (error) {
    console.error('Failed to initialize popup:', error);
  }
}

// Add event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializePopup);

// Add message listener for real-time updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateCounts') {
        updatePopupCounts();
    }
});