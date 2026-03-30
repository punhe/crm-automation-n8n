import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="panel w-full max-w-[980px] overflow-hidden p-3 sm:p-5">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_420px]">
          <section className="rounded-[26px] bg-[linear-gradient(145deg,rgba(13,106,110,0.16),rgba(255,255,255,0.6),rgba(196,106,68,0.2))] p-7 sm:p-9">
            <p className="eyebrow">Clerk Auth</p>
            <h1 className="section-title mt-4 max-w-[12ch]">
              Sign in to your revenue control room.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-[color:var(--muted)]">
              Access the internal RepairShopr operations console, review invoice
              recovery risk, and launch the n8n automations tied to your CRM stack.
            </p>
          </section>

          <section className="surface-card flex items-center justify-center p-4 sm:p-6">
            <SignIn />
          </section>
        </div>
      </div>
    </div>
  );
}
