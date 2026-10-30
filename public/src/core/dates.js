/* YFP · core/dates.js
 * Display formatting only. Date math and every rule decision come from
 * MOCK.helpers; this file only turns their results into words. */
(function (YFP) {
  "use strict";
  if (!YFP.MOCK) return;
  var H = YFP.MOCK.helpers, TODAY = YFP.MOCK.demo.today, plural = YFP.html.plural;

  // "Mon, Nov 2"
  function fmt(s) { return H.parseDate(s).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }
  // "Monday, November 2"
  function fmtLong(s) { return H.parseDate(s).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); }
  // "Nov 2"
  function fmtShort(s) { return H.parseDate(s).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
  // "Fri, Oct 30, 2026"
  function fmtYear(s) { return fmt(s) + ", " + s.slice(0, 4); }

  // Due line for a task: CSS class, icon and words, built from H.status().
  function dueText(emp, tk) {
    var st = H.status(emp, tk);
    if (st === "done") return { cls: "", icon: "check", text: "Completed " + (tk.doneOn === TODAY ? "today" : fmt(tk.doneOn)) };
    if (st === "locked") return { cls: "", icon: "lock", text: "Unlocks " + fmt(emp.start) };
    if (st === "overdue") return { cls: "overdue", icon: "alert", text: "Overdue by " + plural(H.diffDays(tk.due, TODAY), "day") };
    var ahead = H.diffDays(TODAY, tk.due);
    if (ahead === 0) return { cls: "soon", icon: "cal", text: "Due today" };
    if (ahead === 1) return { cls: "soon", icon: "cal", text: "Due tomorrow" };
    return { cls: "", icon: "cal", text: "Due " + fmt(tk.due) };
  }

  // "Today" / "Yesterday" / "3 days ago"
  function ago(days) { return days === 0 ? "Today" : days === 1 ? "Yesterday" : days + " days ago"; }

  YFP.dates = { fmt: fmt, fmtLong: fmtLong, fmtShort: fmtShort, fmtYear: fmtYear, dueText: dueText, ago: ago };
})(window.YFP = window.YFP || {});
