// Types
type IssueSeverity = "warning" | "info" | "error";

interface CodeLine {
  n: number;
  text: string;
  highlight?: boolean;
}

interface ReviewIssue {
  severity: IssueSeverity;
  title: string;
  body: string;
}

interface WorkflowCard {
  mode: string;
  scenario: string;
  detail: string;
}

interface WorkStep {
  num: string;
  label: string;
  detail: string;
}

// Data
const CODE_LINES: CodeLine[] = [
  { n: 1, text: "public static int sum(int[] arr) {" },
  { n: 2, text: "  int total = 0;" },
  { n: 3, text: "  for (int i = 0; i < arr.length - 1; i++) {", highlight: true },
  { n: 4, text: "    total += arr[i];" },
  { n: 5, text: "  }" },
  { n: 6, text: "  return total;" },
  { n: 7, text: "}" },
];

const ISSUES: ReviewIssue[] = [
  {
    severity: "warning",
    title: "Last element is skipped",
    body: "i < arr.length - 1 stops before the final index. The last element is never added. Trace this with a 3-element array.",
  },
  {
    severity: "info",
    title: "Test case to try",
    body: "sum([1, 2, 3, 4, 5])  →  expected: 15, actual: 10",
  },
];

const REVIEW_MODES = [
  "Find Bugs",
  "Explain Code",
  "Generate Tests",
  "Complexity",
  "Security",
];

const WORKFLOW_CARDS: WorkflowCard[] = [
  {
    mode: "Find Bugs",
    scenario: "Loop exits before the last element",
    detail:
      "Student's binary search throws on even-length arrays. StackTutor flags the off-by-one in the bounds and prompts them to trace the loop — without revealing the fix.",
  },
  {
    mode: "Explain Code",
    scenario: "Recursion terminates but they can't explain why",
    detail:
      "A DFS implementation looks correct but the student can't articulate the base case. StackTutor walks through each call frame using their own variable names.",
  },
  {
    mode: "Generate Tests",
    scenario: "Passes basic tests, breaks on empty input",
    detail:
      "StackTutor generates targeted edge-case tests for null arrays, single elements, and duplicates — exposing gaps the student's own suite missed.",
  },
  {
    mode: "Complexity",
    scenario: "Brute-force solution times out on large inputs",
    detail:
      "Student's O(n²) nested loop fails big test cases. StackTutor analyzes the structure and explains what a linear approach would look like instead.",
  },
];

const STEPS: WorkStep[] = [
  {
    num: "01",
    label: "Paste your code",
    detail: "Java, Python, C++, or TypeScript. No setup or account required to try it.",
  },
  {
    num: "02",
    label: "Choose a review mode",
    detail: "Find bugs, explain logic, generate tests, check complexity, or run a security review.",
  },
  {
    num: "03",
    label: "Get guided feedback",
    detail: "Hints before answers. Structured output you can actually learn from.",
  },
  {
    num: "04",
    label: "Learn what to fix and why",
    detail: "Every issue includes reasoning so you build real debugging instincts, not just copies of fixes.",
  },
];

// Helpers
function severityClasses(severity: IssueSeverity) {
  switch (severity) {
    case "warning":
      return {
        border: "border-amber-400/25",
        bg: "bg-amber-500/10",
        title: "text-amber-200",
        badge: "bg-amber-500/15 text-amber-400",
      };
    case "error":
      return {
        border: "border-red-400/25",
        bg: "bg-red-500/10",
        title: "text-red-200",
        badge: "bg-red-500/15 text-red-400",
      };
    default:
      return {
        border: "border-cyan-400/25",
        bg: "bg-cyan-500/10",
        title: "text-cyan-200",
        badge: "bg-cyan-500/15 text-cyan-400",
      };
  }
}

// Components

function Navbar() {
  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/30 bg-violet-500/15 font-mono text-xs font-bold text-violet-300">
          ST
        </div>
        <span className="text-sm font-semibold tracking-tight text-slate-100">
          StackTutor
        </span>
      </div>
      <div className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
        <a className="transition hover:text-slate-100" href="#features">
          Features
        </a>
        <a className="transition hover:text-slate-100" href="#how-it-works">
          How it works
        </a>
        <a
          href="#waitlist"
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-1.5 text-slate-300 transition hover:border-slate-600 hover:text-white"
        >
          Join the waitlist
        </a>
      </div>
    </nav>
  );
}

function CredibilityPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700/80 bg-slate-900 px-2.5 py-1 font-mono text-[11px] text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
      {label}
    </span>
  );
}

function ProductMockup() {
  const activeMode = "Find Bugs";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50">
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-slate-500">
            ArraySum.java
          </span>
          <span className="rounded border border-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
            Java
          </span>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400">
          Guided
        </span>
      </div>

      {/* Mode tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-900/40">
        {REVIEW_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            className={`flex-shrink-0 border-b-2 px-3.5 py-2 font-mono text-[11px] transition ${
              mode === activeMode
                ? "border-violet-500 text-violet-300"
                : "border-transparent text-slate-600 hover:text-slate-400"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Code editor */}
      <div className="overflow-x-auto bg-slate-950 py-3">
        {CODE_LINES.map((line) => (
          <div
            key={line.n}
            className={`flex border-l-2 ${
              line.highlight
                ? "border-amber-400/60 bg-amber-500/10"
                : "border-transparent"
            }`}
          >
            <span className="w-9 flex-shrink-0 select-none pr-3 pl-3 text-right font-mono text-[11px] leading-6 text-slate-600">
              {line.n}
            </span>
            <span
              className={`flex-1 pr-4 font-mono text-[11px] leading-6 ${
                line.highlight ? "text-amber-100/80" : "text-slate-300"
              }`}
            >
              {line.text}
            </span>
          </div>
        ))}
      </div>

      {/* Issue cards */}
      <div className="border-t border-slate-800 bg-slate-950 p-4 space-y-2">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-600">
          Issues · 1 warning · 1 test hint
        </p>
        {ISSUES.map((issue) => {
          const s = severityClasses(issue.severity);
          return (
            <div
              key={issue.title}
              className={`rounded-lg border ${s.border} ${s.bg} px-3.5 py-3`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ${s.badge}`}
                >
                  {issue.severity}
                </span>
                <span className={`text-xs font-semibold ${s.title}`}>
                  {issue.title}
                </span>
              </div>
              <p className="mt-1.5 font-mono text-[11px] leading-5 text-slate-400">
                {issue.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-start gap-12 px-6 pb-14 pt-10 lg:grid-cols-2 lg:pb-20 lg:pt-14">
      <div className="flex flex-col">
        <div className="mb-5 inline-flex self-start rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
          Built for CS students
        </div>

        <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-white md:text-6xl">
          Guided debugging
          <br />
          <span className="text-slate-400">for students who want</span>
          <br />
          <span className="text-slate-400">to actually learn.</span>
        </h1>

        <p className="mt-4 text-sm font-semibold text-violet-300">
          Learn to debug. Don&apos;t just get the answer.
        </p>

        <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
          StackTutor reviews your code with hints first, not answers — so you
          work through the reasoning yourself and actually build debugging
          instincts.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <CredibilityPill label="Hint-first feedback" />
          <CredibilityPill label="Test-case generation" />
          <CredibilityPill label="Complexity analysis" />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#waitlist"
            className="rounded-lg bg-violet-600 px-5 py-3 text-center text-sm font-medium text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500"
          >
            Join the waitlist
          </a>
          <a
            href="#features"
            className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 text-center text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            See review modes
          </a>
        </div>
      </div>

      <ProductMockup />
    </section>
  );
}

function ReviewModes() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-14">
      <div className="max-w-xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
          Review modes
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Built around how students actually get stuck.
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          Each mode gives you a hint before the answer — so the insight sticks,
          not just the fix.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {WORKFLOW_CARDS.map((card) => (
          <article
            key={card.scenario}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700"
          >
            <div className="mb-3">
              <span className="rounded border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 font-mono text-[11px] text-violet-300">
                {card.mode}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white">{card.scenario}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{card.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-14">
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 md:p-10">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
          How it works
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="rounded-lg border border-slate-800 bg-slate-950 p-5"
            >
              <p className="font-mono text-xs text-slate-600">{step.num}</p>
              <p className="mt-3 text-sm font-semibold text-white">{step.label}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Waitlist() {
  return (
    <section id="waitlist" className="mx-auto max-w-7xl px-6 py-16">
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 md:p-12">
        <div className="mx-auto max-w-md text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Early access
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            StackTutor is coming soon.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            First release supports Java, Python, C++, and TypeScript. Beta
            access for early signups.
          </p>

          <form className="mx-auto mt-7 flex max-w-sm flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@university.edu"
              className="h-11 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-violet-500"
            />
            <button
              type="submit"
              className="h-11 rounded-lg bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              Join the waitlist
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-600">
            No spam. Launch updates and beta access only.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-900 px-6 py-7 text-center">
      <p className="text-xs text-slate-600">
        © 2026 StackTutor · Built by Charles Richards
      </p>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-900">
        <Navbar />
      </header>
      <Hero />
      <ReviewModes />
      <HowItWorks />
      <Waitlist />
      <Footer />
    </main>
  );
}
