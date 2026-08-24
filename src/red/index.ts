import { Hono } from 'hono';

const red0 = new Hono();

red0.all('*', async (c) => {
  const gur = (c.req.param('url').indexOf('http') == -1 ? 'https://' : '') + c.req.param('url');
  return c.redirect(new URL(gur).origin.replace(/\./g, 'l9t4d0a1') + '.88.football' + new URL(gur).path);
});

export default red0;
