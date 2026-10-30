/* YFP · views/not-found.js
 * Friendly not-found screen for unknown hashes (#settings, #team-dana,
 * #task-alex-nope). The "data didn't load" screen is in main.js, because
 * it has to work when 04-mock-data.js is missing. */
(function (YFP) {
  "use strict";
  if (!YFP.MOCK) return;
  var e = YFP.MOCK.errorScenarios.unknownRoute, esc = YFP.html.esc;

  function notFound() {
    return '<div class="notfound"><span class="av lg av-morgan" aria-hidden="true">?</span>' +
      '<h1>' + esc(e.title) + '</h1><p class="muted">' + esc(e.body) + '</p>' +
      '<button type="button" class="btn btn-primary" data-action="go" data-dest="home" data-fkey="nf-home">' + esc(e.action) + '</button></div>';
  }

  YFP.views = YFP.views || {};
  YFP.views.notFound = notFound;
})(window.YFP = window.YFP || {});
