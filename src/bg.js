import { init } from './scripts.js';

let keepAliveInterval;

function startKeepAlive() {
  // Clear any existing interval
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  
  // Create a new interval that pings every 20 seconds
  keepAliveInterval = setInterval(() => {
    chrome.runtime.getPlatformInfo(() => {});
  }, 20000);
}

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  init();
  startKeepAlive();
});

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  init();
  startKeepAlive();
});

// Handle suspension
chrome.runtime.onSuspend.addListener(() => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
});

// Reinitialize when receiving a connection
chrome.runtime.onConnect.addListener((port) => {
  init();
  startKeepAlive();
  
  port.onDisconnect.addListener(() => {
    init();
  });
});