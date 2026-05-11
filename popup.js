const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const PROMPTS = {
  tldr: (text) => `Summarize the following webpage content in 3-5 concise sentences. Be direct and informative:\n\n${text}`,
  bullets: (text) => `Summarize the key points of the following webpage content as 5-7 bullet points. Each bullet should be one clear sentence:\n\n${text}`,
  eli5: (text) => `Explain the main idea of the following webpage content in simple terms, as if explaining to a 10-year-old. Keep it friendly and under 100 words:\n\n${text}`,
};

let currentMode = "tldr";   

// --- DOM refs ---
const toggleSettingsBtn = document.getElementById("toggleSettings");
const settingsPanel = document.getElementById("settingsPanel");
const mainPanel = document.getElementById("mainPanel");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKey");
const noKeyMsg = document.getElementById("noKeyMsg");
const readyPanel = document.getElementById("readyPanel");
const summarizeBtn = document.getElementById("summarizeBtn");
const statusArea = document.getElementById("statusArea");
const outputArea = document.getElementById("outputArea");
const summaryText = document.getElementById("summaryText");
const copyBtn = document.getElementById("copyBtn");
const goToSettingsBtn = document.getElementById("goToSettings");

// --- Init ---
chrome.storage.local.get(["apiKey"], ({ apiKey }) => {
  if (apiKey) {
    apiKeyInput.value = apiKey;
    showReady();
  } else {
    showNoKey();
  }
});

function showReady() {
  noKeyMsg.style.display = "none";
  readyPanel.style.display = "block";
}
function showNoKey() {
  noKeyMsg.style.display = "block";
  readyPanel.style.display = "none";
}

// --- Settings toggle ---
toggleSettingsBtn.addEventListener("click", () => {
  const open = settingsPanel.classList.toggle("visible");
  mainPanel.style.display = open ? "none" : "block";
  toggleSettingsBtn.textContent = open ? "← Back" : "API Key";
});

goToSettingsBtn.addEventListener("click", () => {
  settingsPanel.classList.add("visible");
  mainPanel.style.display = "none";
  toggleSettingsBtn.textContent = "← Back";
});

saveKeyBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (!key) return;
  chrome.storage.local.set({ apiKey: key }, () => {
    settingsPanel.classList.remove("visible");
    mainPanel.style.display = "block";
    toggleSettingsBtn.textContent = "API Key";
    showReady();
    setStatus("ok", "API key saved.");
  });
});

// --- Mode tabs ---
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentMode = tab.dataset.mode;
    // Clear previous summary when mode changes
    outputArea.classList.remove("visible");
    statusArea.innerHTML = "";
  });
});

// --- Summarize ---
summarizeBtn.addEventListener("click", async () => {
  chrome.storage.local.get(["apiKey"], async ({ apiKey }) => {
    if (!apiKey) { showNoKey(); return; }

    setLoading(true);
    outputArea.classList.remove("visible");

    try {
      // Get page text from content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      let pageText;

      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Extract meaningful text: skip nav, footer, scripts
            const remove = ["script","style","nav","footer","header","aside","noscript"];
            const clone = document.body.cloneNode(true);
            remove.forEach(tag => clone.querySelectorAll(tag).forEach(el => el.remove()));
            return (clone.innerText || clone.textContent || "").replace(/\s+/g, " ").trim().slice(0, 12000);
          },
        });
        pageText = results[0]?.result;
      } catch {
        pageText = null;
      }

      if (!pageText || pageText.length < 100) {
        setStatus("err", "Couldn't read this page (try on a regular website).");
        setLoading(false);
        return;
      }

      const prompt = PROMPTS[currentMode](pageText);

      const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 512, temperature: 0.4 },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || `API error ${res.status}`;
        setStatus("err", msg);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary returned.";

      summaryText.textContent = summary;
      outputArea.classList.add("visible");
      setStatus("ok", "Done.");
    } catch (e) {
      setStatus("err", "Network error — check your connection.");
      console.error(e);
    }

    setLoading(false);
  });
});

// --- Copy ---
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(summaryText.textContent).then(() => {
    copyBtn.textContent = "copied ✓";
    copyBtn.classList.add("copied");
    setTimeout(() => {
      copyBtn.textContent = "copy";
      copyBtn.classList.remove("copied");
    }, 2000);
  });
});

// --- Helpers ---
function setLoading(on) {
  summarizeBtn.disabled = on;
  if (on) {
    setStatus("loading", "Summarizing…");
  }
}

function setStatus(type, msg) {
  if (type === "loading") {
    statusArea.innerHTML = `<div class="status"><div class="spinner"></div><span>${msg}</span></div>`;
  } else if (type === "ok") {
    statusArea.innerHTML = `<div class="status"><div class="dot ok"></div><span>${msg}</span></div>`;
  } else if (type === "err") {
    statusArea.innerHTML = `<div class="status"><div class="dot err"></div><span>${msg}</span></div>`;
  } else if (type === "warn") {
    statusArea.innerHTML = `<div class="status"><div class="dot warn"></div><span>${msg}</span></div>`;
  } else {
    statusArea.innerHTML = "";
  }
}
