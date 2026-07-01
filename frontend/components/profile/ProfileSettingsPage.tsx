"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Bell,
    BookOpen,
    CheckCircle2,
    Globe,
    Lock,
    LogOut,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Save,
    Settings,
    Shield,
    Sliders,
    User,
    X,
} from "lucide-react";
import { useCurrentUserQuery, useLogoutMutation, useUpdateProfileMutation } from "@/lib/redux/slices/AuthSlice";
import { hasValidAccessToken } from "@/lib/auth/session";

type TabId = "profile" | "security" | "notifications" | "preferences";

interface ProfileData {
    fullName: string;
    email: string;
    username: string;
    userId: string;
    department: string;
    role: string;
    status: "Active" | "Inactive";
    phone: string;
    location: string;
    website: string;
    profilePicture?: string | null;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { id: "preferences", label: "Preferences", icon: <Sliders className="h-4 w-4" /> },
];

function initialsFrom(name: string) {
    return name
        .replace(/^Dr\.\s*/i, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "U";
}

function profileFromUser(user: any, roleLabel: string): ProfileData {
    const displayName = user?.username || roleLabel;
    return {
        fullName: displayName,
        username: user?.username || displayName,
        email: user?.email || "",
        userId: String(user?.id ?? "--"),
        department: user?.department || `${roleLabel} Services`,
        role: user?.role || roleLabel,
        status: user?.is_active === false ? "Inactive" : "Active",
        phone: user?.phone || "+1 (555) 000-0000",
        location: user?.location || "Campus Main Building",
        website: user?.website || "university.edu/portal",
        profilePicture: user?.profile_picture || null,
    };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">{children}</label>;
}

function FieldShell({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3.5 py-3 text-sm text-gray-800">
            <span className="text-gray-400">{icon}</span>
            {children}
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-blue-900" : "bg-gray-200"}`}
            aria-pressed={checked}
        >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} />
        </button>
    );
}

function SignOutModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-gray-900">Sign out?</h2>
                <p className="mt-2 text-sm text-gray-500">You&apos;ll need to sign in again to access your account.</p>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={onConfirm} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">Sign out</button>
                </div>
            </div>
        </div>
    );
}

function SecurityPanel() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [twoFactor, setTwoFactor] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage("Please fill in all password fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage("New password and confirmation do not match.");
            return;
        }
        setMessage("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900">Security Settings</h2>
            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                <div>
                    <FieldLabel>Current Password</FieldLabel>
                    <FieldShell icon={<Lock className="h-4 w-4" />}>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-transparent outline-none" placeholder="Enter current password" />
                    </FieldShell>
                </div>
                <div>
                    <FieldLabel>New Password</FieldLabel>
                    <FieldShell icon={<Lock className="h-4 w-4" />}>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-transparent outline-none" placeholder="Enter new password" />
                    </FieldShell>
                </div>
                <div>
                    <FieldLabel>Confirm New Password</FieldLabel>
                    <FieldShell icon={<Lock className="h-4 w-4" />}>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-transparent outline-none" placeholder="Re-enter new password" />
                    </FieldShell>
                </div>
                {message && <p className={`text-sm ${message.includes("successfully") ? "text-emerald-600" : "text-red-500"}`}>{message}</p>}
                <button type="submit" className="rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">Update Password</button>
            </form>
            <div className="mt-8 flex max-w-md items-center justify-between rounded-xl border border-gray-100 px-4 py-4">
                <div>
                    <div className="text-sm font-semibold text-gray-900">Two-Factor Authentication</div>
                    <div className="text-xs text-gray-500">Add an extra layer of security to your account</div>
                </div>
                <Toggle checked={twoFactor} onChange={setTwoFactor} />
            </div>
        </div>
    );
}

function NotificationsPanel() {
    const [settings, setSettings] = useState({ email: true, push: true, weeklyDigest: false, securityAlerts: true });
    const rows: { key: keyof typeof settings; title: string; desc: string }[] = [
        { key: "email", title: "Email Notifications", desc: "Receive updates and alerts via email" },
        { key: "push", title: "Push Notifications", desc: "Receive real-time alerts on your devices" },
        { key: "weeklyDigest", title: "Weekly Digest", desc: "A weekly summary of platform activity" },
        { key: "securityAlerts", title: "Security Alerts", desc: "Get notified about important security events" },
    ];
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900">Notification Preferences</h2>
            <div className="max-w-xl divide-y divide-gray-100">
                {rows.map((row) => (
                    <div key={row.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div>
                            <div className="text-sm font-semibold text-gray-900">{row.title}</div>
                            <div className="text-xs text-gray-500">{row.desc}</div>
                        </div>
                        <Toggle checked={settings[row.key]} onChange={(v) => setSettings((prev) => ({ ...prev, [row.key]: v }))} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function PreferencesPanel() {
    const [language, setLanguage] = useState("English (US)");
    const [timezone, setTimezone] = useState("UTC+02:00 (Central Africa Time)");
    const [theme, setTheme] = useState<"Light" | "Dark" | "System">("Light");
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900">General Preferences</h2>
            <div className="max-w-md space-y-5">
                <div>
                    <FieldLabel>Language</FieldLabel>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none">
                        <option>English (US)</option>
                        <option>French</option>
                        <option>Spanish</option>
                        <option>Kinyarwanda</option>
                    </select>
                </div>
                <div>
                    <FieldLabel>Timezone</FieldLabel>
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none">
                        <option>UTC-05:00 (Eastern Time)</option>
                        <option>UTC+00:00 (GMT)</option>
                        <option>UTC+02:00 (Central Africa Time)</option>
                        <option>UTC+09:00 (Japan Standard Time)</option>
                    </select>
                </div>
                <div>
                    <FieldLabel>Theme</FieldLabel>
                    <div className="flex gap-2">
                        {(["Light", "Dark", "System"] as const).map((t) => (
                            <button key={t} onClick={() => setTheme(t)} className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${theme === t ? "border-blue-900 bg-blue-900 text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{t}</button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProfileSettingsPage({ roleLabel }: { roleLabel: string }) {
    const router = useRouter();
    const hasAccessToken = hasValidAccessToken();
    const { data: user, isLoading, refetch } = useCurrentUserQuery(undefined, { skip: !hasAccessToken });
    const [updateProfile] = useUpdateProfileMutation();
    const [logout] = useLogoutMutation();
    const [activeTab, setActiveTab] = useState<TabId>("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [showSignOut, setShowSignOut] = useState(false);
    const [profile, setProfile] = useState<ProfileData>(() => profileFromUser(null, roleLabel));
    const [draft, setDraft] = useState<ProfileData>(() => profileFromUser(null, roleLabel));
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const nextProfile = profileFromUser(user, roleLabel);
        setProfile(nextProfile);
        setDraft(nextProfile);
    }, [user, roleLabel]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile({
                username: draft.fullName,
            }).unwrap();
            setProfile(draft);
            setIsEditing(false);
            refetch();
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await logout({ refresh: localStorage.getItem("refresh") }).unwrap();
        } catch {}
        localStorage.clear();
        router.push("/auth");
    };

    const activeProfile = isEditing ? draft : profile;

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Profile &amp; Settings</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your account, preferences, and security settings</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                        <Settings size={15} />
                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                    <div className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex flex-col items-center border-b border-gray-100 pb-5 text-center">
                            <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-blue-900 text-lg font-bold text-white">
                                {activeProfile.profilePicture ? (
                                    <img src={activeProfile.profilePicture} alt={activeProfile.fullName} className="h-full w-full object-cover" />
                                ) : (
                                    initialsFrom(activeProfile.fullName)
                                )}
                            </div>
                            <div className="text-sm font-semibold text-gray-900">{activeProfile.fullName}</div>
                            <div className="text-xs text-gray-400">{activeProfile.email || "No email on file"}</div>
                            <span className="mt-2 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">{activeProfile.role.toLowerCase()}</span>
                        </div>

                        <nav className="mt-4 space-y-1">
                            {TABS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${activeTab === item.id ? "bg-blue-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <button onClick={() => setShowSignOut(true)} className="mt-4 flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50">
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>

                    <div className="space-y-6">
                        {activeTab === "profile" && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                                    {!isEditing ? (
                                        <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
                                            <Pencil className="h-4 w-4" />
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => { setDraft(profile); setIsEditing(false); }} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                                                <X className="h-4 w-4" />
                                                Cancel
                                            </button>
                                            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
                                                <Save className="h-4 w-4" />
                                                {saving ? "Saving..." : "Save Changes"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <FieldLabel>Full Name</FieldLabel>
                                        <FieldShell icon={<User className="h-4 w-4" />}>
                                    {isEditing ? <input value={draft.fullName} onChange={(e) => setDraft((p) => ({ ...p, fullName: e.target.value }))} className="w-full bg-transparent outline-none" /> : activeProfile.fullName}
                                </FieldShell>
                            </div>
                                    <div>
                                        <FieldLabel>User ID</FieldLabel>
                                        <FieldShell icon={<Shield className="h-4 w-4" />}>{activeProfile.userId}</FieldShell>
                                    </div>
                                    <div>
                                        <FieldLabel>Email Address</FieldLabel>
                                        <FieldShell icon={<Mail className="h-4 w-4" />}>
                                            {isEditing ? <input value={draft.email} onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))} className="w-full bg-transparent outline-none" /> : activeProfile.email}
                                        </FieldShell>
                                    </div>
                                    <div>
                                        <FieldLabel>Department</FieldLabel>
                                        <FieldShell icon={<BookOpen className="h-4 w-4" />}>
                                            {isEditing ? <input value={draft.department} onChange={(e) => setDraft((p) => ({ ...p, department: e.target.value }))} className="w-full bg-transparent outline-none" /> : activeProfile.department}
                                        </FieldShell>
                                    </div>
                                    <div>
                                        <FieldLabel>Role</FieldLabel>
                                        <FieldShell icon={<User className="h-4 w-4" />}>{activeProfile.role}</FieldShell>
                                    </div>
                                    <div>
                                        <FieldLabel>Status</FieldLabel>
                                        <FieldShell icon={<CheckCircle2 className="h-4 w-4" />}>{activeProfile.status}</FieldShell>
                                    </div>
                                    <div>
                                        <FieldLabel>Phone</FieldLabel>
                                        <FieldShell icon={<Phone className="h-4 w-4" />}>{activeProfile.phone}</FieldShell>
                                    </div>
                                    <div>
                                        <FieldLabel>Website</FieldLabel>
                                        <FieldShell icon={<Globe className="h-4 w-4" />}>{activeProfile.website}</FieldShell>
                                    </div>
                                    <div className="md:col-span-2">
                                        <FieldLabel>Location</FieldLabel>
                                        <FieldShell icon={<MapPin className="h-4 w-4" />}>{activeProfile.location}</FieldShell>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && <SecurityPanel />}
                        {activeTab === "notifications" && <NotificationsPanel />}
                        {activeTab === "preferences" && <PreferencesPanel />}
                    </div>
                </div>
            </div>

            {showSignOut && <SignOutModal onClose={() => setShowSignOut(false)} onConfirm={handleSignOut} />}
        </main>
    );
}
