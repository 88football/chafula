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

XMLHttpRequest.prototype.open = function(method, url, async = true, user = null, password = null) {
  console.trace('XHR:  ' + url);
  return ABEKENMAN_xhr.call(this, method, ABEKENMAN_transformUrls(url), async, user, password);
};

const ABEKENMAN_fetch = window.fetch;

window.fetch = function(input, init) {
  if (typeof input === 'string') {
    input = ABEKENMAN_transformUrls(input);
  } else if (input instanceof URL) {
    input = new URL(ABEKENMAN_transformUrls(input.toString()));
  } else if (input instanceof Request) {
    input = new Request(ABEKENMAN_transformUrls(input.url), input);
  }

  return ABEKENMAN_fetch.call(this, input, init);
};

// --- 3. setAttribute のフック ---
const ABEKENMAN_setAttribute = Element.prototype.setAttribute;

Element.prototype.setAttribute = function(name, value) {
  let chand;

  if (typeof name === 'string' && typeof value === 'string') {
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
    } else {
      chand = value;
    }

    console.trace('setAttribute:       ' + chand);
  }

  return ABEKENMAN_setAttribute.call(this, name, chand);
};

const ABEKENMAN_href_descriptor = Object.getOwnPropertyDescriptor(
  HTMLAnchorElement.prototype,
  'href'
);

Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
  get() {
    return ABEKENMAN_href_descriptor.get.call(this);
  },
  set(value) {
    const ABEKENMAN_res = ABEKENMAN_transformUrls(value);
    console.trace('hrefに代入:', ABEKENMAN_res);
    return ABEKENMAN_href_descriptor.set.call(this, ABEKENMAN_res);
  },
  configurable: ABEKENMAN_href_descriptor.configurable,
  enumerable: ABEKENMAN_href_descriptor.enumerable
});

const ABEKENMAN_innerHTML_descriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  'innerHTML'
);

Object.defineProperty(Element.prototype, 'innerHTML', {
  get() {
    return ABEKENMAN_innerHTML_descriptor.get.call(this);
  },
  set(value) {
    const ABEKENMAN_res = ABEKENMAN_transformUrls(value);
    console.trace('innerHTMLに代入:', ABEKENMAN_res);
    return ABEKENMAN_innerHTML_descriptor.set.call(this, ABEKENMAN_res);
  },
  configurable: ABEKENMAN_innerHTML_descriptor.configurable,
  enumerable: ABEKENMAN_innerHTML_descriptor.enumerable
});


// ============================================================
// --- 追加: HTML parser / HTML insertion API のフック
// ============================================================

// --- Element.outerHTML ---
const ABEKENMAN_outerHTML_descriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  'outerHTML'
);

if (
  ABEKENMAN_outerHTML_descriptor &&
  ABEKENMAN_outerHTML_descriptor.set
) {
  Object.defineProperty(Element.prototype, 'outerHTML', {
    get() {
      return ABEKENMAN_outerHTML_descriptor.get.call(this);
    },

    set(value) {
      const transformed =
        typeof value === 'string'
          ? ABEKENMAN_transformUrls(value)
          : value;

      console.trace('outerHTMLに代入:', transformed);

      return ABEKENMAN_outerHTML_descriptor.set.call(
        this,
        transformed
      );
    },

    configurable: ABEKENMAN_outerHTML_descriptor.configurable,
    enumerable: ABEKENMAN_outerHTML_descriptor.enumerable
  });

  console.log('overwrite: Element.outerHTML');
}


// --- Element.insertAdjacentHTML() ---
const ABEKENMAN_insertAdjacentHTML =
  Element.prototype.insertAdjacentHTML;

Element.prototype.insertAdjacentHTML = function(
  position,
  text
) {
  const transformed =
    typeof text === 'string'
      ? ABEKENMAN_transformUrls(text)
      : text;

  console.trace(
    'insertAdjacentHTML:',
    position,
    transformed
  );

  return ABEKENMAN_insertAdjacentHTML.call(
    this,
    position,
    transformed
  );
};


// --- document.write() ---
const ABEKENMAN_documentWrite = Document.prototype.write;

Document.prototype.write = function(...args) {
  const transformedArgs = args.map(value => {
    return typeof value === 'string'
      ? ABEKENMAN_transformUrls(value)
      : value;
  });

  console.trace(
    'document.write:',
    transformedArgs
  );

  return ABEKENMAN_documentWrite.apply(
    this,
    transformedArgs
  );
};


// --- document.writeln() ---
const ABEKENMAN_documentWriteln =
  Document.prototype.writeln;

Document.prototype.writeln = function(...args) {
  const transformedArgs = args.map(value => {
    return typeof value === 'string'
      ? ABEKENMAN_transformUrls(value)
      : value;
  });

  console.trace(
    'document.writeln:',
    transformedArgs
  );

  return ABEKENMAN_documentWriteln.apply(
    this,
    transformedArgs
  );
};


// --- DOMParser.parseFromString() ---
const ABEKENMAN_DOMParser =
  window.DOMParser;

if (ABEKENMAN_DOMParser) {
  const ABEKENMAN_parseFromString =
    DOMParser.prototype.parseFromString;

  DOMParser.prototype.parseFromString = function(
    source,
    type
  ) {
    const transformed =
      typeof source === 'string'
        ? ABEKENMAN_transformUrls(source)
        : source;

    console.trace(
      'DOMParser.parseFromString:',
      type,
      transformed
    );

    return ABEKENMAN_parseFromString.call(
      this,
      transformed,
      type
    );
  };
}


// --- Range.createContextualFragment() ---
const ABEKENMAN_createContextualFragment =
  Range.prototype.createContextualFragment;

Range.prototype.createContextualFragment = function(
  fragment
) {
  const transformed =
    typeof fragment === 'string'
      ? ABEKENMAN_transformUrls(fragment)
      : fragment;

  console.trace(
    'Range.createContextualFragment:',
    transformed
  );

  return ABEKENMAN_createContextualFragment.call(
    this,
    transformed
  );
};




// ============================================================
// --- 追加: URLを受け取るAPI / プロパティのフック ---
// ============================================================

// 汎用プロパティフック
function ABEKENMAN_hookUrlProperty(prototype, property, label) {
  if (!prototype) return console.log('no prototype: ' + label);

  const descriptor = Object.getOwnPropertyDescriptor(prototype, property);

  if (!descriptor || !descriptor.set) {
    return console.log('no descriptor: ' + label);
  }

  Object.defineProperty(prototype, property, {
    get() {
      return descriptor.get ? descriptor.get.call(this) : undefined;
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

// --- URLプロパティのフック ---
ABEKENMAN_hookUrlProperty(HTMLAreaElement.prototype, 'href', 'area.href');
ABEKENMAN_hookUrlProperty(HTMLLinkElement.prototype, 'href', 'link.href');

if (typeof HTMLBaseElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(HTMLBaseElement.prototype, 'href', 'base.href');
}

ABEKENMAN_hookUrlProperty(HTMLIFrameElement.prototype, 'src', 'iframe.src');

if (typeof HTMLFrameElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(HTMLFrameElement.prototype, 'src', 'frame.src');
}

ABEKENMAN_hookUrlProperty(HTMLScriptElement.prototype, 'src', 'script.src');
ABEKENMAN_hookUrlProperty(HTMLImageElement.prototype, 'src', 'img.src');
ABEKENMAN_hookUrlProperty(HTMLAudioElement.prototype, 'src', 'audio.src');
ABEKENMAN_hookUrlProperty(HTMLVideoElement.prototype, 'src', 'video.src');

if (typeof HTMLSourceElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(HTMLSourceElement.prototype, 'src', 'source.src');
}

if (typeof HTMLTrackElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(HTMLTrackElement.prototype, 'src', 'track.src');
}

if (typeof HTMLEmbedElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(HTMLEmbedElement.prototype, 'src', 'embed.src');
}

if (typeof HTMLObjectElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(HTMLObjectElement.prototype, 'data', 'object.data');
}

ABEKENMAN_hookUrlProperty(HTMLVideoElement.prototype, 'poster', 'video.poster');

if (typeof HTMLQuoteElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(HTMLQuoteElement.prototype, 'cite', 'quote.cite');
}

ABEKENMAN_hookUrlProperty(HTMLFormElement.prototype, 'action', 'form.action');

if (typeof HTMLButtonElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(
    HTMLButtonElement.prototype,
    'formAction',
    'button.formAction'
  );
}

if (typeof HTMLInputElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(
    HTMLInputElement.prototype,
    'formAction',
    'input.formAction'
  );
}

ABEKENMAN_hookUrlProperty(HTMLImageElement.prototype, 'srcset', 'img.srcset');

if (typeof HTMLSourceElement !== 'undefined') {
  ABEKENMAN_hookUrlProperty(
    HTMLSourceElement.prototype,
    'srcset',
    'source.srcset'
  );
}

// --- window.open() ---
const ABEKENMAN_windowOpen = window.open;

window.open = function(url, target, features, replace) {
  let transformed = url;

  if (typeof url === 'string') {
    transformed = ABEKENMAN_transformUrls(url);
  } else if (url instanceof URL) {
    transformed = ABEKENMAN_transformUrls(url.toString());
  }

  console.log('window.open:', transformed);

  return ABEKENMAN_windowOpen.call(
    this,
    transformed,
    target,
    features,
    replace
  );
};

// --- history.pushState() ---
const ABEKENMAN_pushState = history.pushState;

history.pushState = function(state, unused, url) {
  let transformed = url;

  if (typeof url === 'string') {
    transformed = ABEKENMAN_transformUrls(url);
  } else if (url instanceof URL) {
    transformed = ABEKENMAN_transformUrls(url.toString());
  }

  console.log('history.pushState:', transformed);

  return ABEKENMAN_pushState.call(
    this,
    state,
    unused,
    transformed
  );
};

// --- history.replaceState() ---
const ABEKENMAN_replaceState = history.replaceState;

history.replaceState = function(state, unused, url) {
  let transformed = url;

  if (typeof url === 'string') {
    transformed = ABEKENMAN_transformUrls(url);
  } else if (url instanceof URL) {
    transformed = ABEKENMAN_transformUrls(url.toString());
  }

  console.log('history.replaceState:', transformed);

  return ABEKENMAN_replaceState.call(
    this,
    state,
    unused,
    transformed
  );
};

// --- WebSocket() ---
if (typeof WebSocket !== 'undefined') {
  const ABEKENMAN_WebSocket = window.WebSocket;

  window.WebSocket = function(url, protocols) {
    const transformed = ABEKENMAN_transformUrls(String(url));

    console.log('WebSocket:', transformed);

    return new ABEKENMAN_WebSocket(transformed, protocols);
  };

  window.WebSocket.prototype = ABEKENMAN_WebSocket.prototype;
}

// --- EventSource() ---
if (typeof EventSource !== 'undefined') {
  const ABEKENMAN_EventSource = window.EventSource;

  window.EventSource = function(url, eventSourceInitDict) {
    const transformed = ABEKENMAN_transformUrls(String(url));

    console.log('EventSource:', transformed);

    return new ABEKENMAN_EventSource(
      transformed,
      eventSourceInitDict
    );
  };

  window.EventSource.prototype = ABEKENMAN_EventSource.prototype;
}

// --- ABEKENMAN_location ---
(function() {
  const locationObject = {};

  Object.defineProperties(locationObject, {
    href: {
      configurable: true,
      enumerable: true,

      get() {
        const restored = ABEKENMAN_restoreUrl(window.location.href);

        console.log('ABEKENMAN_location.href GET:', restored);

        return restored;
      },

      set(value) {
        const transformed = ABEKENMAN_transformUrls(String(value));

        console.log('ABEKENMAN_location.href SET:', transformed);

        window.location.href = transformed;
      }
    },

    protocol: {
      configurable: true,
      enumerable: true,

      get() {
        return window.location.protocol;
      },

      set(value) {
        const setval = String(value);

        console.log('ABEKENMAN_location.protocol SET:', setval);

        window.location.protocol = setval;
      }
    },

    host: {
      configurable: true,
      enumerable: true,

      get() {
        const restored = ABEKENMAN_restoreUrl(window.location.host);

        console.log('ABEKENMAN_location.host GET:', restored);

        return restored;
      },

      set(value) {
        const input = '//' + String(value);
        const transformed = ABEKENMAN_transformUrls(input).replace(/^\/\//, '');

        console.log('ABEKENMAN_location.host SET:', transformed);

        window.location.host = transformed;
      }
    },

    hostname: {
      configurable: true,
      enumerable: true,

      get() {
        const restored = ABEKENMAN_restoreUrl(window.location.hostname);

        console.log('ABEKENMAN_location.hostname GET:', restored);

        return restored;
      },

      set(value) {
        const input = '//' + String(value);
        const transformed = ABEKENMAN_transformUrls(input).replace(/^\/\//, '');

        console.log('ABEKENMAN_location.hostname SET:', transformed);

        window.location.hostname = transformed;
      }
    },

    port: {
      configurable: true,
      enumerable: true,

      get() {
        return window.location.port;
      },

      set(value) {
        const setval = String(value);

        console.log('ABEKENMAN_location.port SET:', setval);

        window.location.port = setval;
      }
    },

    pathname: {
      configurable: true,
      enumerable: true,

      get() {
        return window.location.pathname;
      },

      set(value) {
        const setval = String(value);

        console.log('ABEKENMAN_location.pathname SET:', setval);

        window.location.pathname = setval;
      }
    },

    search: {
      configurable: true,
      enumerable: true,

      get() {
        return window.location.search;
      },

      set(value) {
        const setval = String(value);

        console.log('ABEKENMAN_location.search SET:', setval);

        window.location.search = setval;
      }
    },

    hash: {
      configurable: true,
      enumerable: true,

      get() {
        return window.location.hash;
      },

      set(value) {
        const setval = String(value);

        console.log('ABEKENMAN_location.hash SET:', setval);

        window.location.hash = setval;
      }
    },

    origin: {
      configurable: true,
      enumerable: true,

      get() {
        const restored = ABEKENMAN_restoreUrl(window.location.origin);

        console.log('ABEKENMAN_location.origin GET:', restored);

        return restored;
      }
    },

    assign: {
      configurable: true,
      enumerable: true,

      value(url) {
        const transformed = ABEKENMAN_transformUrls(String(url));

        console.log('ABEKENMAN_location.assign:', transformed);

        window.location.assign(transformed);
      }
    },

    replace: {
      configurable: true,
      enumerable: true,

      value(url) {
        const transformed = ABEKENMAN_transformUrls(String(url));

        console.log('ABEKENMAN_location.replace:', transformed);

        window.location.replace(transformed);
      }
    },

    reload: {
      configurable: true,
      enumerable: true,

      value(...args) {
        return window.location.reload(...args);
      }
    },

    toString: {
      configurable: true,
      enumerable: true,

      value() {
        return this.href;
      }
    }
  });

  Object.defineProperty(window, 'ABEKENMAN_location', {
    configurable: true,
    enumerable: true,

    get() {
      console.log('ABEKENMAN_location GET');
      return locationObject;
    },

    set(value) {
      console.log('ABEKENMAN_location SET:', value);
    }
  });
})();






