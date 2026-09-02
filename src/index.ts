import { Hono } from "hono";

import red0 from "./red/index";
import freb0 from "./fddffaac-0446-4d1f-af53-e6babfafb76f/index";

const app = new Hono();

app.route("/red", red0);
app.route("/fddffaac-0446-4d1f-af53-e6babfafb76f", freb0);

export default app;


