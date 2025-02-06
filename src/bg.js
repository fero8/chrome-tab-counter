import { init } from './scripts.js';

chrome.runtime.onInstalled.addListener(() => {
  init();
});