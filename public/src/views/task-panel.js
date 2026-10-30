/* YFP · views/task-panel.js
 * Task Detail side panel (#task-alex-{defId}), opened over the dashboard.
 * States: open / overdue / locked / done / removed. 02-user-flow §5.2 */
(function (YFP) {
  "use strict";
  if (!YFP.MOCK) return;
  var MOCK = YFP.MOCK, H = MOCK.helpers, DEFS = MOCK.taskDefs, ERR = MOCK.errorScenarios, TODAY = MOCK.demo.today;
  var esc = YFP.html.esc, fill = YFP.html.fill, icon = YFP.icons.icon, dates = YFP.dates, tags = YFP.components.tags;

  function shell(headLabel, body, foot) {
    return '<div class="scrim" data-action="close-drawer"></div>' +
      '<aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="dr-title">' +
        '<div class="drawer-head"><span class="drawer-label">' + headLabel + '</span>' +
          '<button type="button" class="icon-btn" data-action="close-drawer" aria-label="Close task details" data-fkey="dclose">' + icon("x", 18) + '</button></div>' +
        '<div class="drawer-body">' + body + '</div>' +
        (foot ? '<div class="drawer-foot">' + foot + '</div>' : '') +
      '</aside>';
  }

  function removed() {
    var e = ERR.taskRemovedWhileOpen;
    return shell("Task", '<h2 id="dr-title" tabindex="-1">' + esc(e.title) + '</h2><p class="muted">' + esc(e.body) + '</p>' +
      '<button type="button" class="btn btn-secondary" data-action="close-drawer" data-fkey="dback">' + esc(e.action) + '</button>');
  }

  function notice(emp, tk, st) {
    if (st === "locked") return '<div class="notice notice-lock">' + icon("lock", 18) + '<span>' + esc(fill(ERR.lockedTaskOpened.notice, { startLong: dates.fmtLong(emp.start) })) + '</span></div>';
    if (st === "overdue") return '<div class="notice notice-warn">' + icon("alert", 18) + '<span>' + esc(ERR.overdueTaskOpened.notice) + '</span></div>';
    if (st === "done") return '<div class="notice notice-done">' + icon("check", 18) + '<span>Completed ' + (tk.doneOn === TODAY ? "today" : "on " + dates.fmtLong(tk.doneOn)) + '. Your manager can see this.</span></div>';
    return "";
  }

  // One resource link per task. Prototype links never navigate (main.js shows a toast).
  function resourceLink(emp, d, st) {
    if (st === "locked") {
      return '<div class="res-link res-locked" aria-disabled="true"><span class="res-icon">' + icon("lock", 18) + '</span>' +
        '<span class="res-text"><span class="res-label">' + esc(fill(ERR.lockedTaskOpened.linkPlaceholder, { start: dates.fmt(emp.start) })) + '</span>' +
        '<span class="res-url">This task’s link unlocks on your first day</span></span></div>';
    }
    var shortUrl = d.link.url.replace(/^https:\/\//, "");
    return '<button type="button" class="res-link" data-action="demo-link" data-url="' + esc(shortUrl) + '" data-fkey="res-link">' +
      '<span class="res-icon">' + icon("link", 18) + '</span>' +
      '<span class="res-text"><span class="res-label">' + esc(d.link.label) + '</span><span class="res-url">' + esc(d.link.src) + ' · ' + esc(shortUrl) + '</span></span>' +
      icon("ext", 16) + '</button>';
  }

  function footer(emp, tk, d, st, id) {
    if (st === "done") return '<button type="button" class="btn btn-secondary" data-action="reopen" data-id="' + esc(id) + '" data-fkey="reopen">Mark as not done</button>';
    if (st === "locked") return '<button type="button" class="btn btn-primary" disabled>' + icon("lock", 16) + 'Available on ' + dates.fmt(emp.start) + '</button>';
    return '<button type="button" class="btn btn-primary" data-action="complete" data-id="' + esc(id) + '" data-fkey="complete">' + icon("check", 18) +
      (d.type === "review" ? "Mark as reviewed" : "Mark as complete") + '</button>' +
      '<p class="faint drawer-note">Your progress and your manager’s dashboard update right away.</p>';
  }

  function taskPanel(id) {
    var f = YFP.store.findTask(id);
    if (!f) return removed();
    var emp = f.emp, tk = f.task, d = DEFS[tk.def], st = H.status(emp, tk), due = dates.dueText(emp, tk);
    var by = MOCK.assigners[tk.addedBy] ? MOCK.assigners[tk.addedBy].label : tk.addedBy;
    var dueNote = st === "overdue" || st === "today" ? ' <span class="due-note' + (st === "overdue" ? " overdue-txt" : "") + '">(' + esc(due.text.toLowerCase()) + ')</span>' : '';
    var body = tags(tk.def) + '<h2 id="dr-title" class="drawer-title" tabindex="-1">' + esc(d.title) + '</h2>' + notice(emp, tk, st) +
      '<dl class="meta"><dt>Due</dt><dd class="num">' + dates.fmtLong(tk.due) + dueNote + '</dd>' +
        '<dt>Assigned by</dt><dd>' + esc(by) + '</dd>' +
        '<dt>Type</dt><dd>' + (d.type === "ar" ? "Action required" : "Review") + ' · ' + (d.timing === "pre" ? "Before Day 1" : "From Day 1") + '</dd></dl>' +
      '<div><h3 class="sec-title">About this task</h3><p class="muted">' + esc(d.desc) + '</p></div>' +
      '<div><h3 class="sec-title">How to complete it</h3>' + resourceLink(emp, d, st) +
        '<ol class="steps">' + d.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ol></div>';
    return shell("Task details", body, footer(emp, tk, d, st, id));
  }

  YFP.views = YFP.views || {};
  YFP.views.taskPanel = taskPanel;
})(window.YFP = window.YFP || {});
