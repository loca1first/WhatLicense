async function scrapeGitHubLicense(url) {
  console.log("Scraping license for:", url);
  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Check for license in repository sidebar
    const sidebarLicense = doc.querySelector('.octicon-law + span');
    if (sidebarLicense) {
      return sidebarLicense.textContent.trim();
    }

    // Check for license file in root directory
    const licenseFile = doc.querySelector('a[title="LICENSE"]');
    if (licenseFile) {
      return "License file found (details not available)";
    }

    // Check README for license information
    const readme = doc.querySelector('#readme');
    if (readme) {
      const readmeText = readme.textContent.toLowerCase();
      if (readmeText.includes('mit license')) return 'MIT';
      if (readmeText.includes('apache license')) return 'Apache';
      if (readmeText.includes('gpl') || readmeText.includes('gnu general public license')) return 'GPL';
      if (readmeText.includes('bsd license')) return 'BSD';
      if (readmeText.includes('mozilla public license')) return 'MPL';
    }

    return 'License not found';
  } catch (error) {
    console.error('Error scraping license:', error);
    return 'Error';
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message in background script:", request);
  if (request.action === 'fetchLicenses') {
    request.links.forEach(async (link) => {
      const license = await scrapeGitHubLicense(link.url);
      console.log("Scraped license:", license, "for", link.url);
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
  return true; // Indicates that the response is sent asynchronously
});
