import { createAuthClient } from "better-auth/react";

// ----------------------------------------------------
//  Better Auth React Client
// ----------------------------------------------------
export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === "development" ? "http://localhost:5000" : "",
});

export const { signIn, signUp, useSession, signOut } = authClient;