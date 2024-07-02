console.log("Content script loaded on", window.location.href);

function scanPage() {
  console.log("Scanning page for GitHub links");
  const links = scanHackerNews();
  console.log("Found links:", links);
  return links;
}

function scanHackerNews() {
  const titles = document.querySelectorAll('.titleline > a');
  const comments = document.querySelectorAll('.comment-tree a');
  
  return [...scanLinks(titles), ...scanLinks(comments)];
}

function scanLinks(elements) {
  return Array.from(elements)
    .filter(link => {
      const href = link.href || '';
      return href.includes('github.com') || href.includes('githubusercontent.com');
    })
    .map(link => ({
      title: link.textContent,
      url: link.href,
      element: link
    }));
}

function injectLicense(element, license) {
  console.log("Injecting license:", license, "for element:", element);
  const span = document.createElement('span');
  span.textContent = ` [${license}]`;
  span.className = 'injected-license';
  element.parentNode.insertBefore(span, element.nextSibling);
}

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message in content script:", request);
  if (request.action === 'scan') {
    try {
      const links = scanPage();
      console.log("Sending response:", {links});
      sendResponse({links});
    } catch (error) {
      console.error("Error in scanPage:", error);
      sendResponse({error: error.message});
    }
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

// Immediately log the initial scan results when the script loads
console.log("Initial scan results:", scanPage());
