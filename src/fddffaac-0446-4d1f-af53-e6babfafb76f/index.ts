import { Hono } from 'hono';
import { html } from 'hono/html';

const freb0 = new Hono();

freb0.all('*', async (c) => {
  try {
    // フォームデータ（x-www-form-urlencoded / multipart）を解析
    const body = await c.req.parseBody();
    const content = body['e6c417a27ec54833ba1582a92f4ec33a'];

    if (typeof content === 'string' && content) {
      // html テンプレートタグで自動エスケープして無害化
      return c.html(html`${content}`);
    }
  } catch {
    // エラーハンドリング
  }

  return c.text('404 Not Found', 404);
});

export default freb0;
