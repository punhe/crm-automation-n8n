import { SignOutButton } from "@clerk/nextjs";

export default function NotAllowedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md text-center">
        <div className="panel p-8">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,128,139,0.16)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-[#D94452]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx={12} cy={12} r={10} />
              <path d="m4.93 4.93 14.14 14.14" />
            </svg>
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Access Restricted
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Your email address is not on the approved access list for this
            workspace. Please contact your administrator to request access.
          </p>

          <div className="mt-6">
            <SignOutButton>
              <button className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
                Sign out & try another account
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </div>
  );
}
