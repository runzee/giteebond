// Shared search autocomplete rendering and selection utilities.
// Used by both search.js (Algolia) and search.old.js (lunr).

function renderSearchItem(item, term) {
  var numContextWords = 2;
  var text = item.content.match(
    "(?:\\s?(?:[\\w]+)\\s?){0," +
      numContextWords +
      "}" +
      term +
      "(?:\\s?(?:[\\w]+)\\s?){0," +
      numContextWords +
      "}"
  );
  item.context = text;
  return (
    '<div class="autocomplete-suggestion" ' +
    'data-term="' + escapeHtml(term) + '" ' +
    'data-title="' + escapeHtml(item.title) + '" ' +
    'data-uri="' + escapeHtml(item.uri) + '" ' +
    'data-context="' + escapeHtml(item.context) + '">' +
    '» ' + escapeHtml(item.title) +
    '<div class="context">' +
    escapeHtml(item.context || '') + '</div>' +
    '</div>'
  );
}

function onSearchSelect(e, term, item) {
  location.href = item.getAttribute('data-uri');
}
