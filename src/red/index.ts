import { Hono } from 'hono';

const red0 = new Hono();

red0.all('*', async (c) => {
  return c.redirect((new URL(c.req.url)).origin.replace('.88.football','').replace(/\./g, 'l9t4d0a1') + c.req.path);
});

export default red0;
