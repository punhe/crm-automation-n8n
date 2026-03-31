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
              headerTitle: "text-[24px] font-bold tracking-tight text-[#1C1D21]",
              headerSubtitle: "text-sm leading-6 text-[#8181A5]",
              socialButtonsBlockButton:
                "h-10 rounded-lg border border-[#ECECF2] bg-white text-[#1C1D21] shadow-none hover:bg-[#F5F5FA]",
              formFieldInput:
                "h-10 rounded-lg border border-[#ECECF2] bg-white text-[#1C1D21] shadow-none focus:border-[#5E81F4] focus:ring-2 focus:ring-[rgba(94,129,244,0.12)]",
              formButtonPrimary:
                "h-10 rounded-lg bg-[#5E81F4] text-white hover:bg-[#4A6DE0]",
              footerActionLink: "text-[#5E81F4] hover:text-[#4A6DE0]",
            },
          }}
        />
      }
    />
  );
}
