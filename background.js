async function fetchGitHubPage(url) {
  console.log("Fetching GitHub page:", url);
  try {
    const response = await fetch(url);
    const html = await response.text();
    return html;
  } catch (error) {
    console.error('Error fetching GitHub page:', error);
    return null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message in background script:", request);
  if (request.action === 'fetchLicenses') {
    request.links.forEach(async (link) => {
      const html = await fetchGitHubPage(link.url);
      if (html) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'parseLicense',
              url: link.url,
              html: html
            });
          }
        });
      }
    });
  }
  return true; // Indicates that the response is sent asynchronously
});
