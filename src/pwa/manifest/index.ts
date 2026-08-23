import { Hono } from "hono";

const manifest0 = new Hono();

manifest0.get("/", (c) => {
  const disp = c.req.query("disp") ?? "standalone";
  const name = c.req.query("name") ?? "Abekenman";
  const shname = c.req.query("shname") ?? name;
  const scope = c.req.query("scope") ?? c.req.query("start") ?? "";
  const start = c.req.query("start") ?? scope;
  const orientation = c.req.query("orie");
  const thecol = c.req.query("thecol") ?? c.req.query("baccol");
  const baccol = c.req.query("baccol") ?? thecol;

  const manifest: Record<string, unknown> = {
    display: disp,

    icons: [
      {
        src: "/media/maskable.png",
        sizes: "3000x3000",
        type: "image/png",
        purpose: "any maskable monochrome",
      },
      {
        src: "/media/maskable.svg",
        type: "image/svg+xml",
        purpose: "any maskable monochrome",
      },
      {
        src: "/media/maskable.svg",
        type: "image/svg+xml",
        purpose: "maskable monochrome",
      },
      {
        src: "/media/maskable.png",
        type: "image/png",
        purpose: "maskable monochrome",
      },
    ],

    name,
    scope,
    short_name: shname,
    start_url: start,
  };

  if (orientation) {
    manifest.orientation = orientation;
  }
  if (thecol) {
    manifest.theme_color = thecol;
    manifest.background_color = baccol;
  }

  return c.json(manifest);
});

export default manifest0;
