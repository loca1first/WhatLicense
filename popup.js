document.getElementById('scanButton').addEventListener('click', () => {
  console.log("Scan button clicked");
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      console.log("Sending scan message to tab:", tabs[0].id);
      chrome.tabs.sendMessage(tabs[0].id, {action: 'scan'}, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError);
          displayError("Failed to communicate with the page. Make sure you're on a supported website (Hacker News or Reddit).");
          return;
        }
        console.log("Received response:", response);
        if (response && response.links && response.links.length > 0) {
          chrome.runtime.sendMessage({action: 'fetchLicenses', links: response.links});
        } else {
          displayError("No GitHub links found on the page.");
        }
      });
    } else {
      console.error("No active tab found");
      displayError("No active tab found. Please try again.");
    }
  });
});

function displayError(message) {
  const resultsList = document.getElementById('results');
  resultsList.innerHTML = `<li style="color: red;">${message}</li>`;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateLicense') {
    console.log("Updating license in popup:", request);
    const resultsList = document.getElementById('results');
    const listItem = document.createElement('li');
    listItem.textContent = `${request.title}: ${request.license}`;
    resultsList.appendChild(listItem);
  }
});
