chrome.contextMenus.create({
  id: 'typeSelection',
  title: 'Type Selection',
  contexts: ['selection'],
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'typeSelection') {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: enableTypingMode,
    });
  }
});

function enableTypingMode() {
  document.dispatchEvent(new CustomEvent('enableTypingMode'));
}
