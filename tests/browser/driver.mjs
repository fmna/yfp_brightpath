/* YFP · tests/browser/driver.mjs
 * Minimal browser driver over the Chrome DevTools Protocol. No dependencies:
 * Node 22+ (built-in fetch and WebSocket) and an installed Chrome or Edge.
 * Used by run.mjs; each suite gets a fresh browser profile. */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { writeFileSync, mkdirSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
export const PUBLIC = resolve(HERE, "..", "..", "public");
export const SHOTS = join(tmpdir(), "yfp-browser-shots");

const CANDIDATES = {
  chrome: [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"
  ],
  edge: [
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/microsoft-edge"
  ]
};

export function findBrowser(name) {
  if (process.env.YFP_BROWSER_PATH) return process.env.YFP_BROWSER_PATH;
  const found = (CANDIDATES[name] || []).find((p) => existsSync(p));
  if (!found) throw new Error(`Couldn't find ${name}. Set YFP_BROWSER_PATH to its executable.`);
  return found;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

// Serves public/ so tests can use http://127.0.0.1 (local) and http://yfp.test (pretend deployed host).
async function startServer() {
  const server = createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const f = resolve(PUBLIC, "." + (p === "/" ? "/index.html" : p));
    if (!(f + sep).startsWith(PUBLIC + sep) || !existsSync(f)) { res.writeHead(404); return res.end("404"); }
    res.writeHead(200, { "content-type": TYPES[f.slice(f.lastIndexOf("."))] || "application/octet-stream" });
    res.end(readFileSync(f));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return server;
}

export async function runSuite(browserName, suitePath) {
  mkdirSync(SHOTS, { recursive: true });
  const server = await startServer();
  const httpPort = server.address().port;
  const port = 9300 + Math.floor(Math.random() * 600);
  const profile = join(tmpdir(), `yfp-browser-profile-${process.pid}-${port}`);
  const proc = spawn(findBrowser(browserName), ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    `--remote-debugging-port=${port}`, "--host-resolver-rules=MAP yfp.test 127.0.0.1", "--no-proxy-server",
    `--user-data-dir=${profile}`, "--window-size=1440,1000", "about:blank"], { stdio: "ignore" });

  let targets = [];
  for (let i = 0; i < 75 && !targets.length; i++) {
    try { targets = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).filter((t) => t.type === "page"); } catch {}
    if (!targets.length) await sleep(200);
  }
  if (!targets.length) { proc.kill(); server.close(); throw new Error("Browser didn't start"); }

  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let seq = 0; const pending = new Map(); const logs = [];
  ws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === "Runtime.consoleAPICalled") logs.push(m.params.type + ": " + m.params.args.map((a) => a.value ?? a.description).join(" "));
    if (m.method === "Runtime.exceptionThrown") logs.push("EXCEPTION: " + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  });
  const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  await send("Runtime.enable"); await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

  let fails = 0, oks = 0;
  const shot = async (name, clip) => {
    const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: !!clip, ...(clip ? { clip } : {}) });
    writeFileSync(join(SHOTS, name + ".png"), Buffer.from(r.result.data, "base64"));
  };
  const page = {
    APP: pathToFileURL(join(PUBLIC, "index.html")).href,
    LOCAL: `http://127.0.0.1:${httpPort}/`, REMOTE: `http://yfp.test:${httpPort}/`, PUBLIC, logs,
    async eval(expr) {
      const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.result.exceptionDetails) throw new Error("eval failed: " + expr + "\n" + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text));
      return r.result.result.value;
    },
    async open(url) {
      await send("Page.navigate", { url }); await sleep(150);
      for (let i = 0; i < 40; i++) { if (await page.eval("document.readyState==='complete' && !!document.querySelector('#app main')")) break; await sleep(100); }
      await sleep(100);
    },
    async hash(h) { await page.eval(`location.hash=${JSON.stringify(h)}`); await sleep(120); },
    async click(sel) {
      const ok = await page.eval(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return false;e.click();return true;})()`);
      if (!ok) page.fail("click: no element " + sel);
      await sleep(120);
    },
    async key(key, shift) {
      const code = { Escape: 27, Tab: 9, Enter: 13, " ": 32 }[key], text = { Enter: "\r", " ": " " }[key], modifiers = shift ? 8 : 0;
      const base = { key, code: key === " " ? "Space" : key, windowsVirtualKeyCode: code, modifiers };
      await send("Input.dispatchKeyEvent", { type: "keyDown", ...base, ...(text ? { text } : {}) });
      await send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
      await sleep(120);
    },
    async text(sel) { return page.eval(`(function(){var e=document.querySelector(${JSON.stringify(sel)});return e?e.innerText.replace(/\\s+/g," ").trim():null;})()`); },
    async texts(sel) { return page.eval(`Array.from(document.querySelectorAll(${JSON.stringify(sel)})).map(function(e){return e.innerText.replace(/\\s+/g," ").trim();})`); },
    async focused() { return page.eval("(document.activeElement&&(document.activeElement.getAttribute('data-fkey')||document.activeElement.id))||null"); },
    async width(w, dpr) { await send("Emulation.setDeviceMetricsOverride", { width: w, height: 1000, deviceScaleFactor: dpr || 1, mobile: false }); await sleep(150); },
    async media(features) { await send("Emulation.setEmulatedMedia", { features }); await sleep(100); },
    async initScript(src) { return (await send("Page.addScriptToEvaluateOnNewDocument", { source: src })).result.identifier; },
    async removeInitScript(id) { await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: id }); },
    async shot(name, full) {
      if (!full) return shot(name);
      const h = await page.eval("document.documentElement.scrollHeight"), w = await page.eval("window.innerWidth");
      return shot(name, { x: 0, y: 0, width: w, height: Math.min(h, 3000), scale: 1 });
    },
    ok(label, cond, detail) {
      if (cond) { oks++; if (process.env.YFP_VERBOSE) console.log("  ok   " + label); }
      else { fails++; console.log("  FAIL " + label + (detail !== undefined ? "  →  " + JSON.stringify(detail) : "")); }
    },
    eq(label, actual, expected) { page.ok(label, JSON.stringify(actual) === JSON.stringify(expected), { got: actual, expected }); },
    has(label, hay, needle) { page.ok(label, typeof hay === "string" && hay.indexOf(needle) > -1, { got: hay, needle }); },
    fail(msg) { fails++; console.log("  FAIL " + msg); },
    section(title) { if (process.env.YFP_VERBOSE) console.log(title); }
  };

  try {
    const suite = await import(pathToFileURL(suitePath).href);
    await suite.default(page);
  } catch (e) { fails++; console.log("  ERROR " + e.stack); }
  const problems = logs.filter((l) => /^(error|EXCEPTION|warning)/.test(l));
  problems.forEach((l) => { fails++; console.log("  CONSOLE " + l); });

  ws.close(); proc.kill(); server.close();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
  return { oks, fails };
}
