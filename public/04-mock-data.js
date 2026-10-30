/* =============================================================================
 * YFP (Your First Path) · 04-mock-data.js
 * Mock onboarding data for the BrightPath Technologies prototype.
 *
 * Companion to (in docs/):
 *   01-pm-brief.md      what and why (wins on any conflict)
 *   02-user-flow.md     demo script, screens, states, rules
 *   03-design-notes.md  visual direction
 *   05-build-spec.md    how the app is built; §5 makes this file the single
 *                       source of truth for data AND rules
 *
 * All data is fictional. No backend, no API, no real people.
 * index.html loads this file at runtime; the app has no inline copy of the
 * data. Rule logic belongs in the helpers below (05-build-spec.md §5).
 *
 * Load it either way:
 *   Browser: <script src="04-mock-data.js"></script>  → window.YFP_MOCK_DATA
 *   Node:    const MOCK = require("./04-mock-data.js")
 *
 * Self-check (Node):  node public/04-mock-data.js   (from the repo root)
 *   Recomputes every persona's progress, buckets and status with the rules
 *   below and compares them with EXPECTED. Exits non-zero on any mismatch.
 * ========================================================================== */
(function (root, factory) {
  var data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  else root.YFP_MOCK_DATA = data;
  if (typeof require === "function" && typeof module === "object" && require.main === module) {
    process.exit(data.helpers.selfCheck(console.log) ? 0 : 1);
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------------------------------------------------------------------------
   * 1. Demo configuration
   * ------------------------------------------------------------------------ */
  var DEMO = {
    // Fixed demo date so the prototype behaves the same every time it is shown.
    today: "2026-10-30", // Friday, Oct 30, 2026
    storageKey: "yfp-demo-v2",
    company: "BrightPath Technologies",
    companySize: 150,
    undoSeconds: 7,
    primaryPersona: "alex",
    secondaryPersona: "morgan",
    // Only these two appear in the role switcher. Brooke and Chris are seen
    // through Morgan's views.
    switchablePersonas: ["alex", "morgan"],
    routes: {
      employeeHome: "#home",
      taskDetail: "#task-{employeeId}-{taskDefId}", // e.g. #task-alex-i9
      managerHome: "#team",
      employeeDetail: "#team-{employeeId}"         // e.g. #team-chris
    }
  };

  /* ---------------------------------------------------------------------------
   * 2. Rules (mirror 02-user-flow.md §6; implemented in helpers below)
   * ------------------------------------------------------------------------ */
  var RULES = {
    buckets: {
      doToday: "Not done, unlocked, and overdue, due today, or due tomorrow",
      doLater: "Not done and due after tomorrow; locked Post-D1 tasks grouped at the bottom",
      done: "Completed",
      sort: "Each bucket sorted by nearest due date"
    },
    locking: "Post-D1 tasks are locked while the demo date is before the employee's start date",
    progress: "Completed tasks / all assigned tasks (locked tasks included)",
    status: {
      needsSupport: "One or more unlocked tasks are past due",
      onTrack: "Everything else"
    },
    stage: "'Starts {date}' before Day 1; 'Day N' (working days since start, inclusive) after",
    managerEdits: [
      "Managers add tasks only from the catalog; no custom tasks",
      "HR-required tasks cannot be removed by a manager",
      "Completed tasks cannot be removed",
      "A task already in the plan cannot be added twice",
      "Pre-D1 tasks cannot be added after the employee's start date",
      "Due date cannot be earlier than the demo date",
      "Default due date = start date + catalog offset; if that has passed, demo date + 2 days"
    ]
  };

  /* ---------------------------------------------------------------------------
   * 3. People
   *    Morgan manages Alex, Brooke and Chris (all on the Product team).
   * ------------------------------------------------------------------------ */
  var PEOPLE = {
    morgan: {
      id: "morgan", name: "Morgan Miller", first: "Morgan", initials: "MM",
      kind: "manager", role: "Hiring manager, Product", dept: "Product",
      workEmail: "morgan.miller@brightpath.example",
      directReports: ["alex", "brooke", "chris"]
    },
    alex: {
      id: "alex", name: "Alex Anderson", first: "Alex", initials: "AA",
      kind: "employee", role: "Associate Product Manager", dept: "Product",
      start: "2026-11-02", managerId: "morgan",
      // Pre-boarding access uses the personal email (01-pm-brief, Access Assumptions).
      personalEmail: "alex.anderson.mail@example.com",
      workEmail: "alex.anderson@brightpath.example",
      demoRole: "Primary persona: pre-boarding, in progress"
    },
    brooke: {
      id: "brooke", name: "Brooke Bennett", first: "Brooke", initials: "BB",
      kind: "employee", role: "Product Designer", dept: "Product",
      start: "2026-10-30", managerId: "morgan",
      personalEmail: "brooke.bennett.mail@example.com",
      workEmail: "brooke.bennett@brightpath.example",
      demoRole: "Success state: all Pre-D1 done, on track on Day 1"
    },
    chris: {
      id: "chris", name: "Chris Carter", first: "Chris", initials: "CC",
      kind: "employee", role: "Product Manager II", dept: "Product",
      start: "2026-10-26", managerId: "morgan",
      personalEmail: "chris.carter.mail@example.com",
      workEmail: "chris.carter@brightpath.example",
      demoRole: "Needs support: highest progress, but 2 tasks overdue"
    }
  };
  var EMPLOYEE_ORDER = ["alex", "brooke", "chris"];

  // Who can appear in a task's "Assigned by" line.
  var ASSIGNERS = {
    hr: { label: "BrightPath HR (required)", short: "HR" },
    morgan: { label: "Morgan Miller, your manager", short: "Morgan Miller" }
  };

  /* ---------------------------------------------------------------------------
   * 4. Task definitions (what a task is)
   *    timing: "pre" (Pre-D1) | "post" (Post-D1)
   *    type:   "ar" (Action required) | "review"
   *    source: "hr" (HR-required, can't be removed) | "cat" (from catalog)
   *    offset: catalog only; default due date = start date + offset days
   *    today:  where this information lives at BrightPath before YFP,
   *            the fragmentation the brief describes
   *    Every task has exactly one resource link (02-user-flow §5.2).
   * ------------------------------------------------------------------------ */
  var TASK_DEFS = {
    /* ----- HR-required ----- */
    offer: {
      title: "Sign your offer letter", timing: "pre", type: "ar", source: "hr",
      desc: "Review and e-sign your offer letter and employment agreement so HR can finalize your start.",
      steps: ["Open your offer letter using the link above", "Review the agreement and e-sign", "Download a copy for your records"],
      link: { label: "Open your offer letter", url: "https://sign.brightpath.com/offer-letter", src: "Signing" },
      today: { channel: "HR message", detail: "E-signature request emailed by the recruiter after the verbal offer" }
    },
    i9: {
      title: "Complete I-9 and tax forms", timing: "pre", type: "ar", source: "hr",
      desc: "Submit your I-9 eligibility form and W-4 so payroll is ready before your first paycheck.",
      steps: ["Open the HR forms portal using the link above", "Fill in I-9 Section 1 and your W-4", "Bring your ID documents on Day 1 for verification"],
      link: { label: "Open the HR forms portal", url: "https://hr.brightpath.com/forms/i9-w4", src: "HR portal" },
      today: { channel: "Welcome email", detail: "Portal link buried in paragraph 3 of the HR welcome email" }
    },
    deposit: {
      title: "Set up direct deposit", timing: "pre", type: "ar", source: "hr",
      desc: "Add your bank details so your first paycheck arrives on time.",
      steps: ["Open the payroll portal using the link above", "Add your routing and account numbers", "Confirm the test deposit amount"],
      link: { label: "Open the payroll portal", url: "https://payroll.brightpath.com/direct-deposit", src: "Payroll" },
      today: { channel: "HR message", detail: "Separate payroll email sent a few days after the welcome email" }
    },
    photo: {
      title: "Upload a badge photo", timing: "pre", type: "ar", source: "hr",
      desc: "Your photo is used for your building badge and your employee profile.",
      steps: ["Use a clear, front-facing photo", "Upload it on your profile page using the link above"],
      link: { label: "Upload your photo", url: "https://people.brightpath.com/profile/photo", src: "People directory" },
      today: { channel: "Spreadsheet", detail: "Facilities tracks badge photos in a shared 'New hire badges' spreadsheet" }
    },
    orientation: {
      title: "Attend Day 1 orientation", timing: "post", type: "ar", source: "hr",
      desc: "A 90-minute session with HR covering benefits, policies and how BrightPath works.",
      steps: ["Join at 9:30 AM in the Atrium, or use the video link on the agenda", "Bring your ID documents for I-9 verification"],
      link: { label: "View the orientation agenda and video link", url: "https://hr.brightpath.com/orientation", src: "HR portal" },
      today: { channel: "HR message", detail: "Calendar invite from HR with the agenda attached as a PDF" }
    },
    laptop: {
      title: "Set up your laptop and accounts", timing: "post", type: "ar", source: "hr",
      desc: "Pick up your laptop from IT and sign in to email, chat and the HR portal.",
      steps: ["Pick up your laptop at the IT desk and follow the setup guide", "Set up your password and two-factor sign-in", "Sign in to email, chat and the HR portal"],
      link: { label: "Open the IT setup guide", url: "https://it.brightpath.com/new-hire-setup", src: "IT help center" },
      today: { channel: "Shared document", detail: "IT setup checklist in a shared doc linked from the welcome email" }
    },

    /* ----- Catalog (managers can add these) ----- */
    handbook: {
      title: "Read the Employee Handbook", timing: "pre", type: "review", source: "cat", offset: -1,
      desc: "Get familiar with BrightPath policies, time off, and how we work together.",
      steps: ["Read sections 1 to 4 (about 25 minutes)", "Note any questions for orientation"],
      link: { label: "Open the Employee Handbook", url: "https://wiki.brightpath.com/employee-handbook", src: "Company wiki" },
      today: { channel: "Shared document", detail: "Handbook PDF attached to the HR welcome email" }
    },
    welcome: {
      title: "Watch the Welcome to BrightPath video", timing: "pre", type: "review", source: "cat", offset: -5,
      desc: "A 12-minute video from our CEO on BrightPath's mission, customers and values.",
      steps: ["Watch the video using the link above", "Note one thing you want to learn more about"],
      link: { label: "Watch Welcome to BrightPath (12 min)", url: "https://comms.brightpath.com/videos/welcome-to-brightpath", src: "Internal comms" },
      today: { channel: "Welcome email", detail: "Video link at the bottom of the CEO welcome email" }
    },
    orgchart: {
      title: "Review the org chart", timing: "pre", type: "review", source: "cat", offset: -1,
      desc: "See who's who on your team and the teams you'll work with most.",
      steps: ["Find your team and your manager", "Note two people outside your team to meet"],
      link: { label: "Open the org chart", url: "https://people.brightpath.com/org-chart/product", src: "People directory" },
      today: { channel: "Spreadsheet", detail: "Team roster spreadsheet the manager shares by message" }
    },
    one1: {
      title: "Schedule a 1:1 with your manager", timing: "post", type: "ar", source: "cat", offset: 1,
      desc: "Set up your first weekly 1:1 so you have a regular check-in from week one.",
      steps: ["Find a 30-minute slot on your manager's calendar", "Send the invite with a short agenda"],
      link: { label: "Open Morgan’s calendar", url: "https://calendar.brightpath.com/people/morgan-miller", src: "Calendar" },
      today: { channel: "Manager message", detail: "Mentioned in the manager's first-week chat message" }
    },
    buddy: {
      title: "Meet your onboarding buddy", timing: "post", type: "ar", source: "cat", offset: 2,
      desc: "A 30-minute coffee chat with the teammate who will help you settle in.",
      steps: ["Accept the calendar invite using the link above", "Bring questions about tools and team habits"],
      link: { label: "Open the buddy chat invite", url: "https://calendar.brightpath.com/invites/buddy-coffee-chat", src: "Calendar" },
      today: { channel: "Spreadsheet", detail: "Buddy pairings tracked in HR's 'Onboarding buddies' spreadsheet" }
    },
    wiki: {
      title: "Review the Team Wiki", timing: "post", type: "review", source: "cat", offset: 4,
      desc: "Learn your team's projects, rituals and where documents live.",
      steps: ["Read the team overview page", "Bookmark the projects and rituals pages"],
      link: { label: "Open the Product Team Wiki", url: "https://wiki.brightpath.com/teams/product", src: "Company wiki" },
      today: { channel: "Manager message", detail: "Wiki link pinned in the team chat channel" }
    },
    security: {
      title: "Complete security and compliance training", timing: "post", type: "ar", source: "cat", offset: 2,
      desc: "Required training on data handling, phishing and acceptable use. About 45 minutes.",
      steps: ["Start the course using the link above", "Complete all modules and the short quiz"],
      link: { label: "Start the training in BrightPath Learn", url: "https://learn.brightpath.com/courses/security-compliance-101", src: "Learning portal" },
      today: { channel: "HR message", detail: "Automated reminder email from the learning portal" }
    },
    expense: {
      title: "Review the expense policy", timing: "post", type: "review", source: "cat", offset: 7,
      desc: "Understand what you can expense and how to submit receipts.",
      steps: ["Read the policy page", "Install the expenses app on your phone"],
      link: { label: "Read the expense policy", url: "https://wiki.brightpath.com/policies/expenses", src: "Company wiki" },
      today: { channel: "Shared document", detail: "Policy doc in the Finance shared drive, found by asking around" }
    },
    goals: {
      title: "Set 30-day goals with your manager", timing: "post", type: "ar", source: "cat", offset: 9,
      desc: "Agree on 3 to 5 goals for your first month and how you'll measure them.",
      steps: ["Draft your goals in the shared template", "Review them in your 1:1"],
      link: { label: "Open the 30-day goals template", url: "https://docs.brightpath.com/templates/30-day-goals", src: "Docs" },
      today: { channel: "Shared document", detail: "Goals template copied from a previous hire's doc" }
    },
    benefits: {
      title: "Enroll in benefits", timing: "post", type: "ar", source: "cat", offset: 10,
      desc: "Choose your health, dental and retirement options within your enrollment window.",
      steps: ["Open the benefits portal using the link above", "Pick your plans and add dependents"],
      link: { label: "Open the benefits portal", url: "https://benefits.brightpath.com/enroll", src: "Benefits portal" },
      today: { channel: "HR message", detail: "Enrollment deadline sent in an HR benefits email" }
    }
  };

  /* ---------------------------------------------------------------------------
   * 5. Task catalog (10 items, HR-curated; managers pick from it)
   *    Listed in the order the Add task dialog shows them.
   * ------------------------------------------------------------------------ */
  var CATALOG = ["handbook", "welcome", "orgchart", "one1", "buddy", "wiki", "security", "expense", "goals", "benefits"];

  /* ---------------------------------------------------------------------------
   * 6. Seed assignments (starting state on the demo date)
   *    t(defId, due, doneOn?, addedBy?)
   *    addedBy defaults to "hr" for HR tasks, "morgan" for catalog tasks.
   * ------------------------------------------------------------------------ */
  function t(def, due, doneOn, addedBy) {
    return {
      def: def, due: due, done: !!doneOn, doneOn: doneOn || null,
      addedBy: addedBy || (TASK_DEFS[def].source === "hr" ? "hr" : "morgan"),
      justNow: false, isNew: false
    };
  }

  function seed() {
    return {
      // ALEX: pre-boarding, starts Mon Nov 2 (3 days away). 2 of 11 done = 18%.
      // Pre-D1 2/6. Post-D1 5 tasks, all locked. On track.
      alex: emp("alex", [
        t("offer",       "2026-10-23", "2026-10-21"),
        t("welcome",     "2026-10-28", "2026-10-27"),
        t("i9",          "2026-10-30"),              // due today → DEMO TASK, Next up
        t("deposit",     "2026-10-31"),              // due tomorrow → Do today
        t("handbook",    "2026-11-01"),              // Do later
        t("photo",       "2026-11-01"),              // Do later
        t("orientation", "2026-11-02"),              // locked
        t("laptop",      "2026-11-02"),              // locked
        t("buddy",       "2026-11-04"),              // locked
        t("wiki",        "2026-11-06"),              // locked
        t("security",    "2026-11-09")               // locked
      ]),

      // BROOKE: Day 1 today. 6 of 11 done = 55%. All Pre-D1 done (6/6).
      // Orientation and laptop due today (not overdue). On track.
      brooke: emp("brooke", [
        t("offer",       "2026-10-16", "2026-10-14"),
        t("welcome",     "2026-10-24", "2026-10-22"),
        t("i9",          "2026-10-27", "2026-10-26"),
        t("deposit",     "2026-10-28", "2026-10-27"),
        t("photo",       "2026-10-29", "2026-10-28"),
        t("handbook",    "2026-10-29", "2026-10-29"),
        t("orientation", "2026-10-30"),
        t("laptop",      "2026-10-30"),
        t("one1",        "2026-11-02"),
        t("buddy",       "2026-11-03"),
        t("wiki",        "2026-11-05")
      ]),

      // CHRIS: Day 5. 8 of 12 done = 67% (highest on the team).
      // Security training (Oct 28) and buddy chat (Oct 29) overdue → Needs support.
      chris: emp("chris", [
        t("offer",       "2026-10-12", "2026-10-09"),
        t("welcome",     "2026-10-20", "2026-10-19"),
        t("i9",          "2026-10-22", "2026-10-22"),
        t("deposit",     "2026-10-23", "2026-10-23"),
        t("photo",       "2026-10-24", "2026-10-23"),
        t("handbook",    "2026-10-25", "2026-10-25"),
        t("orientation", "2026-10-26", "2026-10-26"),
        t("laptop",      "2026-10-26", "2026-10-26"),
        t("security",    "2026-10-28"),              // overdue 2 days (oldest)
        t("buddy",       "2026-10-29"),              // overdue 1 day
        t("wiki",        "2026-11-02"),
        t("goals",       "2026-11-04")
      ])
    };
  }

  function emp(id, tasks) {
    var p = PEOPLE[id];
    return { id: p.id, name: p.name, first: p.first, initials: p.initials, role: p.role, dept: p.dept, start: p.start, tasks: tasks };
  }

  /* ---------------------------------------------------------------------------
   * 7. Demo script data (02-user-flow §3)
   * ------------------------------------------------------------------------ */
  var DEMO_SCRIPT = {
    complete: { employee: "alex", task: "i9", route: "#task-alex-i9", nextUpAfter: "deposit" },
    addTask: {
      employee: "alex", catalogItem: "orgchart", // Pre-D1, offset -1 → due Sun Nov 1
      defaultDue: "2026-11-01", landsIn: "Do later"
    },
    removeTask: { employee: "alex", task: "orgchart", note: "Remove the task just added, then Undo" },
    reviewPlan: { employee: "chris", route: "#team-chris" }
  };

  /* ---------------------------------------------------------------------------
   * 8. Expected values (the build should show exactly these)
   *    pct is rounded: Math.round(done / total * 100)
   * ------------------------------------------------------------------------ */
  var EXPECTED = {
    start: {
      alex: {
        stage: "Starts Mon, Nov 2", status: "On track", done: 2, total: 11, pct: 18,
        preDone: 2, pre: 6, postDone: 0, post: 5, overdue: 0, daysToStart: 3,
        nextUp: "i9",
        buckets: { today: ["i9", "deposit"], later: ["handbook", "photo"],
                   locked: ["orientation", "laptop", "buddy", "wiki", "security"], done: ["offer", "welcome"] }
      },
      brooke: {
        stage: "Day 1", status: "On track", done: 6, total: 11, pct: 55,
        preDone: 6, pre: 6, postDone: 0, post: 5, overdue: 0,
        nextUp: "orientation",
        buckets: { today: ["orientation", "laptop"], later: ["one1", "buddy", "wiki"],
                   locked: [], done: ["offer", "welcome", "i9", "deposit", "photo", "handbook"] }
      },
      chris: {
        stage: "Day 5", status: "Needs support", done: 8, total: 12, pct: 67,
        preDone: 6, pre: 6, postDone: 2, post: 6, overdue: 2, oldestOverdue: "security",
        nextUp: "security",
        buckets: { today: ["security", "buddy"], later: ["wiki", "goals"], locked: [],
                   done: ["offer", "welcome", "i9", "deposit", "photo", "handbook", "orientation", "laptop"] }
      },
      team: {
        averagePct: 47, needSupport: ["chris"], startingNext: { employee: "alex", preD1Left: 4 },
        // Manager table: needs support first, then by start date.
        rowOrder: ["chris", "brooke", "alex"],
        highestPct: "chris"
      }
    },
    afterComplete: { // Alex marks "Complete I-9 and tax forms" as complete
      alex: { done: 3, total: 11, pct: 27, preDone: 3, nextUp: "deposit", latestActivity: "Just now" },
      toast: "Task completed. Your progress went from 18% to 27%.",
      team: { averagePct: 50, highestPct: "chris" }
    },
    afterAdd: { // Morgan adds "Review the org chart" to Alex's plan (after the completion)
      alex: { done: 3, total: 12, pct: 25 },
      toast: "Added “Review the org chart” to Alex’s plan.",
      team: { averagePct: 49 }
    },
    afterRemove: { // Morgan removes it again
      alex: { done: 3, total: 11, pct: 27 },
      toast: "Removed “Review the org chart” from Alex’s plan.",
      team: { averagePct: 50 }
    },
    catalogForAlex: {
      available: ["orgchart", "one1", "expense", "goals", "benefits"],
      unavailable: { handbook: "already", welcome: "already", buddy: "already", wiki: "already", security: "already" }
    },
    catalogForChris: {
      available: ["one1", "expense", "benefits"],
      unavailable: { handbook: "already", welcome: "already", orgchart: "preAfterStart",
                     buddy: "already", wiki: "already", security: "already", goals: "already" }
    }
  };

  /* ---------------------------------------------------------------------------
   * 9. Empty states (02-user-flow §5.5). Copy matches index.html.
   * ------------------------------------------------------------------------ */
  var EMPTY_STATES = {
    doTodayEmpty: {
      where: "Employee board, Do today column",
      when: "No unlocked open task is overdue, due today or due tomorrow",
      title: "Nothing due right now", body: "Tasks due today or tomorrow will show up here.",
      reproduce: "Fixture 'alexAllCaughtUp'"
    },
    doLaterEmpty: {
      where: "Employee board, Do later column",
      when: "No open task due after tomorrow",
      title: "Nothing coming up", titleWhenLockedExist: "No other open tasks", body: "",
      reproduce: "Fixture 'alexAllCaughtUp' (shows the locked-tasks variant)"
    },
    doneEmpty: {
      where: "Employee board, Done column",
      when: "No completed tasks yet",
      title: "No completed tasks yet", body: "Finish a task and it moves here.",
      reproduce: "Fixture 'alexFreshStart'"
    },
    allCaughtUp: {
      where: "Employee dashboard, Next up card",
      when: "No unlocked open tasks",
      title: "You’re all caught up",
      body: "{n} more tasks unlock on {startDate}.",
      bodyWhenNoneLocked: "Nice work. Your manager can see your progress.",
      reproduce: "Fixture 'alexAllCaughtUp' → '5 more tasks unlock on Mon, Nov 2.'"
    },
    managerNothingOpen: {
      where: "Manager table, Next due column",
      when: "Employee has no open unlocked tasks",
      title: "Nothing open",
      reproduce: "Fixture 'alexAllCaughtUp', then open #team"
    },
    catalogExhausted: {
      where: "Add task dialog",
      when: "Every catalog task is already in the plan",
      title: "Every catalog task is already in {first}’s plan",
      body: "Remove a task first if you want to re-add it with a new due date.",
      reproduce: "Fixture 'alexCatalogExhausted'"
    }
  };

  /* ---------------------------------------------------------------------------
   * 10. Error and edge scenarios
   * ------------------------------------------------------------------------ */
  var ERROR_SCENARIOS = {
    catalogAlreadyInPlan: {
      where: "Add task dialog", trigger: "Open Add task for Alex",
      expect: "Handbook, Welcome video, Buddy, Team Wiki and Security training are dimmed",
      reason: "Already in {first}’s plan"
    },
    catalogPreD1AfterStart: {
      where: "Add task dialog", trigger: "Open Add task for Chris (started Oct 26)",
      expect: "'Review the org chart' is dimmed",
      reason: "Pre-D1 tasks can’t be added after the start date"
    },
    dueDateInPast: {
      where: "Add task dialog, Due date field", trigger: "Try to pick a date before Oct 30, 2026",
      expect: "Date input has min = demo date; earlier dates can't be chosen"
    },
    removeHrRequired: {
      where: "Employee Detail", trigger: "Look for a trash icon on 'Complete I-9 and tax forms'",
      expect: "No remove action; shows a 'Required' marker",
      tooltip: "Required tasks are managed by HR"
    },
    removeCompleted: {
      where: "Employee Detail", trigger: "Look for a trash icon on Alex's 'Watch the Welcome to BrightPath video'",
      expect: "No remove action, so the record of progress stays intact"
    },
    lockedTaskOpened: {
      where: "Task Detail", trigger: "Alex opens 'Attend Day 1 orientation' (#task-alex-orientation)",
      expect: "Read-only panel, disabled button 'Available on Mon, Nov 2', resource link greyed out",
      notice: "This is a Post-D1 task. It unlocks on your first day, Monday, November 2.",
      linkPlaceholder: "Link available on Mon, Nov 2"
    },
    overdueTaskOpened: {
      where: "Task Detail", trigger: "Fixture 'alexOverdue', open #task-alex-i9",
      notice: "This task is overdue. Finish it as soon as you can, or reach out to your manager if you’re stuck."
    },
    taskRemovedWhileOpen: {
      where: "Task Detail", trigger: "Fixture 'alexTaskRemoved', open #task-alex-photo",
      title: "This task isn’t in your plan",
      body: "It may have been removed by your manager. Go back to your dashboard to see your current tasks.",
      action: "Back to dashboard"
    },
    unknownRoute: {
      where: "Any", trigger: "Open #settings, or #team-dana (no such employee), or #task-alex-nope",
      title: "We couldn’t find that page",
      body: "The link may be out of date. Pick where you want to go.",
      action: "Go to Alex’s dashboard"
    },
    prototypeLink: {
      where: "Task Detail resource link", trigger: "Click any unlocked resource link",
      expect: "No navigation; toast names the internal page",
      toast: "Prototype link. In the live product this opens {url}"
    },
    storageCorrupt: {
      where: "App load", trigger: "localStorage['yfp-demo-v2'] holds invalid JSON (fixture 'corruptStorage')",
      expect: "App ignores it and loads the seed silently"
    },
    storageUnavailable: {
      where: "App load", trigger: "Private window or blocked site data (localStorage throws)",
      expect: "App runs from the in-memory seed; changes last until the page reloads"
    },
    resetDemo: {
      where: "Top bar", trigger: "Click Reset demo",
      toast: "Demo data reset to the starting state."
    }
  };

  /* ---------------------------------------------------------------------------
   * 11. Fixtures: alternate starting states for showing the states above.
   *     Each returns a fresh copy of the store. Not used by the main demo.
   * ------------------------------------------------------------------------ */
  var FIXTURES = {
    alexAllCaughtUp: {
      description: "All of Alex's Pre-D1 tasks done; only locked Post-D1 remain (6/11 = 55%)",
      build: function () {
        var s = seed();
        s.alex.tasks.forEach(function (x) { if (TASK_DEFS[x.def].timing === "pre" && !x.done) { x.done = true; x.doneOn = DEMO.today; } });
        return s;
      }
    },
    alexFreshStart: {
      description: "Alex has done nothing yet (0/11 = 0%); Done column empty",
      build: function () {
        var s = seed();
        s.alex.tasks.forEach(function (x) { x.done = false; x.doneOn = null; });
        return s;
      }
    },
    alexOverdue: {
      description: "Alex's I-9 was due Oct 28 and is still open → Alex needs support",
      build: function () {
        var s = seed();
        find(s.alex, "i9").due = "2026-10-28";
        return s;
      }
    },
    alexTaskRemoved: {
      description: "Badge photo (HR task) removed from the data to simulate a stale link",
      build: function () {
        var s = seed();
        s.alex.tasks = s.alex.tasks.filter(function (x) { return x.def !== "photo"; });
        return s;
      }
    },
    alexCatalogExhausted: {
      description: "Every catalog item is in Alex's plan; Add task shows the empty state",
      build: function () {
        var s = seed();
        CATALOG.forEach(function (c) {
          if (!find(s.alex, c)) {
            s.alex.tasks.push(t(c, defaultDue(s.alex, c)));
          }
        });
        return s;
      }
    },
    corruptStorage: {
      description: "Raw string to put in localStorage to test the corrupt-storage fallback",
      raw: "{\"alex\":{\"tasks\":[{\"def\":\"i9\""
    }
  };

  /* ---------------------------------------------------------------------------
   * 12. Helpers: the same rules as index.html, used by the self-check
   * ------------------------------------------------------------------------ */
  function D(s) { var a = s.split("-"); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function addDays(s, n) { var d = D(s); d.setDate(d.getDate() + n); return iso(d); }
  function find(e, def) { for (var i = 0; i < e.tasks.length; i++) if (e.tasks[i].def === def) return e.tasks[i]; return null; }
  function started(e, today) { return (today || DEMO.today) >= e.start; }
  function status(e, tk, today) {
    today = today || DEMO.today;
    if (tk.done) return "done";
    if (TASK_DEFS[tk.def].timing === "post" && !started(e, today)) return "locked";
    if (tk.due < today) return "overdue";
    if (tk.due <= addDays(today, 1)) return "today";
    return "later";
  }
  function byDue(a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; }
  function buckets(e) {
    var b = { today: [], later: [], locked: [], done: [] };
    e.tasks.slice().sort(byDue).forEach(function (tk) {
      var s = status(e, tk);
      b[s === "overdue" ? "today" : s].push(tk.def);
    });
    return b;
  }
  function workday(start, today) {
    var n = 0, d = D(start), end = D(today || DEMO.today);
    while (d <= end) { var w = d.getDay(); if (w !== 0 && w !== 6) n++; d.setDate(d.getDate() + 1); }
    return n;
  }
  function fmt(s) { return D(s).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }
  function stats(e) {
    var total = e.tasks.length, done = e.tasks.filter(function (x) { return x.done; }).length;
    var overdue = e.tasks.filter(function (x) { return status(e, x) === "overdue"; }).sort(byDue);
    var pre = e.tasks.filter(function (x) { return TASK_DEFS[x.def].timing === "pre"; });
    var preDone = pre.filter(function (x) { return x.done; }).length;
    var open = e.tasks.filter(function (x) { var s = status(e, x); return s !== "done" && s !== "locked"; }).sort(byDue);
    return {
      done: done, total: total, pct: total ? Math.round(done / total * 100) : 0,
      pre: pre.length, preDone: preDone, post: total - pre.length, postDone: done - preDone,
      overdue: overdue.length, oldestOverdue: overdue[0] ? overdue[0].def : undefined,
      nextUp: open[0] ? open[0].def : null,
      status: overdue.length ? "Needs support" : "On track",
      stage: started(e) ? "Day " + workday(e.start) : "Starts " + fmt(e.start)
    };
  }
  function teamAverage(store) {
    return Math.round(EMPLOYEE_ORDER.reduce(function (a, k) { return a + stats(store[k]).pct; }, 0) / EMPLOYEE_ORDER.length);
  }
  // Pre-filled due date in the Add task dialog. Never in the past:
  // start date + catalog offset, or demo date + 2 days if that has passed.
  function defaultDue(e, def, today) {
    today = today || DEMO.today;
    var due = addDays(e.start, TASK_DEFS[def].offset || 0);
    return due < today ? addDays(today, 2) : due;
  }
  function catalogFor(e) {
    var res = { available: [], unavailable: {} };
    CATALOG.forEach(function (c) {
      if (find(e, c)) res.unavailable[c] = "already";
      else if (TASK_DEFS[c].timing === "pre" && started(e)) res.unavailable[c] = "preAfterStart";
      else res.available.push(c);
    });
    return res;
  }

  function selfCheck(log) {
    log = log || function () {};
    var fails = 0;
    function eq(label, actual, expected) {
      var a = JSON.stringify(actual), x = JSON.stringify(expected);
      if (a !== x) { fails++; log("FAIL " + label + ": got " + a + ", expected " + x); }
    }
    var s = seed();

    // Integrity
    Object.keys(s).forEach(function (k) {
      var seen = {};
      s[k].tasks.forEach(function (x) {
        if (!TASK_DEFS[x.def]) { fails++; log("FAIL unknown def " + x.def); }
        if (seen[x.def]) { fails++; log("FAIL duplicate " + k + "-" + x.def); }
        seen[x.def] = 1;
        if (x.done && x.doneOn > DEMO.today) { fails++; log("FAIL future completion " + k + "-" + x.def); }
        if (TASK_DEFS[x.def].timing === "pre" && x.due >= s[k].start) { fails++; log("FAIL Pre-D1 due on/after start " + k + "-" + x.def); }
      });
      if (PEOPLE[k].managerId !== "morgan") { fails++; log("FAIL manager " + k); }
    });
    if (CATALOG.length < 5 || CATALOG.length > 10) { fails++; log("FAIL catalog size"); }
    CATALOG.forEach(function (c) { if (TASK_DEFS[c].source !== "cat" || typeof TASK_DEFS[c].offset !== "number") { fails++; log("FAIL catalog item " + c); } });

    // Starting state
    EMPLOYEE_ORDER.forEach(function (k) {
      var st = stats(s[k]), ex = EXPECTED.start[k];
      Object.keys(ex).forEach(function (f) {
        if (f === "buckets") eq(k + ".buckets", buckets(s[k]), ex.buckets);
        else if (f === "daysToStart") eq(k + ".daysToStart", Math.round((D(s[k].start) - D(DEMO.today)) / 864e5), ex.daysToStart);
        else eq(k + "." + f, st[f], ex[f]);
      });
    });
    eq("team.averagePct", teamAverage(s), EXPECTED.start.team.averagePct);
    var pcts = EMPLOYEE_ORDER.map(function (k) { return [k, stats(s[k]).pct]; }).sort(function (a, b) { return b[1] - a[1]; });
    eq("team.highestPct", pcts[0][0], EXPECTED.start.team.highestPct);
    eq("team.needSupport", EMPLOYEE_ORDER.filter(function (k) { return stats(s[k]).overdue > 0; }), EXPECTED.start.team.needSupport);
    eq("team.startingNext.preD1Left", stats(s.alex).pre - stats(s.alex).preDone, EXPECTED.start.team.startingNext.preD1Left);
    var rows = EMPLOYEE_ORDER.slice().sort(function (a, b) {
      var ra = stats(s[a]).overdue > 0 ? 0 : 1, rb = stats(s[b]).overdue > 0 ? 0 : 1;
      return ra - rb || (s[a].start < s[b].start ? -1 : 1);
    });
    eq("team.rowOrder", rows, EXPECTED.start.team.rowOrder);
    eq("catalogForAlex", catalogFor(s.alex), EXPECTED.catalogForAlex);
    eq("catalogForChris", catalogFor(s.chris), EXPECTED.catalogForChris);
    eq("defaultDue.future", defaultDue(s.alex, "orgchart"), "2026-11-01");
    eq("defaultDue.past", defaultDue(s.chris, "one1"), "2026-11-01"); // Oct 27 has passed → Oct 30 + 2

    // Step 3: Alex completes the I-9
    var i9 = find(s.alex, "i9"); i9.done = true; i9.doneOn = DEMO.today;
    var a1 = stats(s.alex);
    eq("afterComplete.pct", a1.pct, EXPECTED.afterComplete.alex.pct);
    eq("afterComplete.nextUp", a1.nextUp, EXPECTED.afterComplete.alex.nextUp);
    eq("afterComplete.team", teamAverage(s), EXPECTED.afterComplete.team.averagePct);

    // Step 8: Morgan adds the org chart review
    var item = DEMO_SCRIPT.addTask.catalogItem;
    eq("addTask.defaultDue", addDays(s.alex.start, TASK_DEFS[item].offset), DEMO_SCRIPT.addTask.defaultDue);
    s.alex.tasks.push(t(item, DEMO_SCRIPT.addTask.defaultDue));
    eq("afterAdd.pct", stats(s.alex).pct, EXPECTED.afterAdd.alex.pct);
    eq("afterAdd.team", teamAverage(s), EXPECTED.afterAdd.team.averagePct);
    eq("afterAdd.bucket", buckets(s.alex).later.indexOf(item) > -1, true);

    // Step 9: Morgan removes it
    s.alex.tasks = s.alex.tasks.filter(function (x) { return x.def !== item; });
    eq("afterRemove.pct", stats(s.alex).pct, EXPECTED.afterRemove.alex.pct);
    eq("afterRemove.team", teamAverage(s), EXPECTED.afterRemove.team.averagePct);

    // Fixtures
    var f1 = FIXTURES.alexAllCaughtUp.build();
    eq("fixture.allCaughtUp.nextUp", stats(f1.alex).nextUp, null);
    eq("fixture.allCaughtUp.locked", buckets(f1.alex).locked.length, 5);
    eq("fixture.freshStart.done", buckets(FIXTURES.alexFreshStart.build().alex).done.length, 0);
    eq("fixture.overdue.status", stats(FIXTURES.alexOverdue.build().alex).status, "Needs support");
    eq("fixture.removed", find(FIXTURES.alexTaskRemoved.build().alex, "photo"), null);
    eq("fixture.exhausted", catalogFor(FIXTURES.alexCatalogExhausted.build().alex).available.length, 0);
    var corruptOk = false; try { JSON.parse(FIXTURES.corruptStorage.raw); } catch (e) { corruptOk = true; }
    eq("fixture.corrupt", corruptOk, true);
    eq("seed is fresh each call", stats(seed().alex).pct, 18);

    log(fails ? fails + " check(s) failed" : "All checks passed");
    return fails === 0;
  }

  return {
    demo: DEMO,
    rules: RULES,
    people: PEOPLE,
    employeeOrder: EMPLOYEE_ORDER,
    assigners: ASSIGNERS,
    taskDefs: TASK_DEFS,
    catalog: CATALOG,
    seed: seed,                 // returns a fresh copy of the starting store
    demoScript: DEMO_SCRIPT,
    expected: EXPECTED,
    emptyStates: EMPTY_STATES,
    errorScenarios: ERROR_SCENARIOS,
    fixtures: FIXTURES,
    helpers: { status: status, buckets: buckets, stats: stats, teamAverage: teamAverage, catalogFor: catalogFor, defaultDue: defaultDue, addDays: addDays, selfCheck: selfCheck }
  };
});
