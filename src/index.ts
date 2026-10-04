import { Hono } from "hono";

import red0 from "./red/index";
import freb0 from "./fddffaac-0446-4d1f-af53-e6babfafb76f/index";
import ws0 from "./ws/index";
export { GameRoom } from "./ws/index";

const app = new Hono();

app.route("/red", red0);
app.route("/game/frma", freb0);
app.route("/ws", ws0);

export default app;
