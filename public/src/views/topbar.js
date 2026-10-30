/* YFP · views/topbar.js
 * Brand, demo date, role switcher ("View as") and Reset demo. Every screen. */
(function (YFP) {
  "use strict";
  if (!YFP.MOCK) return;
  var MOCK = YFP.MOCK, esc = YFP.html.esc, avatar = YFP.components.avatar;

  var SWITCH_LABEL = { alex: "New hire", morgan: "Manager" };

  function topbar(route) {
    var options = MOCK.demo.switchablePersonas.map(function (id) {
      var p = MOCK.people[id];
      return '<button type="button" data-action="role" data-role="' + id + '" data-fkey="role-' + id + '" aria-pressed="' + (route.role === id) + '">' +
        avatar(p) + '<span>' + esc(p.name) + ' <small>' + SWITCH_LABEL[id] + '</small></span></button>';
    }).join("");
    return '<header class="topbar"><div class="wrap">' +
      '<a class="brand" href="#' + (route.role === "morgan" ? "team" : "home") + '" data-fkey="brand"><span class="brand-mark">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--on-brand)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c3-1 4-4 7-7s5-3 7-7"/><circle cx="5" cy="19" r="1.6" fill="var(--on-brand)"/><circle cx="19" cy="5" r="1.6" fill="var(--on-brand)"/></svg>' +
      '</span><span><span class="brand-name">Your First Path</span><span class="brand-sub">' + esc(MOCK.demo.company) + '</span></span></a>' +
      '<span class="demo-date" title="The prototype runs on a fixed date so the demo is repeatable">Demo date: ' + YFP.dates.fmtYear(MOCK.demo.today) + '</span>' +
      '<div class="switcher" role="group" aria-label="View as"><span class="switcher-label" aria-hidden="true">View as</span><div class="seg">' + options + '</div></div>' +
      '<button type="button" class="link-btn" data-action="reset" data-fkey="reset">Reset demo</button>' +
    '</div></header>';
  }

  YFP.views = YFP.views || {};
  YFP.views.topbar = topbar;
})(window.YFP = window.YFP || {});
