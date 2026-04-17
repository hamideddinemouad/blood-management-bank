import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn, Sparkles } from "lucide-react";
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
    variant === "compact"
      ? {
          wrapper:
            "rounded-2xl border border-red-100 bg-red-50/80 p-4 md:p-5",
          grid: "grid gap-3 md:grid-cols-2",
          button:
            "w-full rounded-xl border border-white/70 bg-white px-4 py-3 text-left shadow-sm transition hover:border-red-200 hover:bg-red-50 disabled:opacity-60",
        }
      : {
          wrapper:
            "rounded-[2rem] border border-red-100 bg-white/90 p-6 md:p-8 shadow-lg",
          grid: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
          button:
            "w-full rounded-2xl border border-red-100 bg-gradient-to-br from-white to-red-50 px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md disabled:opacity-60",
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
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-red-600 p-3 text-white shadow-lg">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </div>

      {activeAccount && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-900 shadow-sm">
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
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Demo as {account.label}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {isLoading
                      ? "Preparing a fresh demo dataset for this role..."
                      : account.description}
                  </div>
                </div>
                <div className="rounded-xl bg-red-100 p-2 text-red-600">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
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
