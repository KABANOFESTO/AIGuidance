"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BellRing, CheckCheck, Clock3, Search, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCurrentUserQuery } from "@/lib/redux/slices/AuthSlice";
import {
    useGetNotificationsQuery,
    useGetUnreadNotificationCountQuery,
    useMarkAllNotificationsReadMutation,
    useMarkNotificationReadMutation,
} from "@/lib/redux/slices/NotificationSlice";
import { hasValidAccessToken } from "@/lib/auth/session";

type RolePath = "/admin" | "/student" | "/lecturer";

export default function NotificationCenterPage({ roleLabel, rolePath }: { roleLabel: string; rolePath: RolePath }) {
    const hasAccessToken = hasValidAccessToken();
    const { data: user } = useCurrentUserQuery(undefined, { skip: !hasAccessToken });
    const { data: notifications = [], refetch } = useGetNotificationsQuery(undefined, { skip: !hasAccessToken });
    const { data: unreadData } = useGetUnreadNotificationCountQuery(undefined, { skip: !hasAccessToken });
    const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
    const [markRead] = useMarkNotificationReadMutation();
    const [query, setQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<"all" | "unread" | "read">("all");

    const filtered = useMemo(() => {
        return (notifications as any[]).filter((notification) => {
            const searchable = `${notification.title || ""} ${notification.message || ""} ${notification.notification_type || ""}`.toLowerCase();
            const matchesQuery = searchable.includes(query.toLowerCase());
            const matchesFilter =
                selectedFilter === "all" ||
                (selectedFilter === "unread" && !notification.is_read) ||
                (selectedFilter === "read" && notification.is_read);
            return matchesQuery && matchesFilter;
        });
    }, [notifications, query, selectedFilter]);

    const handleMarkRead = async (id: number) => {
        await markRead(id).unwrap();
        refetch();
    };

    const handleMarkAll = async () => {
        await markAllRead(undefined).unwrap();
        refetch();
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-[#1e2a78]">{roleLabel} Center</p>
                        <h1 className="mt-1 text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="mt-1 text-sm text-gray-500">A live inbox for platform updates, academic alerts, and system messages.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`${rolePath}/dashboard`} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                            <ExternalLink size={15} />
                            Back to dashboard
                        </Link>
                        <button
                            onClick={handleMarkAll}
                            disabled={markingAll || !notifications.length}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#1e2a78] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#16205c] disabled:opacity-60"
                        >
                            <CheckCheck size={15} />
                            Mark all read
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="text-sm text-gray-500">Unread</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{unreadData?.unread_count ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{notifications.length}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="text-sm text-gray-500">Account</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{user?.username || roleLabel}</div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                            <Search size={16} className="text-gray-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search notifications..."
                                className="w-72 bg-transparent text-sm outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {(["all", "unread", "read"] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setSelectedFilter(filter)}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedFilter === filter ? "bg-[#1e2a78] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                >
                                    {filter === "all" ? "All" : filter === "unread" ? "Unread" : "Read"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 divide-y divide-gray-100">
                        {filtered.length ? filtered.map((notification: any) => (
                            <div key={notification.id} className={`flex flex-col gap-3 px-1 py-4 sm:flex-row sm:items-start sm:justify-between ${notification.is_read ? "" : "bg-sky-50/30"}`}>
                                <div className="flex gap-3">
                                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notification.is_read ? "bg-gray-100 text-gray-500" : "bg-[#1e2a78]/10 text-[#1e2a78]"}`}>
                                        <BellRing size={18} />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-bold text-gray-900">{notification.title}</h3>
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                                {notification.notification_type}
                                            </span>
                                            {!notification.is_read && (
                                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                            <Clock3 size={12} />
                                            {notification.created_at ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }) : "Just now"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {notification.link && (
                                        <a
                                            href={notification.link}
                                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                        >
                                            Open
                                            <ExternalLink size={13} />
                                        </a>
                                    )}
                                    {!notification.is_read && (
                                        <button
                                            onClick={() => handleMarkRead(notification.id)}
                                            className="rounded-xl bg-[#1e2a78] px-3 py-2 text-xs font-semibold text-white hover:bg-[#16205c]"
                                        >
                                            Mark read
                                        </button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="py-14 text-center text-sm text-gray-400">No notifications found.</div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
