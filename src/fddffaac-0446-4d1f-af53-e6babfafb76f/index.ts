import { Hono } from 'hono';
import { html, raw } from 'hono/html'; // raw を追加

const freb0 = new Hono();

freb0.all('*', async (c) => {
  try {
    const body = await c.req.parseBody();
    const content = body['e6c417a27ec54833ba1582a92f4ec33a'];

    if (typeof content === 'string' && content) {
      // エスケープせずにそのままHTMLとしてレンダリング
      return c.html(html`${raw(content)}`);
    }
  } catch {
    // エラー処理
  }

  return c.text('404 Not Found', 404);
});

export default freb0;
