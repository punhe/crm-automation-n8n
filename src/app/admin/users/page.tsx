import Link from "next/link";

import { StatusPill } from "@/components/status-pill";
import { listClerkUsers, requireAllowedUser } from "@/lib/auth";
import {
  getAllowedEmails,
  getGrandfatheredBefore,
  isEmailAllowlistEnabled,
} from "@/lib/env";
import { toRelativeTime } from "@/lib/format";

export default async function AdminUsersPage() {
  await requireAllowedUser();

  const [users, allowedEmails, grandfatheredBefore, allowlistEnabled] =
    await Promise.all([
      listClerkUsers(),
      Promise.resolve(getAllowedEmails()),
      Promise.resolve(getGrandfatheredBefore()),
      Promise.resolve(isEmailAllowlistEnabled()),
    ]);

  return (
    <>
      {/* Header */}
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Admin · User Management</p>
            <h2 className="section-title mt-3">
              Registered accounts & email allowlist
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              All accounts that have signed in via Clerk. The allowlist
              controls which new email addresses can access the workspace.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-soft)]"
          >
            ← Dashboard
          </Link>
        </div>
      </section>

      {/* Allowlist status card */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article className="surface-card p-4">
          <p className="eyebrow">Allowlist status</p>
          <div className="mt-2">
            <StatusPill
              label={allowlistEnabled ? "Enabled" : "Disabled (open)"}
              tone={allowlistEnabled ? "teal" : "amber"}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {allowlistEnabled
              ? "Only emails in the list below can access this workspace."
              : "Set ALLOWED_EMAILS in .env to enable."}
          </p>
        </article>

        <article className="surface-card p-4">
          <p className="eyebrow">Approved emails</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {allowedEmails.length}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {allowedEmails.length === 0
              ? "No emails configured"
              : "Comma-separated in .env"}
          </p>
        </article>

        <article className="surface-card p-4">
          <p className="eyebrow">Grandfathered before</p>
          <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
            {grandfatheredBefore
              ? grandfatheredBefore.toLocaleDateString()
              : "Not set"}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Accounts created before this date bypass the allowlist.
          </p>
        </article>
      </section>

      {/* Allowed email list */}
      {allowlistEnabled ? (
        <section className="panel p-5">
          <p className="eyebrow">Approved email addresses</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Edit <code className="rounded bg-[var(--panel-soft)] px-1.5 py-0.5 font-mono text-[var(--accent)]">ALLOWED_EMAILS</code> in your <code className="rounded bg-[var(--panel-soft)] px-1.5 py-0.5 font-mono text-[var(--accent)]">.env</code> file to add or remove emails.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {allowedEmails.map((email) => (
              <span
                key={email}
                className="inline-flex items-center rounded-md bg-[rgba(124,231,172,0.16)] px-3 py-1.5 text-xs font-medium text-[#2DB77B]"
              >
                {email}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Registered users table */}
      <section className="panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Registered accounts</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
              {users.length} user{users.length !== 1 ? "s" : ""} in Clerk
            </h3>
          </div>
          <StatusPill label={`${users.length} accounts`} tone="berry" />
        </div>

        {users.length === 0 ? (
          <div className="surface-card mt-5 p-5">
            <p className="text-sm leading-6 text-[var(--muted)]">
              No users found in the Clerk instance.
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-lg">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Primary Email</th>
                  <th>Allowlist</th>
                  <th>Created</th>
                  <th>Last Sign In</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isGrandfathered =
                    grandfatheredBefore &&
                    user.createdAt &&
                    new Date(user.createdAt) < grandfatheredBefore;

                  const isOnAllowlist =
                    user.email &&
                    allowedEmails.includes(user.email.toLowerCase());

                  let accessStatus: {
                    label: string;
                    tone: "teal" | "amber" | "rose" | "slate";
                  };

                  if (!allowlistEnabled) {
                    accessStatus = { label: "Open access", tone: "slate" };
                  } else if (isOnAllowlist) {
                    accessStatus = { label: "Approved", tone: "teal" };
                  } else if (isGrandfathered) {
                    accessStatus = { label: "Grandfathered", tone: "amber" };
                  } else {
                    accessStatus = { label: "Not allowed", tone: "rose" };
                  }

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {user.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]">
                              {(user.firstName?.[0] || user.email?.[0] || "?").toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-[var(--foreground)]">
                              {[user.firstName, user.lastName]
                                .filter(Boolean)
                                .join(" ") || "Unnamed"}
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--muted)]">
                              {user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm text-[var(--foreground)] break-all">
                          {user.email || "—"}
                        </p>
                        {user.allEmails.length > 1 ? (
                          <p className="mt-0.5 text-xs text-[var(--muted)]">
                            +{user.allEmails.length - 1} more
                          </p>
                        ) : null}
                      </td>
                      <td>
                        <StatusPill
                          label={accessStatus.label}
                          tone={accessStatus.tone}
                        />
                      </td>
                      <td>
                        <p className="text-sm text-[var(--foreground)]">
                          {toRelativeTime(user.createdAt)}
                        </p>
                      </td>
                      <td>
                        <p className="text-sm text-[var(--foreground)]">
                          {user.lastSignInAt
                            ? toRelativeTime(user.lastSignInAt)
                            : "Never"}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
