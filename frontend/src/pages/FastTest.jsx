import { ArrowRight, BriefcaseMedical, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import DemoFirstSection from "../components/DemoFirstSection";

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
      <main className="pt-8">
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-red-100 bg-white/90 shadow-[0_30px_120px_-45px_rgba(127,29,29,0.45)] backdrop-blur">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-8 sm:p-10">
                <DemoFirstSection showCta={false} />
              </div>

              <div className="border-t border-red-100 bg-red-50/70 p-8 sm:p-10 lg:border-l lg:border-t-0">
                <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-red-100 p-3 text-red-600">
                      <BriefcaseMedical className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">What the demo includes</h2>
                      <p className="text-sm text-slate-500">Preloaded role journeys with no setup friction.</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {roleHighlights.map((item) => (
                      <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          {item.title}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/login"
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Open standard login
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
