import { Hono } from "hono";

import new0 from "./new/index";
import pwa0 from "./pwa/index";

const app = new Hono();

app.route("/new", new0);
app.route("/pwa", pwa0);

export default app;


