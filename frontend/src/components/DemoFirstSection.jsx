import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import DemoAccessPanel from "./DemoAccessPanel";

export default function DemoFirstSection({
  badge = "Try Demo First",
  title = "Want to see the product now instead of filling this form?",
  description = "Fast Test is the better first click for most visitors. Explore a seeded donor, hospital, admin, or blood lab experience before creating a real account.",
  ctaLabel = "Open Fast Test",
  ctaTo = "/fast-test",
  showCta = true,
  panelTitle = "Preview the donor journey instantly",
  panelDescription = "Skip registration for now and enter a ready-made BBMS workspace with realistic data already loaded.",
}) {
  return (
    <div className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-[0_30px_90px_-45px_rgba(249,115,22,0.65)]">
      <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
        <Sparkles className="h-4 w-4" />
        {badge}
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {description}
          </p>
        </div>

        {showCta ? (
          <Link
            to={ctaTo}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-base font-semibold text-white shadow-[0_20px_45px_-20px_rgba(249,115,22,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-400"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <div className="mt-5">
        <DemoAccessPanel
          title={panelTitle}
          description={panelDescription}
          variant="priority"
        />
      </div>
    </div>
  );
}
