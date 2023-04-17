console.log('contentScript.js is running'); // Add this line at the beginning of the file

function extractArticleContent() {
  return new Promise((resolve) => {
    const documentClone = document.cloneNode(true);
    const location = document.location;
    const uri = {
      spec: location.href,
      host: location.host,
      prePath: location.protocol + '//' + location.host,
      scheme: location.protocol.substr(0, location.protocol.indexOf(':')),
      pathBase: location.protocol + '//' + location.host + location.pathname.substr(0, location.pathname.lastIndexOf('/') + 1),
    };

    const readability = new Readability(uri, documentClone);
    const parsedArticle = readability.parse();

    resolve(parsedArticle.textContent);
  });
}


// Notify the popup that the content script is ready.
chrome.runtime.sendMessage({ type: 'contentScriptReady' });
