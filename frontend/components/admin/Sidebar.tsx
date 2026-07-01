'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutGrid,
    Users,
    Database,
    Activity,
    FileText,
    User,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { useCurrentUserQuery, useLogoutMutation } from "@/lib/redux/slices/AuthSlice";
import { hasValidAccessToken } from "@/lib/auth/session";

const adminItems = [
    { title: 'System Overview', url: '/admin/dashboard', icon: LayoutGrid },
    { title: 'User Management', url: '/admin/users', icon: Users },
    { title: 'Knowledge Base', url: '/admin/knowledge-base', icon: Database },
    { title: 'System Analytics', url: '/admin/analytics', icon: Activity },
    { title: 'Reports', url: '/admin/reports', icon: FileText },
];

function ConfirmDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void; }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-gray-900">Sign out?</h3>
                <p className="mt-2 text-sm text-gray-500">You will be redirected to the login page and will need to sign in again to access your dashboard.</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={onConfirm} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Sign Out</button>
                </div>
            </div>
        </div>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const hasAccessToken = hasValidAccessToken();
    const { data: user, isLoading } = useCurrentUserQuery(undefined, { skip: !hasAccessToken });
    const [logout] = useLogoutMutation();

    useEffect(() => {
        if (!mobileOpen) return;
        const handleEsc = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [mobileOpen]);

    const handleSignOut = async () => {
        try {
            await logout({ refresh: localStorage.getItem("refresh") }).unwrap();
        } catch {
            // best effort
        }
        localStorage.clear();
        router.push('/auth');
    };

    const initials = user?.username
        ?.split(' ')
        .map((part: string) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? 'U';

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-[#1e2a78]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="5" y="9" width="14" height="10" rx="2" />
                            <path d="M9 9V7a3 3 0 0 1 6 0v2" />
                            <circle cx="9.5" cy="14" r="1" fill="white" />
                            <circle cx="14.5" cy="14" r="1" fill="white" />
                        </svg>
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-bold text-white">AI<span className="text-sky-400">Guidance</span></p>
                        <p className="truncate text-xs font-medium text-sky-300/80">Admin Portal</p>
                    </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white md:hidden" aria-label="Close menu">
                    <X size={18} />
                </button>
                <Menu size={18} className="hidden text-slate-300 md:block" />
            </div>

            <div className="border-b border-white/10 px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                        {isLoading ? <span className="animate-pulse">..</span> : initials}
                    </div>
                    <div className="overflow-hidden">
                        {isLoading ? (
                            <div className="space-y-1.5">
                                <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
                                <div className="h-2.5 w-16 animate-pulse rounded bg-white/10" />
                            </div>
                        ) : (
                            <>
                                <p className="truncate text-sm font-bold text-white">{user?.username ?? "Admin"}</p>
                                <p className="truncate text-xs text-sky-300/80">{user?.email ?? "admin@example.com"}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1.5">
                    {adminItems.map((item) => {
                        const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
                        return (
                            <li key={item.title}>
                                <Link
                                    href={item.url}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150 ${isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
                                >
                                    <item.icon size={17} className="shrink-0" />
                                    <span className="truncate">{item.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="border-t border-white/10 px-3 py-4">
                <Link href="/admin/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/8 hover:text-white">
                    <User size={17} className="shrink-0" />
                    Profile &amp; Settings
                </Link>
                <button onClick={() => setConfirmOpen(true)} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/8 hover:text-white">
                    <LogOut size={17} className="shrink-0" />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setMobileOpen((v) => !v)} className="fixed left-4 top-4 z-[150] rounded-lg p-2 text-white shadow-lg md:hidden" style={{ background: '#1e2a78' }} aria-label="Toggle menu">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {mobileOpen && <div className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />}

            <aside ref={sidebarRef} className="fixed inset-y-0 left-0 z-[145] w-64 transition-transform duration-300 md:hidden" style={{ transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
                <SidebarContent />
            </aside>

            <aside className="sticky top-0 hidden h-screen w-64 flex-col md:flex">
                <SidebarContent />
            </aside>

            <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleSignOut} />
        </>
    );
}
