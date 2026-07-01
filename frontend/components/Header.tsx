"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from "next/navigation";
import { LogOut, LayoutGrid, UserCircle2 } from "lucide-react";
import { useCurrentUserQuery, useLogoutMutation } from "@/lib/redux/slices/AuthSlice";
import { hasValidAccessToken } from "@/lib/auth/session";

const navItems = [
    { label: 'Features', href: '#features', id: 'features' },
    { label: 'How It Works', href: '#performance', id: 'performance' },
    { label: 'Roles', href: '#roles', id: 'roles' },
    { label: 'About', href: '#about', id: 'about' },
];

export default function Header() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('features');
    const [isScrolled, setIsScrolled] = useState(false);
    const hasAccessToken = hasValidAccessToken();
    const { data: user } = useCurrentUserQuery(undefined, { skip: !hasAccessToken });
    const [logout] = useLogoutMutation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 16);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const sections = navItems
            .map((item) => document.getElementById(item.id))
            .filter((section): section is HTMLElement => Boolean(section));

        if (sections.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visibleEntry?.target?.id) {
                    setActiveSection(visibleEntry.target.id);
                }
            },
            { rootMargin: '-35% 0px -45% 0px', threshold: [0.2, 0.4, 0.65] },
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    const handleNavClick = (targetId: string) => {
        const target = document.getElementById(targetId);
        if (!target) return;
        setActiveSection(targetId);
        setMenuOpen(false);
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const headerClassName = useMemo(
        () =>
            `sticky top-0 z-50 w-full bg-[#1c2554] transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''
            }`,
        [isScrolled],
    );

    const roleHome =
        user?.role === "Admin"
            ? "/admin/dashboard"
            : user?.role === "Lecturer"
                ? "/lecturer/dashboard"
                : "/student/dashboard";

    const profileHome =
        user?.role === "Admin"
            ? "/admin/profile"
            : user?.role === "Lecturer"
                ? "/lecturer/profile"
                : "/student/profile";

    const handleLogout = async () => {
        try {
            await logout({ refresh: localStorage.getItem("refresh") }).unwrap();
        } catch {}
        localStorage.clear();
        router.push("/auth");
    };

    return (
        <header className={headerClassName}>
            <div className="border-b border-white/10">
                <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">

                    {/* Logo */}
                    <button
                        type="button"
                        onClick={() => handleNavClick('features')}
                        className="flex items-center gap-3 text-left"
                        aria-label="Scroll to top"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="9" width="14" height="10" rx="2" />
                                <path d="M9 9V7a3 3 0 0 1 6 0v2" />
                                <circle cx="9.5" cy="14" r="1" fill="#7dd3fc" />
                                <circle cx="14.5" cy="14" r="1" fill="#7dd3fc" />
                                <path d="M3 13h2M19 13h2" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold leading-tight tracking-tight text-white">
                            AI<span className="text-sky-400">Guidance</span>
                        </span>
                    </button>

                    {/* Desktop Nav */}
                    <nav className="hidden items-center gap-1 md:flex">
                        {navItems.map(({ label, href, id }) => {
                            const isActive = activeSection === id;
                            return (
                                <a
                                    key={id}
                                    href={href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick(id);
                                    }}
                                    className={`relative rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 ${isActive
                                        ? 'text-white'
                                        : 'text-slate-300 hover:text-white'
                                        }`}
                                >
                                    {label}
                                </a>
                            );
                        })}
                    </nav>

                    {/* Desktop CTA Buttons */}
                    <div className="hidden items-center gap-3 md:flex">
                        {user ? (
                            <>
                                <Link href={roleHome} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-white/20">
                                    <LayoutGrid size={16} />
                                    Dashboard
                                </Link>
                                <Link href={profileHome} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-white/20">
                                    <UserCircle2 size={16} />
                                    Profile
                                </Link>
                                <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:opacity-90 hover:-translate-y-0.5">
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                    <Link
                                        href="/auth"
                                        className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-white/20"
                                    >
                                        Sign In
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:opacity-90 hover:-translate-y-0.5"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        className="inline-flex rounded-lg border border-white/20 bg-white/5 p-2 text-white transition-colors hover:bg-white/10 md:hidden"
                        aria-label="Toggle menu"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            {menuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="border-b border-white/10 bg-[#1c2554] px-6 pb-5 pt-3 shadow-lg md:hidden">
                    <div className="flex flex-col gap-1">
                        {navItems.map(({ label, href, id }) => {
                            const isActive = activeSection === id;
                            return (
                                <a
                                    key={id}
                                    href={href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick(id);
                                    }}
                                    className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {label}
                                </a>
                            );
                        })}
                        <div className="mt-3 grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                            {user ? (
                                <>
                                <Link
                                    href={roleHome}
                                    onClick={() => setMenuOpen(false)}
                                    className="rounded-full bg-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/20"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href={profileHome}
                                    onClick={() => setMenuOpen(false)}
                                    className="rounded-full bg-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/20"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                                    className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:opacity-90"
                                >
                                    Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/auth"
                                        onClick={() => setMenuOpen(false)}
                                        className="rounded-full bg-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/20"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth/signup"
                                        onClick={() => setMenuOpen(false)}
                                        className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:opacity-90"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
