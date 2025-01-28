let selectedText = '';
let currentIndex = 0;
let isTypingMode = false;
let originalSelection = null;

document.addEventListener('enableTypingMode', () => {
  isTypingMode = true;
  const selection = window.getSelection();
  if (selection.toString().trim()) {
    selectedText = selection.toString();
    originalSelection = selection;
    currentIndex = 0;
    highlightText();
    console.log('Type selection mode enabled via context menu'); // Debug log
  }
});

document.addEventListener('mouseup', () => {
  if (!isTypingMode) {
    originalSelection = window.getSelection();
  }
});

document.addEventListener('keydown', (e) => {
  if (isTypingMode && e.key === ' ') {
    e.preventDefault();
  }
});

document.addEventListener('keypress', (e) => {
  if (!isTypingMode || !selectedText) return;

  const expectedChar = selectedText[currentIndex]?.toLowerCase();
  const typedChar = e.key.toLowerCase();

  if (expectedChar === ' ' && typedChar === ' ') {
    currentIndex++;
    highlightText();
  } else if (typedChar === expectedChar) {
    currentIndex++;
    highlightText();
  }

  if (currentIndex >= selectedText.length) {
    isTypingMode = false;
    currentIndex = 0;
  }
});

function highlightText() {
  const range = originalSelection.getRangeAt(0);
  const span = document.createElement('span');
  span.innerHTML = `
    <span class="typed">${selectedText.substring(0, currentIndex)}</span>
    <span class="current">${selectedText.substring(
      currentIndex,
      currentIndex + 1
    )}</span>
    <span class="untyped">${selectedText.substring(currentIndex + 1)}</span>
  `;

  range.deleteContents();
  range.insertNode(span);
}
