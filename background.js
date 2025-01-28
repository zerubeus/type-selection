console.log('BACKGROUND SCRIPT START'); // Debug log - Verifying background script execution

if (!chrome.scripting) {
  console.error(
    'chrome.scripting is undefined at background script start. Check permissions in manifest.json and reload the extension.'
  );
} else {
  console.log('chrome.scripting is available at background script start.');
}
console.log('Background script loaded'); // Debug log

// Check if context menu already exists to prevent "duplicate id" error
chrome.contextMenus.create(
  {
    id: 'typeSelection',
    title: 'Type Selection',
    contexts: ['selection'],
  },
  () => {
    if (chrome.runtime.lastError) {
      console.warn(
        'Context menu creation error:',
        chrome.runtime.lastError.message
      );
    } else {
      console.log('Context menu created'); // Debug log
    }
  }
);

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  console.log('Context menu item clicked:', info.menuItemId); // Debug log
  if (info.menuItemId === 'typeSelection') {
    console.log('TypeSelection context menu clicked'); // Debug log
    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: () => {
          document.dispatchEvent(new CustomEvent('enableTypingMode'));
        },
      })
      .catch((err) => console.error('Failed to execute script:', err));
  }
});

function enableTypingMode() {
  if (!chrome.scripting) {
    console.error(
      'chrome.scripting is undefined. Check permissions in manifest.json and reload the extension.'
    );
    return;
  }
  chrome.scripting.executeScript({
    target: { activeTab: true },
    function: () => {
      document.dispatchEvent(new CustomEvent('enableTypingMode'));
    },
  });
}
