"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Linkedin } from "lucide-react";

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
    const { token, logout } = useAuth();
    const isAuthed = !!token;

    const Item = ({ href, label, exact }: NavItem) => {
        const active = isActive(pathname, href, exact);
        return (
            <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={[
                // bigger text + base font family
                "px-3 py-2 rounded-base font-base font-medium text-2l sm:text-2l",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring]",
                active
                ? "bg-secondary-background text-foreground border-2 border-border shadow-shadow"
                : "text-foreground",
            ].join(" ")}
            >
            {label}
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
            <Link href="/" className="flex items-center gap-3 min-w-0">
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

            <span className="font-heading font-semibold text-xl sm:text-2xl leading-none tracking-tight">
                SkillSync
            </span>
            </Link>

            <div className="ms-auto hidden sm:block" />

            <nav
                className="flex items-center gap-4 sm:gap-6 flex-wrap min-w-0"
                aria-label="Primary"
                >
                {(isAuthed ? AUTH_NAV_ITEMS : UNAUTH_NAV_ITEMS).map((it) => (
                    <Item key={it.href} {...it} />
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

                    <Button variant="neutral" size="icon">
                        <a href="#" aria-label="Custom">
                            <svg viewBox="0 0 256 256" role="img" aria-hidden>
                                <g transform="translate(1.4066 1.4066) scale(2.81 2.81)">
                                <path
                                    d="M 46.756 90 c -15.565 0 -30.721 -8.071 -39.047 -22.492 c -6.01 -10.41 -7.607 -22.537 -4.496 -34.148 C 6.324 21.749 13.77 12.045 24.18 6.035 c 8.604 -4.968 18.353 -6.926 28.201 -5.661 c 0.838 0.108 1.518 0.73 1.698 1.555 c 0.182 0.825 -0.176 1.675 -0.892 2.124 c -14.77 9.253 -19.511 28.329 -10.794 43.429 c 8.719 15.1 27.609 20.532 43.008 12.367 c 0.743 -0.398 1.659 -0.28 2.284 0.289 c 0.624 0.569 0.823 1.47 0.498 2.249 c -3.829 9.159 -10.4 16.626 -19.004 21.593 C 62.113 88.06 54.385 90 46.756 90 z M 46.538 4.001 C 39.41 4.007 32.46 5.873 26.18 9.499 C 6.601 20.803 -0.131 45.929 11.173 65.508 s 36.428 26.311 56.008 15.007 c 6.28 -3.625 11.371 -8.712 14.941 -14.882 c -16.184 5.635 -34.346 -0.83 -43.192 -16.151 C 30.085 34.161 33.565 15.199 46.538 4.001 z"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1}           
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    vectorEffect="non-scaling-stroke"
                                />
                                </g>
                            </svg>
                            </a>
                    </Button>
                </div>
            </nav>
        </div>
        </header>
    );
}
