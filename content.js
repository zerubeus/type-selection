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

    // First, delete the original content
    originalRange.deleteContents();

    // Then clear the selection
    selection.removeAllRanges();

    // Finally, set up our typing interface
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
    let expectedChar = selectedText[currentIndex];

    // Check if the current expected character is one that should be skipped by space
    if (
      expectedChar === ' ' ||
      expectedChar === '.' ||
      /\s/.test(expectedChar)
    ) {
      // Keep advancing as long as we encounter skippable characters
      while (currentIndex < selectedText.length) {
        expectedChar = selectedText[currentIndex];
        if (
          expectedChar === ' ' ||
          expectedChar === '.' ||
          /\s/.test(expectedChar)
        ) {
          currentIndex++;
        } else {
          // Stop advancing when a non-skippable character is found
          break;
        }
      }
      isCurrentCharacterIncorrect = false; // Reset error state after skipping
      highlightText();
    }
    // Optional: Handle space press when the expected char is not skippable
    // else {
    //    isCurrentCharacterIncorrect = true;
    //    highlightText();
    // }
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
      0x0027, // Straight single quote '
      0x2019, // Right single quotation '
      0x2018, // Left single quotation '
      0x2032, // Prime ′
      0x0060, // Backtick `
      0x2035, // Reversed prime ‵
      0x02b9, // Modifier letter prime ʹ
      0x02bb, // Modifier letter turned comma ʻ
    ];

    // Map of double quote character codes
    const doubleQuoteCodes = [
      0x0022, // Straight double quote "
      0x201c, // Left double quote "
      0x201d, // Right double quote "
      0x2033, // Double prime ″
      0x02dd, // Double acute accent ˝
      0x3003, // Ditto mark 〃
    ];

    if (apostropheCodes.includes(code)) {
      return 0x0027; // Return the code for straight single quote
    }
    if (doubleQuoteCodes.includes(code)) {
      return 0x0022; // Return the code for straight double quote
    }
    return char.toLowerCase().charCodeAt(0);
  };

  const normalizedExpected = normalizeChar(expectedChar);
  const normalizedTyped = normalizeChar(typedChar);

  // Handle quotes and regular characters
  if (normalizedTyped === normalizedExpected) {
    isCurrentCharacterIncorrect = false;
    currentIndex++;
    highlightText();
  } else {
    // Always set incorrect flag and update highlight on any mismatch
    isCurrentCharacterIncorrect = true;
    highlightText();
    // Do not advance currentIndex on error
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

  // Create a working copy of the original range
  const range = originalRange.cloneRange();

  // Remove any existing typing containers
  const existingContainers = document.querySelectorAll('.typing-container');
  existingContainers.forEach((container) => container.remove());

  // Create and set up the new container
  const container = document.createElement('span');
  container.className = 'typing-container';
  container.style.whiteSpace = 'pre-wrap';

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

  // Clear the range contents and insert our container
  range.deleteContents();
  range.insertNode(container);
}

// Add new function to handle exiting typing mode
function exitTypingMode() {
  if (!isTypingMode) return;

  isTypingMode = false;
  currentIndex = 0;
  isCurrentCharacterIncorrect = false;

  // Remove any existing typing containers from the page
  const existingContainers = document.querySelectorAll('.typing-container');
  existingContainers.forEach((container) => container.remove());

  // Restore the original text
  restoreOriginalText();

  // Reset all variables
  selectedText = '';
  originalRange = null;
  originalTextNode = null;
}
