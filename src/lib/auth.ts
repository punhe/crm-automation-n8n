import "server-only";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  getAllowedEmails,
  getGrandfatheredBefore,
  isEmailAllowlistEnabled,
} from "@/lib/env";

export async function requireUser() {
  const result = await auth.protect();
  await enforceAllowlist();
  return result;
}

/**
 * Checks whether the signed-in user's email is on the allowlist.
 * Accounts created before the grandfathered date are always allowed.
 * If the allowlist is empty (disabled), everyone is allowed.
 */
async function enforceAllowlist() {
  if (!isEmailAllowlistEnabled()) {
    return; // allowlist disabled — everyone passes
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Grandfathered accounts bypass the allowlist
  const cutoff = getGrandfatheredBefore();
  if (cutoff && user.createdAt && new Date(user.createdAt) < cutoff) {
    return;
  }

  // Check email against allowlist
  const allowed = getAllowedEmails();
  const userEmails = user.emailAddresses.map((e) =>
    e.emailAddress.toLowerCase(),
  );

  const isAllowed = userEmails.some((email) => allowed.includes(email));

  if (!isAllowed) {
    redirect("/not-allowed");
  }
}

/**
 * Alias for requireUser — all protected routes now enforce the allowlist.
 * Kept as a named export for semantic clarity on admin pages.
 */
export async function requireAllowedUser() {
  return requireUser();
}

/**
 * Lists all Clerk users for the admin panel. Returns user data
 * sorted newest-first.
 */
export async function listClerkUsers() {
  await auth.protect();

  const client = await clerkClient();
  const response = await client.users.getUserList({
    orderBy: "-created_at",
    limit: 100,
  });

  return response.data.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email:
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null,
    allEmails: user.emailAddresses.map((e) => e.emailAddress),
    imageUrl: user.imageUrl,
    createdAt: user.createdAt
      ? new Date(user.createdAt).toISOString()
      : null,
    lastSignInAt: user.lastSignInAt
      ? new Date(user.lastSignInAt).toISOString()
      : null,
  }));
}
