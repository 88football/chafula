
import { Hono } from 'hono';

const freb0 = new Hono();

freb0.all('*', async (c) => {
  if (c.req.json() || c.req.json().e6c417a27ec54833ba1582a92f4ec33a) return c.html(c.req.json().e6c417a27ec54833ba1582a92f4ec33a);
});

export default freb0;
