// background.js — service worker for PageBrief extension
// Handles extension lifecycle events

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    console.log("PageBrief installed. Open the extension and add your Gemini API key.");
  }
});
  
   
  
