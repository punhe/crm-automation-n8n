import { SignUp } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Team Provisioning"
      title="Create access for the internal ops team."
      description="New accounts should land in the same protected CRM shell, with customer records, invoice actions and automation entry points hidden until Clerk finishes authentication."
      authSlot={
        <SignUp
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
