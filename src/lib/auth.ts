import "server-only";

import { auth } from "@clerk/nextjs/server";

export async function requireUser() {
  const authObject = await auth();

  if (!authObject.userId) {
    return authObject.redirectToSignIn();
  }

  return authObject;
}
