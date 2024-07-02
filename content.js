function scanPage() {
  console.log("Scanning page for GitHub links");
  const isHackerNews = window.location.hostname === 'news.ycombinator.com';
  const isReddit = window.location.hostname === 'www.reddit.com';
  
  let links = [];
  
  if (isHackerNews) {
    links = scanHackerNews();
  } else if (isReddit) {
    links = scanReddit();
  }
  
  console.log("Found links:", links);
  return links;
}

function scanHackerNews() {
  const titles = document.querySelectorAll('.titlelink');
  const comments = document.querySelectorAll('.comment-tree a');
  
  return [...scanLinks(titles), ...scanLinks(comments)];
}

function scanReddit() {
  const titles = document.querySelectorAll('a[data-click-id="body"]');
  const comments = document.querySelectorAll('.comment a');
  
  return [...scanLinks(titles), ...scanLinks(comments)];
}

function scanLinks(elements) {
  return Array.from(elements)
    .filter(link => link.href.includes('github.com'))
    .map(link => ({
      title: link.textContent,
      url: link.href,
      element: link
    }));
}

function injectLicense(element, license) {
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
    const element = request.element;
    injectLicense(element, request.license);
  }
  return true; // Indicates that the response is sent asynchronously
});
