import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// ----------------------------------------------------
// MongoDB Client Connection for Better Auth
// ----------------------------------------------------
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please add your MONGODB_URI to environment variables");
}

const client = new MongoClient(uri);
const db = client.db();

// ----------------------------------------------------
// Better Auth Instance Configuration
// ----------------------------------------------------
export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  
  // Set baseURL dynamically supporting Render backend or local fallback
  baseURL: process.env.BETTER_AUTH_URL || "https://skillswap-server-wgm3.onrender.com",
  
  // Allow requests from both local development and Vercel production frontend
  trustedOrigins: [
    "http://localhost:3000",
    "https://skillswap-client-five.vercel.app"
  ],

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      prompt: "select_account",
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "client",
        input: true,
      },
    },
  },
});