import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar"
import { DM_Sans } from "next/font/google"
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillSync",
  description: "Groups + Flashcards",
};

const dmSans = DM_Sans({
  subsets: ["latin"], 
  variable: "--font-dm-sans",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en" className="bg-background text-foreground">
      <body className="antialiased">
        <Navbar />
        <AuthProvider >{children}</AuthProvider>
      </body>
    </html>
  )
}