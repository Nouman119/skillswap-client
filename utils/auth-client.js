import { createAuthClient } from "better-auth/client";

// Initialize the Better Auth client connected to the backend server
export const authClient = createAuthClient({
  baseURL: "http://localhost:5000",
});

export const { signIn, signUp, useSession, signOut } = authClient;