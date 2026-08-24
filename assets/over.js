// --- 1. URL変換・復元関数 ---
function ABEKENMAN_transformUrls(text) {
  if (typeof text !== 'string') return text;
  const urlRegex = /(?<![:\\])(https?:)?\/\/([^\/\s"']+)(\/[^\s"']*)?/gi;
  return text.replace(urlRegex, (match, protocol, domain, pathAndQuery) => {
    const proto = protocol || '';
    const modifiedDomain = domain.replace(/\./g, 'l9t4d0a1');
    const path = pathAndQuery || '';
    return `${proto}//${modifiedDomain}.88.football${path}`;
  });
}

function ABEKENMAN_restoreUrl(url) {
  if (typeof url !== 'string') return url;
  return url.replace('.88.football', '').replace(/l9t4d0a1/g, '.');
}

var ABEKENMAN_restored = ABEKENMAN_restoreUrl(location.href);

// --- 2. XHR & Fetch のフック ---
const ABEKENMAN_xhr = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, async=true, user=null, password=null) {
  console.log('XHR:  ' + url);
  return ABEKENMAN_xhr.call(this, method, ABEKENMAN_transformUrls(url), async, user, password);
};

const ABEKENMAN_fetch = window.fetch;
window.fetch = function(input, init) {
  if (typeof input === 'string') input = ABEKENMAN_transformUrls(input);
  else if (input instanceof URL) input = new URL(ABEKENMAN_transformUrls(input.toString()));
  else if (input instanceof Request) input = new Request(ABEKENMAN_transformUrls(input.url), input);
  return ABEKENMAN_fetch.call(this, input, init);
};
