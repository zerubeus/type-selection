let selectedText = '';
let currentIndex = 0;
let isTypingMode = false;
let originalRange = null;
let isCurrentCharacterIncorrect = false;
let originalTextNode = null;

document.addEventListener('enableTypingMode', () => {
  isTypingMode = true;
  const selection = window.getSelection();
  if (selection.toString().trim()) {
    selectedText = selection.toString();
    // Store the original range before any modifications
    originalRange = selection.getRangeAt(0).cloneRange();
    // Store the original text content
    originalTextNode = originalRange.cloneContents();
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
  const selection = window.getSelection();
  if (selection.toString().trim()) {
    originalRange = selection.getRangeAt(0).cloneRange();
  }
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
    exitTypingMode();
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

  const expectedChar = selectedText[currentIndex];
  const typedChar = e.key;

  // Normalize apostrophes and quotes
  const normalizeChar = (char) => {
    const code = char.charCodeAt(0);

    // Map of apostrophe-like character codes
    const apostropheCodes = [
      0x0027, // Straight quote '
      0x2019, // Right single quotation '
      0x2018, // Left single quotation '
      0x2032, // Prime ′
      0x0060, // Backtick `
      0x2035, // Reversed prime ‵
      0x02b9, // Modifier letter prime ʹ
      0x02bb, // Modifier letter turned comma ʻ
    ];

    if (apostropheCodes.includes(code)) {
      return 0x0027; // Return the code for straight quote
    }
    return char.toLowerCase().charCodeAt(0);
  };

  const normalizedExpected = normalizeChar(expectedChar);
  const normalizedTyped = normalizeChar(typedChar);

  if (normalizedTyped === normalizedExpected && expectedChar !== ' ') {
    isCurrentCharacterIncorrect = false;
    currentIndex++;
    highlightText();
  } else if (expectedChar !== ' ') {
    isCurrentCharacterIncorrect = true;
    highlightText();
  }

  if (currentIndex >= selectedText.length) {
    exitTypingMode();
  }
});

function restoreOriginalText() {
  if (originalTextNode && originalRange) {
    const range = originalRange.cloneRange();
    range.deleteContents();
    range.insertNode(originalTextNode.cloneNode(true));
    // Clear selection
    window.getSelection().removeAllRanges();
  }
}

function highlightText() {
  if (!originalRange) return;

  const range = originalRange.cloneRange();
  const container = document.createElement('span');
  container.className = 'typing-container';
  container.style.whiteSpace = 'normal';

  // Get the original element's computed styles
  const originalElement = range.startContainer.parentElement;
  const computedStyle = window.getComputedStyle(originalElement);

  // Copy relevant styles from the original element
  container.style.fontFamily = computedStyle.fontFamily;
  container.style.fontWeight = computedStyle.fontWeight;
  container.style.fontStyle = computedStyle.fontStyle;
  container.style.lineHeight = computedStyle.lineHeight;
  container.style.letterSpacing = computedStyle.letterSpacing;
  container.style.wordSpacing = computedStyle.wordSpacing;

  const typedSpan = document.createElement('span');
  typedSpan.className = 'typed';
  typedSpan.textContent = selectedText.substring(0, currentIndex);

  const currentSpan = document.createElement('span');
  currentSpan.className = isCurrentCharacterIncorrect ? 'incorrect' : 'current';
  currentSpan.textContent = selectedText.substring(
    currentIndex,
    currentIndex + 1
  );

  const untypedSpan = document.createElement('span');
  untypedSpan.className = 'untyped';
  untypedSpan.textContent = selectedText.substring(currentIndex + 1);

  container.appendChild(typedSpan);
  container.appendChild(currentSpan);
  container.appendChild(untypedSpan);

  // Use the original range for modifications
  range.deleteContents();
  range.insertNode(container);
}

// Add new function to handle exiting typing mode
function exitTypingMode() {
  isTypingMode = false;
  currentIndex = 0;
  isCurrentCharacterIncorrect = false;
  restoreOriginalText();
  // Reset all variables
  selectedText = '';
  originalRange = null;
  originalTextNode = null;
}
