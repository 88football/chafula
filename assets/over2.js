// --- 1. URL変換・復元関数 ---
function ABEKENMAN_transformUrls(text) {
  if (typeof text !== 'string') return text;
  const urlRegex = /(?<![:\\])(https?:)?\/\/([^\/\s"']+)(\/[^\s"']*)?/gi;
  return text.replace(urlRegex, (match, protocol, domain, pathAndQuery) => {
    const proto = protocol || '';
    let modifiedDomain;
    if (domain.includes('.88.football')) {
      modifiedDomain = domain;
    } else {
      modifiedDomain = domain.replace(/\./g, 'l9t4d0a1') + '.88.football';
    }
    const path = pathAndQuery || '';
    return proto + '//' + modifiedDomain + path;
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
  console.trace('XHR:  ' + url);
  return ABEKENMAN_xhr.call(this, method, ABEKENMAN_transformUrls(url), async, user, password);
};

const ABEKENMAN_fetch = window.fetch;
window.fetch = function(input, init) {
  if (typeof input === 'string') input = ABEKENMAN_transformUrls(input);
  else if (input instanceof URL) input = new URL(ABEKENMAN_transformUrls(input.toString()));
  else if (input instanceof Request) input = new Request(ABEKENMAN_transformUrls(input.url), input);
  return ABEKENMAN_fetch.call(this, input, init);
};

// --- 3. setAttribute のフック ---
const ABEKENMAN_setAttribute = Element.prototype.setAttribute;

Element.prototype.setAttribute = function(name, value) {
  let chand;
  if (typeof name === 'string' && typeof value === 'string') {
    // URLを含む可能性がある属性
    const urlAttributes = [
      'href',
      'src',
      'srcset',
      'action',
      'formaction',
      'cite',
      'poster',
      'background',
      'data',
      'manifest'
    ];

    if (urlAttributes.includes(name.toLowerCase())) {
      chand = ABEKENMAN_transformUrls(value);
    } else chand = value;
    console.trace('setAttribute:       ' + chand);
  }

  return ABEKENMAN_setAttribute.call(this, name, chand);
};

const ABEKENMAN_href_descriptor = Object.getOwnPropertyDescriptor(
  HTMLAnchorElement.prototype,
  "href"
);

Object.defineProperty(HTMLAnchorElement.prototype, "href", {
  get() {
    return ABEKENMAN_href_descriptor.get.call(this)
  },
  set(value) {
    const ABEKENMAN_res = ABEKENMAN_transformUrls(value);
    console.trace("hrefに代入:", ABEKENMAN_res);
    return ABEKENMAN_href_descriptor.set.call(this, ABEKENMAN_res);
  },
  configurable: ABEKENMAN_href_descriptor.configurable,
  enumerable: ABEKENMAN_href_descriptor.enumerable,
});

const ABEKENMAN_innerHTML_descriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "innerHTML"
);

Object.defineProperty(Element.prototype, "innerHTML", {
  get() {
    return ABEKENMAN_innerHTML_descriptor.get.call(this);
  },
  set(value) {
    const ABEKENMAN_res = ABEKENMAN_transformUrls(value);
    console.trace("innerHTMLに代入:", ABEKENMAN_res);
    return ABEKENMAN_innerHTML_descriptor.set.call(this, ABEKENMAN_res);
  },
  configurable: ABEKENMAN_innerHTML_descriptor.configurable,
  enumerable: ABEKENMAN_innerHTML_descriptor.enumerable,
});






// ============================================================
// --- 追加: URLを受け取るAPI / プロパティのフック ---
// ============================================================

// 汎用プロパティフック
function ABEKENMAN_hookUrlProperty(prototype, property, label) {
  if (!prototype) return console.log('no prototype: ' + label);

  const descriptor = Object.getOwnPropertyDescriptor(
    prototype,
    property
  );

  if (!descriptor || !descriptor.set) return console.log('no descriptor: ' + label);

  Object.defineProperty(prototype, property, {
    get() {
      return descriptor.get
        ? descriptor.get.call(this)
        : undefined;
    },

    set(value) {
      const transformed =
        typeof value === 'string'
          ? ABEKENMAN_transformUrls(value)
          : value;

      console.log(label + ':', transformed);

      return descriptor.set.call(this, transformed);
    },

    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable
  });
  console.log('overwrite: ' + label);
}


// ============================================================
// 1. <area href>
// ============================================================

ABEKENMAN_hookUrlProperty(
  HTMLAreaElement.prototype,
  'href',
  'area.href'
);


// ============================================================
// 2. <link href>
// ============================================================

ABEKENMAN_hookUrlProperty(
  HTMLLinkElement.prototype,
  'href',
  'link.href'
);


// ============================================================
// 3. <base href>
// ============================================================

if (typeof HTMLBaseElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(
    HTMLBaseElement.prototype,
    'href',
    'base.href'
  );
}


// ============================================================
// 4. <iframe src>
// ============================================================

ABEKENMAN_hookUrlProperty(
  HTMLIFrameElement.prototype,
  'src',
  'iframe.src'
);


// ============================================================
// 5. <frame src>
// ============================================================

if (typeof HTMLFrameElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(
    HTMLFrameElement.prototype,
    'src',
    'frame.src'
  );
}


// ============================================================
// 6. <script src>
// ============================================================

ABEKENMAN_hookUrlProperty(
  HTMLScriptElement.prototype,
  'src',
  'script.src'
);


// ============================================================
// 7. <img src>
// ============================================================

ABEKENMAN_hookUrlProperty(
  HTMLImageElement.prototype,
  'src',
  'img.src'
);


// ============================================================
// 8. <audio src>
// ============================================================

ABEKENMAN_hookUrlProperty(
  HTMLAudioElement.prototype,
  'src',
  'audio.src'
);


// ============================================================
// 9. <video src>
// ============================================================

ABEKENMAN_hookUrlProperty(
  HTMLVideoElement.prototype,
  'src',
  'video.src'
);


// ============================================================
// 10. <source src>
// ============================================================

if (typeof HTMLSourceElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(
    HTMLSourceElement.prototype,
    'src',
    'source.src'
  );
}


// ============================================================
// 11. <track src>
// ============================================================

if (typeof HTMLTrackElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(
    HTMLTrackElement.prototype,
    'src',
    'track.src'
  );
}


// ============================================================
// 12. <embed src>
// ============================================================

if (typeof HTMLEmbedElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(
    HTMLEmbedElement.prototype,
    'src',
    'embed.src'
  );
}


// ============================================================
// 13. <object data>
// ============================================================

if (typeof HTMLObjectElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(
    HTMLObjectElement.prototype,
    'data',
    'object.data'
  );
}


// ============================================================
// 14. <video poster>
// ============================================================

ABEKENMAN_hookUrlProperty(
  HTMLVideoElement.prototype,
  'poster',
  'video.poster'
);


// ============================================================
// 15. <blockquote / q cite>
// ============================================================

if (typeof HTMLQuoteElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(
    HTMLQuoteElement.prototype,
    'cite',
    'quote.cite'
  );
}


// ============================================================
// 16. form.action
// ============================================================

ABEKENMAN_hookUrlProperty(
  HTMLFormElement.prototype,
  'action',
  'form.action'
);


// ============================================================
// 17. button.formAction
// ============================================================

if (typeof HTMLButtonElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(
    HTMLButtonElement.prototype,
    'formAction',
    'button.formAction'
  );
}


// ============================================================
// 18. input.formAction
// ============================================================

if (typeof HTMLInputElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(
    HTMLInputElement.prototype,
    'formAction',
    'input.formAction'
  );
}


// ============================================================
// 19. img.srcset
// ============================================================

ABEKENMAN_hookUrlProperty(
  HTMLImageElement.prototype,
  'srcset',
  'img.srcset'
);


// ============================================================
// 20. source.srcset
// ============================================================

if (typeof HTMLSourceElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(
    HTMLSourceElement.prototype,
    'srcset',
    'source.srcset'
  );
}


// ============================================================
// 21. window.open()
// ============================================================

const ABEKENMAN_windowOpen = window.open;

window.open = function(
  url,
  target,
  features,
  replace
) {
  let transformed = url;

  if (typeof url === 'string') {
    transformed =
      ABEKENMAN_transformUrls(url);
  } else if (url instanceof URL) {
    transformed =
      ABEKENMAN_transformUrls(url.toString());
  }

  console.log(
    'window.open:',
    transformed
  );

  return ABEKENMAN_windowOpen.call(
    this,
    transformed,
    target,
    features,
    replace
  );
};


// ============================================================
// 22. history.pushState()
// ============================================================

const ABEKENMAN_pushState =
  history.pushState;

history.pushState = function(
  state,
  unused,
  url
) {
  let transformed = url;

  if (typeof url === 'string') {
    transformed =
      ABEKENMAN_transformUrls(url);
  } else if (url instanceof URL) {
    transformed =
      ABEKENMAN_transformUrls(url.toString());
  }

  console.log(
    'history.pushState:',
    transformed
  );

  return ABEKENMAN_pushState.call(
    this,
    state,
    unused,
    transformed
  );
};


// ============================================================
// 23. history.replaceState()
// ============================================================

var ABEKENMAN_replaceState =
  history.replaceState;

history.replaceState = function(
  state,
  unused,
  url
) {
  let transformed = url;

  if (typeof url === 'string') {
    transformed =
      ABEKENMAN_transformUrls(url);
  } else if (url instanceof URL) {
    transformed =
      ABEKENMAN_transformUrls(url.toString());
  }

  console.log(
    'history.replaceState:',
    transformed
  );

  return ABEKENMAN_replaceState.call(
    this,
    state,
    unused,
    transformed
  );
};


// ============================================================
// 24. WebSocket()
// ============================================================

if (typeof WebSocket !== 'undefined') {
  const ABEKENMAN_WebSocket =
    window.WebSocket;

  window.WebSocket = function(
    url,
    protocols
  ) {
    const transformed =
      ABEKENMAN_transformUrls(
        String(url)
      );

    console.log(
      'WebSocket:',
      transformed
    );

    return new ABEKENMAN_WebSocket(
      transformed,
      protocols
    );
  };

  window.WebSocket.prototype =
    ABEKENMAN_WebSocket.prototype;
}


// ============================================================
// 25. EventSource()
// ============================================================

if (typeof EventSource !== 'undefined') {
  const ABEKENMAN_EventSource =
    window.EventSource;

  window.EventSource = function(
    url,
    eventSourceInitDict
  ) {
    const transformed =
      ABEKENMAN_transformUrls(
        String(url)
      );

    console.log(
      'EventSource:',
      transformed
    );

    return new ABEKENMAN_EventSource(
      transformed,
      eventSourceInitDict
    );
  };

  window.EventSource.prototype =
    ABEKENMAN_EventSource.prototype;
}








var ABEKENMAN_location_desc = {
  get href() {
    return ABEKENMAN_transformUrls(
      window.location.href
    );
  },

  set href(url) {
    const transformed =
      ABEKENMAN_transformUrls(
        String(url)
      );

    console.log(
      'ABEKENMAN_location_desc.href =',
      transformed
    );

    window.location.href = transformed;
  },

  get protocol() {
    return window.location.protocol;
  },

  get host() {
    const hostname =
      ABEKENMAN_transformUrls(
        '//' + window.location.hostname
      ).replace(/^\/\//, '');
    
    return window.location.port
      ? hostname + ':' + window.location.port
      : hostname;
  },

  get hostname() {
    return ABEKENMAN_transformUrls(
      '//' + window.location.hostname
    ).replace(/^\/\//, '');
  },

  get port() {
    return window.location.port;
  },

  get pathname() {
    return window.location.pathname;
  },

  get search() {
    return window.location.search;
  },

  get hash() {
    return window.location.hash;
  },

  get origin() {
    return ABEKENMAN_transformUrls(
      window.location.origin
    );
  },

  assign(url) {
    const transformed =
      ABEKENMAN_transformUrls(
        String(url)
      );

    console.log(
      'ABEKENMAN_location.assign:',
      transformed
    );

    window.location.assign(transformed);
  },

  replace(url) {
    const transformed =
      ABEKENMAN_transformUrls(
        String(url)
      );

    console.log(
      'ABEKENMAN_location_desc.replace:',
      transformed
    );

    window.location.replace(transformed);
  },

  reload(...args) {
    return window.location.reload(...args);
  },

  toString() {
    return this.href;
  }
};

alert(ABEKENMAN_location_desc.href);



