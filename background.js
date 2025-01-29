if (!chrome.scripting) {
  console.error(
    'chrome.scripting is undefined at background script start. Check permissions in manifest.json and reload the extension.'
  );
} else {
  console.log('chrome.scripting is available at background script start.');
}

chrome.contextMenus.create(
  {
    id: 'typeSelection',
    title: 'TypePractice Select',
    contexts: ['selection'],
  },
  () => {
    if (chrome.runtime.lastError) {
      console.warn(
        'Context menu creation error:',
        chrome.runtime.lastError.message
      );
    } else {
      console.log('Context menu created');
    }
  }
);

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'typeSelection') {
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
