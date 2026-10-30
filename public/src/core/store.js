/* YFP · core/store.js
 * The one store both views read, load/save, mutations, undo, reset, UI state.
 * Rule checks (catalogFor, canRemove, stats…) come from MOCK.helpers. */
(function (YFP) {
  "use strict";
  if (!YFP.MOCK) return;
  var MOCK = YFP.MOCK, H = MOCK.helpers, TODAY = MOCK.demo.today, KEY = MOCK.demo.storageKey;
  var ORDER = MOCK.employeeOrder, DEFS = MOCK.taskDefs, TOASTS = MOCK.toasts, fill = YFP.html.fill;

  var fixtureMode = false;
  var toastTimer = null;

  /* ----- Load and save (05-build-spec §6.2) ----- */

  // Test-only hook: ?fixture=name, honored only when running locally, never saved.
  function loadFixture() {
    try {
      var name = new URLSearchParams(location.search).get("fixture");
      if (!name) return null;
      var local = location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
      var fx = MOCK.fixtures[name];
      if (!local || !fx || typeof fx.build !== "function") return null;
      fixtureMode = true;
      return fx.build();
    } catch (e) { return null; }
  }

  function load() {
    var fx = loadFixture();
    if (fx) return fx;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (H.validateStore(parsed)) return parsed;
      }
    } catch (e) { /* corrupt JSON or storage blocked: fall through to the seed */ }
    return MOCK.seed();
  }

  function save() {
    if (fixtureMode) return;
    try { localStorage.setItem(KEY, JSON.stringify(store.data)); } catch (e) { /* storage blocked: memory only */ }
  }

  function freshUi() { return { confirmRemove: null, addOpen: false, pick: null, due: "", toast: null, keepToast: false }; }

  /* ----- Lookups ----- */

  // Task IDs are "{employeeId}-{defId}", e.g. "alex-i9".
  function findTask(taskId) {
    var cut = String(taskId).indexOf("-");
    if (cut < 0) return null;
    var emp = store.data[taskId.slice(0, cut)];
    var tk = emp ? H.findTask(emp, taskId.slice(cut + 1)) : null;
    return tk ? { emp: emp, task: tk } : null;
  }
  function taskId(emp, tk) { return emp.id + "-" + tk.def; }

  function eachTask(fn) { ORDER.forEach(function (k) { store.data[k].tasks.forEach(fn); }); }

  /* ----- Toast (one at a time, Undo kept in memory only) ----- */

  function setToast(msg, undo) {
    store.ui.toast = { msg: msg, undo: undo || null };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { store.ui.toast = null; store.onChange(); }, MOCK.demo.undoSeconds * 1000);
  }
  function dismissToast() { clearTimeout(toastTimer); store.ui.toast = null; }

  /* ----- Mutations (05-build-spec §6.3) ----- */

  function completeTask(id) {
    var f = findTask(id);
    if (!f || f.task.done || H.status(f.emp, f.task) === "locked") return false;
    var before = H.stats(f.emp).pct;
    var prevJust = null;
    eachTask(function (x) { if (x.justNow) prevJust = x; x.justNow = false; });
    f.task.done = true; f.task.doneOn = TODAY; f.task.justNow = true;
    save();
    setToast(fill(TOASTS.completed, { before: before, after: H.stats(f.emp).pct }), function () {
      f.task.done = false; f.task.doneOn = null; f.task.justNow = false;
      if (prevJust) prevJust.justNow = true;
      save();
    });
    return true;
  }

  function reopenTask(id) {
    var f = findTask(id);
    if (!f || !f.task.done) return false;
    f.task.done = false; f.task.doneOn = null; f.task.justNow = false;
    save();
    setToast(TOASTS.reopened);
    return true;
  }

  function addTask(empId, defId, due) {
    var emp = store.data[empId];
    if (!emp || H.catalogFor(emp).available.indexOf(defId) < 0) return false;
    if (!due || due < TODAY) due = TODAY;
    var tk = H.makeTask(defId, due, null, "morgan");
    tk.isNew = true;
    emp.tasks.push(tk);
    save();
    setToast(fill(TOASTS.added, { title: DEFS[defId].title, first: emp.first }));
    return true;
  }

  function removeTask(id) {
    var f = findTask(id);
    if (!f || !H.canRemove(f.emp, f.task).ok) return false;
    var emp = f.emp, tk = f.task, idx = emp.tasks.indexOf(tk);
    emp.tasks.splice(idx, 1);
    store.ui.confirmRemove = null;
    save();
    setToast(fill(TOASTS.removed, { title: DEFS[tk.def].title, first: emp.first }), function () {
      if (!H.findTask(emp, tk.def)) emp.tasks.splice(Math.min(idx, emp.tasks.length), 0, tk);
      save();
    });
    return true;
  }

  function undo() {
    var u = store.ui.toast && store.ui.toast.undo;
    dismissToast();
    if (u) u();
  }

  function reset() {
    store.data = MOCK.seed();
    store.ui = freshUi();
    save();
    setToast(TOASTS.reset);
    store.ui.keepToast = true;
  }

  function clearNewFlags() { eachTask(function (x) { x.isNew = false; }); save(); }

  var store = {
    data: null,
    ui: freshUi(),
    onChange: function () {},   // main.js sets this to render()
    isFixture: function () { return fixtureMode; },
    findTask: findTask, taskId: taskId,
    completeTask: completeTask, reopenTask: reopenTask, addTask: addTask, removeTask: removeTask,
    undo: undo, reset: reset, dismissToast: dismissToast, setToast: setToast, clearNewFlags: clearNewFlags
  };
  store.data = load();

  YFP.store = store;
})(window.YFP = window.YFP || {});
