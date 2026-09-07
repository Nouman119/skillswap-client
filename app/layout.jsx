import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "SkillSwap | Freelance Marketplace Platform",
  description: "Connect skilled freelancers with clients worldwide for seamless task completion.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-gray-900 antialiased">
        <AuthProvider>
          {/* Global Sticky Navigation */}
          <Navbar />

          {/* Dynamic Page Views */}
          <main className="flex-1">{children}</main>

          {/* Global Structured Footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}