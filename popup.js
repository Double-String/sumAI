console.log('popup.js is running');

const summarizeBtn = document.getElementById('summarizeBtn');
const summaryResult = document.getElementById('summaryResult');
const loadingMessage = document.getElementById('loadingMessage');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'contentScriptReady') {
    loadingMessage.style.display = 'none';
    summarizeBtn.disabled = false;
  }
});

async function fetchContent() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('Active tab:', tabs[0]); // Add this line inside the query
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { type: 'fetchContent' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          resolve(null);
        } else {
          resolve(response.content);
        }
      });
    });
  });
}

function truncateText(text, maxTokens = 1500) {
  const tokens = text.split(/\s+/);
  if (tokens.length <= maxTokens) return text;
  return tokens.slice(0, maxTokens).join(' ');
}

async function summarize(content) {
    const apiKey = 'your-openAI-API-key';
    const apiEndpoint = 'https://api.openai.com/v1/engines/text-davinci-002/completions';

  const truncatedContent = truncateText(content);
  const prompt = `Please provide a bullet-point summary of the following text. Each bullet point should be under 140 characters:\n\n${truncatedContent}\n\nSummary:`;

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      max_tokens: 300,
      n: 1,
      stop: null,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].text.trim();
}

summarizeBtn.addEventListener('click', async () => {
    summarizeBtn.disabled = true;
    summaryResult.textContent = 'Summarizing...';
  
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractArticleContent,
      });
  
      const content = result[0].result;
      const summary = await summarize(content);
      summaryResult.textContent = summary;
    } catch (error) {
      summaryResult.textContent = 'An error occurred. Please try again.';
    } finally {
      summarizeBtn.disabled = false;
    }
  });
  
