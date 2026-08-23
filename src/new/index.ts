import { Hono } from "hono";
import new0 from "./new/index";

const ps0 = new Hono();

new0.route("/ps", ps0);

export default new0;
