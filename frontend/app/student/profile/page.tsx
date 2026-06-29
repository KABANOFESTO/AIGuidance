"use client";

import React, { useState } from "react";
import {
    User,
    Shield,
    BookOpen,
    CheckCircle2,
    Phone,
    MapPin,
    Globe,
    Mail,
    Pencil,
    LogOut,
    X,
    Save,
    Bell,
    Sliders,
    Lock,
} from "lucide-react";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

type TabId = "profile" | "security" | "notifications" | "preferences";

interface ProfileData {
    fullName: string;
    email: string;
    studentStaffId: string;
    department: string;
    role: string;
    status: "Active" | "Inactive";
    phone: string;
    location: string;
    website: string;
}

interface NavItem {
    id: TabId;
    label: string;
    icon: React.ReactNode;
}

// ----------------------------------------------------------------------------
// Static config
// ----------------------------------------------------------------------------

const NAV_ITEMS: NavItem[] = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
    {
        id: "notifications",
        label: "Notifications",
        icon: <Bell className="h-4 w-4" />,
    },
    {
        id: "preferences",
        label: "Preferences",
        icon: <Sliders className="h-4 w-4" />,
    },
];

const INITIAL_PROFILE: ProfileData = {
    fullName: "Dr. Sarah Mitchell",
    email: "admin@university.edu",
    studentStaffId: "ADM001",
    department: "IT Administration",
    role: "Admin",
    status: "Active",
    phone: "+1 (555) 234-5678",
    location: "Campus Building A, Room 204",
    website: "university.edu/portal",
};

function getInitials(name: string): string {
    return name
        .replace(/^Dr\.\s*/i, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
}

// ----------------------------------------------------------------------------
// Reusable bits
// ----------------------------------------------------------------------------

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
            {children}
        </label>
    );
}

function ReadOnlyField({
    icon,
    value,
}: {
    icon: React.ReactNode;
    value: string;
}) {
    return (
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3.5 py-3 text-sm text-gray-800">
            <span className="text-gray-400">{icon}</span>
            {value}
        </div>
    );
}

function EditableField({
    icon,
    value,
    onChange,
}: {
    icon: React.ReactNode;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 ring-1 ring-blue-100 focus-within:ring-2 focus-within:ring-blue-400">
            <span className="text-gray-400">{icon}</span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-transparent outline-none"
            />
        </div>
    );
}

function Toggle({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-blue-900" : "bg-gray-200"
                }`}
            aria-pressed={checked}
        >
            <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"
                    }`}
            />
        </button>
    );
}

// ----------------------------------------------------------------------------
// Tab panels
// ----------------------------------------------------------------------------

function ProfilePanel({
    profile,
    isEditing,
    draft,
    setDraft,
    onStartEdit,
    onCancel,
    onSave,
}: {
    profile: ProfileData;
    isEditing: boolean;
    draft: ProfileData;
    setDraft: React.Dispatch<React.SetStateAction<ProfileData>>;
    onStartEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
}) {
    const data = isEditing ? draft : profile;

    const update = (key: keyof ProfileData) => (value: string) =>
        setDraft((prev) => ({ ...prev, [key]: value }));

    return (
        <>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-bold text-gray-900">
                    Personal Information
                </h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <FieldLabel>Full Name</FieldLabel>
                        {isEditing ? (
                            <EditableField
                                icon={<User className="h-4 w-4" />}
                                value={data.fullName}
                                onChange={update("fullName")}
                            />
                        ) : (
                            <ReadOnlyField
                                icon={<User className="h-4 w-4" />}
                                value={data.fullName}
                            />
                        )}
                    </div>

                    <div>
                        <FieldLabel>Student/Staff ID</FieldLabel>
                        <ReadOnlyField
                            icon={<Shield className="h-4 w-4" />}
                            value={data.studentStaffId}
                        />
                    </div>

                    <div>
                        <FieldLabel>Email Address</FieldLabel>
                        {isEditing ? (
                            <EditableField
                                icon={<Mail className="h-4 w-4" />}
                                value={data.email}
                                onChange={update("email")}
                            />
                        ) : (
                            <ReadOnlyField
                                icon={<Mail className="h-4 w-4" />}
                                value={data.email}
                            />
                        )}
                    </div>

                    <div>
                        <FieldLabel>Department</FieldLabel>
                        {isEditing ? (
                            <EditableField
                                icon={<BookOpen className="h-4 w-4" />}
                                value={data.department}
                                onChange={update("department")}
                            />
                        ) : (
                            <ReadOnlyField
                                icon={<BookOpen className="h-4 w-4" />}
                                value={data.department}
                            />
                        )}
                    </div>

                    <div>
                        <FieldLabel>Role</FieldLabel>
                        <ReadOnlyField
                            icon={<User className="h-4 w-4" />}
                            value={data.role}
                        />
                    </div>

                    <div>
                        <FieldLabel>Status</FieldLabel>
                        <ReadOnlyField
                            icon={<CheckCircle2 className="h-4 w-4" />}
                            value={data.status}
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={onSave}
                                className="flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                            >
                                <Save className="h-4 w-4" />
                                Save Changes
                            </button>
                            <button
                                onClick={onCancel}
                                className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onStartEdit}
                            className="flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-bold text-gray-900">
                    Contact Information
                </h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-xl bg-gray-50 px-3.5 py-3">
                        <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                        <div>
                            <div className="text-xs text-gray-400">Phone</div>
                            {isEditing ? (
                                <input
                                    value={data.phone}
                                    onChange={(e) => update("phone")(e.target.value)}
                                    className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none"
                                />
                            ) : (
                                <div className="text-sm font-medium text-gray-800">
                                    {data.phone}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-gray-50 px-3.5 py-3">
                        <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                        <div>
                            <div className="text-xs text-gray-400">Location</div>
                            {isEditing ? (
                                <input
                                    value={data.location}
                                    onChange={(e) => update("location")(e.target.value)}
                                    className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none"
                                />
                            ) : (
                                <div className="text-sm font-medium text-gray-800">
                                    {data.location}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-gray-50 px-3.5 py-3">
                        <Globe className="mt-0.5 h-4 w-4 text-gray-400" />
                        <div>
                            <div className="text-xs text-gray-400">Website</div>
                            {isEditing ? (
                                <input
                                    value={data.website}
                                    onChange={(e) => update("website")(e.target.value)}
                                    className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none"
                                />
                            ) : (
                                <div className="text-sm font-medium text-gray-800">
                                    {data.website}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
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
            <h2 className="mb-6 text-lg font-bold text-gray-900">
                Security Settings
            </h2>

            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                <div>
                    <FieldLabel>Current Password</FieldLabel>
                    <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3.5 py-2.5">
                        <Lock className="h-4 w-4 text-gray-400" />
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-transparent text-sm outline-none"
                            placeholder="Enter current password"
                        />
                    </div>
                </div>

                <div>
                    <FieldLabel>New Password</FieldLabel>
                    <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3.5 py-2.5">
                        <Lock className="h-4 w-4 text-gray-400" />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-transparent text-sm outline-none"
                            placeholder="Enter new password"
                        />
                    </div>
                </div>

                <div>
                    <FieldLabel>Confirm New Password</FieldLabel>
                    <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3.5 py-2.5">
                        <Lock className="h-4 w-4 text-gray-400" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-transparent text-sm outline-none"
                            placeholder="Re-enter new password"
                        />
                    </div>
                </div>

                {message && (
                    <p
                        className={`text-sm ${message.includes("successfully")
                            ? "text-emerald-600"
                            : "text-red-500"
                            }`}
                    >
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    className="rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                    Update Password
                </button>
            </form>

            <div className="mt-8 flex max-w-md items-center justify-between rounded-xl border border-gray-100 px-4 py-4">
                <div>
                    <div className="text-sm font-semibold text-gray-900">
                        Two-Factor Authentication
                    </div>
                    <div className="text-xs text-gray-500">
                        Add an extra layer of security to your account
                    </div>
                </div>
                <Toggle checked={twoFactor} onChange={setTwoFactor} />
            </div>
        </div>
    );
}

function NotificationsPanel() {
    const [settings, setSettings] = useState({
        email: true,
        push: true,
        weeklyDigest: false,
        securityAlerts: true,
    });

    const update = (key: keyof typeof settings) => (v: boolean) =>
        setSettings((prev) => ({ ...prev, [key]: v }));

    const ROWS: { key: keyof typeof settings; title: string; desc: string }[] = [
        {
            key: "email",
            title: "Email Notifications",
            desc: "Receive updates and alerts via email",
        },
        {
            key: "push",
            title: "Push Notifications",
            desc: "Receive real-time alerts on your devices",
        },
        {
            key: "weeklyDigest",
            title: "Weekly Digest",
            desc: "A weekly summary of platform activity",
        },
        {
            key: "securityAlerts",
            title: "Security Alerts",
            desc: "Get notified about important security events",
        },
    ];

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900">
                Notification Preferences
            </h2>

            <div className="max-w-xl divide-y divide-gray-100">
                {ROWS.map((row) => (
                    <div
                        key={row.key}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                        <div>
                            <div className="text-sm font-semibold text-gray-900">
                                {row.title}
                            </div>
                            <div className="text-xs text-gray-500">{row.desc}</div>
                        </div>
                        <Toggle checked={settings[row.key]} onChange={update(row.key)} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function PreferencesPanel() {
    const [language, setLanguage] = useState("English (US)");
    const [timezone, setTimezone] = useState("UTC-05:00 (Eastern Time)");
    const [theme, setTheme] = useState<"Light" | "Dark" | "System">("Light");

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900">
                General Preferences
            </h2>

            <div className="max-w-md space-y-5">
                <div>
                    <FieldLabel>Language</FieldLabel>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none"
                    >
                        <option>English (US)</option>
                        <option>French</option>
                        <option>Spanish</option>
                        <option>Kinyarwanda</option>
                    </select>
                </div>

                <div>
                    <FieldLabel>Timezone</FieldLabel>
                    <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none"
                    >
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
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${theme === t
                                    ? "border-blue-900 bg-blue-900 text-white"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Sign-out confirmation modal
// ----------------------------------------------------------------------------

function SignOutModal({
    onConfirm,
    onClose,
}: {
    onConfirm: () => void;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-gray-900">Sign out?</h2>
                <p className="mt-2 text-sm text-gray-500">
                    You'll need to sign in again to access your account.
                </p>
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function ProfileAndSettingsPage() {
    const [activeTab, setActiveTab] = useState<TabId>("profile");
    const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
    const [draft, setDraft] = useState<ProfileData>(INITIAL_PROFILE);
    const [isEditing, setIsEditing] = useState(false);
    const [showSignOut, setShowSignOut] = useState(false);
    const [signedOut, setSignedOut] = useState(false);

    const startEdit = () => {
        setDraft(profile);
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setDraft(profile);
        setIsEditing(false);
    };

    const saveEdit = () => {
        setProfile(draft);
        setIsEditing(false);
    };

    if (signedOut) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-gray-900">
                        You've been signed out
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Thanks for visiting, {profile.fullName}.
                    </p>
                    <button
                        onClick={() => setSignedOut(false)}
                        className="mt-5 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                        Sign back in
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Profile &amp; Settings
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your account, preferences, and security settings
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                    {/* Sidebar */}
                    <div className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex flex-col items-center border-b border-gray-100 pb-5 text-center">
                            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-900 text-lg font-bold text-white">
                                {getInitials(profile.fullName)}
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                                {profile.fullName}
                            </div>
                            <div className="text-xs text-gray-400">{profile.email}</div>
                            <span className="mt-2 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                {profile.role.toLowerCase()}
                            </span>
                        </div>

                        <nav className="mt-4 space-y-1">
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${activeTab === item.id
                                        ? "bg-blue-900 text-white"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <button
                            onClick={() => setShowSignOut(true)}
                            className="mt-4 flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>

                    {/* Main content */}
                    <div>
                        {activeTab === "profile" && (
                            <ProfilePanel
                                profile={profile}
                                isEditing={isEditing}
                                draft={draft}
                                setDraft={setDraft}
                                onStartEdit={startEdit}
                                onCancel={cancelEdit}
                                onSave={saveEdit}
                            />
                        )}
                        {activeTab === "security" && <SecurityPanel />}
                        {activeTab === "notifications" && <NotificationsPanel />}
                        {activeTab === "preferences" && <PreferencesPanel />}
                    </div>
                </div>
            </div>

            {showSignOut && (
                <SignOutModal
                    onClose={() => setShowSignOut(false)}
                    onConfirm={() => {
                        setShowSignOut(false);
                        setSignedOut(true);
                    }}
                />
            )}
        </main>
    );
}