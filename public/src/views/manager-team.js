/* YFP · views/manager-team.js
 * Manager Dashboard (#team): tiles → attention callouts → progress table.
 * "Is onboarding on track, and who needs me?" 02-user-flow §5.3 */
(function (YFP) {
  "use strict";
  if (!YFP.MOCK) return;
  var MOCK = YFP.MOCK, H = MOCK.helpers, DEFS = MOCK.taskDefs, EMPTY = MOCK.emptyStates;
  var esc = YFP.html.esc, plural = YFP.html.plural, icon = YFP.icons.icon, C = YFP.components, dates = YFP.dates;

  // Shared with Employee Detail: "Starts Mon, Nov 2" + "3 days until Day 1".
  function stageSub(emp, stg) {
    return stg.started ? "Started " + dates.fmt(emp.start) : plural(stg.daysToStart, "day") + " until Day 1";
  }

  function activity(emp) {
    var a = H.lastActivity(emp);
    if (a.kind === "none") return { when: "", text: "No tasks completed yet", fresh: false };
    return {
      when: a.kind === "justNow" ? "Just now" : dates.ago(a.daysAgo),
      text: "Completed “" + DEFS[a.task.def].title + "”",
      fresh: a.kind === "justNow"
    };
  }

  function tiles(rows, data) {
    var risk = rows.filter(function (x) { return x.s.needsSupport; });
    var next = H.startingNext(data), nextEmp = next ? data[next.employee] : null;
    return '<div class="tiles">' +
      '<div class="tile"><span class="stat-label">Need support</span>' +
        '<span class="val num' + (risk.length ? " risk" : "") + '">' + risk.length + '</span>' +
        '<span class="sub">' + (risk.length ? risk.map(function (x) { return esc(x.e.first) + ' · ' + x.s.overdue + ' overdue'; }).join(", ") : "Everyone is on track") + '</span></div>' +
      '<div class="tile"><span class="stat-label">Average progress</span><span class="val num">' + H.teamAverage(data) + '%</span>' +
        '<span class="sub">Across all assigned tasks</span></div>' +
      '<div class="tile"><span class="stat-label">Starting next</span>' +
        '<span class="val val-name">' + (nextEmp ? esc(nextEmp.name) : "None") + '</span>' +
        '<span class="sub">' + (nextEmp ? dates.fmt(nextEmp.start) + ' · ' + plural(next.preD1Left, "Pre-D1 task") + ' left' : "No upcoming start dates") + '</span></div>' +
    '</div>';
  }

  function callouts(rows) {
    return rows.filter(function (x) { return x.s.needsSupport; }).map(function (x) {
      var oldest = x.s.overdueTasks[0];
      return '<div class="callout"><p>' + icon("alert", 18) + '<span><strong>' + esc(x.e.name) + ' may need support.</strong> ' +
        plural(x.s.overdue, "overdue task") + ', including “' + esc(DEFS[oldest.def].title) + '” (due ' + dates.fmt(oldest.due) + ').</span></p>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-action="open-hire" data-emp="' + esc(x.e.id) + '" data-fkey="callout-' + esc(x.e.id) + '">Review ' + esc(x.e.first) + '’s plan</button></div>';
    }).join("");
  }

  function row(x) {
    var e = x.e, s = x.s, nx = s.next, nd = nx ? dates.dueText(e, nx) : null, a = activity(e);
    return '<tr class="clickable" data-action="open-hire" data-emp="' + esc(e.id) + '">' +
      '<th scope="row"><div class="who">' + C.avatar(e, "md") + '<div>' +
        '<button type="button" class="who-btn" data-action="open-hire" data-emp="' + esc(e.id) + '" data-fkey="hire-' + esc(e.id) + '">' + esc(e.name) + '</button>' +
        '<div class="faint cell-sub">' + esc(e.role) + ' · ' + esc(e.dept) + '</div></div></div></th>' +
      '<td class="cell-stage"><strong>' + esc(x.stg.label) + '</strong><div class="faint cell-sub">' + stageSub(e, x.stg) + '</div></td>' +
      '<td><div class="prog-cell"><div class="meter-top"><strong class="num">' + s.pct + '%</strong><span class="faint num">' + s.done + '/' + s.total + ' tasks</span></div>' + C.bar(s.pct, s.needsSupport) + '</div></td>' +
      '<td>' + (nx ? esc(DEFS[nx.def].title) + '<div class="cell-sub ' + (nd.cls === "overdue" ? "overdue-txt" : "faint") + '">' + esc(nd.text) + '</div>' : '<span class="faint">' + esc(EMPTY.managerNothingOpen.title) + '</span>') + '</td>' +
      '<td>' + C.pill(s.needsSupport) + '</td>' +
      '<td><span class="cell-when' + (a.fresh ? " fresh" : "") + '">' + esc(a.when) + '</span><div class="faint cell-sub cell-activity">' + esc(a.text) + '</div></td>' +
    '</tr>';
  }

  function managerTeam() {
    var data = YFP.store.data;
    var rows = H.teamOrder(data).map(function (k) { var e = data[k]; return { e: e, s: H.stats(e), stg: H.stage(e) }; });
    var head = '<div class="page-head"><div><p class="eyebrow">Manager view</p><h1>Your new hires</h1>' +
      '<p class="muted">' + rows.length + (rows.length === 1 ? " person" : " people") + ' onboarding. Progress updates as soon as they complete a task.</p></div></div>';
    var table = '<div class="panel"><div class="panel-head"><h2>Onboarding progress</h2><span class="faint panel-note">Sorted by who needs attention first</span></div>' +
      '<div class="table-scroll"><table><thead><tr>' +
        '<th scope="col">New hire</th><th scope="col">Stage</th><th scope="col">Progress</th><th scope="col">Next due</th><th scope="col">Status</th><th scope="col">Latest activity</th>' +
      '</tr></thead><tbody>' + rows.map(row).join("") + '</tbody></table></div></div>';
    return head + tiles(rows, data) + callouts(rows) + table;
  }

  YFP.views = YFP.views || {};
  YFP.views.managerTeam = managerTeam;
  YFP.views.stageSub = stageSub;
})(window.YFP = window.YFP || {});
