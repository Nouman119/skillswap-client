import { createAuthClient } from "better-auth/react";

// ----------------------------------------------------
//  Better Auth React Client
// ----------------------------------------------------
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://skillswap-server-wgm3.onrender.com",
});

export const { signIn, signUp, useSession, signOut } = authClient;