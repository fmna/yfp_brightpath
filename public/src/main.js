/* YFP · main.js
 * render(), delegated events, focus management, boot (05-build-spec §6.4, §9).
 * Wires events to store mutations; holds no business rules. */
(function (YFP) {
  "use strict";
  var app = document.getElementById("app"), toastRoot = document.getElementById("toast-root");

  // Must work without 04-mock-data.js, so this copy can't live there.
  if (!YFP.MOCK) {
    app.innerHTML = '<main><div class="wrap"><div class="notfound"><h1>Demo data didn’t load</h1>' +
      '<p class="muted">04-mock-data.js is missing or failed to load. Keep it in the same folder as index.html and reload the page.</p></div></div></main>';
    return;
  }

  var MOCK = YFP.MOCK, H = MOCK.helpers, store = YFP.store, router = YFP.router, V = YFP.views;
  var fill = YFP.html.fill, go = router.go;

  var last = { view: null, taskId: null, addOpen: false };
  var opener = null;        // data-fkey of the element that opened the task panel
  var pendingFocus = null;  // data-fkey to focus after the next render

  function viewKey(r) { return r.view + (r.emp ? "-" + r.emp : ""); }
  function byKey(k) { return k ? document.querySelector('[data-fkey="' + k + '"]') : null; }

  function render() {
    var r = router.current(), ui = store.ui, key = viewKey(r);
    var active = document.activeElement;
    var focusKey = active && active.getAttribute ? active.getAttribute("data-fkey") : null;
    var changed = last.view !== null && last.view !== key;

    if (changed) {
      if (!ui.keepToast) store.dismissToast();
      ui.confirmRemove = null; ui.addOpen = false; ui.pick = null;
      if (last.view.indexOf("hire") === 0) store.clearNewFlags(); // "Just added" clears on leaving Employee Detail
    }
    ui.keepToast = false;

    var html = r.view === "home" ? V.employeeHome(r) :
      r.view === "team" ? V.managerTeam() :
      r.view === "hire" ? V.employeeDetail(r) : V.notFound();
    app.innerHTML = V.topbar(r) + '<main id="main"><div class="wrap">' + html + '</div></main>';
    toastRoot.innerHTML = YFP.components.toast(ui.toast);
    document.title = (r.role === "morgan" ? "Manager" : "Alex") + " · YFP Onboarding Prototype";

    // Focus (05-build-spec §9.3)
    var panelOpened = !!r.taskId && r.taskId !== last.taskId;
    var dialogOpened = ui.addOpen && !last.addOpen;
    var panelClosed = !r.taskId && !!last.taskId && r.view === "home";
    var target = null;
    if (panelOpened) target = document.getElementById("dr-title");
    else if (dialogOpened) target = document.getElementById("add-title");
    else if (pendingFocus) target = byKey(pendingFocus);
    else if (panelClosed) target = byKey(opener) || byKey("next");
    else target = byKey(focusKey);
    if (target) target.focus({ preventScroll: panelOpened || dialogOpened });
    if (panelClosed) opener = null;
    pendingFocus = null;

    if (changed && !panelOpened) window.scrollTo(0, 0);
    last = { view: key, taskId: r.taskId || null, addOpen: ui.addOpen };
  }
  store.onChange = render;

  function closeDialog() { store.ui.addOpen = false; store.ui.pick = null; pendingFocus = "add-open"; render(); }
  function cancelRemove() { var back = store.ui.confirmRemove; store.ui.confirmRemove = null; pendingFocus = "rm-" + back; render(); }

  /* ----- Events: one delegated listener per type ----- */

  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("[data-action]");
    if (!el) return;
    if (el.tagName === "TR" && ev.target.closest("button")) return;
    var a = el.getAttribute("data-action"), id = el.getAttribute("data-id"), ui = store.ui;
    switch (a) {
      case "role": go(el.getAttribute("data-role") === "morgan" ? "team" : "home"); break;
      case "open-task": opener = el.getAttribute("data-fkey"); go("task-" + id); break;
      case "close-drawer": go("home"); break;
      case "complete": store.completeTask(id); go("home"); break;
      case "reopen": store.reopenTask(id); pendingFocus = "complete"; render(); break;
      case "open-hire": go("team-" + el.getAttribute("data-emp")); break;
      case "back-team": go("team"); break;
      case "go": go(el.getAttribute("data-dest")); break;
      case "remove-ask": ui.confirmRemove = id; pendingFocus = "rm-confirm"; render(); break;
      case "remove-cancel": cancelRemove(); break;
      case "remove-confirm": store.removeTask(id); pendingFocus = "undo"; render(); break;
      case "add-open": ui.addOpen = true; ui.pick = null; store.dismissToast(); render(); break;
      case "add-close": closeDialog(); break;
      case "add-submit":
        var emp = router.current().emp, input = document.getElementById("due-input");
        if (emp && ui.pick) store.addTask(emp, ui.pick, (input && input.value) || ui.due);
        closeDialog();
        break;
      case "demo-link": store.setToast(fill(MOCK.toasts.prototypeLink, { url: el.getAttribute("data-url") })); render(); break;
      case "reset": store.reset(); render(); break;
      case "toast-undo": store.undo(); render(); break;
      case "toast-close": store.dismissToast(); render(); break;
    }
  });

  document.addEventListener("change", function (ev) {
    var el = ev.target;
    if (el.name === "cat") {
      var emp = store.data[router.current().emp];
      store.ui.pick = el.value;
      store.ui.due = H.defaultDue(emp, el.value);
      pendingFocus = "cat-" + el.value;
      render();
    } else if (el.id === "due-input") {
      store.ui.due = el.value;
    }
  });

  document.addEventListener("keydown", function (ev) {
    var dialog = document.querySelector('[role="dialog"]');
    if (ev.key === "Tab" && dialog) {
      // Keep focus inside the open panel or dialog.
      var f = Array.prototype.filter.call(dialog.querySelectorAll("button, input, [href], [tabindex]"), function (x) { return !x.disabled && x.tabIndex >= 0; });
      if (!f.length) return;
      var first = f[0], lastEl = f[f.length - 1];
      if (!dialog.contains(document.activeElement)) { ev.preventDefault(); first.focus(); }
      else if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); lastEl.focus(); }
      else if (!ev.shiftKey && document.activeElement === lastEl) { ev.preventDefault(); first.focus(); }
      return;
    }
    if (ev.key !== "Escape") return;
    if (store.ui.addOpen) closeDialog();
    else if (router.current().taskId) go("home");
    else if (store.ui.confirmRemove) cancelRemove();
  });

  window.addEventListener("hashchange", render);

  /* ----- Boot ----- */
  var failures = [];
  if (!H.selfCheck(function (line) { failures.push(line); })) console.warn("YFP self-check failed\n" + failures.join("\n"));
  if (store.isFixture()) console.info("YFP: fixture loaded from ?fixture=. Changes are not saved.");
  render();
})(window.YFP = window.YFP || {});
