"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string; exact?: boolean };

const NAV_ITEMS: NavItem[] = [
    { href: "/groups", label: "Groups" },
    { href: "/login", label: "Login", exact: true },
    { href: "/register", label: "Register", exact: true },
];

function isActive(pathname: string, href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
    const pathname = usePathname();

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
        <header className="w-full border-b-[4px] border-border bg-secondary-background">
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
                {NAV_ITEMS.map((it) => (
                    <Item key={it.href} {...it} />
                ))}
                <Button className="font-bold text-md">Get started</Button>
            </nav>
        </div>
        </header>
    );
}
