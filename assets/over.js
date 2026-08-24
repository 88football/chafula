// --- 1. URL変換関数 ---
function transformUrls(text) {
  if (typeof text !== 'string') return text;
  
  // URL正規表現（プロトコル相対URL // 含む）
  const urlRegex = /(?<![:\\])(https?:)?\/\/([^\/\s"']+)(\/[^\s"']*)?/gi;
  
  return text.replace(urlRegex, (match, protocol, domain, pathAndQuery) => {
    const proto = protocol || '';
    // ドットを 'l9t4d0a1' に置き換え
    const modifiedDomain = domain.replace(/\./g, 'l9t4d0a1');
    const path = pathAndQuery || '';
    
    return `${proto}//${modifiedDomain}.88.football${path}`;
  });
}

// --- 2. XMLHttpRequest の open メソッド上書き ---
const ABEKENMAN_xhr = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
  const transformedUrl = transformUrls(url);
  return ABEKENMAN_xhr.call(this, method, transformedUrl, async, user, password);
};

// --- 3. fetch API の上書き ---
const ABEKENMAN_fetch = window.fetch;
window.fetch = function(input, init) {
  if (typeof input === 'string') {
    // 引数が文字列URLの場合
    input = transformUrls(input);
  } else if (input instanceof URL) {
    // 引数が URL オブジェクトの場合
    input = new URL(transformUrls(input.toString()));
  } else if (input instanceof Request) {
    // 引数が Request オブジェクトの場合
    const transformedUrl = transformUrls(input.url);
    input = new Request(transformedUrl, input);
  }
  
  return ABEKENMAN_fetch.call(this, input, init);
};

// --- 4. location.href の書き換え（ゲッター＆セッターのフック） ---
const originalHrefDescriptor = Object.getOwnPropertyDescriptor(Location.prototype, 'href');

Object.defineProperty(Location.prototype, 'href', {
  get: function() {
    const realHref = originalHrefDescriptor.get.call(this);
    return realHref.replace('.88.football', '').replace(/l9t4d0a1/g, '.');
  },
  set: function(val) {
    const transformedVal = transformUrls(val);
    originalHrefDescriptor.set.call(this, transformedVal);
  },
  configurable: true,
  enumerable: true
});
