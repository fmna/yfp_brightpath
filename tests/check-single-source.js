/* YFP · tests/check-single-source.js
 * Fails if any business rule is defined outside public/04-mock-data.js
 * (05-build-spec §5.4). Scans public/index.html and public/src/**\/*.js.
 * Run: node tests/check-single-source.js   (no dependencies) */
"use strict";
var fs = require("fs"), path = require("path");

var ROOT = path.join(__dirname, "..", "public");
var RULES = ["status", "buckets", "stats", "started", "isStarted", "teamOrder", "teamAverage", "catalogFor",
  "defaultDue", "canRemove", "makeTask", "t", "stage", "lastActivity", "startingNext", "validateStore", "byDue"];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce(function (out, d) {
    var p = path.join(dir, d.name);
    return out.concat(d.isDirectory() ? walk(p) : /\.js$/.test(d.name) ? [p] : []);
  }, []);
}

var files = [path.join(ROOT, "index.html")].concat(walk(path.join(ROOT, "src")));
var names = RULES.join("|");
var patterns = [
  new RegExp("\\bfunction\\s+(" + names + ")\\s*\\(", "g"),               // function stats(
  new RegExp("\\b(?:var|let|const)\\s+(" + names + ")\\s*=", "g"),        // var stats =
  new RegExp("(?:^|[^.\\w$])(" + names + ")\\s*=(?!=)", "gm"),            // stats = …
  new RegExp("\\.(" + names + ")\\s*=(?!=)", "g"),                        // YFP.stats = …
  new RegExp("[{,]\\s*(" + names + ")\\s*:\\s*(?:function\\b|\\([^)]*\\)\\s*=>|\\w+\\s*=>)", "g") // { stats: function
];

var problems = [];
files.forEach(function (file) {
  var src = fs.readFileSync(file, "utf8");
  src.split(/\r?\n/).forEach(function (line, i) {
    var found = {};
    patterns.forEach(function (re) {
      re.lastIndex = 0;
      var m;
      while ((m = re.exec(line))) found[m[1]] = true;
    });
    Object.keys(found).forEach(function (name) {
      problems.push(path.relative(path.join(ROOT, ".."), file) + ":" + (i + 1) + "  defines rule '" + name + "'  →  " + line.trim());
    });
  });
});

if (problems.length) {
  console.log("FAIL: rule logic defined outside 04-mock-data.js. Use MOCK.helpers instead.");
  problems.forEach(function (p) { console.log("  " + p); });
  process.exit(1);
}
console.log("Single source OK: " + files.length + " files scanned, no rule definitions outside 04-mock-data.js");
