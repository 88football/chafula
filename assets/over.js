// --- 1. URL変換・復元関数 ---
function transformUrls(text) {
  if (typeof text !== 'string') return text;
  const urlRegex = /(?<![:\\])(https?:)?\/\/([^\/\s"']+)(\/[^\s"']*)?/gi;
  return text.replace(urlRegex, (match, protocol, domain, pathAndQuery) => {
    const proto = protocol || '';
    const modifiedDomain = domain.replace(/\./g, 'l9t4d0a1');
    const path = pathAndQuery || '';
    return `${proto}//${modifiedDomain}.88.football${path}`;
  });
}

function restoreUrl(url) {
  if (typeof url !== 'string') return url;
  return url.replace('.88.football', '').replace(/l9t4d0a1/g, '.');
}

// --- 2. XHR & Fetch のフック ---
const ABEKENMAN_xhr = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
  return ABEKENMAN_xhr.call(this, method, transformUrls(url), async, user, password);
};

const ABEKENMAN_fetch = window.fetch;
window.fetch = function(input, init) {
  if (typeof input === 'string') input = transformUrls(input);
  else if (input instanceof URL) input = new URL(transformUrls(input.toString()));
  else if (input instanceof Request) input = new Request(transformUrls(input.url), input);
  return ABEKENMAN_fetch.call(this, input, init);
};

// --- 3. location.href のフック（堅牢化） ---
try {
  // Prototypeへの定義
  Object.defineProperty(Location.prototype, 'href', {
    get: function() {
      return restoreUrl(window.location.origin + window.location.pathname + window.location.search + window.location.hash);
    },
    set: function(val) {
      window.location.assign(transformUrls(val));
    },
    configurable: true,
    enumerable: true
  });
} catch (e) {
  console.warn("Location.prototype の上書きに失敗しました:", e);
}

// テスト実行
alert(location.href);
