// Milestone 1: core employee experience (build-spec §10.2 steps 1–2, user-flow §5.1–5.2)
export default async function (p) {
  await p.open(p.APP);
  await p.eval("localStorage.clear()");
  await p.open(p.APP + "#home");

  p.section("Dashboard (start state)");
  p.eq("title", await p.eval("document.title"), "Alex · YFP Onboarding Prototype");
  p.has("greeting", await p.text(".page-head"), "Your Day 1 is Monday, November 2. Finish your Pre-D1 tasks before then.");
  p.ok("no 'first day' anywhere in the UI", !/first day|day one/i.test(await p.eval("document.body.innerText")));
  p.eq("ring", await p.text(".ring-num"), "18%");
  p.has("done count", await p.text(".summary"), "2 of 11 tasks done");
  p.has("on track line", await p.text(".summary"), "You’re on track");
  const meters = await p.texts(".meter-row");
  p.has("Pre-D1 meter", meters[0], "2/6");
  p.has("Pre-D1 deadline", meters[0], "Finish by Sun, Nov 1 · 3 days left");
  p.has("Post-D1 meter", meters[1], "0/5");
  p.has("Post-D1 locked", meters[1], "Locked until Mon, Nov 2");
  p.has("next up", await p.text(".next-card"), "Complete I-9 and tax forms");
  p.has("next up due", await p.text(".next-card"), "Due today");
  p.eq("column order", await p.texts(".col h2"), ["Do today", "Do later", "Done"]);
  p.eq("counts", await p.texts(".col .count"), ["2", "2", "2"]);
  p.eq("Do today", await p.texts(".col-today .card-title"), ["Complete I-9 and tax forms", "Set up direct deposit"]);
  p.eq("Do later", await p.texts(".col-later .card-title"), ["Read the Employee Handbook", "Upload a badge photo"]);
  p.eq("Done", await p.texts(".col-done .card-title"), ["Sign your offer letter", "Watch the Welcome to BrightPath video"]);
  p.eq("locked rows", (await p.texts(".locked-row")).length, 5);
  p.has("locked heading", await p.text(".locked-head"), "Unlocks on Day 1 · Mon, Nov 2");
  p.eq("tags order on I-9", await p.texts(".col-today .card:first-child .chip"), ["Pre-D1", "Action required"]);
  p.eq("deposit due", await p.text(".col-today .card:nth-child(2) .card-foot"), "Due tomorrow");
  p.eq("rules under columns", await p.texts(".col-help"), ["Overdue, due today or due tomorrow", "Coming up. No action needed yet.", "Nice work. These count toward your progress."]);
  await p.shot("m1-01-dashboard", true);

  p.section("Task Detail");
  await p.click('[data-fkey="next"]');
  p.eq("hash", await p.eval("location.hash"), "#task-alex-i9");
  p.eq("focus on title", await p.focused(), "dr-title");
  const panel = await p.text(".drawer");
  p.has("title", panel, "Complete I-9 and tax forms");
  p.has("due line", panel, "Friday, October 30 (due today)");
  p.has("assigned by", panel, "BrightPath HR (required)");
  p.has("type", panel, "Action required · Before Day 1");
  p.has("link label", panel, "Open the HR forms portal");
  p.has("link source", panel, "HR portal · hr.brightpath.com/forms/i9-w4");
  p.eq("steps", (await p.texts(".steps li")).length, 3);
  p.eq("primary action", await p.text(".drawer-foot .btn"), "Mark as complete");
  p.ok("link is a button (no navigation)", await p.eval("document.querySelector('.res-link').tagName==='BUTTON'"));
  await p.shot("m1-02-panel");
  await p.click(".res-link");
  p.eq("prototype link toast", await p.text(".toast span"), "Prototype link. In the live product this opens hr.brightpath.com/forms/i9-w4.");
  p.eq("still on panel", await p.eval("location.hash"), "#task-alex-i9");

  p.section("Focus trap + Esc");
  await p.eval("document.querySelector('[data-fkey=\"complete\"]').focus()");
  await p.key("Tab");
  p.ok("Tab stays in panel", await p.eval("document.querySelector('.drawer').contains(document.activeElement)"), await p.focused());
  await p.key("Escape");
  p.eq("Esc closes", await p.eval("location.hash"), "#home");
  p.eq("focus back to opener", await p.focused(), "next");

  p.section("Mark as complete");
  await p.click('[data-fkey="card-alex-i9"]');
  await p.click('[data-action="complete"]');
  p.eq("panel closed", await p.eval("!!document.querySelector('.drawer')"), false);
  p.eq("hash home", await p.eval("location.hash"), "#home");
  p.eq("ring 27%", await p.text(".ring-num"), "27%");
  p.has("3 of 11", await p.text(".summary"), "3 of 11 tasks done");
  p.has("Pre-D1 3/6", (await p.texts(".meter-row"))[0], "3/6");
  p.eq("toast", await p.text(".toast span"), "Task completed. Your progress went from 18% to 27%.");
  p.ok("toast has Undo", await p.eval("!!document.querySelector('[data-action=\"toast-undo\"]')"));
  p.ok("toast region is a live region", await p.eval("document.getElementById('toast-root').getAttribute('role')==='status'"));
  p.has("I-9 in Done", (await p.texts(".col-done .card-title")).join("|"), "Complete I-9 and tax forms");
  p.has("Just completed tag", await p.text('.col-done [data-fkey="card-alex-i9"]'), "Just completed");
  p.has("next up advances", await p.text(".next-card"), "Set up direct deposit");
  p.eq("focus returns to the card (now in Done)", await p.focused(), "card-alex-i9");
  await p.shot("m1-03-after-complete");

  p.section("Undo, then redo");
  await p.click('[data-action="toast-undo"]');
  p.eq("undo → 18%", await p.text(".ring-num"), "18%");
  p.eq("toast gone", await p.eval("!!document.querySelector('.toast')"), false);
  p.has("I-9 back in Do today", (await p.texts(".col-today .card-title")).join("|"), "Complete I-9 and tax forms");
  await p.click('[data-fkey="card-alex-i9"]');
  await p.click('[data-action="complete"]');
  p.eq("redo → 27%", await p.text(".ring-num"), "27%");

  p.section("Mark as not done");
  await p.click('[data-fkey="card-alex-welcome"]');
  p.has("done notice", await p.text(".drawer"), "Completed on Tuesday, October 27. Your manager can see this.");
  p.eq("reopen button", await p.text(".drawer-foot .btn"), "Mark as not done");
  await p.click('[data-action="reopen"]');
  p.eq("toast", await p.text(".toast span"), "Marked as not done.");
  p.eq("Mark as reviewed for Review task", await p.text(".drawer-foot .btn"), "Mark as reviewed");
  p.eq("focus moved to new primary action", await p.focused(), "complete");
  await p.click('[data-action="complete"]');
  p.eq("back to 27%", await p.text(".ring-num"), "27%");

  p.section("Locked Post-D1 task");
  await p.hash("#task-alex-orientation");
  const lk = await p.text(".drawer");
  p.has("locked notice", lk, "This is a Post-D1 task. It unlocks on Day 1, Monday, November 2.");
  p.has("link placeholder", lk, "Link available on Mon, Nov 2");
  p.ok("real link label hidden", lk.indexOf("orientation agenda") < 0, lk);
  p.ok("no clickable link", await p.eval("!document.querySelector('[data-action=\"demo-link\"]')"));
  p.eq("disabled button", await p.eval("(function(){var b=document.querySelector('.drawer-foot .btn');return [b.disabled,b.innerText.trim()];})()"), [true, "Available on Mon, Nov 2"]);
  await p.shot("m1-04-locked");
  await p.key("Escape");

  p.section("Persistence");
  await p.open(p.APP + "#home");
  p.eq("reload keeps 27%", await p.text(".ring-num"), "27%");
  p.has("reload keeps Just completed (latest = welcome)", await p.text('[data-fkey="card-alex-welcome"]'), "Just completed");
  p.ok("only one Just completed tag", (await p.texts(".just")).length === 1, await p.texts(".just"));
}
