import { Hono } from 'hono';

import { html, raw } from 'hono/html';

const freb0 = new Hono();

freb0.all('*', async (c) => {
  try {
    const body = await c.req.json();
    const content = body?.e6c417a27ec54833ba1582a92f4ec33a;

    if (content) {
      // raw() を使うことでエスケープされず、そのままHTMLとしてレンダリングされます
      return c.html(html`${raw(content)}`);
    }
  } catch {
    // JSONが含まれないリクエスト（GETなど）でのエラー落ちを防止
  }

  return c.text('Not Found', 404);
});

export default freb0;
