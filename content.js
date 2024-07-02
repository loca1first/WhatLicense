// Add this function to content.js
function parseLicense(html) {
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
}

// Update the message listener in content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message in content script:", request);
  if (request.action === 'scan') {
    const links = scanPage();
    console.log("Sending response:", {links});
    sendResponse({links});
  } else if (request.action === 'parseLicense') {
    const license = parseLicense(request.html);
    console.log("Parsed license:", license, "for", request.url);
    const element = document.querySelector(`a[href="${request.url}"]`);
    if (element) {
      injectLicense(element, license);
    } else {
      console.error("Element not found for URL:", request.url);
    }
    // Send the result back to the popup
    chrome.runtime.sendMessage({
      action: 'updateLicense',
      title: element ? element.textContent : request.url,
      license: license
    });
  }
  return true; // Indicates that the response is sent asynchronously
});
