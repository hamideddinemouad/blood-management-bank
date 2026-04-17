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
        <section className="mx-auto max-w-[88rem] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2.25rem] border border-red-100 bg-white/90 shadow-[0_30px_120px_-45px_rgba(127,29,29,0.45)] backdrop-blur">
            <div className="p-8 sm:p-10 lg:p-12">
              <DemoFirstSection
                badge="Try Demo First"
                title="Want to see the product now instead of filling this form?"
                description="Fast Test is the better first click for most visitors. Explore a seeded donor, hospital, admin, or blood lab experience before creating a real account."
                showCta={false}
                className="border-orange-300 bg-gradient-to-br from-orange-50 via-white to-red-50 p-7 sm:p-8 lg:p-10 shadow-[0_35px_100px_-55px_rgba(249,115,22,0.95)]"
                panelTitle="Preview the donor journey instantly"
                panelDescription="Skip registration for now and enter a ready-made BBMS workspace with realistic data already loaded."
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-red-100 bg-white/90 p-8 shadow-[0_24px_80px_-48px_rgba(127,29,29,0.55)]">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-red-100 p-3 text-red-600 shrink-0">
                <BriefcaseMedical className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  What the demo includes
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Preloaded role journeys with no setup friction.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {roleHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
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
              className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Open standard login
              <ArrowRight className="h-5 w-5 shrink-0" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
