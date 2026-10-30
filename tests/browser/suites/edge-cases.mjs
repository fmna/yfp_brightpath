// Milestone 3: edge cases and required states (user-flow §5.5, build-spec §9.6, §10.3)
import { cpSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function (p) {
  const F = (name, hash) => p.APP + "?fixture=" + name + (hash || "#home");
  await p.open(p.APP);
  await p.eval("localStorage.clear()");

  p.section("All caught up + Do today empty + Do later locked variant (alexAllCaughtUp)");
  await p.open(F("alexAllCaughtUp"));
  p.has("next up: all caught up", await p.text(".next-card"), "You’re all caught up");
  p.has("unlock count", await p.text(".next-card"), "5 more tasks unlock on Mon, Nov 2.");
  p.eq("Do today empty state", await p.text(".col-today .empty"), "Nothing due right now Tasks due today or tomorrow will show up here.");
  p.eq("Do later locked variant", await p.text(".col-later .empty"), "No other open tasks");
  p.eq("locked rows still listed", (await p.texts(".locked-row")).length, 5);
  p.eq("progress 55%", await p.text(".ring-num"), "55%");
  await p.shot("m3-01-all-caught-up", true);
  await p.hash("#team");
  p.has("manager: Nothing open", (await p.texts("tbody tr"))[2], "Nothing open");

  p.section("Done column empty (alexFreshStart)");
  await p.open(F("alexFreshStart"));
  p.eq("Done empty state", await p.text(".col-done .empty"), "No completed tasks yet Finish a task and it moves here.");
  p.eq("progress 0%", await p.text(".ring-num"), "0%");
  await p.hash("#team");
  const alexRow = (await p.texts("tbody tr")).find((r) => r.indexOf("Alex Anderson") > -1);
  p.has("manager: no activity", alexRow, "No tasks completed yet");
  p.has("fresh start → offer/welcome overdue → needs support", alexRow, "Needs support");

  p.section("Overdue (alexOverdue)");
  await p.open(F("alexOverdue"));
  p.eq("card overdue line", await p.text('[data-fkey="card-alex-i9"] .card-foot'), "Overdue by 2 days");
  p.ok("card overdue is red", await p.eval("document.querySelector('[data-fkey=\"card-alex-i9\"] .card-foot').classList.contains('overdue')"));
  p.has("summary overdue", await p.text(".summary"), "1 overdue");
  p.eq("overdue sorts first in Do today", (await p.texts(".col-today .card-title"))[0], "Complete I-9 and tax forms");
  await p.hash("#task-alex-i9");
  p.has("panel notice", await p.text(".drawer"), "This task is overdue. Finish it as soon as you can, or reach out to your manager if you’re stuck.");
  p.has("panel due note", await p.text(".drawer .meta"), "Wednesday, October 28 (overdue by 2 days)");
  await p.shot("m3-02-overdue-panel");
  await p.hash("#team");
  p.has("tile: 2 need support", (await p.texts(".tile"))[0], "2");
  p.eq("two callouts", (await p.texts(".callout")).length, 2);
  p.eq("needs-support rows first, then by start date", await p.texts("tbody .who-btn"), ["Chris Carter", "Alex Anderson", "Brooke Bennett"]);
  p.has("Alex row Needs support", (await p.texts("tbody tr"))[1], "Needs support");
  await p.shot("m3-03-overdue-team", true);

  p.section("Task removed while open (alexTaskRemoved)");
  await p.open(F("alexTaskRemoved", "#task-alex-photo"));
  const rm = await p.text(".drawer");
  p.has("title", rm, "This task isn’t in your plan");
  p.has("body", rm, "It may have been removed by your manager. Go back to your dashboard to see your current tasks.");
  p.eq("focus on title", await p.focused(), "dr-title");
  await p.click('[data-fkey="dback"]');
  p.eq("back to dashboard", await p.eval("location.hash"), "#home");

  p.section("Catalog exhausted (alexCatalogExhausted)");
  await p.open(F("alexCatalogExhausted", "#team-alex"));
  await p.click('[data-action="add-open"]');
  p.eq("empty state", await p.text(".modal .empty"), "Every catalog task is already in Alex’s plan Remove a task first if you want to re-add it with a new due date.");
  p.ok("submit disabled", await p.eval("document.querySelector('[data-action=\"add-submit\"]').disabled"));
  await p.shot("m3-04-catalog-exhausted");

  p.section("Nothing addable, some blocked by Pre-D1 rule (chrisCatalogExhausted)");
  await p.open(F("chrisCatalogExhausted", "#team-chris"));
  await p.click('[data-action="add-open"]');
  p.eq("empty state", await p.text(".modal .empty"), "No catalog tasks can be added for Chris right now The rest are already in Chris’s plan, or are Pre-D1 tasks that can’t be added after the start date.");

  p.section("Fixture mode never saves");
  await p.open(F("alexFreshStart"));
  await p.click('[data-fkey="next"]');
  await p.click('[data-action="complete"]');
  p.eq("fixture: 1 of 11", await p.text(".ring-num"), "9%");
  p.eq("storage untouched", await p.eval("localStorage.getItem('yfp-demo-v2')"), null);
  await p.open(p.APP + "#home");
  p.eq("normal state after leaving fixture", await p.text(".ring-num"), "18%");
  p.eq("no sample-state notice without a fixture", await p.eval("!!document.querySelector('.fixture-note')"), false);

  p.section("Fixture hook: works on any host, shows the notice, never overwrites saved state");
  await p.open(p.LOCAL + "?fixture=alexAllCaughtUp#home");
  p.eq("honored on 127.0.0.1", await p.text(".ring-num"), "55%");
  // REMOTE is its own origin, so it gets its own saved demo: complete one task there first.
  await p.open(p.REMOTE + "#home");
  await p.eval("localStorage.clear()");
  await p.open(p.REMOTE + "#home");
  await p.click('[data-fkey="next"]');
  await p.click('[data-action="complete"]');
  p.eq("saved demo on a non-local host", await p.text(".ring-num"), "27%");
  const saved = await p.eval("localStorage.getItem('yfp-demo-v2')");
  await p.open(p.REMOTE + "?fixture=alexAllCaughtUp#home");
  p.eq("honored on a non-local host", await p.text(".ring-num"), "55%");
  p.eq("notice text", await p.text(".fixture-note"), "Showing a sample state: Alex has finished every task due before Day 1. Changes aren’t saved. Back to the demo");
  p.eq("back link drops the query and hash", await p.eval("document.querySelector('.fixture-note a').getAttribute('href')"), "/");
  await p.shot("m3-00-fixture-notice");
  await p.hash("#team");
  p.ok("notice on manager views too", await p.eval("!!document.querySelector('.fixture-note')"));
  await p.open(p.REMOTE + "?fixture=alexFreshStart#home");
  await p.click('[data-fkey="next"]');
  await p.click('[data-action="complete"]');
  p.eq("fixture change works in memory", await p.text(".ring-num"), "9%");
  p.eq("saved demo untouched", await p.eval("localStorage.getItem('yfp-demo-v2')"), saved);
  await p.click('[data-fkey="fixture-back"]');
  for (let i = 0; i < 40; i++) {
    await wait(100);
    try { if (await p.eval("!location.search && document.readyState==='complete' && !!document.querySelector('#app main')")) break; } catch {}
  }
  p.eq("back link lands on the plain URL", await p.eval("location.search + location.hash"), "");
  p.eq("back to the saved demo", await p.text(".ring-num"), "27%");
  p.eq("notice gone", await p.eval("!!document.querySelector('.fixture-note')"), false);
  await p.open(p.REMOTE + "?fixture=nope#home");
  p.eq("unknown fixture ignored", await p.text(".ring-num"), "27%");
  p.eq("no notice for unknown fixture", await p.eval("!!document.querySelector('.fixture-note')"), false);
  await p.open(p.REMOTE + "?fixture=corruptStorage#home");
  p.eq("non-buildable fixture ignored", await p.eval("!!document.querySelector('.fixture-note')"), false);

  p.section("Unknown routes");
  for (const h of ["#settings", "#team-dana", "#task-alex-nope", "#task-brooke-i9", "#team-", "#task-"]) {
    await p.open(p.APP + h);
    p.has("not-found for " + h, await p.text("main"), "We couldn’t find that page");
  }
  p.has("body copy", await p.text("main"), "The link may be out of date. Pick where you want to go.");
  p.eq("no persona selected", await p.eval("Array.from(document.querySelectorAll('[data-action=\"role\"]')).map(function(b){return b.getAttribute('aria-pressed');})"), ["false", "false"]);
  await p.shot("m3-05-not-found");
  await p.click('[data-action="go"]');
  p.eq("button → Alex's dashboard", await p.eval("location.hash"), "#home");
  await p.open(p.APP + "#task-alex-orgchart");
  p.has("real task not in plan → isn't-in-plan panel", await p.text(".drawer"), "This task isn’t in your plan");

  p.section("Storage edge cases");
  await p.open(p.APP + "#home");
  await p.eval("localStorage.setItem('yfp-demo-v2', window.YFP_MOCK_DATA.fixtures.corruptStorage.raw)");
  await p.open(p.APP + "#home");
  p.eq("corrupt JSON → seed", await p.text(".ring-num"), "18%");
  await p.eval("localStorage.setItem('yfp-demo-v2', JSON.stringify({alex:{id:'alex',start:'2026-11-02',tasks:[{def:'i9',due:'2026-10-30',done:'yes'}]}}))");
  await p.open(p.APP + "#home");
  p.eq("wrong shape → seed", await p.text(".ring-num"), "18%");
  const block = await p.initScript("Object.defineProperty(window,'localStorage',{get:function(){throw new DOMException('blocked','SecurityError');}});");
  await p.open(p.APP + "#home");
  p.eq("storage blocked → runs from memory", await p.text(".ring-num"), "18%");
  await p.click('[data-fkey="next"]');
  await p.click('[data-action="complete"]');
  p.eq("changes work in memory", await p.text(".ring-num"), "27%");
  await p.click('[data-action="role"][data-role="morgan"]');
  p.has("manager sees it in memory", (await p.texts(".tile"))[1], "50%");
  await p.removeInitScript(block);

  p.section("Due date can't be in the past");
  await p.open(p.APP);
  await p.eval("localStorage.clear()");
  await p.open(p.APP + "#team-alex");
  await p.click('[data-action="add-open"]');
  await p.eval("(function(){var i=document.querySelector('input[value=\"one1\"]');i.checked=true;i.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await wait(100);
  p.eq("one1 default (start + 1)", await p.eval("document.getElementById('due-input').value"), "2026-11-03");
  await p.eval("document.getElementById('due-input').value='2026-10-01'");
  await p.click('[data-action="add-submit"]');
  const oneRow = (await p.texts("tbody tr")).find((r) => r.indexOf("Schedule a 1:1") === 0) || "";
  p.has("past date clamped to demo date", oneRow, "Fri, Oct 30");

  p.section("Undo window");
  p.ok("toast present", await p.eval("!!document.querySelector('.toast')"));
  await wait(7300);
  p.eq("toast gone after 7s", await p.eval("!!document.querySelector('.toast')"), false);

  p.section("Esc with nothing open is harmless");
  await p.key("Escape");
  p.eq("still on page", await p.eval("location.hash"), "#team-alex");

  p.section("Demo data didn't load");
  // Copy of public/ without the data file, in the OS temp folder.
  const nodata = join(tmpdir(), "yfp-nodata-" + process.pid);
  rmSync(nodata, { recursive: true, force: true });
  cpSync(p.PUBLIC, nodata, { recursive: true });
  rmSync(join(nodata, "04-mock-data.js"));
  const before = p.logs.length;
  await p.open(pathToFileURL(join(nodata, "index.html")).href);
  p.has("message", await p.text("main"), "Demo data didn’t load");
  p.has("instructions", await p.text("main"), "Keep it in the same folder as index.html");
  p.eq("no script errors besides the missing file", p.logs.slice(before).filter((l) => /EXCEPTION/.test(l)), []);
  await p.shot("m3-06-no-data");
  rmSync(nodata, { recursive: true, force: true });
}
