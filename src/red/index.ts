import { Hono } from 'hono';

const red0 = new Hono();

red0.all('*', async (c) => {
  return c.redirect(new URL(c.req.param('url')).origin.replace(/\./g, 'l9t4d0a1') + '.88.football' + new URL(c.req.param('url')).path);
});

export default red0;
