/* YFP · core/router.js
 * Hash routes (05-build-spec §7). Works on any static host, no rewrites.
 *   "" | #home            Alex  · Employee Dashboard
 *   #task-alex-{defId}    Alex  · Employee Dashboard + Task Detail panel
 *   #team                 Morgan · Manager Dashboard
 *   #team-{employeeId}    Morgan · Employee Detail
 *   anything else         Not-found screen */
(function (YFP) {
  "use strict";
  if (!YFP.MOCK) return;
  var MOCK = YFP.MOCK;

  function parse(hash) {
    var h = String(hash || "").replace(/^#/, "");
    if (h === "" || h === "home") return { view: "home", role: "alex" };
    if (h.indexOf("task-") === 0) {
      var id = h.slice(5), def = id.slice(id.indexOf("-") + 1);
      // Only Alex's tasks open from a link. A real task that isn't in Alex's
      // plan opens the "isn't in your plan" panel; a made-up one is not-found.
      if (id.indexOf("alex-") === 0 && MOCK.taskDefs[def]) return { view: "home", role: "alex", taskId: id };
      return { view: "404", role: null };
    }
    if (h === "team") return { view: "team", role: "morgan" };
    if (h.indexOf("team-") === 0) {
      var emp = h.slice(5);
      if (MOCK.employeeOrder.indexOf(emp) > -1) return { view: "hire", role: "morgan", emp: emp };
    }
    return { view: "404", role: null };
  }

  function current() { return parse(location.hash); }

  // Same hash → just re-render (hashchange wouldn't fire).
  function go(hash) {
    if (location.hash === "#" + hash || (hash === "home" && location.hash === "")) YFP.store.onChange();
    else location.hash = hash;
  }

  YFP.router = { parse: parse, current: current, go: go };
})(window.YFP = window.YFP || {});
