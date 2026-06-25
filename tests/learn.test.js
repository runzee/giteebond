/**
 * @jest-environment jsdom
 */

// Extract pure functions from learn.js for testing

function getScrollBarWidth() {
  var inner = document.createElement('p');
  inner.style.width = '100%';
  inner.style.height = '200px';

  var outer = document.createElement('div');
  outer.style.position = 'absolute';
  outer.style.top = '0px';
  outer.style.left = '0px';
  outer.style.visibility = 'hidden';
  outer.style.width = '200px';
  outer.style.height = '150px';
  outer.style.overflow = 'hidden';
  outer.appendChild(inner);

  document.body.appendChild(outer);
  var w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  var w2 = inner.offsetWidth;
  if (w1 == w2) w2 = outer.clientWidth;

  document.body.removeChild(outer);

  return w1 - w2;
}

function fallbackMessage(action) {
  var actionMsg = '';
  var actionKey = action === 'cut' ? 'X' : 'C';

  if (/iPhone|iPad/i.test(navigator.userAgent)) {
    actionMsg = 'No support :(';
  } else if (/Mac/i.test(navigator.userAgent)) {
    actionMsg = 'Press ⌘-' + actionKey + ' to ' + action;
  } else {
    actionMsg = 'Press Ctrl-' + actionKey + ' to ' + action;
  }

  return actionMsg;
}

const ANCHOR_REGEX = /^#[^ ]+$/;

describe('getScrollBarWidth', () => {
  test('returns a number', () => {
    const result = getScrollBarWidth();
    expect(typeof result).toBe('number');
  });

  test('returns zero or positive value', () => {
    const result = getScrollBarWidth();
    expect(result).toBeGreaterThanOrEqual(0);
  });

  test('does not leave elements in the DOM', () => {
    const before = document.body.children.length;
    getScrollBarWidth();
    const after = document.body.children.length;
    expect(after).toBe(before);
  });
});

describe('fallbackMessage', () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
      configurable: true,
    });
  });

  test('returns Ctrl-C message for copy on non-Mac/iOS', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      writable: true,
      configurable: true,
    });
    expect(fallbackMessage('copy')).toBe('Press Ctrl-C to copy');
  });

  test('returns Ctrl-X message for cut on non-Mac/iOS', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      writable: true,
      configurable: true,
    });
    expect(fallbackMessage('cut')).toBe('Press Ctrl-X to cut');
  });

  test('returns Mac-style message for copy on Mac', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      writable: true,
      configurable: true,
    });
    expect(fallbackMessage('copy')).toBe('Press ⌘-C to copy');
  });

  test('returns Mac-style message for cut on Mac', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      writable: true,
      configurable: true,
    });
    expect(fallbackMessage('cut')).toBe('Press ⌘-X to cut');
  });

  test('returns no support message on iPhone', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
      writable: true,
      configurable: true,
    });
    expect(fallbackMessage('copy')).toBe('No support :(');
  });

  test('returns no support message on iPad', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPad; CPU OS 14_0)',
      writable: true,
      configurable: true,
    });
    expect(fallbackMessage('cut')).toBe('No support :(');
  });
});

describe('ANCHOR_REGEX', () => {
  test('matches valid anchor with id', () => {
    expect(ANCHOR_REGEX.test('#section-1')).toBe(true);
  });

  test('matches anchor with special characters', () => {
    expect(ANCHOR_REGEX.test('#my-section_2')).toBe(true);
  });

  test('matches single character anchor', () => {
    expect(ANCHOR_REGEX.test('#a')).toBe(true);
  });

  test('does not match hash only', () => {
    expect(ANCHOR_REGEX.test('#')).toBe(false);
  });

  test('does not match anchor with spaces', () => {
    expect(ANCHOR_REGEX.test('#section one')).toBe(false);
  });

  test('does not match empty string', () => {
    expect(ANCHOR_REGEX.test('')).toBe(false);
  });

  test('does not match string without hash prefix', () => {
    expect(ANCHOR_REGEX.test('section-1')).toBe(false);
  });

  test('does not match hash with trailing space', () => {
    expect(ANCHOR_REGEX.test('#section ')).toBe(false);
  });
});

describe('highlight utility - jQuery.highlight', () => {
  // Test the core highlight algorithm extracted from learn.js
  function highlightNode(node, re, nodeName, className) {
    if (node.nodeType === 3) {
      var match = node.data.match(re);
      if (match) {
        var highlight = document.createElement(nodeName || 'span');
        highlight.className = className || 'highlight';
        var wordNode = node.splitText(match.index);
        wordNode.splitText(match[0].length);
        var wordClone = wordNode.cloneNode(true);
        highlight.appendChild(wordClone);
        wordNode.parentNode.replaceChild(highlight, wordNode);
        return 1;
      }
    } else if (
      node.nodeType === 1 &&
      node.childNodes &&
      !/(script|style)/i.test(node.tagName) &&
      !(node.tagName === nodeName.toUpperCase() && node.className === className)
    ) {
      for (var i = 0; i < node.childNodes.length; i++) {
        i += highlightNode(node.childNodes[i], re, nodeName, className);
      }
    }
    return 0;
  }

  test('highlights matching text in a text node', () => {
    const container = document.createElement('div');
    container.textContent = 'Hello world';
    highlightNode(container, /world/, 'mark', 'highlight');
    expect(container.innerHTML).toBe('Hello <mark class="highlight">world</mark>');
  });

  test('does not modify text when no match', () => {
    const container = document.createElement('div');
    container.textContent = 'Hello world';
    highlightNode(container, /xyz/, 'mark', 'highlight');
    expect(container.textContent).toBe('Hello world');
  });

  test('highlights all occurrences in text node via recursive traversal', () => {
    const container = document.createElement('div');
    container.textContent = 'foo bar foo';
    highlightNode(container, /foo/, 'mark', 'highlight');
    expect(container.innerHTML).toBe(
      '<mark class="highlight">foo</mark> bar <mark class="highlight">foo</mark>'
    );
  });

  test('skips script elements', () => {
    const container = document.createElement('div');
    const script = document.createElement('script');
    script.textContent = 'var x = "hello";';
    container.appendChild(script);
    highlightNode(container, /hello/, 'mark', 'highlight');
    expect(script.textContent).toBe('var x = "hello";');
  });

  test('skips style elements', () => {
    const container = document.createElement('div');
    const style = document.createElement('style');
    style.textContent = '.hello { color: red; }';
    container.appendChild(style);
    highlightNode(container, /hello/, 'mark', 'highlight');
    expect(style.textContent).toBe('.hello { color: red; }');
  });

  test('skips already-highlighted elements', () => {
    const container = document.createElement('div');
    const mark = document.createElement('mark');
    mark.className = 'highlight';
    mark.textContent = 'hello';
    container.appendChild(mark);
    highlightNode(container, /hello/, 'mark', 'highlight');
    // Should not double-wrap
    expect(container.innerHTML).toBe('<mark class="highlight">hello</mark>');
  });

  test('highlights text in nested elements', () => {
    const container = document.createElement('div');
    const span = document.createElement('span');
    span.textContent = 'nested hello text';
    container.appendChild(span);
    highlightNode(container, /hello/, 'mark', 'highlight');
    expect(span.innerHTML).toBe('nested <mark class="highlight">hello</mark> text');
  });

  test('uses explicit nodeName and className', () => {
    const container = document.createElement('div');
    container.textContent = 'test text';
    highlightNode(container, /test/, 'span', 'highlight');
    expect(container.querySelector('span.highlight')).not.toBeNull();
  });
});

describe('regex escaping for highlight words', () => {
  // Tests the word-escaping regex from learn.js jQuery.fn.highlight
  function escapeWord(word) {
    return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  test('escapes special regex characters', () => {
    expect(escapeWord('foo.bar')).toBe('foo\\.bar');
    expect(escapeWord('a+b')).toBe('a\\+b');
    expect(escapeWord('a*b')).toBe('a\\*b');
    expect(escapeWord('(test)')).toBe('\\(test\\)');
    expect(escapeWord('[test]')).toBe('\\[test\\]');
  });

  test('escapes backslash', () => {
    expect(escapeWord('a\\b')).toBe('a\\\\b');
  });

  test('escapes dollar sign', () => {
    expect(escapeWord('$100')).toBe('\\$100');
  });

  test('escapes pipe', () => {
    expect(escapeWord('a|b')).toBe('a\\|b');
  });

  test('does not modify plain words', () => {
    expect(escapeWord('hello')).toBe('hello');
    expect(escapeWord('world123')).toBe('world123');
  });

  test('escapes whitespace', () => {
    expect(escapeWord('hello world')).toBe('hello\\ world');
  });

  test('escapes hash', () => {
    expect(escapeWord('#heading')).toBe('\\#heading');
  });
});
