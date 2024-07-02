async function fetchGitHubLicense(url) {
  const repoPath = new URL(url).pathname.slice(1);
  const apiUrl = `https://api.github.com/repos/${repoPath}/license`;
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.license ? data.license.spdx_id : 'Unknown';
  } catch (error) {
    console.error('Error fetching license:', error);
    return 'Error';
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchLicenses') {
    request.links.forEach(async (link) => {
      const license = await fetchGitHubLicense(link.url);
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'injectLicense',
        element: link.element,
        license: license
      });
      chrome.runtime.sendMessage({
        action: 'updateLicense',
        title: link.title,
        license: license
      });
    });
  }
});
