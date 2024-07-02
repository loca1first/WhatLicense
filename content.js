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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message in content script:", request);
  if (request.action === 'scan') {
    const links = scanPage();
    console.log("Sending response:", {links});
    sendResponse({links});
  } else if (request.action === 'injectLicense') {
    const element = document.querySelector(`a[href="${request.url}"]`);
    if (element) {
      injectLicense(element, request.license);
    } else {
      console.error("Element not found for URL:", request.url);
    }
  }
  return true; // Indicates that the response is sent asynchronously
});

// Immediately scan the page when the script loads
const initialLinks = scanPage();
console.log("Initial scan results:", initialLinks);
