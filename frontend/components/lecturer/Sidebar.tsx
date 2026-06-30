'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutGrid,
    Upload,
    BarChart2,
    MessageSquare,
    User,
    LogOut,
    Menu,
    X,
    Briefcase,
} from 'lucide-react';
import { useCurrentUserQuery, useLogoutMutation } from "@/lib/redux/slices/AuthSlice";

const lecturerItems = [
    { title: 'Overview', url: '/lecturer/dashboard', icon: LayoutGrid },
    { title: 'Course Materials', url: '/lecturer/course-materials', icon: Upload },
    { title: 'Class Performance', url: '/lecturer/class-performance', icon: BarChart2 },
    { title: 'Feedback', url: '/lecturer/feedback', icon: MessageSquare },
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
    const hasAccessToken = typeof window !== "undefined" && Boolean(localStorage.getItem("access"));
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
        } catch {}
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
        <div className="flex h-full flex-col" style={{ background: '#1a237e' }}>
            <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                        <Briefcase size={17} className="text-white" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-bold text-white leading-tight">AI<span className="text-sky-400">Guidance</span></p>
                        <p className="truncate text-xs font-medium" style={{ color: '#90caf9' }}>Lecturer Portal</p>
                    </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white md:hidden" aria-label="Close menu">
                    <X size={18} />
                </button>
                <Menu size={20} className="hidden text-slate-300 md:block" />
            </div>

            <div className="mx-4 border-t border-white/10" />

            <div className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: '#22c55e' }}>
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
                                <p className="truncate text-sm font-bold text-white">{user?.username ?? "Lecturer"}</p>
                                <p className="truncate text-xs" style={{ color: '#90caf9' }}>{user?.email ?? "lecturer@example.com"}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-4 border-t border-white/10" />

            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                    {lecturerItems.map((item) => {
                        const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
                        return (
                            <li key={item.title}>
                                <Link
                                    href={item.url}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150 ${isActive ? 'text-white' : 'text-slate-300 hover:text-white'}`}
                                    style={isActive ? { background: 'rgba(255,255,255,0.15)' } : undefined}
                                >
                                    <item.icon size={17} className="shrink-0" />
                                    <span className="truncate flex-1">{item.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="border-t border-white/10 px-3 py-4">
                <Link href="/lecturer/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
                    <User size={17} className="shrink-0" />
                    Profile &amp; Settings
                </Link>
                <button onClick={() => setConfirmOpen(true)} className="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
                    <LogOut size={17} className="shrink-0" />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setMobileOpen((v) => !v)} className="fixed left-4 top-4 z-[150] rounded-lg p-2 text-white shadow-lg md:hidden" style={{ background: '#1a237e' }} aria-label="Toggle menu">
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
