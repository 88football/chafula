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

// --- 3. location.href & document.location の強力なフック ---
(function hookLocation() {
  // 元のネイティブゲッター/セッターDescriptorを取得
  const nativeHrefDescriptor = Object.getOwnPropertyDescriptor(Location.prototype, 'href');

  if (!nativeHrefDescriptor) {
    console.error('ネイティブの href Descriptor を取得できませんでした。');
    return;
  }

  const customGetter = function() {
    // ネイティブのゲッターを使って「実際のURL」を取得し、復元処理を通す
    const realHref = nativeHrefDescriptor.get.call(this);
    return restoreUrl(realHref);
  };

  const customSetter = function(val) {
    // 遷移先のURLを変換してネイティブのセッターに渡す
    const transformedVal = transformUrls(val);
    nativeHrefDescriptor.set.call(this, transformedVal);
  };

  // A. Location.prototype への上書き
  try {
    Object.defineProperty(Location.prototype, 'href', {
      get: customGetter,
      set: customSetter,
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    console.warn('Location.prototype のフック失敗:', e);
  }

  // B. window.location インスタンス自体への直接プロパティ再定義（Chromium対策）
  try {
    Object.defineProperty(window.location, 'href', {
      get: customGetter,
      set: customSetter,
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    // ブラウザのセキュリティ設定によってはインスタンス直接の変更が失敗する場合があるためキャッチ
  }

  // C. document.location の上書き
  try {
    Object.defineProperty(Document.prototype, 'location', {
      get: customGetter,
      set: customSetter,
      configurable: true,
      enumerable: true
    });
  } catch (e) {}

  // D. document.URL の上書き（文字列参照対策）
  try {
    Object.defineProperty(Document.prototype, 'URL', {
      get: customGetter,
      configurable: true,
      enumerable: true
    });
  } catch (e) {}
})();

// テスト実行
alert(location.href);
