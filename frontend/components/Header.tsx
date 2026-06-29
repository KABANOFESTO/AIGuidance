'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

const navItems = [
    { label: 'Features', href: '#features', id: 'features' },
    { label: 'Performance', href: '#performance', id: 'performance' },
    { label: 'Roles', href: '#roles', id: 'roles' },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('features');
    const [isScrolled, setIsScrolled] = useState(false);

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
            `sticky top-0 z-50 w-full bg-white transition-all duration-300 ${isScrolled ? 'shadow-sm' : ''
            }`,
        [isScrolled],
    );

    return (
        <header className={headerClassName}>
            <div className="border-b border-gray-100">
                <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">

                    {/* Logo */}
                    <button
                        type="button"
                        onClick={() => handleNavClick('features')}
                        className="flex items-center gap-3 text-left"
                        aria-label="Scroll to top"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-md">
                            <Image
                                src="/logo.png"
                                alt="UoK MailAI logo"
                                height={28}
                                width={28}
                                className="block"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[1rem] font-bold leading-tight tracking-tight text-gray-900">
                                UoK MailAI
                            </span>
                            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gray-400">
                                Auto-Reply System
                            </span>
                        </div>
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
                                            ? 'text-gray-900'
                                            : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {label}
                                    {isActive && (
                                        <span className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-violet-600" />
                                    )}
                                </a>
                            );
                        })}
                    </nav>

                    {/* Desktop CTA Buttons */}
                    <div className="hidden items-center gap-3 md:flex">
                        <Link
                            href="/auth"
                            className="rounded-lg border border-violet-600 px-5 py-2 text-sm font-semibold text-violet-600 transition-all duration-150 hover:bg-violet-50"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-violet-700 hover:-translate-y-0.5"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-2 text-gray-500 transition-colors hover:text-gray-800 md:hidden"
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
                <div className="border-b border-gray-100 bg-white px-6 pb-5 pt-3 shadow-lg md:hidden">
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
                                            ? 'bg-violet-50 text-violet-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    {label}
                                </a>
                            );
                        })}
                        <div className="mt-3 grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                            <Link
                                href="/auth"
                                onClick={() => setMenuOpen(false)}
                                className="rounded-lg border border-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-violet-600 transition-colors hover:bg-violet-50"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth/signup"
                                onClick={() => setMenuOpen(false)}
                                className="rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}