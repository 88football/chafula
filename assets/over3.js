// ============================================================
// --- 1. URL変換・復元関数
// ============================================================

/* function ABEKENMAN_transformUrls(text) {
  if (typeof text !== "string") return text;

  const urlRegex = /(?<![:\\])(https?:)?\/\/([^\/\s"']+)(\/[^\s"']*)?/gi;

  return text.replace(urlRegex, (match, protocol, domain, pathAndQuery) => {
    const proto = protocol || "";
    let modifiedDomain;

    if (domain.includes(".88.football")) {
      modifiedDomain = domain;
    } else {
      modifiedDomain = domain.replace(/\./g, "l9t4d0a1") + ".88.football";
    }

    const path = pathAndQuery || "";

    return proto + "//" + modifiedDomain + path;
  });
} */

function transformUrls4(text) {
  const urlRegex = /(?<=href\=['"]\$\{)(\w+)(?=\}['"])/gi;
  return text.replace(urlRegex, (match, varedurl) => {
    const varur = "ABEKENMAN_transformUrls(" + varedurl + ")";
    return varur;
  });
}

function transformUrls3(text) {
  const urlRegex = /(['"]https?:)\/\/(['"+.()\-\/\s\w]+)(?=;)/gi;
  return transformUrls4(text).replace(
    urlRegex,
    (match, protocol, domainandpath) => {
      const proto = protocol || "";
      const dopath = domainandpath || "";
      if (
        dopath.includes("+") &&
        (dopath.includes("'") || dopath.includes('"')) &&
        dopath.split("(").length == dopath.split(")").length
      )
        return "ABEKENMAN_transformUrls(" + proto + "//" + dopath + ")";
      else return match;
    },
  );
}

function transformUrls2(text) {
  const urlRegex = /(?<![:\\])(https?:)?\/\/\$\{([^\/\s"']+)\}(\/[^\s"']*)?/gi;
  return transformUrls3(text).replace(
    urlRegex,
    (match, protocol, domain, pathAndQuery) => {
      const proto = protocol || "";
      const modifiedDomain =
        '${ABEKENMAN_transformUrls("//" + ' + domain + ")}";
      const path = pathAndQuery || "";
      return proto + modifiedDomain + path;
    },
  );
}

function transformUrls(text) {
  const urlRegex =
    /(?<![:\\])(https?:)?(?:\/\/|\\\/\\\/)([^\/\s"'$]+)((?:\\\/|(?<!\\)\/)[^\s"']*)/gi;
  return transformUrls2(text).replace(
    urlRegex,
    (match, protocol, domain, pathAndQuery) => {
      const proto = protocol || "";
      const modifiedDomain = domain.replace(/\./g, "l9t4d0a1");
      const path = pathAndQuery || "";
      return `${proto}//${modifiedDomain}.88.football${path}`;
    },
  );
}

function ABEKENMAN_restoreUrl(url) {
  if (typeof url !== "string") return url;

  return url.replace(".88.football", "").replace(/l9t4d0a1/g, ".");
}

var ABEKENMAN_restored = ABEKENMAN_restoreUrl(location.href);

// ============================================================
// --- 2. hostname 判定
// ============================================================
//
// origin ではなく hostname のみを比較する。
// port / protocol は判定対象外。
//
// 例:
//
// https://example.com/a
// http://example.com/b
//
// → 同一 hostname
//
// https://example.com
// https://www.example.com
//
// → 別 hostname
//
// ============================================================

function ABEKENMAN_isCrossHostnameNavigation(url) {
  try {
    const target = new URL(String(url), window.location.href);

    const currentHostname = window.location.hostname;

    const targetHostname = target.hostname;

    return targetHostname.toLowerCase() !== currentHostname.toLowerCase();
  } catch (e) {
    console.warn("ABEKENMAN_isCrossHostnameNavigation: invalid URL:", url, e);

    return false;
  }
}

// ============================================================
// --- 3. URLを絶対URLにする
// ============================================================

function ABEKENMAN_resolveUrl(url) {
  try {
    return new URL(String(url), window.location.href).href;
  } catch (e) {
    return String(url);
  }
}

// ============================================================
// --- 4. 別hostname遷移処理
// ============================================================
//
// 別hostname:
//     ABEKENMAN_showIndependentDialog(url)
//
// 同一hostname:
//     通常動作
//
// ============================================================

function ABEKENMAN_handleCrossHostnameNavigation(url) {
  const resolved = ABEKENMAN_resolveUrl(url);

  if (ABEKENMAN_isCrossHostnameNavigation(resolved)) {
    console.log("ABEKENMAN: cross-hostname navigation:", resolved);

    ABEKENMAN_showIndependentDialog(resolved);

    return true;
  }

  return false;
}

// ============================================================
// --- 5. XHR
// ============================================================

const ABEKENMAN_xhr = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (
  method,
  url,
  async = true,
  user = null,
  password = null,
) {
  console.trace("XHR: " + url);

  return ABEKENMAN_xhr.call(
    this,
    method,
    ABEKENMAN_transformUrls(url),
    async,
    user,
    password,
  );
};

// ============================================================
// --- 6. fetch
// ============================================================

const ABEKENMAN_fetch = window.fetch;

window.fetch = function (input, init) {
  if (typeof input === "string") {
    input = ABEKENMAN_transformUrls(input);
  } else if (input instanceof URL) {
    input = new URL(ABEKENMAN_transformUrls(input.toString()));
  } else if (input instanceof Request) {
    input = new Request(ABEKENMAN_transformUrls(input.url), input);
  }

  return ABEKENMAN_fetch.call(this, input, init);
};

// ============================================================
// --- 7. setAttribute
// ============================================================

const ABEKENMAN_setAttribute = Element.prototype.setAttribute;

Element.prototype.setAttribute = function (name, value) {
  let chand = value;

  if (typeof name === "string" && typeof value === "string") {
    const urlAttributes = [
      "href",
      "src",
      "srcset",
      "action",
      "formaction",
      "cite",
      "poster",
      "background",
      "data",
      "manifest",
    ];

    if (urlAttributes.includes(name.toLowerCase())) {
      chand = ABEKENMAN_transformUrls(value);
    }

    console.trace("setAttribute:", name, chand);
  }

  return ABEKENMAN_setAttribute.call(this, name, chand);
};

// ============================================================
// --- 8. HTMLAnchorElement.href
// ============================================================

const ABEKENMAN_href_descriptor = Object.getOwnPropertyDescriptor(
  HTMLAnchorElement.prototype,
  "href",
);

if (ABEKENMAN_href_descriptor && ABEKENMAN_href_descriptor.set) {
  Object.defineProperty(HTMLAnchorElement.prototype, "href", {
    get() {
      return ABEKENMAN_href_descriptor.get.call(this);
    },

    set(value) {
      const transformed = ABEKENMAN_transformUrls(value);

      console.trace("hrefに代入:", transformed);

      return ABEKENMAN_href_descriptor.set.call(this, transformed);
    },

    configurable: ABEKENMAN_href_descriptor.configurable,

    enumerable: ABEKENMAN_href_descriptor.enumerable,
  });
}

// ============================================================
// --- 9. innerHTML
// ============================================================

const ABEKENMAN_innerHTML_descriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "innerHTML",
);

if (ABEKENMAN_innerHTML_descriptor && ABEKENMAN_innerHTML_descriptor.set) {
  Object.defineProperty(Element.prototype, "innerHTML", {
    get() {
      return ABEKENMAN_innerHTML_descriptor.get.call(this);
    },

    set(value) {
      const transformed = ABEKENMAN_transformUrls(value);

      console.trace("innerHTMLに代入:", transformed);

      return ABEKENMAN_innerHTML_descriptor.set.call(this, transformed);
    },

    configurable: ABEKENMAN_innerHTML_descriptor.configurable,

    enumerable: ABEKENMAN_innerHTML_descriptor.enumerable,
  });
}

// ============================================================
// --- 10. outerHTML
// ============================================================

const ABEKENMAN_outerHTML_descriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "outerHTML",
);

if (ABEKENMAN_outerHTML_descriptor && ABEKENMAN_outerHTML_descriptor.set) {
  Object.defineProperty(Element.prototype, "outerHTML", {
    get() {
      return ABEKENMAN_outerHTML_descriptor.get.call(this);
    },

    set(value) {
      const transformed =
        typeof value === "string" ? ABEKENMAN_transformUrls(value) : value;

      console.trace("outerHTMLに代入:", transformed);

      return ABEKENMAN_outerHTML_descriptor.set.call(this, transformed);
    },

    configurable: ABEKENMAN_outerHTML_descriptor.configurable,

    enumerable: ABEKENMAN_outerHTML_descriptor.enumerable,
  });
}

// ============================================================
// --- 11. insertAdjacentHTML
// ============================================================

const ABEKENMAN_insertAdjacentHTML = Element.prototype.insertAdjacentHTML;

Element.prototype.insertAdjacentHTML = function (position, text) {
  const transformed =
    typeof text === "string" ? ABEKENMAN_transformUrls(text) : text;

  console.trace("insertAdjacentHTML:", position, transformed);

  return ABEKENMAN_insertAdjacentHTML.call(this, position, transformed);
};

// ============================================================
// --- 12. document.write
// ============================================================

const ABEKENMAN_documentWrite = Document.prototype.write;

Document.prototype.write = function (...args) {
  const transformedArgs = args.map((value) => {
    return typeof value === "string" ? ABEKENMAN_transformUrls(value) : value;
  });

  console.trace("document.write:", transformedArgs);

  return ABEKENMAN_documentWrite.apply(this, transformedArgs);
};

// ============================================================
// --- 13. document.writeln
// ============================================================

const ABEKENMAN_documentWriteln = Document.prototype.writeln;

Document.prototype.writeln = function (...args) {
  const transformedArgs = args.map((value) => {
    return typeof value === "string" ? ABEKENMAN_transformUrls(value) : value;
  });

  console.trace("document.writeln:", transformedArgs);

  return ABEKENMAN_documentWriteln.apply(this, transformedArgs);
};

// ============================================================
// --- 14. DOMParser
// ============================================================

if (typeof DOMParser !== "undefined") {
  const ABEKENMAN_parseFromString = DOMParser.prototype.parseFromString;

  DOMParser.prototype.parseFromString = function (source, type) {
    const transformed =
      typeof source === "string" ? ABEKENMAN_transformUrls(source) : source;

    console.trace("DOMParser.parseFromString:", type, transformed);

    return ABEKENMAN_parseFromString.call(this, transformed, type);
  };
}

// ============================================================
// --- 15. Range.createContextualFragment
// ============================================================

const ABEKENMAN_createContextualFragment =
  Range.prototype.createContextualFragment;

Range.prototype.createContextualFragment = function (fragment) {
  const transformed =
    typeof fragment === "string" ? ABEKENMAN_transformUrls(fragment) : fragment;

  console.trace("Range.createContextualFragment:", transformed);

  return ABEKENMAN_createContextualFragment.call(this, transformed);
};

// ============================================================
// --- 16. 汎用URLプロパティフック
// ============================================================

function ABEKENMAN_hookUrlProperty(prototype, property, label) {
  if (!prototype) {
    console.log("no prototype: " + label);
    return;
  }

  const descriptor = Object.getOwnPropertyDescriptor(prototype, property);

  if (!descriptor || !descriptor.set) {
    console.log("no descriptor: " + label);

    return;
  }

  Object.defineProperty(prototype, property, {
    get() {
      return descriptor.get ? descriptor.get.call(this) : undefined;
    },

    set(value) {
      const transformed =
        typeof value === "string" ? ABEKENMAN_transformUrls(value) : value;

      console.log(label + ":", transformed);

      return descriptor.set.call(this, transformed);
    },

    configurable: descriptor.configurable,

    enumerable: descriptor.enumerable,
  });

  console.log("overwrite: " + label);
}

// ============================================================
// --- 17. URLプロパティ
// ============================================================

ABEKENMAN_hookUrlProperty(HTMLAreaElement.prototype, "href", "area.href");

ABEKENMAN_hookUrlProperty(HTMLLinkElement.prototype, "href", "link.href");

if (typeof HTMLBaseElement !== "undefined") {
  ABEKENMAN_hookUrlProperty(HTMLBaseElement.prototype, "href", "base.href");
}

ABEKENMAN_hookUrlProperty(HTMLIFrameElement.prototype, "src", "iframe.src");

if (typeof HTMLFrameElement !== "undefined") {
  ABEKENMAN_hookUrlProperty(HTMLFrameElement.prototype, "src", "frame.src");
}

ABEKENMAN_hookUrlProperty(HTMLScriptElement.prototype, "src", "script.src");

ABEKENMAN_hookUrlProperty(HTMLImageElement.prototype, "src", "img.src");

ABEKENMAN_hookUrlProperty(HTMLAudioElement.prototype, "src", "audio.src");

ABEKENMAN_hookUrlProperty(HTMLVideoElement.prototype, "src", "video.src");

if (typeof HTMLSourceElement !== "undefined") {
  ABEKENMAN_hookUrlProperty(HTMLSourceElement.prototype, "src", "source.src");
}

if (typeof HTMLTrackElement !== "undefined") {
  ABEKENMAN_hookUrlProperty(HTMLTrackElement.prototype, "src", "track.src");
}

if (typeof HTMLEmbedElement !== "undefined") {
  ABEKENMAN_hookUrlProperty(HTMLEmbedElement.prototype, "src", "embed.src");
}

if (typeof HTMLObjectElement !== "undefined") {
  ABEKENMAN_hookUrlProperty(HTMLObjectElement.prototype, "data", "object.data");
}

ABEKENMAN_hookUrlProperty(HTMLVideoElement.prototype, "poster", "video.poster");

if (typeof HTMLQuoteElement !== "undefined") {
  ABEKENMAN_hookUrlProperty(HTMLQuoteElement.prototype, "cite", "quote.cite");
}

ABEKENMAN_hookUrlProperty(HTMLFormElement.prototype, "action", "form.action");

if (typeof HTMLButtonElement !== "undefined") {
  ABEKENMAN_hookUrlProperty(
    HTMLButtonElement.prototype,
    "formAction",
    "button.formAction",
  );
}

if (typeof HTMLInputElement !== "undefined") {
  ABEKENMAN_hookUrlProperty(
    HTMLInputElement.prototype,
    "formAction",
    "input.formAction",
  );
}

ABEKENMAN_hookUrlProperty(HTMLImageElement.prototype, "srcset", "img.srcset");

if (typeof HTMLSourceElement !== "undefined") {
  ABEKENMAN_hookUrlProperty(
    HTMLSourceElement.prototype,
    "srcset",
    "source.srcset",
  );
}

// ============================================================
// --- 18. window.open
// ============================================================

const ABEKENMAN_windowOpen = window.open;

window.open = function (url, target, features, replace) {
  let transformed = url;

  if (typeof url === "string") {
    transformed = ABEKENMAN_transformUrls(url);
  } else if (url instanceof URL) {
    transformed = ABEKENMAN_transformUrls(url.toString());
  }

  console.log("window.open:", transformed);

  if (
    typeof transformed === "string" &&
    ABEKENMAN_handleCrossHostnameNavigation(transformed)
  ) {
    return null;
  }

  return ABEKENMAN_windowOpen.call(
    this,
    transformed,
    target,
    features,
    replace,
  );
};

// ============================================================
// --- 19. history.pushState
// ============================================================

const ABEKENMAN_pushState = history.pushState;

history.pushState = function (state, unused, url) {
  let transformed = url;

  if (typeof url === "string") {
    transformed = ABEKENMAN_transformUrls(url);
  } else if (url instanceof URL) {
    transformed = ABEKENMAN_transformUrls(url.toString());
  }

  console.log("history.pushState:", transformed);

  if (
    transformed != null &&
    ABEKENMAN_handleCrossHostnameNavigation(transformed)
  ) {
    return;
  }

  return ABEKENMAN_pushState.call(this, state, unused, transformed);
};

// ============================================================
// --- 20. history.replaceState
// ============================================================

const ABEKENMAN_replaceState = history.replaceState;

history.replaceState = function (state, unused, url) {
  let transformed = url;

  if (typeof url === "string") {
    transformed = ABEKENMAN_transformUrls(url);
  } else if (url instanceof URL) {
    transformed = ABEKENMAN_transformUrls(url.toString());
  }

  console.log("history.replaceState:", transformed);

  if (
    transformed != null &&
    ABEKENMAN_handleCrossHostnameNavigation(transformed)
  ) {
    return;
  }

  return ABEKENMAN_replaceState.call(this, state, unused, transformed);
};

// ============================================================
// --- 21. WebSocket
// ============================================================

if (typeof WebSocket !== "undefined") {
  const ABEKENMAN_WebSocket = window.WebSocket;

  window.WebSocket = function (url, protocols) {
    const transformed = ABEKENMAN_transformUrls(String(url));

    console.log("WebSocket:", transformed);

    return new ABEKENMAN_WebSocket(transformed, protocols);
  };

  window.WebSocket.prototype = ABEKENMAN_WebSocket.prototype;
}

// ============================================================
// --- 22. EventSource
// ============================================================

if (typeof EventSource !== "undefined") {
  const ABEKENMAN_EventSource = window.EventSource;

  window.EventSource = function (url, eventSourceInitDict) {
    const transformed = ABEKENMAN_transformUrls(String(url));

    console.log("EventSource:", transformed);

    return new ABEKENMAN_EventSource(transformed, eventSourceInitDict);
  };

  window.EventSource.prototype = ABEKENMAN_EventSource.prototype;
}

// ============================================================
// --- 23. <a> / <area> のクリック
// ============================================================
//
// ここが重要。
// href setterをフックするだけでは、
// ユーザーがリンクをクリックした際のナビゲーションは
// 捕捉できないため、capture phaseで監視する。
//
// ============================================================

document.addEventListener(
  "click",
  function (event) {
    let element = event.target;

    if (!(element instanceof Element)) {
      return;
    }

    const link = element.closest("a[href], area[href]");

    if (!link) {
      return;
    }

    // modifier click はブラウザの挙動を維持する。
    // ただし実際に別hostnameへ移動する場合は止める。
    const rawHref = link.getAttribute("href");

    if (
      !rawHref ||
      rawHref.startsWith("#") ||
      rawHref.startsWith("javascript:") ||
      rawHref.startsWith("mailto:") ||
      rawHref.startsWith("tel:")
    ) {
      return;
    }

    const transformed = ABEKENMAN_transformUrls(rawHref);

    const resolved = ABEKENMAN_resolveUrl(transformed);

    console.log("ABEKENMAN link click:", resolved);

    if (ABEKENMAN_isCrossHostnameNavigation(resolved)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      console.log("ABEKENMAN: link cross-hostname:", resolved);

      ABEKENMAN_showIndependentDialog(resolved);

      return;
    }
  },
  true,
);

// ============================================================
// --- 24. <form> submitイベント
// ============================================================

document.addEventListener(
  "submit",
  function (event) {
    const form = event.target;

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    let action = form.getAttribute("action");

    if (!action) {
      action = window.location.href;
    }

    const transformed = ABEKENMAN_transformUrls(action);

    const resolved = ABEKENMAN_resolveUrl(transformed);

    console.log("ABEKENMAN form submit:", resolved);

    if (ABEKENMAN_isCrossHostnameNavigation(resolved)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      console.log("ABEKENMAN: form cross-hostname:", resolved);

      ABEKENMAN_showIndependentDialog(resolved);

      return;
    }
  },
  true,
);

// ============================================================
// --- 25. HTMLFormElement.submit()
// ============================================================
//
// submit() は submit event を発生させないため、
// submitイベントだけでは捕捉できない。
//
// ============================================================

const ABEKENMAN_formSubmit = HTMLFormElement.prototype.submit;

HTMLFormElement.prototype.submit = function () {
  let action = this.getAttribute("action");

  if (!action) {
    action = window.location.href;
  }

  const transformed = ABEKENMAN_transformUrls(action);

  const resolved = ABEKENMAN_resolveUrl(transformed);

  console.log("ABEKENMAN form.submit:", resolved);

  if (ABEKENMAN_isCrossHostnameNavigation(resolved)) {
    console.log("ABEKENMAN: form.submit cross-hostname:", resolved);

    ABEKENMAN_showIndependentDialog(resolved);

    return;
  }

  return ABEKENMAN_formSubmit.call(this);
};

// ============================================================
// --- 26. HTMLFormElement.requestSubmit()
// ============================================================

if (typeof HTMLFormElement.prototype.requestSubmit === "function") {
  const ABEKENMAN_formRequestSubmit = HTMLFormElement.prototype.requestSubmit;

  HTMLFormElement.prototype.requestSubmit = function (submitter) {
    let action = this.getAttribute("action");

    if (!action) {
      action = window.location.href;
    }

    // submitter の formaction が優先される
    if (submitter && submitter instanceof Element) {
      const submitterAction = submitter.getAttribute("formaction");

      if (submitterAction) {
        action = submitterAction;
      }
    }

    const transformed = ABEKENMAN_transformUrls(action);

    const resolved = ABEKENMAN_resolveUrl(transformed);

    console.log("ABEKENMAN form.requestSubmit:", resolved);

    if (ABEKENMAN_isCrossHostnameNavigation(resolved)) {
      console.log("ABEKENMAN: requestSubmit cross-hostname:", resolved);

      ABEKENMAN_showIndependentDialog(resolved);

      return;
    }

    return ABEKENMAN_formRequestSubmit.call(this, submitter);
  };
}

// ============================================================
// --- 27. submit button の formaction
// ============================================================
//
// <button formaction="...">
// <input formaction="...">
//
// クリック時にform.actionではなくformactionが
// 使用されるケースを捕捉する。
//
// ============================================================

document.addEventListener(
  "click",
  function (event) {
    let element = event.target;

    if (!(element instanceof Element)) {
      return;
    }

    const submitter = element.closest(
      'button[type="submit"],' +
        'input[type="submit"],' +
        'input[type="image"]',
    );

    if (!submitter) {
      return;
    }

    const form = submitter.form;

    if (!form) {
      return;
    }

    const formaction = submitter.getAttribute("formaction");

    if (!formaction) {
      return;
    }

    const transformed = ABEKENMAN_transformUrls(formaction);

    const resolved = ABEKENMAN_resolveUrl(transformed);

    console.log("ABEKENMAN submitter formaction:", resolved);

    if (ABEKENMAN_isCrossHostnameNavigation(resolved)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      console.log("ABEKENMAN: formaction cross-hostname:", resolved);

      ABEKENMAN_showIndependentDialog(resolved);

      return;
    }
  },
  true,
);

// ============================================================
// --- 28. meta refresh
// ============================================================
//
// <meta http-equiv="refresh"
//       content="0;url=https://example.com/">
//
// DOMに追加されたmeta refreshを監視する。
//
// ============================================================

function ABEKENMAN_checkMetaRefresh(meta) {
  if (!(meta instanceof HTMLMetaElement)) {
    return;
  }

  const httpEquiv = meta.getAttribute("http-equiv");

  if (!httpEquiv || httpEquiv.toLowerCase() !== "refresh") {
    return;
  }

  const content = meta.getAttribute("content");

  if (!content) {
    return;
  }

  const match = content.match(/^\s*[\d.]+\s*(?:;\s*url\s*=\s*(.*))?\s*$/i);

  if (!match) {
    return;
  }

  const rawUrl = match[1];

  if (!rawUrl) {
    return;
  }

  const cleanedUrl = rawUrl.trim().replace(/^['"]|['"]$/g, "");

  const transformed = ABEKENMAN_transformUrls(cleanedUrl);

  const resolved = ABEKENMAN_resolveUrl(transformed);

  console.log("ABEKENMAN meta refresh:", resolved);

  if (ABEKENMAN_isCrossHostnameNavigation(resolved)) {
    console.log("ABEKENMAN: meta refresh cross-hostname:", resolved);

    // refreshを無効化
    meta.setAttribute("content", "999999999");

    ABEKENMAN_showIndependentDialog(resolved);
  }
}

// ============================================================
// --- 29. MutationObserver
// ============================================================

if (typeof MutationObserver !== "undefined") {
  const ABEKENMAN_metaObserver = new MutationObserver(function (mutations) {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLMetaElement) {
            ABEKENMAN_checkMetaRefresh(node);
          } else if (node instanceof Element) {
            const metas = node.querySelectorAll("meta[http-equiv]");

            for (const meta of metas) {
              ABEKENMAN_checkMetaRefresh(meta);
            }
          }
        }
      }

      if (mutation.type === "attributes") {
        if (mutation.target instanceof HTMLMetaElement) {
          ABEKENMAN_checkMetaRefresh(mutation.target);
        }
      }
    }
  });

  ABEKENMAN_metaObserver.observe(document.documentElement || document, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["http-equiv", "content"],
  });

  // 既に存在しているmeta refreshも確認
  if (document.querySelectorAll) {
    const metas = document.querySelectorAll("meta[http-equiv]");

    for (const meta of metas) {
      ABEKENMAN_checkMetaRefresh(meta);
    }
  }
}

// ============================================================
// --- 20. ABEKENMAN_location
// ============================================================

(function () {
  const locationObject = {};

  Object.defineProperties(locationObject, {
    // --------------------------------------------------------
    // href
    // --------------------------------------------------------

    href: {
      configurable: true,
      enumerable: true,

      get() {
        const restored = ABEKENMAN_restoreUrl(window.location.href);

        console.log("ABEKENMAN_location.href GET:", restored);

        return restored;
      },

      set(value) {
        const transformed = ABEKENMAN_transformUrls(String(value));

        console.log("ABEKENMAN_location.href SET:", transformed);

        if (ABEKENMAN_isCrossOriginNavigation(transformed)) {
          console.log("ABEKENMAN: location.href cross-origin:", transformed);

          ABEKENMAN_showIndependentDialog(transformed);

          return;
        }

        window.location.href = transformed;
      },
    },

    // --------------------------------------------------------
    // protocol
    // --------------------------------------------------------

    protocol: {
      configurable: true,
      enumerable: true,

      get() {
        return window.location.protocol;
      },

      set(value) {
        const setval = String(value);

        console.log("ABEKENMAN_location.protocol SET:", setval);

        window.location.protocol = setval;
      },
    },

    // --------------------------------------------------------
    // host
    // --------------------------------------------------------

    host: {
      configurable: true,
      enumerable: true,

      get() {
        const restored = ABEKENMAN_restoreUrl(window.location.host);

        console.log("ABEKENMAN_location.host GET:", restored);

        return restored;
      },

      set(value) {
        const input = "//" + String(value);

        const transformed = ABEKENMAN_transformUrls(input).replace(/^\/\//, "");

        console.log("ABEKENMAN_location.host SET:", transformed);

        if (ABEKENMAN_isCrossOriginNavigation("//" + transformed)) {
          console.log("ABEKENMAN: location.host cross-origin:", transformed);

          ABEKENMAN_showIndependentDialog("//" + transformed);

          return;
        }

        window.location.host = transformed;
      },
    },

    // --------------------------------------------------------
    // hostname
    // --------------------------------------------------------

    hostname: {
      configurable: true,
      enumerable: true,

      get() {
        const restored = ABEKENMAN_restoreUrl(window.location.hostname);

        console.log("ABEKENMAN_location.hostname GET:", restored);

        return restored;
      },

      set(value) {
        const input = "//" + String(value);

        const transformed = ABEKENMAN_transformUrls(input).replace(/^\/\//, "");

        console.log("ABEKENMAN_location.hostname SET:", transformed);

        if (ABEKENMAN_isCrossOriginNavigation("//" + transformed)) {
          console.log(
            "ABEKENMAN: location.hostname cross-origin:",
            transformed,
          );

          ABEKENMAN_showIndependentDialog("//" + transformed);

          return;
        }

        window.location.hostname = transformed;
      },
    },

    // --------------------------------------------------------
    // port
    // --------------------------------------------------------

    port: {
      configurable: true,
      enumerable: true,

      get() {
        return window.location.port;
      },

      set(value) {
        const setval = String(value);

        console.log("ABEKENMAN_location.port SET:", setval);

        window.location.port = setval;
      },
    },

    // --------------------------------------------------------
    // pathname
    // --------------------------------------------------------

    pathname: {
      configurable: true,
      enumerable: true,

      get() {
        return window.location.pathname;
      },

      set(value) {
        const setval = String(value);

        console.log("ABEKENMAN_location.pathname SET:", setval);

        window.location.pathname = setval;
      },
    },

    // --------------------------------------------------------
    // search
    // --------------------------------------------------------

    search: {
      configurable: true,
      enumerable: true,

      get() {
        return window.location.search;
      },

      set(value) {
        const setval = String(value);

        console.log("ABEKENMAN_location.search SET:", setval);

        window.location.search = setval;
      },
    },

    // --------------------------------------------------------
    // hash
    // --------------------------------------------------------

    hash: {
      configurable: true,
      enumerable: true,

      get() {
        return window.location.hash;
      },

      set(value) {
        const setval = String(value);

        console.log("ABEKENMAN_location.hash SET:", setval);

        window.location.hash = setval;
      },
    },

    // --------------------------------------------------------
    // origin
    // --------------------------------------------------------

    origin: {
      configurable: true,
      enumerable: true,

      get() {
        const restored = ABEKENMAN_restoreUrl(window.location.origin);

        console.log("ABEKENMAN_location.origin GET:", restored);

        return restored;
      },
    },

    // --------------------------------------------------------
    // assign()
    // --------------------------------------------------------

    assign: {
      configurable: true,
      enumerable: true,

      value(url) {
        const transformed = ABEKENMAN_transformUrls(String(url));

        console.log("ABEKENMAN_location.assign:", transformed);

        if (ABEKENMAN_isCrossOriginNavigation(transformed)) {
          console.log("ABEKENMAN: location.assign cross-origin:", transformed);

          ABEKENMAN_showIndependentDialog(transformed);

          return;
        }

        window.location.assign(transformed);
      },
    },

    // --------------------------------------------------------
    // replace()
    // --------------------------------------------------------

    replace: {
      configurable: true,
      enumerable: true,

      value(url) {
        const transformed = ABEKENMAN_transformUrls(String(url));

        console.log("ABEKENMAN_location.replace:", transformed);

        if (ABEKENMAN_isCrossOriginNavigation(transformed)) {
          console.log("ABEKENMAN: location.replace cross-origin:", transformed);

          ABEKENMAN_showIndependentDialog(transformed);

          return;
        }

        window.location.replace(transformed);
      },
    },

    // --------------------------------------------------------
    // reload()
    // --------------------------------------------------------

    reload: {
      configurable: true,
      enumerable: true,

      value(...args) {
        return window.location.reload(...args);
      },
    },

    // --------------------------------------------------------
    // toString()
    // --------------------------------------------------------

    toString: {
      configurable: true,
      enumerable: true,

      value() {
        return this.href;
      },
    },
  });

  // ==========================================================
  // --- window.ABEKENMAN_location
  // ==========================================================

  Object.defineProperty(window, "ABEKENMAN_location", {
    configurable: true,
    enumerable: true,

    get() {
      console.log("ABEKENMAN_location GET");

      return locationObject;
    },

    set(value) {
      console.log("ABEKENMAN_location SET:", value);
    },
  });
})();

// ============================================================
// --- 30. Drag & Drop によるリンク遷移
// ============================================================
//
// URLをドラッグしてブラウザへドロップする等の
// ブラウザUIレベルのナビゲーションはJavaScriptから
// 完全には捕捉できないため、ここでは通常のDOM操作のみ扱う。
//
// ============================================================

// ============================================================
// --- 31. 完了ログ
// ============================================================

console.log("ABEKENMAN navigation hooks installed.");

console.log("ABEKENMAN current hostname:", window.location.hostname);
