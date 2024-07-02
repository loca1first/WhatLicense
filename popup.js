document.getElementById('scanButton').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'scan'}, (response) => {
      if (response) {
        chrome.runtime.sendMessage({action: 'fetchLicenses', links: response});
      }
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateLicense') {
    const resultsList = document.getElementById('results');
    const listItem = document.createElement('li');
    listItem.textContent = `${request.title}: ${request.license}`;
    resultsList.appendChild(listItem);
  }
});
