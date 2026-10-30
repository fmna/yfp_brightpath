/* YFP · views/employee-detail.js
 * Employee Detail (#team-{id}): breadcrumb → header → plan table grouped
 * Pre-D1 / Post-D1, with inline remove confirmation. 02-user-flow §5.4 */
(function (YFP) {
  "use strict";
  if (!YFP.MOCK) return;
  var MOCK = YFP.MOCK, H = MOCK.helpers, DEFS = MOCK.taskDefs, ERR = MOCK.errorScenarios, TODAY = MOCK.demo.today;
  var esc = YFP.html.esc, icon = YFP.icons.icon, C = YFP.components, dates = YFP.dates;

  var STATUS_CELL = {
    done: ["st-done", "check", "Done"],
    overdue: ["st-overdue", "alert", "Overdue"],
    later: ["st-later", "cal", "Upcoming"],
    locked: ["st-locked", "lock", "Locked until Day 1"]
  };
  function statusCell(emp, tk) {
    var st = H.status(emp, tk);
    var m = st === "today" ? ["st-today", "cal", H.diffDays(TODAY, tk.due) === 0 ? "Due today" : "Due tomorrow"] : STATUS_CELL[st];
    return '<span class="st ' + m[0] + '">' + icon(m[1], 14) + m[2] + '</span>';
  }

  function header(emp) {
    var s = H.stats(emp), stg = H.stage(emp);
    return '<nav class="breadcrumb" aria-label="Breadcrumb"><button type="button" data-action="back-team" data-fkey="crumb">New hires</button>' +
        '<span class="faint" aria-hidden="true">/</span><span aria-current="page">' + esc(emp.name) + '</span></nav>' +
      '<div class="hire-head"><div class="hire-id">' + C.avatar(emp, "lg") + '<div class="hire-name">' +
        '<h1>' + esc(emp.name) + '</h1>' +
        '<div class="hire-meta"><span>' + esc(emp.role) + ' · ' + esc(emp.dept) + '</span></div>' +
          '<div class="hire-meta"><span>' + esc(stg.label) + ' · ' + YFP.views.stageSub(emp, stg) + '</span>' + C.pill(s.needsSupport) + '</div></div></div>' +
        '<div class="prog-cell"><div class="meter-top"><span><strong class="num">' + s.pct + '%</strong> complete</span><span class="faint num">' + s.done + ' of ' + s.total + ' tasks</span></div>' +
          C.bar(s.pct, s.needsSupport) +
          (s.needsSupport ? '<span class="overdue-txt cell-sub">' + icon("alert", 13) + ' ' + s.overdue + ' overdue</span>' : '<span class="faint cell-sub">No overdue tasks</span>') + '</div>' +
        '<button type="button" class="btn btn-primary" data-action="add-open" data-fkey="add-open">' + icon("plus", 16) + 'Add task</button>' +
      '</div>';
  }

  function actionCell(emp, tk, id, d) {
    var rm = H.canRemove(emp, tk);
    if (rm.ok) return '<button type="button" class="icon-btn danger" data-action="remove-ask" data-id="' + esc(id) + '" data-fkey="rm-' + esc(id) + '" aria-label="Remove ' + esc(d.title) + '">' + icon("trash", 17) + '</button>';
    if (rm.reason === "hrRequired") return '<span class="required" title="' + esc(ERR.removeHrRequired.tooltip) + '">Required by HR</span>';
    return '<span class="required" title="Completed tasks stay in the plan as a record">Completed</span>';
  }

  function confirmRow(emp, id, d) {
    return '<tr class="confirm-row"><td colspan="5"><div class="confirm-inner">' +
      '<span>Remove “' + esc(d.title) + '” from ' + esc(emp.first) + '’s plan? ' + esc(emp.first) + ' will no longer see it.</span>' +
      '<span class="confirm-actions"><button type="button" class="btn btn-secondary btn-sm" data-action="remove-cancel" data-fkey="rm-cancel">Cancel</button>' +
      '<button type="button" class="btn btn-danger btn-sm" data-action="remove-confirm" data-id="' + esc(id) + '" data-fkey="rm-confirm">Remove task</button></span>' +
    '</div></td></tr>';
  }

  function group(emp, timing, label) {
    var list = emp.tasks.filter(function (x) { return DEFS[x.def].timing === timing; }).sort(H.byDue);
    var doneCount = list.filter(function (x) { return x.done; }).length;
    var out = '<tr class="group-row"><th scope="rowgroup" colspan="5">' + label + ' · ' + doneCount + '/' + list.length + ' done</th></tr>';
    if (!list.length) out += '<tr><td colspan="5" class="faint">No ' + (timing === "pre" ? "Pre-D1" : "Post-D1") + ' tasks in this plan.</td></tr>';
    list.forEach(function (tk) {
      var id = YFP.store.taskId(emp, tk), d = DEFS[tk.def];
      var by = MOCK.assigners[tk.addedBy] ? MOCK.assigners[tk.addedBy].short : tk.addedBy;
      out += '<tr><td><div class="task-cell"><strong>' + esc(d.title) + '</strong>' + C.tags(tk.def, tk.isNew ? '<span class="chip chip-new">Just added</span>' : '') + '</div></td>' +
        '<td class="num">' + dates.fmt(tk.due) + '</td><td>' + statusCell(emp, tk) + '</td><td class="muted">' + esc(by) + '</td>' +
        '<td class="cell-action">' + actionCell(emp, tk, id, d) + '</td></tr>';
      if (YFP.store.ui.confirmRemove === id && H.canRemove(emp, tk).ok) out += confirmRow(emp, id, d);
    });
    return out;
  }

  function employeeDetail(route) {
    var emp = YFP.store.data[route.emp];
    var table = '<div class="panel"><div class="panel-head"><h2>Onboarding plan</h2><span class="faint panel-note">Add tasks from the catalog. HR-required tasks can’t be removed.</span></div>' +
      '<div class="table-scroll"><table><thead><tr><th scope="col">Task</th><th scope="col">Due</th><th scope="col">Status</th><th scope="col">Added by</th><th scope="col"><span class="sr">Actions</span></th></tr></thead>' +
      '<tbody>' + group(emp, "pre", "Before Day 1 (Pre-D1)") + group(emp, "post", "From Day 1 (Post-D1)") + '</tbody></table></div></div>';
    return header(emp) + table + (YFP.store.ui.addOpen ? YFP.views.addTaskDialog(emp) : "");
  }

  YFP.views = YFP.views || {};
  YFP.views.employeeDetail = employeeDetail;
})(window.YFP = window.YFP || {});
