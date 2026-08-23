import { Hono } from 'hono';

const ps0 = new Hono();

// マルチバイト文字のみをURLエンコードする関数
function encodeMultiByteOnly(str: string): string {
  let encoded = '';
  const chars = Array.from(str);
  for (const char of chars) {
    const urlEncoded = encodeURIComponent(char);
    // %が含まれるエンコード結果（マルチバイト）を対象とする
    if ((urlEncoded.match(/%/g) || []).length >= 2) {
      encoded += urlEncoded;
    } else {
      encoded += char;
    }
  }
  return encoded;
}

ps0.all('/', async (c) => {
  // CORSヘッダー
  c.header('Access-Control-Allow-Origin', '*');

  const queryParams = c.req.query();
  const urlParam = queryParams['url'];

  if (!urlParam) {
    return c.text('please it.');
  }

  const parParam = queryParams['par'];

  // クエリパラメータの再構築用オブジェクト作成 ($gp から url と par を除去)
  const gp = { ...queryParams };
  delete gp['url'];
  delete gp['par'];

  let rl = urlParam.replace(/ /g, '+');

  // $que の組み立て処理
  let que = '';
  if (Object.keys(gp).length > 0) {
    const jsonStr = JSON.stringify(gp);
    const formattedParams = jsonStr
      .replace(/[{}"}]/g, '')
      .replace(/:/g, '=')
      .replace(/,/g, '&');

    if (rl.includes('?')) {
      que = '&' + formattedParams;
    } else {
      if (rl.endsWith('/')) {
        que = '?' + formattedParams;
      } else if (rl.includes('/')) {
        const afterFirstSlash = rl.substring(rl.indexOf('/'));
        que = afterFirstSlash.includes('.') ? '?' + formattedParams : '/?' + formattedParams;
      } else {
        que = '/?' + formattedParams;
      }
    }
  }

  rl = encodeMultiByteOnly(rl);
  que = encodeMultiByteOnly(que);

  // 対象ターゲットURLの決定
  let targetUrl = '';
  if (rl.startsWith('http://') || rl.startsWith('https://')) {
    targetUrl = rl + que;
  } else if (rl.startsWith('//')) {
    targetUrl = 'https:' + rl + que;
  } else {
    if (parParam) {
      let relativeRl = rl;
      if (relativeRl.startsWith('./')) {
        relativeRl = relativeRl.substring(2);
      }

      if (relativeRl.startsWith('/')) {
        const schemeEnd = parParam.indexOf('://') + 3;
        const slashIndex = parParam.indexOf('/', schemeEnd);
        const baseUrl = slashIndex !== -1 ? parParam.substring(0, slashIndex) : parParam;
        targetUrl = baseUrl + relativeRl + que;
      } else {
        let pra = parParam;
        while (relativeRl.startsWith('../')) {
          const lastSlash = pra.lastIndexOf('/');
          if (lastSlash !== -1) {
            pra = pra.substring(0, lastSlash);
          }
          relativeRl = relativeRl.substring(3);
        }
        const queryIndex = pra.indexOf('?');
        const basePra = queryIndex !== -1 ? pra.substring(0, queryIndex) : (pra.endsWith('/') ? pra : pra + '/');
        targetUrl = basePra + relativeRl + que;
      }
    } else {
      targetUrl = 'https://' + rl + que;
    }
  }

  // HTTPリクエストのヘッダー設定
  const headers = new Headers();

  // niji-gazo.com の場合の User-Agent 設定
  const targetCheckUrl = parParam || urlParam;
  if (targetCheckUrl.startsWith('https://niji-gazo.com')) {
    headers.set('User-Agent', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36');
  }

  // Fetchオプションの構成
  const fetchOptions: RequestInit = {
    method: c.req.method,
    headers: headers,
    redirect: 'follow'
  };

  if (c.req.method === 'POST') {
    fetchOptions.body = await c.req.arrayBuffer();
  }

  // フェッチ実行
  const response = await fetch(targetUrl, fetchOptions);
  const contentType = response.headers.get('content-type') || '';
  const finalUrl = response.url || targetUrl;

  // text/html でリダイレクトが必要な場合の判定
  if (contentType.toLowerCase().startsWith('text/html') && (urlParam !== finalUrl || parParam || Object.keys(gp).length > 0)) {
    return c.redirect('https://xn--28j1a4k.com/new/ps/?url=' + encodeURIComponent(finalUrl), 302);
  }

  let bodyText = await response.text();
  const lowerContentType = contentType.toLowerCase();

  // HTML / JS に対する書き換え処理
  if (
    lowerContentType.startsWith('text/html') ||
    lowerContentType.startsWith('application/javascript') ||
    lowerContentType.startsWith('text/javascript')
  ) {
    const a = '/new/ps/?par=' + encodeURIComponent(finalUrl) + '&url=';

    if (!targetCheckUrl.startsWith('https://niji-gazo.com')) {
      bodyText = bodyText.replace(/([^.]\s*)window[.]/g, '$1');
    }
    bodyText = bodyText.replace(/(import\s[^;"\']+["\'])/g, '$1' + a);
    bodyText = bodyText.replace(/([^.]\s+)(src|href|action|srcset|formaction)=([^\s>"\']+)/g, '$1$2="$3"');
    bodyText = bodyText.replace(
      /(<form\s[^>]*action=["\'])([^"\']*)(["\'][^>]*>)/g,
      `$1$2$3<input type="hidden" name="par" value="${finalUrl}"><input type="hidden" name="url" value="$2">`
    );
    bodyText = bodyText.replace(/([^.]\s+)(src|href|action|srcset|formaction)=(["\'])(?!data:|javascript:|#|[+]|\s)/g, '$1$2=$3' + a);
    bodyText = bodyText.replace(/([^.]\s+)(src|href|action|srcset|formaction)=(["\'])(?!data:|javascript:|#|[+])\s/g, '$1$2=' + a + '$3 ');
    bodyText = bodyText.replace(/[.]\s*((location[.](?!assign|replace|href))|src|href|action|srcset|formaction)\s*=/g, `.$1 = '${a}' + `);
    bodyText = bodyText.replace(/name=(["\'])viewport["\']/g, 'name=$1Abekenman$1');
    bodyText = bodyText.replace(/(;\s*)(import|open|(new\s+(Request|Worker))|(location[.](assign|replace)))\s*[(]/g, `$1$2('${a}' + `);
  }
  // CSS に対する書き換え処理
  else if (lowerContentType.startsWith('text/css')) {
    const schemeEnd = finalUrl.indexOf('/', 10);
    const b = schemeEnd !== -1 ? finalUrl.substring(0, schemeEnd + 1) : finalUrl + '/';

    bodyText = bodyText.replace(/(\surl\s*[(]\s*)(["\'](?!data:|https:|http:|\/))/g, '$1$2' + finalUrl);
    bodyText = bodyText.replace(/(\surl\s*[(]\s*)(["\'])\/(?!\/)/g, '$1$2' + b + '/');
    bodyText = bodyText.replace(/(\surl\s*[(]\s*)(?!\s|data:|https:|http:|\/|"|\')/g, '$1' + finalUrl);
    bodyText = bodyText.replace(/(\surl\s*[(]\s*)\/(?!\/|"|\')/g, '$1' + b + '/');
  }

  // HTMLのhead内にscriptタグを追加
  if (contentType.toLowerCase().startsWith('text/html')) {
    bodyText = bodyText.replace(/<head([^>]*)[>]/, '<head$1><script src="/new/ps/over.js"></script>');
  }

  // レスポンスの返却
  return c.text(bodyText, 200, {
    'content-type': contentType
  });
});

export default ps0;

