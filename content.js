let selectedText = '';
let currentIndex = 0;
let isTypingMode = false;
let originalSelection = null;
let isCurrentCharacterIncorrect = false;
let originalTextNode = null;

document.addEventListener('enableTypingMode', () => {
  isTypingMode = true;
  const selection = window.getSelection();
  if (selection.toString().trim()) {
    selectedText = selection.toString();
    originalSelection = selection;
    originalTextNode = selection.getRangeAt(0).cloneContents();
    currentIndex = 0;
    isCurrentCharacterIncorrect = false;
    highlightText();
  }
});

document.addEventListener('mouseup', (e) => {
  if (isTypingMode) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  originalSelection = window.getSelection();
});

document.addEventListener('mousedown', (e) => {
  if (isTypingMode) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
});

document.addEventListener('keydown', (e) => {
  if (!isTypingMode) return;

  if (e.key === 'Escape') {
    isTypingMode = false;
    currentIndex = 0;
    isCurrentCharacterIncorrect = false;
    restoreOriginalText();
    return;
  }

  if (e.key === ' ') {
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  if (!isTypingMode || !selectedText) return;

  if (e.key === ' ') {
    const expectedChar = selectedText[currentIndex];
    if (expectedChar === ' ') {
      currentIndex++;
      highlightText();
    }
  }
});

document.addEventListener('keypress', (e) => {
  if (!isTypingMode || !selectedText) return;

  const expectedChar = selectedText[currentIndex]?.toLowerCase();
  const typedChar = e.key.toLowerCase();

  if (typedChar === expectedChar && expectedChar !== ' ') {
    isCurrentCharacterIncorrect = false;
    currentIndex++;
    highlightText();
  } else if (expectedChar !== ' ') {
    isCurrentCharacterIncorrect = true;
    highlightText();
  }

  if (currentIndex >= selectedText.length) {
    isTypingMode = false;
    currentIndex = 0;
  }
});

function restoreOriginalText() {
  if (originalTextNode && originalSelection) {
    const range = originalSelection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(originalTextNode.cloneNode(true));
  }
}

function highlightText() {
  const range = originalSelection.getRangeAt(0);
  const span = document.createElement('span');
  span.innerHTML = `
    <span class="typed">${selectedText.substring(0, currentIndex)}</span>
    <span class="${
      isCurrentCharacterIncorrect ? 'incorrect' : 'current'
    }">${selectedText.substring(currentIndex, currentIndex + 1)}</span>
    <span class="untyped">${selectedText.substring(currentIndex + 1)}</span>
  `;

  range.deleteContents();
  range.insertNode(span);
}
