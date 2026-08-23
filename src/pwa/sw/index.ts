import { Hono } from "hono";

const sw0 = new Hono();

sw0.get("/", (c) => {
  const filesParam = c.req.query("files") ?? "[]";

  let files: string[] = [];

  try {
    files = JSON.parse(filesParam);
  } catch {
    files = [];
  }

  const js = `
const cd = {
  version: '1.0',
  files: ${JSON.stringify(files)}
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cd.version).then((cache) => {
      return cache.addAll(cd.files);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response ? response : fetch(event.request);
    })
  );
});
`;

  return new Response(js, {
    headers: {
      "Content-Type": "application/javascript",
    },
  });
});

export default sw0;
