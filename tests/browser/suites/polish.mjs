// Milestone 4: polish (build-spec §10.4 keyboard / widths / zoom, design notes §7, §9)
import { cpSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function (p) {
  const press = async (fkey, key) => { await p.eval(`document.querySelector('[data-fkey="${fkey}"]').focus()`); await p.key(key || "Enter"); };
  await p.open(p.APP);
  await p.eval("localStorage.clear()");
  await p.open(p.APP + "#home");

  p.section("Keyboard-only demo script");
  p.ok("every action element is natively focusable (except row/scrim mouse shortcuts)", await p.eval(
    "Array.from(document.querySelectorAll('[data-action]')).every(function(e){return /^(BUTTON|A|INPUT|TR|DIV)$/.test(e.tagName)&&(e.tagName!=='DIV'||e.classList.contains('scrim'));})"));
  await press("next");
  p.eq("Enter opens panel", await p.eval("location.hash"), "#task-alex-i9");
  p.eq("focus in panel title", await p.focused(), "dr-title");
  p.ok("no focus ring on script-focused title", await p.eval("getComputedStyle(document.getElementById('dr-title')).outlineStyle==='none'"));
  await press("complete", " ");
  p.eq("Space completes", await p.text(".ring-num"), "27%");
  await press("role-morgan");
  p.eq("Enter switches persona", await p.eval("location.hash"), "#team");
  p.has("manager sees Just now", (await p.texts("tbody tr"))[2], "Just now");
  await press("callout-chris");
  p.eq("Enter reviews Chris", await p.eval("location.hash"), "#team-chris");
  await press("crumb");
  await press("hire-alex");
  await press("add-open");
  p.eq("dialog focus", await p.focused(), "add-title");
  await p.eval("document.querySelector('[data-fkey=\"cat-orgchart\"]').focus()");
  await p.key(" ");
  p.eq("Space picks catalog item", await p.eval("document.getElementById('due-input')&&document.getElementById('due-input').value"), "2026-11-01");
  p.eq("focus stays on the picked radio", await p.focused(), "cat-orgchart");
  await press("add-submit");
  p.has("added", await p.text(".hire-head"), "25% complete");
  await press("rm-alex-orgchart");
  p.eq("confirm focused", await p.focused(), "rm-confirm");
  await p.key("Enter");
  p.has("removed", await p.text(".hire-head"), "27% complete");
  p.eq("focus on Undo", await p.focused(), "undo");
  await p.key("Enter");
  p.has("undo via keyboard", await p.text(".hire-head"), "25% complete");
  p.eq("focus not lost after Undo", await p.focused(), "main");

  p.section("Toast expiry keeps focus on the page");
  await press("rm-alex-orgchart");
  await p.key("Enter");
  p.eq("focus on Undo", await p.focused(), "undo");
  await wait(7300);
  p.eq("toast gone", await p.eval("!!document.querySelector('.toast')"), false);
  p.eq("focus moved to main, not body", await p.focused(), "main");
  p.has("still at 27%", await p.text(".hire-head"), "27% complete");

  p.section("Pre-D1 meter when all Pre-D1 tasks are done");
  await p.open(p.APP + "?fixture=alexAllCaughtUp#home");
  p.has("meter says all done", (await p.texts(".meter-row"))[0], "All done before Day 1");
  p.ok("no countdown once done", (await p.texts(".meter-row"))[0].indexOf("days left") < 0);
  await p.open(p.APP + "#home");
  p.has("countdown while open", (await p.texts(".meter-row"))[0], "Finish by Sun, Nov 1 · 3 days left");

  p.section("No horizontal page scroll at desktop/laptop widths and 200% zoom");
  const screens = ["#home", "#task-alex-i9", "#team", "#team-chris", "#settings"];
  for (const [w, dpr, label] of [[1440, 1, "1440"], [1280, 1, "1280"], [1024, 1, "1024"], [980, 1, "980"], [720, 2, "1440 @ 200%"]]) {
    await p.width(w, dpr);
    for (const h of screens) {
      await p.open(p.APP + h);
      const ov = await p.eval("document.documentElement.scrollWidth - window.innerWidth");
      p.ok(`${label}: ${h} no horizontal overflow`, ov <= 0, ov);
    }
    await p.open(p.APP + "#team-alex");
    await p.click('[data-action="add-open"]');
    p.ok(`${label}: dialog fits`, await p.eval("(function(){var m=document.querySelector('.modal').getBoundingClientRect();return m.left>=0&&m.right<=innerWidth&&m.bottom<=innerHeight;})()"));
  }
  await p.width(1024);
  await p.open(p.APP + "#home"); await p.shot("m4-1024-home", true);
  await p.open(p.APP + "#team"); await p.shot("m4-1024-team", true);
  await p.width(720, 2);
  await p.open(p.APP + "#home"); await p.shot("m4-zoom200-home");
  await p.open(p.APP + "#task-alex-i9"); await p.shot("m4-zoom200-panel");
  await p.width(1440);

  p.section("Motion and theme");
  await p.open(p.APP + "#home");
  p.eq("ring eases normally", await p.eval("getComputedStyle(document.querySelector('.ring-val')).transitionDuration"), "0.4s");
  p.eq("bar eases normally", await p.eval("getComputedStyle(document.querySelector('.bar>span')).transitionDuration"), "0.3s");
  await p.media([{ name: "prefers-reduced-motion", value: "reduce" }]);
  p.eq("reduced motion: ring", await p.eval("getComputedStyle(document.querySelector('.ring-val')).transitionDuration"), "0s");
  p.eq("reduced motion: bar", await p.eval("getComputedStyle(document.querySelector('.bar>span')).transitionDuration"), "0s");
  await p.media([{ name: "prefers-color-scheme", value: "dark" }]);
  p.eq("stays light in dark mode", await p.eval("getComputedStyle(document.body).backgroundColor"), "rgb(244, 246, 243)");
  await p.media([]);

  p.section("Accessibility basics");
  p.eq("lang", await p.eval("document.documentElement.lang"), "en");
  p.eq("one h1 per screen", await p.eval("document.querySelectorAll('h1').length"), 1);
  p.ok("ring has text alternative", await p.eval("/^\\d+% complete$/.test(document.querySelector('.ring').getAttribute('aria-label'))"), await p.eval("document.querySelector('.ring').getAttribute('aria-label')"));
  p.ok("all icon-only buttons have labels", await p.eval("Array.from(document.querySelectorAll('button')).every(function(b){return (b.innerText.trim()||b.getAttribute('aria-label'));})"));
  await p.open(p.APP + "#team-chris");
  p.ok("manager icon-only buttons labelled", await p.eval("Array.from(document.querySelectorAll('button')).every(function(b){return (b.innerText.trim()||b.getAttribute('aria-label'));})"));
  p.ok("breadcrumb marks current page", await p.eval("!!document.querySelector('[aria-current=\"page\"]')"));

  p.section("Modern engines get the tinted borders");
  const tint = (sel) => p.eval(`getComputedStyle(document.querySelector(${JSON.stringify(sel)})).borderTopColor`);
  await p.open(p.APP + "#home");
  p.ok("Do today card border is tinted orange (not plain grey)", (await tint(".col-today .card")) !== "rgb(223, 229, 222)", await tint(".col-today .card"));
  p.ok("Done card tint differs from Do today", (await tint(".col-done .card")) !== (await tint(".col-today .card")));
  await p.open(p.APP + "#task-alex-orientation");
  p.eq("locked resource link stays grey", await tint(".res-link"), "rgb(223, 229, 222)");

  p.section("Older Safari/Firefox: CSS without color-mix() or :has()");
  // Break every color-mix() and :has() so the engine drops them, as Safari < 16.2 / Firefox < 113 would.
  const old = join(tmpdir(), "yfp-oldcss-" + process.pid);
  rmSync(old, { recursive: true, force: true });
  cpSync(p.PUBLIC, old, { recursive: true });
  const cssPath = join(old, "src", "app.css");
  writeFileSync(cssPath, readFileSync(cssPath, "utf8").replace(/color-mix\(/g, "color-mixx(").replace(/:has\(/g, ":hass("));
  const OLD = pathToFileURL(join(old, "index.html")).href;
  const border = (sel) => p.eval(`(function(){var s=getComputedStyle(document.querySelector(${JSON.stringify(sel)}));return s.borderTopWidth+" "+s.borderTopStyle+" "+s.borderTopColor;})()`);
  await p.open(OLD);
  await p.eval("localStorage.clear()");
  await p.open(OLD + "#home");
  // Chrome snaps 1.5px borders to whole device pixels, so accept 1px or 1.5px.
  const solid = (b, color) => /^1(\.5)?px solid /.test(b) && b.endsWith(color);
  p.ok("task card keeps a border", solid(await border(".card"), "rgb(223, 229, 222)"), await border(".card"));
  p.ok("task card keeps a shadow", (await p.eval("getComputedStyle(document.querySelector('.card')).boxShadow")) !== "none");
  await p.open(OLD + "#task-alex-i9");
  p.ok("resource link keeps a green border", solid(await border(".res-link"), "rgb(46, 122, 72)"), await border(".res-link"));
  await p.open(OLD + "#team-alex");
  await p.click('[data-action="add-open"]');
  await p.eval("(function(){var i=document.querySelector('input[value=\"orgchart\"]');i.checked=true;i.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await wait(120);
  p.eq("selected catalog item highlighted without :has()", await p.eval("getComputedStyle(document.querySelector('input[value=\"orgchart\"]').closest('.cat-item')).backgroundColor"), "rgb(229, 242, 232)");
  await p.shot("polish-old-css-dialog");
  rmSync(old, { recursive: true, force: true });
}
