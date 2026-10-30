/* YFP · ui/html.js
 * Creates the window.YFP namespace and small HTML helpers.
 * Loads right after 04-mock-data.js; every later file reads YFP.MOCK. */
(function (YFP) {
  "use strict";
  YFP.MOCK = window.YFP_MOCK_DATA || null;

  var ENT = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ENT[c]; }); }

  // Copy templates live in 04-mock-data.js; fill() is defined there too.
  function fill(tpl, vals) { return YFP.MOCK.helpers.fill(tpl, vals); }

  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }

  YFP.html = { esc: esc, fill: fill, plural: plural };
})(window.YFP = window.YFP || {});
