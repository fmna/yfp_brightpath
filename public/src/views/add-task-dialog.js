/* YFP · views/add-task-dialog.js
 * Catalog dialog: available items first, unavailable dimmed with a reason,
 * fixed footer with the due date. Availability comes from H.catalogFor(). */
(function (YFP) {
  "use strict";
  if (!YFP.MOCK) return;
  var MOCK = YFP.MOCK, H = MOCK.helpers, DEFS = MOCK.taskDefs, ERR = MOCK.errorScenarios, EMPTY = MOCK.emptyStates, TODAY = MOCK.demo.today;
  var esc = YFP.html.esc, fill = YFP.html.fill, icon = YFP.icons.icon, C = YFP.components;

  function reasonText(reason, emp) {
    return reason === "already" ? fill(ERR.catalogAlreadyInPlan.reason, { first: emp.first }) : ERR.catalogPreD1AfterStart.reason;
  }

  function item(emp, def, reason) {
    var d = DEFS[def], ui = YFP.store.ui;
    return '<label class="cat-item' + (reason ? " disabled" : "") + '">' +
      '<input type="radio" name="cat" value="' + def + '" data-fkey="cat-' + def + '"' + (reason ? " disabled" : "") + (ui.pick === def ? " checked" : "") + '>' +
      '<span class="cat-main"><strong>' + esc(d.title) + '</strong>' + C.tags(def) +
        '<span class="muted cat-desc">' + esc(d.desc) + '</span>' +
        (reason ? '<span class="cat-note">' + icon("lock", 13) + esc(reasonText(reason, emp)) + '</span>' : '') + '</span></label>';
  }

  function addTaskDialog(emp) {
    var ui = YFP.store.ui, cat = H.catalogFor(emp);
    var list = cat.available.map(function (c) { return item(emp, c, null); })
      .concat(MOCK.catalog.filter(function (c) { return cat.unavailable[c]; }).map(function (c) { return item(emp, c, cat.unavailable[c]); }));
    // Nothing to add: "all already in the plan" vs. "some are Pre-D1 after the start date".
    var allInPlan = Object.keys(cat.unavailable).every(function (c) { return cat.unavailable[c] === "already"; });
    var empty = allInPlan ? EMPTY.catalogExhausted : EMPTY.catalogNoneAvailable;
    var body = cat.available.length ? '<div class="catalog" role="radiogroup" aria-label="Task catalog">' + list.join("") + '</div>' :
      C.emptyState(fill(empty.title, { first: emp.first }), fill(empty.body, { first: emp.first }));
    var due = ui.pick ?
      '<label class="field field-inline" for="due-input">Due date<input type="date" id="due-input" value="' + esc(ui.due) + '" min="' + TODAY + '" required data-fkey="due"></label>' :
      '<span class="faint foot-hint">' + (cat.available.length ? "Select a task to set its due date" : "") + '</span>';
    return '<div class="scrim" data-action="add-close"></div>' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="add-title">' +
        '<div class="drawer-head"><h2 id="add-title" tabindex="-1">Add a task for ' + esc(emp.first) + '</h2>' +
          '<button type="button" class="icon-btn" data-action="add-close" aria-label="Close" data-fkey="add-x">' + icon("x", 18) + '</button></div>' +
        '<div class="drawer-body modal-body"><p class="muted">Choose from the BrightPath task catalog. ' + esc(emp.first) + ' sees new tasks right away.</p>' + body + '</div>' +
        '<div class="drawer-foot modal-foot">' + due +
          '<button type="button" class="btn btn-secondary" data-action="add-close" data-fkey="add-cancel">Cancel</button>' +
          '<button type="button" class="btn btn-primary" data-action="add-submit" data-fkey="add-submit"' + (ui.pick ? "" : " disabled") + '>Add to ' + esc(emp.first) + '’s plan</button>' +
        '</div>' +
      '</div>';
  }

  YFP.views = YFP.views || {};
  YFP.views.addTaskDialog = addTaskDialog;
})(window.YFP = window.YFP || {});
