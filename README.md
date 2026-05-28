# PageBrief – AI Web Page Summarizer

A Chrome extension that summarizes any webpage in seconds using **Google Gemini AI** (free, no billing required).

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![Free API](https://img.shields.io/badge/API-Free%20Gemini-orange)

---

## Features

- **3 summary modes** — TL;DR, Bullet Points, or ELI5 (Explain Like I'm 5)
- **One click** — instantly extracts and summarizes the current page
- **Copy to clipboard** — grab the summary with one tap
- **Secure key storage** — your API key stays local in Chrome storage
- **Free to run** — uses Gemini 1.5 Flash, which has a generous free tier

---   

## Screenshots

> _Add your own screenshot here after loading the extension._

---

## Setup

### 1. Get a free Gemini API key

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with a Google account
3. Click **Create API key** — no billing or credit card needed

### 2. Load the extension in Chrome

1. Clone or download this repo
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select this project folder
5. The PageBrief icon will appear in your toolbar

### 3. Add your API key

1. Click the PageBrief extension icon
2. Click **API Key** in the top right
3. Paste your Gemini API key and click **Save Key**

You're ready to go!

---

## Usage

1. Navigate to any webpage
2. Click the PageBrief extension icon
3. Choose a mode: **TL;DR**, **Bullets**, or **ELI5**
4. Click **Summarize this page**
5. Read the summary, copy it if needed

---

## Project Structure

```
pagebrief/
├── manifest.json        # Extension config (Manifest V3)
├── popup.html           # Extension UI
├── popup.js             # UI logic + Gemini API calls
├── background.js        # Service worker
├── content.js           # Content script (injected into pages)
├── generate_icons.py    # Script to generate icons
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## How It Works

1. When you click **Summarize**, the popup runs a content script via `chrome.scripting.executeScript` to extract visible text from the current page (up to 12,000 characters)
2. The text is sent to the **Gemini 1.5 Flash** API with a mode-specific prompt
3. The response is displayed in the popup with a copy button

---

## API & Costs

This extension uses **Gemini 1.5 Flash**, which as of 2024 offers:
- **Free tier**: 15 requests/minute, 1 million tokens/day
- No credit card required

Check the latest limits at [ai.google.dev/pricing](https://ai.google.dev/pricing).

---

## Contributing

Pull requests welcome! Some ideas for extensions:

- [ ] Context menu: right-click selected text to summarize
- [ ] Summary history saved per URL
- [ ] Export to Markdown or Notion
- [ ] Custom prompt input
- [ ] Support for Anthropic Claude or OpenAI as alternative backends

---

## License

MIT — use freely, modify freely.
