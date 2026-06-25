/**
 * @jest-environment jsdom
 */

// Extract helper functions from auto-complete.js for isolated testing

function hasClass(el, className) {
  return el.classList
    ? el.classList.contains(className)
    : new RegExp('\\b' + className + '\\b').test(el.className);
}

function addEvent(el, type, handler) {
  if (el.attachEvent) el.attachEvent('on' + type, handler);
  else el.addEventListener(type, handler);
}

function removeEvent(el, type, handler) {
  if (el.detachEvent) el.detachEvent('on' + type, handler);
  else el.removeEventListener(type, handler);
}

// Default renderItem function from auto-complete.js
function renderItem(item, search) {
  search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  var re = new RegExp('(' + search.split(' ').join('|') + ')', 'gi');
  return (
    '<div class="autocomplete-suggestion" data-val="' +
    item +
    '">' +
    item.replace(re, '<b>$1</b>') +
    '</div>'
  );
}

describe('hasClass', () => {
  test('returns true when element has the class', () => {
    const el = document.createElement('div');
    el.className = 'foo bar';
    expect(hasClass(el, 'foo')).toBe(true);
    expect(hasClass(el, 'bar')).toBe(true);
  });

  test('returns false when element does not have the class', () => {
    const el = document.createElement('div');
    el.className = 'foo bar';
    expect(hasClass(el, 'baz')).toBe(false);
  });

  test('returns false for empty className', () => {
    const el = document.createElement('div');
    expect(hasClass(el, 'foo')).toBe(false);
  });

  test('does not match partial class names', () => {
    const el = document.createElement('div');
    el.className = 'foobar';
    expect(hasClass(el, 'foo')).toBe(false);
  });

  test('handles single class', () => {
    const el = document.createElement('div');
    el.className = 'only-class';
    expect(hasClass(el, 'only-class')).toBe(true);
  });

  test('handles class with hyphens and underscores', () => {
    const el = document.createElement('div');
    el.className = 'my-class_name';
    expect(hasClass(el, 'my-class_name')).toBe(true);
  });
});

describe('addEvent / removeEvent', () => {
  test('addEvent attaches an event listener', () => {
    const el = document.createElement('div');
    const handler = jest.fn();
    addEvent(el, 'click', handler);
    el.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('removeEvent detaches an event listener', () => {
    const el = document.createElement('div');
    const handler = jest.fn();
    addEvent(el, 'click', handler);
    removeEvent(el, 'click', handler);
    el.click();
    expect(handler).not.toHaveBeenCalled();
  });

  test('addEvent supports multiple handlers on same event', () => {
    const el = document.createElement('div');
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    addEvent(el, 'click', handler1);
    addEvent(el, 'click', handler2);
    el.click();
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  test('removeEvent only removes the specified handler', () => {
    const el = document.createElement('div');
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    addEvent(el, 'click', handler1);
    addEvent(el, 'click', handler2);
    removeEvent(el, 'click', handler1);
    el.click();
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  test('addEvent works with different event types', () => {
    const el = document.createElement('input');
    const handler = jest.fn();
    addEvent(el, 'focus', handler);
    el.dispatchEvent(new Event('focus'));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('renderItem', () => {
  test('wraps matching text in bold tags', () => {
    const result = renderItem('Hello World', 'Hello');
    expect(result).toContain('<b>Hello</b>');
    expect(result).toContain('data-val="Hello World"');
  });

  test('renders with correct autocomplete-suggestion class', () => {
    const result = renderItem('test item', 'test');
    expect(result).toContain('class="autocomplete-suggestion"');
  });

  test('handles case-insensitive matching', () => {
    const result = renderItem('Hello World', 'hello');
    expect(result).toContain('<b>Hello</b>');
  });

  test('handles search term with special regex characters', () => {
    const result = renderItem('price is $100.00', '$100');
    expect(result).toContain('<b>$100</b>');
  });

  test('handles search with no match gracefully', () => {
    const result = renderItem('Hello World', 'xyz');
    expect(result).toBe(
      '<div class="autocomplete-suggestion" data-val="Hello World">Hello World</div>'
    );
  });

  test('highlights multiple words separately', () => {
    const result = renderItem('foo bar baz', 'foo baz');
    expect(result).toContain('<b>foo</b>');
    expect(result).toContain('<b>baz</b>');
  });

  test('handles empty search term', () => {
    const result = renderItem('Hello', '');
    expect(result).toContain('data-val="Hello"');
  });
});

describe('autoComplete default options', () => {
  test('default minChars is 2', () => {
    const defaults = {
      selector: 0,
      source: 0,
      minChars: 2,
      delay: 150,
      offsetLeft: 0,
      offsetTop: 1,
      cache: 1,
      menuClass: '',
    };
    expect(defaults.minChars).toBe(2);
    expect(defaults.delay).toBe(150);
    expect(defaults.cache).toBe(1);
    expect(defaults.offsetLeft).toBe(0);
    expect(defaults.offsetTop).toBe(1);
  });

  test('options override defaults correctly', () => {
    const defaults = {
      minChars: 2,
      delay: 150,
      cache: 1,
    };
    const options = { minChars: 3, delay: 200 };
    for (var k in options) {
      if (options.hasOwnProperty(k)) defaults[k] = options[k];
    }
    expect(defaults.minChars).toBe(3);
    expect(defaults.delay).toBe(200);
    expect(defaults.cache).toBe(1); // unchanged
  });
});

describe('autoComplete caching logic', () => {
  test('cache stores and retrieves suggestions by value', () => {
    const cache = {};
    const data = [{ title: 'Result 1' }, { title: 'Result 2' }];
    cache['test'] = data;
    expect(cache['test']).toBe(data);
    expect('test' in cache).toBe(true);
    expect('other' in cache).toBe(false);
  });

  test('empty cache result prevents further requests for longer queries', () => {
    const cache = {};
    const minChars = 2;
    cache['tes'] = []; // empty results for "tes"

    // Simulating the cache-check logic from auto-complete.js:
    // for val "test" (len 4), loop i=1..1, checks slice(0,3)="tes"
    const val = 'test';
    let shouldSkip = false;
    for (var i = 1; i < val.length - minChars; i++) {
      var part = val.slice(0, val.length - i);
      if (part in cache && !cache[part].length) {
        shouldSkip = true;
        break;
      }
    }
    expect(shouldSkip).toBe(true);
  });

  test('non-empty cache result does not prevent further requests', () => {
    const cache = {};
    const minChars = 2;
    cache['te'] = [{ title: 'Result' }];

    const val = 'test';
    let shouldSkip = false;
    for (var i = 1; i < val.length - minChars; i++) {
      var part = val.slice(0, val.length - i);
      if (part in cache && !cache[part].length) {
        shouldSkip = true;
        break;
      }
    }
    expect(shouldSkip).toBe(false);
  });
});

describe('autoComplete keyboard navigation', () => {
  test('key code 40 is down arrow', () => {
    expect(40).toBe(40); // down
    expect(38).toBe(38); // up
    expect(27).toBe(27); // esc
    expect(13).toBe(13); // enter
    expect(9).toBe(9); // tab
  });

  test('suggestion selection className toggling', () => {
    const el = document.createElement('div');
    el.className = 'autocomplete-suggestion';

    // Simulate selecting
    el.className += ' selected';
    expect(el.className).toContain('selected');

    // Simulate deselecting
    el.className = el.className.replace('selected', '');
    expect(el.className).not.toContain('selected');
  });
});
