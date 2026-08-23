import { Hono } from "hono";
import ps0 from "./new/index";

const new0 = new Hono();

new0.route("/ps", ps0);

export default new0;
