import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  authSlot: ReactNode;
};

const authStats = [
  { label: "Protected routes", value: "4" },
  { label: "Server actions", value: "2" },
  { label: "Workflow handoffs", value: "n8n" },
];

export function AuthShell({
  eyebrow,
  title,
  description,
  authSlot,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-5 lg:px-8 lg:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1440px] gap-5 lg:grid-cols-[minmax(0,1.15fr)_430px]">
        <section className="panel relative overflow-hidden p-5 sm:p-6 lg:p-8">
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(94,129,244,0.16),transparent_60%)]" />
          <div className="absolute right-0 top-16 h-32 w-32 rounded-full bg-[rgba(124,231,172,0.10)] blur-3xl" />

          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="mt-5 max-w-[10ch] text-[clamp(2rem,4.5vw,3.8rem)] font-bold leading-[0.94] tracking-[-0.04em] text-[var(--foreground)]">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
                {description}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {authStats.map((item) => (
                  <div key={item.label} className="surface-card p-4">
                    <p className="eyebrow">{item.label}</p>
                    <p className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card overflow-hidden p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Preview</p>
                  <h2 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
                    Dashboard language from the same workspace
                  </h2>
                </div>
                <span className="rounded-md bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
                  Login required
                </span>
              </div>

              <div className="mt-5 rounded-xl bg-[var(--panel-soft)] p-4">
                <div className="grid gap-3 lg:grid-cols-[80px_minmax(0,1fr)]">
                  <div className="rounded-xl bg-white p-3 shadow-[var(--shadow-card)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-white">
                      C
                    </div>
                    <div className="mt-4 space-y-1.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-2 rounded-full bg-[var(--accent-soft)]"
                          style={{ width: `${index === 0 ? 100 : 76 - index * 8}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-5 h-14 rounded-lg bg-[linear-gradient(180deg,var(--accent-soft),white)]" />
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {["MRR", "Recovery", "Unpaid"].map((item, index) => (
                        <div
                          key={item}
                          className="rounded-xl bg-white p-3 shadow-[var(--shadow-card)]"
                        >
                          <p className="eyebrow">{item}</p>
                          <div
                            className="mt-3 h-7 rounded-lg bg-[linear-gradient(90deg,var(--accent-soft),rgba(124,231,172,0.14))]"
                            style={{ width: `${88 - index * 11}%` }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_200px]">
                      <div className="rounded-xl bg-white p-3 shadow-[var(--shadow-card)]">
                        <div className="flex gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                          <span className="h-2 w-2 rounded-full bg-[var(--accent-mint)]" />
                          <span className="h-2 w-2 rounded-full bg-[var(--accent-amber)]" />
                        </div>
                        <div className="grid-pattern mt-3 h-36 rounded-lg p-3">
                          <div className="relative h-full overflow-hidden rounded-lg bg-[linear-gradient(180deg,rgba(94,129,244,0.10),rgba(94,129,244,0.01))]">
                            <svg
                              viewBox="0 0 300 120"
                              className="absolute inset-0 h-full w-full"
                              aria-hidden="true"
                            >
                              <path
                                d="M0 86 C28 62, 48 56, 74 74 S126 114, 156 90 S208 30, 238 56 S278 106, 300 44"
                                fill="none"
                                stroke="var(--accent)"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                              <path
                                d="M0 72 C30 86, 54 96, 84 72 S140 22, 170 46 S220 116, 254 88 S282 72, 300 92"
                                fill="none"
                                stroke="var(--accent-mint)"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white p-3 shadow-[var(--shadow-card)]">
                        <div className="mx-auto h-24 w-24 rounded-full bg-[conic-gradient(var(--accent)_0_44%,var(--accent-mint)_44%_72%,var(--accent-amber)_72%_100%)] p-2.5">
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-center">
                            <span className="text-xs font-semibold text-[var(--foreground)]">
                              Queue
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          {["Invoices", "Customers", "Reminders"].map((item) => (
                            <div
                              key={item}
                              className="flex items-center justify-between text-sm text-[var(--muted)]"
                            >
                              <span>{item}</span>
                              <span className="font-semibold text-[var(--foreground)]">
                                Live
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card flex items-center justify-center p-4 sm:p-5 lg:p-6">
          <div className="w-full">{authSlot}</div>
        </section>
      </div>
    </div>
  );
}
