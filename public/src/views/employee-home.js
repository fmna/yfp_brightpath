/* YFP · views/employee-home.js
 * Employee Dashboard (#home): greeting → summary (ring, Pre-D1/Post-D1
 * meters, Next up) → board (Do today · Do later · Done). 02-user-flow §5.1 */
(function (YFP) {
  "use strict";
  if (!YFP.MOCK) return;
  var MOCK = YFP.MOCK, H = MOCK.helpers, DEFS = MOCK.taskDefs, EMPTY = MOCK.emptyStates;
  var esc = YFP.html.esc, fill = YFP.html.fill, plural = YFP.html.plural, icon = YFP.icons.icon;
  var C = YFP.components, dates = YFP.dates;

  function greeting(emp, stg) {
    return '<div class="page-head"><div><p class="eyebrow">' + (stg.started ? "Onboarding" : "Before Day 1") + '</p>' +
      '<h1>Welcome, ' + esc(emp.first) + '</h1>' +
      '<p class="muted">' + (stg.started ? 'Here is everything you need for your first weeks.' :
        'Your Day 1 is <strong>' + dates.fmtLong(emp.start) + '</strong>. Finish your Pre-D1 tasks before then.') + '</p></div></div>';
  }

  function nextUp(emp, s, lockedCount) {
    if (!s.next) {
      var body = lockedCount ? fill(EMPTY.allCaughtUp.body, { n: lockedCount, startDate: dates.fmt(emp.start) }) : EMPTY.allCaughtUp.bodyWhenNoneLocked;
      return '<div class="next-card"><p class="stat-label">Next up</p><p class="big">' + esc(EMPTY.allCaughtUp.title) + '</p><p class="muted">' + esc(body) + '</p></div>';
    }
    var due = dates.dueText(emp, s.next);
    return '<div class="next-card"><p class="stat-label">Next up</p><p class="big">' + esc(DEFS[s.next.def].title) + '</p>' +
      '<p class="card-foot ' + due.cls + '">' + icon(due.icon, 15) + esc(due.text) + '</p>' +
      '<button type="button" class="btn btn-primary btn-sm" data-action="open-task" data-id="' + esc(YFP.store.taskId(emp, s.next)) + '" data-fkey="next">Open task ' + icon("arrow", 15) + '</button></div>';
  }

  function meter(chipCls, chipText, label, done, total, foot) {
    return '<div class="meter-row"><div class="meter-top"><span><span class="chip ' + chipCls + '">' + chipText + '</span> ' + label + '</span>' +
      '<strong class="num">' + done + '/' + total + '</strong></div>' +
      C.bar(total ? Math.round(done / total * 100) : 0, false) +
      '<p class="faint meter-foot">' + foot + '</p></div>';
  }

  function summary(emp, s, stg, lockedCount) {
    var preFoot = s.pre && s.preDone === s.pre ? icon("check", 12) + ' All done before Day 1' :
      stg.started ? 'Due before ' + dates.fmt(emp.start) :
      'Finish by ' + dates.fmt(H.addDays(emp.start, -1)) + ' · ' + plural(stg.daysToStart, "day") + ' left';
    var postFoot = stg.started ? 'Unlocked' : icon("lock", 12) + ' Locked until ' + dates.fmt(emp.start);
    return '<div class="summary">' +
      '<section><p class="stat-label">Overall progress</p><div class="ring-row">' + C.ring(s.pct) +
        '<div><p class="big num">' + s.done + ' of ' + s.total + ' tasks done</p>' +
        '<p class="muted summary-sub">' + (s.needsSupport ? '<span class="overdue-txt">' + icon("alert", 14) + ' ' + s.overdue + ' overdue</span>' : 'You’re on track') + '</p></div></div></section>' +
      '<section><div class="split-meter">' +
        meter("chip-pre", "Pre-D1", "Before Day 1", s.preDone, s.pre, preFoot) +
        meter("chip-post", "Post-D1", "From Day 1 on", s.postDone, s.post, postFoot) +
      '</div></section>' +
      '<section>' + nextUp(emp, s, lockedCount) + '</section></div>';
  }

  function column(emp, key, title, help, list, empty, extra) {
    return '<section class="col col-' + key + '" aria-labelledby="h-' + key + '">' +
      '<div class="col-head"><h2 id="h-' + key + '">' + title + '</h2><span class="count num" aria-label="' + plural(list.length, "task") + '">' + list.length + '</span></div>' +
      '<p class="col-help">' + help + '</p><div class="stack">' +
      (list.length ? list.map(function (x) { return C.taskCard(emp, x); }).join("") : empty) +
      (extra || "") + '</div></section>';
  }

  function lockedGroup(emp, locked) {
    if (!locked.length) return "";
    return '<div class="locked-group"><p class="locked-head">' + icon("lock", 14) + ' Unlocks on Day 1 · ' + dates.fmt(emp.start) + '</p>' +
      locked.map(function (x) {
        var id = YFP.store.taskId(emp, x);
        return '<button type="button" class="locked-row" data-action="open-task" data-id="' + esc(id) + '" data-fkey="card-' + esc(id) + '">' +
          '<span>' + esc(DEFS[x.def].title) + '<span class="sr">, locked until Day 1, due</span></span><span class="num">' + dates.fmtShort(x.due) + '</span></button>';
      }).join("") + '</div>';
  }

  function board(emp, b) {
    var laterEmpty = b.locked.length ? EMPTY.doLaterEmpty.titleWhenLockedExist : EMPTY.doLaterEmpty.title;
    return '<div class="board">' +
      column(emp, "today", "Do today", "Overdue, due today or due tomorrow", b.today, C.emptyState(EMPTY.doTodayEmpty.title, EMPTY.doTodayEmpty.body)) +
      column(emp, "later", "Do later", "Coming up. No action needed yet.", b.later, C.emptyState(laterEmpty, EMPTY.doLaterEmpty.body), lockedGroup(emp, b.locked)) +
      column(emp, "done", "Done", "Nice work. These count toward your progress.", b.done, C.emptyState(EMPTY.doneEmpty.title, EMPTY.doneEmpty.body)) +
    '</div>';
  }

  function employeeHome(route) {
    var emp = YFP.store.data[MOCK.demo.primaryPersona];
    var s = H.stats(emp), b = H.buckets(emp), stg = H.stage(emp);
    return greeting(emp, stg) + summary(emp, s, stg, b.locked.length) + board(emp, b) +
      (route.taskId ? YFP.views.taskPanel(route.taskId) : "");
  }

  YFP.views = YFP.views || {};
  YFP.views.employeeHome = employeeHome;
})(window.YFP = window.YFP || {});
