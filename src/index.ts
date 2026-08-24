import { Hono } from "hono";

import red0 from "./red/index";

const app = new Hono();

app.route("/red", red0);

export default app;


