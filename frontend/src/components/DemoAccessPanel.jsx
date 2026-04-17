import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  Loader2,
  LogIn,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { demoAccountList } from "../utils/demoAccounts";
import { loginWithDemoRole } from "../utils/demoLogin";

export default function DemoAccessPanel({
  title = "Demo Access",
  description = "Jump straight into demo role accounts. If the shared dataset is older than two hours, it refreshes automatically before login.",
  variant = "default",
}) {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState("");
  const activeAccount = demoAccountList.find((account) => account.key === loadingRole);

  const styles =
    variant === "priority"
      ? {
          wrapper:
            "rounded-[1.5rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-red-50 p-4 shadow-[0_30px_80px_-40px_rgba(249,115,22,0.55)] sm:rounded-[2rem] sm:p-6 md:p-8",
          badge:
            "inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.24em]",
          iconWrap:
            "rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-2.5 text-white shadow-lg sm:rounded-2xl sm:p-3",
          grid: "grid gap-3 sm:gap-4 xl:grid-cols-2",
          button:
            "w-full cursor-pointer rounded-xl border border-orange-200 bg-white px-4 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg motion-reduce:transition-none disabled:opacity-60 sm:rounded-2xl sm:px-5 sm:py-5",
          metaGrid: "mt-4 grid gap-3 sm:mt-5 lg:grid-cols-3",
          metaCard:
            "rounded-xl border border-white/80 bg-white/80 px-3 py-3 text-sm text-slate-700 shadow-sm sm:rounded-2xl sm:px-4",
        }
      : variant === "compact"
        ? {
            wrapper:
              "rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-red-50 p-5 md:p-6 shadow-[0_20px_60px_-40px_rgba(249,115,22,0.6)]",
            badge:
              "inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-700",
            iconWrap:
              "rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-3 text-white shadow-lg",
            grid: "grid gap-3 md:grid-cols-2",
            button:
              "w-full cursor-pointer rounded-xl border border-white/70 bg-white px-4 py-3 text-left shadow-sm transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md motion-reduce:transition-none disabled:opacity-60",
            metaGrid: "mt-4 grid gap-3 sm:grid-cols-3",
            metaCard:
              "rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm",
          }
        : {
            wrapper:
              "rounded-[2rem] border border-red-100 bg-white/90 p-6 md:p-8 shadow-lg",
            badge:
              "inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-700",
            iconWrap:
              "rounded-2xl bg-red-600 p-3 text-white shadow-lg",
            grid: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
            button:
              "w-full cursor-pointer rounded-2xl border border-red-100 bg-gradient-to-br from-white to-red-50 px-5 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md motion-reduce:transition-none disabled:opacity-60",
            metaGrid: "mt-5 grid gap-3 sm:grid-cols-3",
            metaCard:
              "rounded-2xl border border-red-100 bg-red-50/60 px-4 py-3 text-sm text-slate-700",
          };

  const handleDemoLogin = async (roleKey) => {
    try {
      setLoadingRole(roleKey);
      await loginWithDemoRole(roleKey, navigate);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Demo login failed";
      window.alert(message);
    } finally {
      setLoadingRole("");
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.badge}>
        <Sparkles className="h-3.5 w-3.5" />
        Recommended First Step
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className={`${styles.iconWrap} shrink-0`}>
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            {description}
          </p>
          <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-orange-700 sm:items-center">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" />
            Skip forms and open a realistic seeded workspace in one click.
          </p>
        </div>
      </div>

      <div className={styles.metaGrid}>
        <div className={styles.metaCard}>
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Clock3 className="h-4 w-4 text-orange-600" />
            Under 10 seconds
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Jump straight into a live product path with fresh sample data.
          </p>
        </div>
        <div className={styles.metaCard}>
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-orange-600" />
            Zero setup friction
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            No registration, no approval wait, no manual seeding.
          </p>
        </div>
        <div className={styles.metaCard}>
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <LogIn className="h-4 w-4 text-orange-600" />
            4 demo roles
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Preview admin, donor, hospital, and blood lab journeys instantly.
          </p>
        </div>
      </div>

      {activeAccount && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-red-900 shadow-sm sm:rounded-2xl sm:px-4 sm:py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-red-600 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Setting up the {activeAccount.label} demo workspace...
              </p>
              <p className="mt-1 text-sm leading-6 text-red-700">
                Refreshing sample data and signing you in. This can take a few seconds while the fresh seed is prepared.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`mt-5 ${styles.grid}`}>
        {demoAccountList.map((account) => {
          const isLoading = loadingRole === account.key;

          return (
            <button
              key={account.key}
              type="button"
              onClick={() => handleDemoLogin(account.key)}
              disabled={Boolean(loadingRole)}
              className={styles.button}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 sm:text-base">
                    Demo as {account.label}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">
                    {isLoading
                      ? "Preparing a fresh demo dataset for this role..."
                      : account.description}
                  </div>
                  <div className="mt-2 break-all text-xs font-medium text-orange-700">
                    {account.email}
                  </div>
                </div>
                <div className="shrink-0 self-start rounded-xl bg-red-100 p-2.5 text-red-600 shadow-sm">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LogIn className="h-5 w-5" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
