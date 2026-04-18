import { ArrowRight, BriefcaseMedical, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import DemoAccessPanel from "../components/DemoAccessPanel";

export default function FastTest() {
  const roleHighlights = [
    {
      title: "Admin",
      text: "Review approvals, facility records, donor records, and platform-wide stats.",
    },
    {
      title: "Donor",
      text: "Open a donor profile with donation history, eligibility info, and upcoming camp visibility.",
    },
    {
      title: "Hospital",
      text: "Browse blood requests, current stock, recent activity, and donor outreach from a real hospital account.",
    },
    {
      title: "Blood Lab",
      text: "Inspect camps, stock, recent donations, and request management in a preloaded lab workspace.",
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.16),_transparent_36%),linear-gradient(180deg,#fffdfd_0%,#fff6f4_100%)]">
      <main className="pt-4 sm:pt-6 lg:pt-8">
        <section className="mx-auto max-w-[88rem] px-3 pb-8 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14">
          <div className="overflow-hidden rounded-[1.5rem] border border-red-100 bg-white/90 shadow-[0_30px_120px_-45px_rgba(127,29,29,0.45)] backdrop-blur sm:rounded-[2rem] lg:rounded-[2.25rem]">
            <div className="p-4 sm:p-8 lg:p-12">
              <div className="rounded-[1.5rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-red-50 p-4 shadow-[0_35px_100px_-55px_rgba(249,115,22,0.95)] sm:rounded-[2rem] sm:p-7 lg:p-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
                  <BriefcaseMedical className="h-4 w-4" />
                  Try Demo First
                </div>
                <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Want a quick preview instead of the form?
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                  Open a seeded donor, hospital, admin, or blood lab experience first.
                </p>
                <div className="mt-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
                    <BriefcaseMedical className="h-4 w-4" />
                    Best first step
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
                    Preview it now
                  </h2>
                </div>
                <div className="mt-5">
                  <DemoAccessPanel
                    title="Demo Access"
                    description="Open a seeded donor, hospital, admin, or blood lab role."
                    variant="priority"
                    showBadge={false}
                    showIntro={false}
                    showMeta={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-3 pb-10 sm:px-6 sm:pb-12 lg:px-8">
          <div className="rounded-[1.5rem] border border-red-100 bg-white/90 p-4 shadow-[0_24px_80px_-48px_rgba(127,29,29,0.55)] sm:rounded-[2rem] sm:p-8">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="shrink-0 rounded-xl bg-red-100 p-2.5 text-red-600 sm:rounded-2xl sm:p-3">
                <BriefcaseMedical className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  What the demo includes
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Preloaded role journeys with no setup.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:mt-8 sm:gap-4 md:grid-cols-2">
              {roleHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:rounded-2xl sm:p-5"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 sm:text-base">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 sm:h-5 sm:w-5" />
                    {item.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <Link
              to="/login"
              className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:mt-8 sm:w-auto sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-base"
            >
              Use standard login
              <ArrowRight className="h-5 w-5 shrink-0" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
