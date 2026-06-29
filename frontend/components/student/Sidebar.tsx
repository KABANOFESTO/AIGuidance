'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutGrid,
    Briefcase,
    BookOpen,
    Compass,
    BarChart2,
    User,
    LogOut,
    Menu,
    X,
} from 'lucide-react';

/* ── Nav items per role ── */
const studentItems = [
    { title: 'Overview', url: '/student/dashboard', icon: LayoutGrid },
    { title: 'AI Chatbot', url: '/student/chatbot', icon: Briefcase, badge: 'AI' },
    { title: 'Course Recommendations', url: '/student/courses', icon: BookOpen },
    { title: 'Career Guide', url: '/student/career-guide', icon: Compass },
    { title: 'Performance Analytics', url: '/student/analytics', icon: BarChart2 },
];

/* Swap or extend for other roles */
const navItems = studentItems;

/* ── Types ── */
interface UserDetails {
    fullName: string;
    code: string;
}

/* ── Confirm logout dialog ── */
function ConfirmDialog({
    open,
    onClose,
    onConfirm,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-gray-900">Sign out?</h3>
                <p className="mt-2 text-sm text-gray-500">
                    You will be redirected to the login page and will need to sign in again to access your dashboard.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Sidebar ── */
export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const sidebarRef = useRef<HTMLDivElement>(null);

    /* Simulate fetching user — replace with your real API call */
    useEffect(() => {
        const timer = setTimeout(() => {
            setUser({
                fullName: 'Alex Johnson',
                code: 'STU2024001',
            });
            setLoadingUser(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleSignOut = () => {
        localStorage.clear();
        router.push('/auth');
    };

    const initials = user?.fullName
        ?.split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? 'U';

    /* ── Sidebar content (shared between mobile & desktop) ── */
    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-[#1e2a78]">

            {/* Logo + hamburger */}
            <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <Briefcase size={17} className="text-white" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-bold text-white">
                            AIGuidance
                        </p>
                        <p className="truncate text-xs font-medium text-sky-300/80">Student Portal</p>
                    </div>
                </div>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
                    aria-label="Close menu"
                >
                    <X size={18} />
                </button>
                <Menu size={18} className="hidden text-slate-300 md:block" />
            </div>

            <div className="mx-4 border-t border-white/10" />

            {/* User card */}
            <div className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1e2a78]">
                        {loadingUser ? <span className="animate-pulse">..</span> : initials}
                    </div>
                    <div className="overflow-hidden">
                        {loadingUser ? (
                            <div className="space-y-1.5">
                                <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
                                <div className="h-2.5 w-16 animate-pulse rounded bg-white/10" />
                            </div>
                        ) : (
                            <>
                                <p className="truncate text-sm font-bold text-white">{user?.fullName}</p>
                                <p className="truncate text-xs text-sky-300/80">{user?.code}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-4 border-t border-white/10" />

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
                        return (
                            <li key={item.title}>
                                <Link
                                    href={item.url}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150 ${isActive
                                        ? 'bg-white/20 text-white'
                                        : 'text-slate-300 hover:bg-white/8 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={17} className="shrink-0" />
                                    <span className="truncate flex-1">{item.title}</span>
                                    {item.badge && (
                                        <span className="shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom actions */}
            <div className="border-t border-white/10 px-3 py-4">
                <Link
                    href="/student/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/8 hover:text-white"
                >
                    <User size={17} className="shrink-0" />
                    Profile &amp; Settings
                </Link>
                <button
                    onClick={() => setConfirmOpen(true)}
                    className="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/8 hover:text-white"
                >
                    <LogOut size={17} className="shrink-0" />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen((v) => !v)}
                className="fixed left-4 top-4 z-[150] rounded-lg p-2 text-white shadow-lg md:hidden"
                style={{ background: '#1e2a78' }}
                aria-label="Toggle menu"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <aside
                ref={sidebarRef}
                className="fixed inset-y-0 left-0 z-[145] w-64 transition-transform duration-300 md:hidden"
                style={{ transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)' }}
            >
                <SidebarContent />
            </aside>

            {/* Desktop sidebar */}
            <aside className="sticky top-0 hidden h-screen w-64 flex-col md:flex">
                <SidebarContent />
            </aside>

            {/* Confirm dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleSignOut}
            />
        </>
    );
}