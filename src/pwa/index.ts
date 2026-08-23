import { Hono } from "hono";
import manifest0 from "./manifest/index";
import sw0 from "./sw/index";

const pwa0 = new Hono();

pwa0.route("/manifest", manifest0);
pwa0.route("/sw", sw0);

export default pwa0;
