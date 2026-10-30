/* YFP · ui/components.js
 * Small HTML-string components shared by the views (05-build-spec §8).
 * Presentation only: every state shown here comes from MOCK.helpers. */
(function (YFP) {
  "use strict";
  if (!YFP.MOCK) return;
  var DEFS = YFP.MOCK.taskDefs, esc = YFP.html.esc, icon = YFP.icons.icon, dates = YFP.dates;

  // Timing tag, then type tag, always in that order. `extra` = more chips.
  function tags(def, extra) {
    var d = DEFS[def];
    return '<div class="chips">' +
      (d.timing === "pre" ? '<span class="chip chip-pre">Pre-D1</span>' : '<span class="chip chip-post">Post-D1</span>') +
      (d.type === "ar" ? '<span class="chip chip-ar">Action required</span>' : '<span class="chip chip-review">Review</span>') +
      (extra || "") + '</div>';
  }

  function avatar(person, size) {
    return '<span class="av ' + (size || "") + ' av-' + esc(person.id) + '" aria-hidden="true">' + esc(person.initials) + '</span>';
  }

  function ring(pct) {
    var r = 36, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    return '<div class="ring" role="img" aria-label="' + pct + '% complete"><svg width="84" height="84" viewBox="0 0 84 84">' +
      '<circle class="ring-track" cx="42" cy="42" r="' + r + '" fill="none" stroke-width="9"/>' +
      '<circle class="ring-val" cx="42" cy="42" r="' + r + '" fill="none" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '"/>' +
      '</svg><span class="ring-num num" aria-hidden="true">' + pct + '%</span></div>';
  }

  // Green normally, red when the person needs support. The % is shown as text next to it.
  function bar(pct, risk) {
    return '<div class="bar' + (risk ? " risk" : "") + '" aria-hidden="true"><span style="width:' + pct + '%"></span></div>';
  }

  function pill(needsSupport) {
    return needsSupport ? '<span class="pill pill-risk">Needs support</span>' : '<span class="pill pill-ok">On track</span>';
  }

  function emptyState(title, body) {
    return '<div class="empty"><strong>' + esc(title) + '</strong>' + (body ? '<span>' + esc(body) + '</span>' : '') + '</div>';
  }

  // Whole card is a button. Contents: tags → title → description → due line.
  function taskCard(emp, tk) {
    var d = DEFS[tk.def], due = dates.dueText(emp, tk), id = YFP.store.taskId(emp, tk);
    return '<button type="button" class="card" data-action="open-task" data-id="' + esc(id) + '" data-fkey="card-' + esc(id) + '">' +
      tags(tk.def) +
      '<span class="card-title">' + esc(d.title) + '</span>' +
      '<span class="card-desc">' + esc(d.desc) + '</span>' +
      '<span class="card-foot ' + due.cls + '">' + icon(due.icon, 15) + '<span>' + esc(due.text) + '</span>' +
        (tk.justNow ? '<span class="just">Just completed</span>' : '') + '</span>' +
    '</button>';
  }

  function toast(msg) {
    if (!msg) return "";
    return '<div class="toast"><span>' + esc(msg.msg) + '</span>' +
      (msg.undo ? '<button type="button" data-action="toast-undo" data-fkey="undo">Undo</button>' : '') +
      '<button type="button" data-action="toast-close" data-fkey="toast-x" aria-label="Dismiss">' + icon("x", 14) + '</button></div>';
  }

  YFP.components = { tags: tags, avatar: avatar, ring: ring, bar: bar, pill: pill, emptyState: emptyState, taskCard: taskCard, toast: toast };
})(window.YFP = window.YFP || {});
