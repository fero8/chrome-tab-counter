import { init, getStorageItem, setStorageItem } from './scripts.js';

setStorageItem('lastPing', Date.now());

async function ping() {
  try {
    const timestamp = Date.now();
    const lastPingTime = await getStorageItem('lastPing');
    const timeSinceLastPing = timestamp - lastPingTime;

    // If more than 2 minutes passed between pings, system likely slept
    if (timeSinceLastPing > 120000) {
      //console.log('System wake detected, time since last ping:', Math.round(timeSinceLastPing/1000), 'seconds');
      //await init();
      await chrome.runtime.reload();
    }
    await setStorageItem('lastPing', timestamp);
    //console.log('Service worker ping:', new Date(timestamp).toLocaleTimeString(), `(${Math.floor(timestamp/1000)}s)`);

    // Add platform info check to keep service worker alive
    await chrome.runtime.getPlatformInfo();
  } catch (error) {
    console.error('Ping failed:', error);
  }
}

async function setupAlarms() {
  await chrome.alarms.clearAll();
  
  chrome.alarms.create('keepAlive', {
    periodInMinutes: 0.5,
    delayInMinutes: 0  // Start immediately
  });
  
  await ping();
}

// Listen for alarm events
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'keepAlive') {
    await ping();
  }
});

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
  try {
    await init();
    await setupAlarms();
  } catch (error) {
    console.error('Failed to initialize on install:', error);
  }
});

// Initialize on startup
chrome.runtime.onStartup.addListener(async () => {
  try {
    //console.log('Service worker startup');
    await init();
    await setupAlarms();
  } catch (error) {
    console.error('Failed to initialize on startup:', error);
  }
});

// Reinitialize when receiving a connection
chrome.runtime.onConnect.addListener((port) => {
  try {
    //console.log('Service worker connected');
    init();
    setupAlarms();
    
    port.onDisconnect.addListener(() => {
      try {
        //console.log('Service worker disconnected');
        init();
      } catch (error) {
        console.error('Failed to reinitialize on port disconnect:', error);
      }
    });
  } catch (error) {
    console.error('Failed to handle connection:', error);
  }
});