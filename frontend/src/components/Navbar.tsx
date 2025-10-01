"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const path = usePathname();
    const Item = ({ href, label }: { href: string; label: string }) => (
        <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm ${
        path === href ? "bg-gray-200 dark:bg-gray-800" : "hover:opacity-80"
      }`}
        >
            {label}
        </Link>
    );
    
    return (
        <header className="w-full border-b border-gray-800">
            <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
                <Link href="/" className="font-semibold">SkillSync</Link>
                <nav className="flex gap-2">
                    <Item href="/groups" label="Groups"/>
                    <Item href="/login" label="Login"/>
                    <Item href="/register" label="Register"/>
                </nav>
            </div>
        </header>
    );
}