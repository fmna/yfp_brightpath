/* YFP · tests/browser/run.mjs
 * Runs the browser suites against public/ in headless Chrome or Edge.
 *
 *   node tests/browser/run.mjs                    all suites, Chrome
 *   node tests/browser/run.mjs --browser=edge     all suites, Edge
 *   node tests/browser/run.mjs employee manager   selected suites
 *   YFP_VERBOSE=1 node tests/browser/run.mjs      print every check
 *
 * Needs Node 22+ and Chrome or Edge (or YFP_BROWSER_PATH). No npm install.
 * Screenshots go to <tmp>/yfp-browser-shots. Exit code 0 means all passed. */
import { readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { runSuite, SHOTS } from "./driver.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const browser = (args.find((a) => a.startsWith("--browser=")) || "--browser=chrome").split("=")[1];
const wanted = args.filter((a) => !a.startsWith("--"));
const ORDER = ["employee", "manager", "edge-cases", "polish"];
const suites = readdirSync(join(HERE, "suites")).map((f) => basename(f, ".mjs"))
  .filter((n) => !wanted.length || wanted.includes(n))
  .sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));

let total = 0, failed = 0;
console.log(`YFP browser tests · ${browser}`);
for (const name of suites) {
  const t0 = Date.now();
  const { oks, fails } = await runSuite(browser, join(HERE, "suites", name + ".mjs"));
  total += oks + fails; failed += fails;
  console.log(`${fails ? "FAIL" : "pass"}  ${name.padEnd(11)} ${String(oks).padStart(3)}/${oks + fails} checks  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
console.log(failed ? `\n${failed} of ${total} checks failed` : `\nAll ${total} checks passed (screenshots: ${SHOTS})`);
process.exit(failed ? 1 : 0);
