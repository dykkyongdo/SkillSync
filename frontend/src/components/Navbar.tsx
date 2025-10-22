"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useInvitationCount } from "@/contexts/InvitationCountContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Linkedin, Sun, Moon } from "lucide-react";

type NavItem = { href: string; label: string; exact?: boolean };

const AUTH_NAV_ITEMS: NavItem[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/groups", label: "Groups" },
    { href: "/notifications", label: "Notifications" },
];

const UNAUTH_NAV_ITEMS: NavItem[] = [
    { href: "/auth/login", label: "Login", exact: true },
    { href: "/auth/register", label: "Register", exact: true },
];

function isActive(pathname: string, href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
    const pathname = usePathname();
    const { logout, isAuthenticated } = useAuth();
    const { count: invitationCount } = useInvitationCount();
    const { theme, toggleTheme } = useTheme();
    const isAuthed = isAuthenticated;
    
    // Debug logging
    console.log("Navbar render - invitationCount:", invitationCount, "isAuthed:", isAuthed);
    console.log("Navbar render - count type:", typeof invitationCount, "value:", invitationCount);

    const Item = ({ href, label, exact, showBadge }: NavItem & { showBadge?: boolean }) => {
        const active = isActive(pathname, href, exact);
        return (
            <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={[
                // bigger text + base font family
                "px-3 py-2 rounded-base font-medium text-2l sm:text-2l relative",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring]",
                active
                ? "bg-secondary-background text-foreground border-2 border-border shadow-shadow"
                : "text-foreground",
            ].join(" ")}
            >
            {label}
            {showBadge && invitationCount > 0 ? (
                (() => {
                    console.log("Rendering badge - invitationCount:", invitationCount);
                    return (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                            {invitationCount > 9 ? '9+' : invitationCount}
                        </span>
                    );
                })()
            ) : showBadge ? (
                (() => {
                    console.log("Badge should be hidden - invitationCount:", invitationCount);
                    return null;
                })()
            ) : null}
            </Link>
        );
    };

    return (
        <header className="fixed inset-x-0 top-0 z-50 w-full
        bg-secondary-background border-b-4 border-border
        shadow-sm">
        <div
            className={[
            "mx-auto max-w-7xl px-3 sm:px-4 lg:px-6",
            "flex flex-wrap items-center gap-x-6 gap-y-3 py-3",
            ].join(" ")}
        >
            <Link href={isAuthed ? "/groups" : "/"} className="flex items-center gap-3 min-w-0">
            <span
                className="grid place-items-center size-10 sm:size-11 rounded-base border-2 border-border bg-main"
                aria-hidden="true"
            >
                <span
                className="block size-6 sm:size-7 bg-foreground
                            [mask-image:url('/book-open.svg')]
                            [mask-size:contain] [mask-position:center] [mask-repeat:no-repeat]"
                />
            </span>

            <span className="font-semibold text-xl sm:text-2xl leading-none tracking-tight">
                SkillSync
            </span>
            </Link>

            <div className="ms-auto hidden sm:block" />

            <nav
                className="flex items-center gap-4 sm:gap-6 flex-wrap min-w-0"
                aria-label="Primary"
                >
                {(isAuthed ? AUTH_NAV_ITEMS : UNAUTH_NAV_ITEMS).map((it) => (
                    <Item 
                        key={it.href} 
                        {...it} 
                        showBadge={it.href === "/notifications"} 
                    />
                ))}

                {isAuthed && (
                    <Button 
                    className="font-semibold"
                    variant="neutral" onClick={logout}>
                        Logout
                    </Button>
                )}


                <div className="flex items-center gap-5">
                    <Button variant="neutral" size="icon">
                        <a href="https://github.com/dykkyongdo/SkillSync" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <Image src="/github-mark.svg" alt="" width={20} height={20} />
                        </a>
                    </Button>

                    <Button variant="neutral" size="icon">
                        <a href="https://www.linkedin.com/in/dyk-kyong-do-46a0a4265/" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <Linkedin aria-hidden className="shrink-0"/>
                        </a>
                    </Button>

                    <Button variant="neutral" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </nav>
        </div>
        </header>
    );
}
