import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillSync",
  description: "Groups + Flashcards",
};

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}