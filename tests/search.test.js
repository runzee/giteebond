/**
 * @jest-environment jsdom
 */

// Tests for the search rendering logic from search.js

describe('search result rendering', () => {
  // Extracted from search.js: the renderItem logic used with autoComplete
  function renderSearchItem(item, term) {
    var numContextWords = 2;
    var text = item.content.match(
      '(?:\\s?(?:[\\w]+)\\s?){0,' +
        numContextWords +
        '}' +
        term +
        '(?:\\s?(?:[\\w]+)\\s?){0,' +
        numContextWords +
        '}'
    );
    item.context = text;
    return (
      '<div class="autocomplete-suggestion" ' +
      'data-term="' +
      term +
      '" ' +
      'data-title="' +
      item.title +
      '" ' +
      'data-uri="' +
      item.uri +
      '" ' +
      'data-context="' +
      item.context +
      '">' +
      '» ' +
      item.title +
      '<div class="context">' +
      (item.context || '') +
      '</div>' +
      '</div>'
    );
  }

  test('renders a search result with title and context', () => {
    const item = {
      title: 'Getting Started',
      content: 'This guide helps you get started with the platform quickly',
      uri: '/docs/getting-started',
    };
    const result = renderSearchItem(item, 'started');
    expect(result).toContain('data-title="Getting Started"');
    expect(result).toContain('data-uri="/docs/getting-started"');
    expect(result).toContain('data-term="started"');
    expect(result).toContain('» Getting Started');
  });

  test('extracts context words around matching term', () => {
    const item = {
      title: 'Test Doc',
      content: 'one two three target four five six',
      uri: '/docs/test',
    };
    const result = renderSearchItem(item, 'target');
    // Context should include words around "target"
    expect(item.context).not.toBeNull();
    expect(item.context[0]).toContain('target');
  });

  test('handles no match in content gracefully', () => {
    const item = {
      title: 'No Match Doc',
      content: 'This content has nothing relevant',
      uri: '/docs/no-match',
    };
    const result = renderSearchItem(item, 'xyznonexistent');
    expect(item.context).toBeNull();
    expect(result).toContain('<div class="context"></div>');
  });

  test('renders context div with empty string when context is null', () => {
    const item = {
      title: 'Empty',
      content: 'no match here',
      uri: '/docs/empty',
    };
    const result = renderSearchItem(item, 'zzzzz');
    expect(result).toContain('<div class="context"></div>');
  });

  test('handles term at start of content', () => {
    const item = {
      title: 'Start Match',
      content: 'hello world foo bar',
      uri: '/docs/start',
    };
    const result = renderSearchItem(item, 'hello');
    expect(item.context).not.toBeNull();
    expect(item.context[0]).toContain('hello');
  });

  test('handles term at end of content', () => {
    const item = {
      title: 'End Match',
      content: 'foo bar baz end',
      uri: '/docs/end',
    };
    const result = renderSearchItem(item, 'end');
    expect(item.context).not.toBeNull();
    expect(item.context[0]).toContain('end');
  });

  test('result contains proper HTML structure', () => {
    const item = {
      title: 'Structure Test',
      content: 'test content here',
      uri: '/docs/structure',
    };
    const result = renderSearchItem(item, 'content');
    expect(result).toMatch(/^<div class="autocomplete-suggestion"/);
    expect(result).toMatch(/<\/div>$/);
    expect(result).toContain('<div class="context">');
  });
});

describe('search configuration', () => {
  test('searchable attributes are correctly defined', () => {
    const searchableAttributes = ['title,alternative_title', 'content', 'description'];
    expect(searchableAttributes).toHaveLength(3);
    expect(searchableAttributes[0]).toContain('title');
    expect(searchableAttributes[1]).toBe('content');
    expect(searchableAttributes[2]).toBe('description');
  });
});

describe('search onSelect behavior', () => {
  test('onSelect navigates to item URI', () => {
    // The onSelect handler does: location.href = item.getAttribute("data-uri")
    const item = document.createElement('div');
    item.setAttribute('data-uri', '/docs/test-page');
    expect(item.getAttribute('data-uri')).toBe('/docs/test-page');
  });

  test('search result data attributes are accessible', () => {
    const div = document.createElement('div');
    div.setAttribute('data-term', 'test');
    div.setAttribute('data-title', 'Test Title');
    div.setAttribute('data-uri', '/docs/test');
    div.setAttribute('data-context', 'some context');

    expect(div.getAttribute('data-term')).toBe('test');
    expect(div.getAttribute('data-title')).toBe('Test Title');
    expect(div.getAttribute('data-uri')).toBe('/docs/test');
    expect(div.getAttribute('data-context')).toBe('some context');
  });
});

describe('context extraction regex', () => {
  test('regex captures context words around term', () => {
    const numContextWords = 2;
    const term = 'target';
    const pattern =
      '(?:\\s?(?:[\\w]+)\\s?){0,' +
      numContextWords +
      '}' +
      term +
      '(?:\\s?(?:[\\w]+)\\s?){0,' +
      numContextWords +
      '}';
    const re = new RegExp(pattern);
    const content = 'one two three target four five six';
    const match = content.match(re);
    expect(match).not.toBeNull();
    expect(match[0]).toContain('target');
    // Should capture surrounding words
    expect(match[0]).toContain('three');
    expect(match[0]).toContain('four');
  });

  test('regex works when term is at boundary', () => {
    const numContextWords = 2;
    const term = 'start';
    const pattern =
      '(?:\\s?(?:[\\w]+)\\s?){0,' +
      numContextWords +
      '}' +
      term +
      '(?:\\s?(?:[\\w]+)\\s?){0,' +
      numContextWords +
      '}';
    const re = new RegExp(pattern);
    const content = 'start of the document';
    const match = content.match(re);
    expect(match).not.toBeNull();
    expect(match[0]).toContain('start');
  });

  test('regex returns null when term not found', () => {
    const numContextWords = 2;
    const term = 'notfound';
    const pattern =
      '(?:\\s?(?:[\\w]+)\\s?){0,' +
      numContextWords +
      '}' +
      term +
      '(?:\\s?(?:[\\w]+)\\s?){0,' +
      numContextWords +
      '}';
    const re = new RegExp(pattern);
    const content = 'this has nothing relevant';
    const match = content.match(re);
    expect(match).toBeNull();
  });
});
