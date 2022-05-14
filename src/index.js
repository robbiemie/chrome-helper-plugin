// background.js

let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('欢迎使用欣哥的小工具 %cgreen', `color: ${color}`);
});