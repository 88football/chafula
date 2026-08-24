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
  // アロー関数ではなく function() を使って this (XHRインスタンス) を保持する
  const transformedUrl = transformUrls(url);
  return ABEKENMAN_xhr.call(this, method, transformedUrl, async, user, password);
};

// --- 3. location.href の書き換え（ゲッター＆セッターのフック） ---
const originalHrefDescriptor = Object.getOwnPropertyDescriptor(Location.prototype, 'href');

Object.defineProperty(Location.prototype, 'href', {
  get: function() {
    // 本来の location.href を取得して transformUrls で変換した値を返す
    const realHref = originalHrefDescriptor.get.call(this);
    return realHref.replace('.88.football', '').replace(/l9t4d0a1/g, '.');
  },
  set: function(val) {
    // href に代入（ページ遷移）された場合も transformUrls を適用して遷移させる
    const transformedVal = transformUrls(val);
    originalHrefDescriptor.set.call(this, transformedVal);
  },
  configurable: true,
  enumerable: true
});
