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

// --- 3. location.href & document の完全フック ---
(function hookLocation() {
  // Prototype または window.location インスタンスから Descriptor を探索・取得
  let nativeHrefDescriptor = Object.getOwnPropertyDescriptor(Location.prototype, 'href') ||
                             Object.getOwnPropertyDescriptor(window.location, 'href');

  // 万が一どちらからも取得できない場合のフォールバック（文字列として直接呼ぶ）
  const getNativeHref = nativeHrefDescriptor && nativeHrefDescriptor.get
    ? function(target) { return nativeHrefDescriptor.get.call(target); }
    : function(target) { return Function.prototype.toString.call(target); };

  const setNativeHref = nativeHrefDescriptor && nativeHrefDescriptor.set
    ? function(target, val) { nativeHrefDescriptor.set.call(target, val); }
    : function(target, val) { window.location.assign(val); };

  const customGetter = function() {
    // 実際のURLを取得して復元関数を通す
    const realHref = getNativeHref(window.location);
    return restoreUrl(realHref);
  };

  const customSetter = function(val) {
    const transformedVal = transformUrls(val);
    setNativeHref(window.location, transformedVal);
  };

  // 1. Location.prototype の上書き
  try {
    Object.defineProperty(Location.prototype, 'href', {
      get: customGetter,
      set: customSetter,
      configurable: true,
      enumerable: true
    });
  } catch (e) {}

  // 2. window.location インスタンス自身の上書き（Chromium/WebKit対策）
  try {
    Object.defineProperty(window.location, 'href', {
      get: customGetter,
      set: customSetter,
      configurable: true,
      enumerable: true
    });
  } catch (e) {}

  // 3. document.location の上書き
  try {
    Object.defineProperty(Document.prototype, 'location', {
      get: customGetter,
      set: customSetter,
      configurable: true,
      enumerable: true
    });
  } catch (e) {}

  // 4. document.URL の上書き
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
