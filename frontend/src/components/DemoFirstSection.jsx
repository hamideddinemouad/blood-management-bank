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
  className = "",
  ctaClassName = "",
  panelTitle = "Preview the donor journey instantly",
  panelDescription = "Skip registration for now and enter a ready-made BBMS workspace with realistic data already loaded.",
}) {
  return (
    <div
      className={`rounded-[1.5rem] border border-orange-200 bg-white/90 p-4 shadow-[0_30px_90px_-45px_rgba(249,115,22,0.65)] sm:rounded-[2rem] sm:p-6 ${className}`.trim()}
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.24em]">
        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        {badge}
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            {description}
          </p>
        </div>

        {showCta ? (
          <Link
            to={ctaTo}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-20px_rgba(249,115,22,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-400 sm:w-auto sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base ${ctaClassName}`.trim()}
          >
            {ctaLabel}
            <ArrowRight className="h-5 w-5 shrink-0" />
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
