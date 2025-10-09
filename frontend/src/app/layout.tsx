import type { Metadata } from "next";
import Providers from "./providers";
import Navbar from "@/components/Navbar"
import { DM_Sans } from "next/font/google"
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillSync",
  description: "Groups + Flashcards",
};

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400","500","700","800"], // add 800
  variable: "--font-dm-sans",
  display: "swap",
});


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} bg-background text-foreground`}>
      <body className="min-h-screen" suppressHydrationWarning={true}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}