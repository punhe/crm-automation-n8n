import { SignIn } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth-shell";

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Clerk Access"
      title="Sign in before the CRM opens."
      description="This workspace exposes RepairShopr customer data, invoice recovery actions and future n8n controls, so the app now stays behind Clerk from the first request."
      authSlot={
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "w-full",
              card: "w-full border-0 bg-transparent p-0 shadow-none",
              headerTitle: "text-[24px] font-[400] tracking-tight text-[var(--foreground)]",
              headerSubtitle: "text-sm leading-6 text-[var(--muted)]",
              socialButtonsBlockButton:
                "h-10 rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] shadow-none hover:bg-[var(--panel-soft)]",
              formFieldInput:
                "h-10 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] shadow-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-soft)]",
              formButtonPrimary:
                "h-10 rounded-full bg-[var(--btn-primary-bg)] border border-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:brightness-110",
              footerActionLink: "text-[var(--accent)] hover:text-[var(--accent-strong)]",
            },
          }}
        />
      }
    />
  );
}
