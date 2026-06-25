var defined_algolia_appId = defined_algolia_appId || "";
var defined_algolia_apiKey = defined_algolia_apiKey || "";
var defined_algolia_indexName = defined_algolia_indexName || "";
if (!defined_algolia_appId || !defined_algolia_apiKey || !defined_algolia_indexName) {
  console.warn("Algolia search is not configured. Set algolia_appId, algolia_apiKey, and algolia_indexName in your site config.");
}
var client = algoliasearch(defined_algolia_appId, defined_algolia_apiKey);
var index = client.initIndex(defined_algolia_indexName);
index.setSettings({
  searchableAttributes: [
    'title,alternative_title',
    'content',
    'description'
  ]
});
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function search(term, response) {
  index.search({
    query: term,
  }, function(err, re){
    if (err) {
      console.error('Algolia search error:', err.message || err);
      response([]);
      return;
    }
    response(re.hits);
  })
}

$(document).ready(function() {
  new autoComplete({
    selector: $("#search-by").get(0),
    source: search,
    renderItem: renderSearchItem,
    onSelect: onSearchSelect
  });
});
