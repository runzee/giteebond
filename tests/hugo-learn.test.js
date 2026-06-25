/**
 * @jest-environment jsdom
 */

// Extract the getUrlParameter function from hugo-learn.js for isolated testing
const getUrlParameter = function getUrlParameter(sPageURL) {
  var url = sPageURL.split('?');
  var obj = {};
  if (url.length == 2) {
    var sURLVariables = url[1].split('&'),
      sParameterName,
      i;
    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');
      obj[sParameterName[0]] = sParameterName[1];
    }
    return obj;
  } else {
    return undefined;
  }
};

describe('getUrlParameter', () => {
  test('returns undefined for URL without query string', () => {
    expect(getUrlParameter('http://example.com/image.png')).toBeUndefined();
  });

  test('returns undefined for URL with no question mark', () => {
    expect(getUrlParameter('/path/to/file')).toBeUndefined();
  });

  test('parses a single query parameter', () => {
    const result = getUrlParameter('http://example.com/img.png?width=200');
    expect(result).toEqual({ width: '200' });
  });

  test('parses multiple query parameters', () => {
    const result = getUrlParameter('http://example.com/img.png?width=200&height=100');
    expect(result).toEqual({ width: '200', height: '100' });
  });

  test('parses classes parameter with comma-separated values', () => {
    const result = getUrlParameter('http://example.com/img.png?classes=shadow,border');
    expect(result).toEqual({ classes: 'shadow,border' });
  });

  test('parses all three image parameters', () => {
    const result = getUrlParameter('http://example.com/img.png?width=300&height=150&classes=inline');
    expect(result).toEqual({ width: '300', height: '150', classes: 'inline' });
  });

  test('handles empty query string', () => {
    const result = getUrlParameter('http://example.com/img.png?');
    expect(result).toEqual({ '': undefined });
  });

  test('handles parameter with no value', () => {
    const result = getUrlParameter('http://example.com/img.png?key');
    expect(result).toEqual({ key: undefined });
  });

  test('handles URL with encoded characters in values', () => {
    const result = getUrlParameter('http://example.com/img.png?name=hello%20world');
    expect(result).toEqual({ name: 'hello%20world' });
  });

  test('returns undefined for empty string', () => {
    expect(getUrlParameter('')).toBeUndefined();
  });
});
