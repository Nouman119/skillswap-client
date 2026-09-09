import { createAuthClient } from "better-auth/react";

// ----------------------------------------------------
//  Better Auth React Client
// ----------------------------------------------------
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const { signIn, signUp, useSession, signOut } = authClient;