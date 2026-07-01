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
import { toast } from "sonner";

type TabId = "profile" | "security" | "notifications" | "preferences";
type ThemeOption = "Light" | "Dark" | "System";
type NotificationField = "notificationEmail" | "pushNotifications" | "weeklyDigest" | "securityAlerts";

interface ProfileState {
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
    profilePictureUrl: string | null;
    notificationEmail: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
    securityAlerts: boolean;
    language: string;
    timezone: string;
    theme: ThemeOption;
    twoFactorEnabled: boolean;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { id: "preferences", label: "Preferences", icon: <Sliders className="h-4 w-4" /> },
];

function initialsFrom(name: string) {
    return (
        name
            .replace(/^Dr\.\s*/i, "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase() || "U"
    );
}

function getTheme(value: unknown): ThemeOption {
    if (value === "Dark" || value === "System") return value;
    return "Light";
}

function profileFromUser(user: any, roleLabel: string): ProfileState {
    const settings = user?.settings ?? {};
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
        profilePictureUrl: user?.profile_picture_url || user?.profile_picture || null,
        notificationEmail: settings.notification_email ?? true,
        pushNotifications: settings.push_notifications ?? true,
        weeklyDigest: settings.weekly_digest ?? false,
        securityAlerts: settings.security_alerts ?? true,
        language: settings.language || "English (US)",
        timezone: settings.timezone || "UTC+02:00 (Central Africa Time)",
        theme: getTheme(settings.theme),
        twoFactorEnabled: settings.two_factor_enabled ?? false,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
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
                    <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}

function PanelShell({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
    return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            </div>
            {action}
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
    const [profile, setProfile] = useState<ProfileState>(() => profileFromUser(null, roleLabel));
    const [draft, setDraft] = useState<ProfileState>(() => profileFromUser(null, roleLabel));
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingSecurity, setSavingSecurity] = useState(false);
    const [savingNotifications, setSavingNotifications] = useState(false);
    const [savingPreferences, setSavingPreferences] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    useEffect(() => {
        const nextProfile = profileFromUser(user, roleLabel);
        setProfile(nextProfile);
        setDraft(nextProfile);
        setProfileImageFile(null);
        setProfileImagePreview(nextProfile.profilePictureUrl);
    }, [user, roleLabel]);

    useEffect(() => {
        return () => {
            if (profileImagePreview && profileImagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(profileImagePreview);
            }
        };
    }, [profileImagePreview]);

    const handleProfileFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setProfileImageFile(file);
        if (profileImagePreview && profileImagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(profileImagePreview);
        }
        setProfileImagePreview(file ? URL.createObjectURL(file) : profile.profilePictureUrl);
    };

    const handleProfileSave = async () => {
        setSavingProfile(true);
        setStatusMessage(null);
        try {
            const payload = profileImageFile ? new FormData() : { username: draft.fullName || draft.username };
            if (payload instanceof FormData) {
                payload.append("username", draft.fullName || draft.username);
                if (profileImageFile) {
                    payload.append("profile_picture", profileImageFile);
                }
            }

            const updatedUser = await updateProfile(payload).unwrap();
            const nextProfile = profileFromUser(updatedUser, roleLabel);
            setProfile(nextProfile);
            setDraft((current) => ({
                ...current,
                ...nextProfile,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
            setIsEditing(false);
            setProfileImageFile(null);
            setStatusMessage("Profile updated successfully.");
            toast.success("Profile updated successfully.");
            await refetch();
        } catch (error: any) {
            const message = error?.data?.detail || error?.data?.error || "Unable to update profile.";
            setStatusMessage(message);
            toast.error(message);
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSave = async () => {
        if (!draft.currentPassword || !draft.newPassword || !draft.confirmPassword) {
            setStatusMessage("Fill in all password fields before saving.");
            return;
        }

        if (draft.newPassword !== draft.confirmPassword) {
            setStatusMessage("New password and confirmation do not match.");
            return;
        }

        setSavingSecurity(true);
        setStatusMessage(null);
        try {
            const updatedUser = await updateProfile({
                current_password: draft.currentPassword,
                new_password: draft.newPassword,
            }).unwrap();

            setProfile(profileFromUser(updatedUser, roleLabel));
            setDraft((current) => ({
                ...current,
                ...profileFromUser(updatedUser, roleLabel),
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
            setStatusMessage("Password updated successfully.");
            toast.success("Password updated successfully.");
            await refetch();
        } catch (error: any) {
            const message = error?.data?.current_password || error?.data?.detail || "Unable to update password.";
            setStatusMessage(message);
            toast.error(message);
        } finally {
            setSavingSecurity(false);
        }
    };

    const handleNotificationSave = async () => {
        setSavingNotifications(true);
        setStatusMessage(null);
        try {
            const updatedUser = await updateProfile({
                notification_email: draft.notificationEmail,
                push_notifications: draft.pushNotifications,
                weekly_digest: draft.weeklyDigest,
                security_alerts: draft.securityAlerts,
            }).unwrap();
            setProfile(profileFromUser(updatedUser, roleLabel));
            setDraft((current) => ({ ...current, ...profileFromUser(updatedUser, roleLabel) }));
            setStatusMessage("Notification preferences saved.");
            toast.success("Notification preferences saved.");
            await refetch();
        } catch (error: any) {
            const message = error?.data?.detail || "Unable to update notification settings.";
            setStatusMessage(message);
            toast.error(message);
        } finally {
            setSavingNotifications(false);
        }
    };

    const handlePreferencesSave = async () => {
        setSavingPreferences(true);
        setStatusMessage(null);
        try {
            const updatedUser = await updateProfile({
                language: draft.language,
                timezone: draft.timezone,
                theme: draft.theme,
                two_factor_enabled: draft.twoFactorEnabled,
            }).unwrap();
            setProfile(profileFromUser(updatedUser, roleLabel));
            setDraft((current) => ({ ...current, ...profileFromUser(updatedUser, roleLabel) }));
            setStatusMessage("Preferences saved.");
            toast.success("Preferences saved.");
            await refetch();
        } catch (error: any) {
            const message = error?.data?.detail || "Unable to update preferences.";
            setStatusMessage(message);
            toast.error(message);
        } finally {
            setSavingPreferences(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await logout({ refresh: localStorage.getItem("refresh") }).unwrap();
        } catch {
            // ignore sign-out cleanup failures
        }
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
                        type="button"
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                        <Settings size={15} />
                        Refresh
                    </button>
                </div>

                {(isLoading || statusMessage) && (
                    <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
                        {isLoading ? "Loading profile..." : statusMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                    <div className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex flex-col items-center border-b border-gray-100 pb-5 text-center">
                            <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-blue-900 text-lg font-bold text-white">
                                {profileImagePreview ? (
                                    <img src={profileImagePreview} alt={activeProfile.fullName} className="h-full w-full object-cover" />
                                ) : (
                                    initialsFrom(activeProfile.fullName)
                                )}
                            </div>
                            <div className="text-sm font-semibold text-gray-900">{activeProfile.fullName}</div>
                            <div className="text-xs text-gray-400">{activeProfile.email || "No email on file"}</div>
                            <span className="mt-2 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                {activeProfile.role.toLowerCase()}
                            </span>
                        </div>

                        <nav className="mt-4 space-y-1">
                            {TABS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                                        activeTab === item.id ? "bg-blue-900 text-white" : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <button
                            type="button"
                            onClick={() => setShowSignOut(true)}
                            className="mt-4 flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>

                    <div className="space-y-6">
                        {activeTab === "profile" && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <PanelShell
                                    title="Personal Information"
                                    subtitle="Keep your account identity and profile picture current."
                                    action={
                                        !isEditing ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(true)}
                                                className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Edit Profile
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDraft(profile);
                                                        setProfileImageFile(null);
                                                        setProfileImagePreview(profile.profilePictureUrl);
                                                        setIsEditing(false);
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleProfileSave}
                                                    disabled={savingProfile}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                                                >
                                                    <Save className="h-4 w-4" />
                                                    {savingProfile ? "Saving..." : "Save Changes"}
                                                </button>
                                            </div>
                                        )
                                    }
                                />

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <FieldLabel>Full Name</FieldLabel>
                                        <FieldShell icon={<User className="h-4 w-4" />}>
                                            {isEditing ? (
                                                <input
                                                    value={draft.fullName}
                                                    onChange={(e) => setDraft((p) => ({ ...p, fullName: e.target.value }))}
                                                    className="w-full bg-transparent outline-none"
                                                />
                                            ) : (
                                                activeProfile.fullName
                                            )}
                                        </FieldShell>
                                    </div>
                                    <div>
                                        <FieldLabel>User ID</FieldLabel>
                                        <FieldShell icon={<Shield className="h-4 w-4" />}>{activeProfile.userId}</FieldShell>
                                    </div>
                                    <div>
                                        <FieldLabel>Email Address</FieldLabel>
                                        <FieldShell icon={<Mail className="h-4 w-4" />}>
                                            <input value={activeProfile.email} readOnly className="w-full bg-transparent outline-none text-gray-500" />
                                        </FieldShell>
                                    </div>
                                    <div>
                                        <FieldLabel>Department</FieldLabel>
                                        <FieldShell icon={<BookOpen className="h-4 w-4" />}>
                                            <input value={activeProfile.department} readOnly className="w-full bg-transparent outline-none text-gray-500" />
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
                                        <FieldShell icon={<Phone className="h-4 w-4" />}>
                                            <input value={activeProfile.phone} readOnly className="w-full bg-transparent outline-none text-gray-500" />
                                        </FieldShell>
                                    </div>
                                    <div>
                                        <FieldLabel>Website</FieldLabel>
                                        <FieldShell icon={<Globe className="h-4 w-4" />}>
                                            <input value={activeProfile.website} readOnly className="w-full bg-transparent outline-none text-gray-500" />
                                        </FieldShell>
                                    </div>
                                    <div className="md:col-span-2">
                                        <FieldLabel>Location</FieldLabel>
                                        <FieldShell icon={<MapPin className="h-4 w-4" />}>
                                            <input value={activeProfile.location} readOnly className="w-full bg-transparent outline-none text-gray-500" />
                                        </FieldShell>
                                    </div>
                                    {isEditing && (
                                        <div className="md:col-span-2">
                                            <FieldLabel>Profile Photo</FieldLabel>
                                            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                                                <input type="file" accept="image/*" onChange={handleProfileFileChange} className="text-sm text-gray-600" />
                                                <span className="text-xs text-gray-500">
                                                    {profileImageFile ? profileImageFile.name : "PNG, JPG, or WEBP up to your backend limit"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <PanelShell
                                    title="Security Settings"
                                    subtitle="Update your password and account protection settings."
                                    action={
                                        <button
                                            type="button"
                                            onClick={handlePasswordSave}
                                            disabled={savingSecurity}
                                            className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                                        >
                                            <Save className="h-4 w-4" />
                                            {savingSecurity ? "Saving..." : "Update Password"}
                                        </button>
                                    }
                                />

                                <div className="max-w-md space-y-4">
                                    <div>
                                        <FieldLabel>Current Password</FieldLabel>
                                        <FieldShell icon={<Lock className="h-4 w-4" />}>
                                            <input
                                                type="password"
                                                value={draft.currentPassword}
                                                onChange={(e) => setDraft((p) => ({ ...p, currentPassword: e.target.value }))}
                                                className="w-full bg-transparent outline-none"
                                                placeholder="Enter current password"
                                            />
                                        </FieldShell>
                                    </div>
                                    <div>
                                        <FieldLabel>New Password</FieldLabel>
                                        <FieldShell icon={<Lock className="h-4 w-4" />}>
                                            <input
                                                type="password"
                                                value={draft.newPassword}
                                                onChange={(e) => setDraft((p) => ({ ...p, newPassword: e.target.value }))}
                                                className="w-full bg-transparent outline-none"
                                                placeholder="Enter new password"
                                            />
                                        </FieldShell>
                                    </div>
                                    <div>
                                        <FieldLabel>Confirm New Password</FieldLabel>
                                        <FieldShell icon={<Lock className="h-4 w-4" />}>
                                            <input
                                                type="password"
                                                value={draft.confirmPassword}
                                                onChange={(e) => setDraft((p) => ({ ...p, confirmPassword: e.target.value }))}
                                                className="w-full bg-transparent outline-none"
                                                placeholder="Re-enter new password"
                                            />
                                        </FieldShell>
                                    </div>
                                    <div className="flex max-w-md items-center justify-between rounded-xl border border-gray-100 px-4 py-4">
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">Two-Factor Authentication</div>
                                            <div className="text-xs text-gray-500">Add an extra layer of security to your account</div>
                                        </div>
                                        <Toggle
                                            checked={draft.twoFactorEnabled}
                                            onChange={(v) => setDraft((p) => ({ ...p, twoFactorEnabled: v }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <PanelShell
                                    title="Notification Preferences"
                                    subtitle="Control how the system contacts you."
                                    action={
                                        <button
                                            type="button"
                                            onClick={handleNotificationSave}
                                            disabled={savingNotifications}
                                            className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                                        >
                                            <Save className="h-4 w-4" />
                                            {savingNotifications ? "Saving..." : "Save Notifications"}
                                        </button>
                                    }
                                />
                                <div className="max-w-xl divide-y divide-gray-100">
                                    {[
                                        { key: "notificationEmail", title: "Email Notifications", desc: "Receive updates and alerts via email" },
                                        { key: "pushNotifications", title: "Push Notifications", desc: "Receive real-time alerts on your devices" },
                                        { key: "weeklyDigest", title: "Weekly Digest", desc: "A weekly summary of platform activity" },
                                        { key: "securityAlerts", title: "Security Alerts", desc: "Get notified about important security events" },
                                    ].map((row) => (
                                        <div key={row.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{row.title}</div>
                                                <div className="text-xs text-gray-500">{row.desc}</div>
                                            </div>
                                            {(() => {
                                                const key = row.key as NotificationField;
                                                return (
                                                    <Toggle
                                                        checked={draft[key]}
                                                        onChange={(v) =>
                                                            setDraft((prev) => ({
                                                                ...prev,
                                                                [key]: v,
                                                            }))
                                                        }
                                                    />
                                                );
                                            })()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "preferences" && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <PanelShell
                                    title="General Preferences"
                                    subtitle="Tune the system to your locale and workflow."
                                    action={
                                        <button
                                            type="button"
                                            onClick={handlePreferencesSave}
                                            disabled={savingPreferences}
                                            className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                                        >
                                            <Save className="h-4 w-4" />
                                            {savingPreferences ? "Saving..." : "Save Preferences"}
                                        </button>
                                    }
                                />
                                <div className="max-w-md space-y-5">
                                    <div>
                                        <FieldLabel>Language</FieldLabel>
                                        <select
                                            value={draft.language}
                                            onChange={(e) => setDraft((p) => ({ ...p, language: e.target.value }))}
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
                                            value={draft.timezone}
                                            onChange={(e) => setDraft((p) => ({ ...p, timezone: e.target.value }))}
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
                                            {(["Light", "Dark", "System"] as const).map((themeOption) => (
                                                <button
                                                    key={themeOption}
                                                    type="button"
                                                    onClick={() => setDraft((p) => ({ ...p, theme: themeOption }))}
                                                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                                                        draft.theme === themeOption
                                                            ? "border-blue-900 bg-blue-900 text-white"
                                                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {themeOption}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-4">
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">Two-Factor Enabled</div>
                                            <div className="text-xs text-gray-500">Mirrors your security preference in the account profile</div>
                                        </div>
                                        <Toggle checked={draft.twoFactorEnabled} onChange={(v) => setDraft((p) => ({ ...p, twoFactorEnabled: v }))} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showSignOut && <SignOutModal onClose={() => setShowSignOut(false)} onConfirm={handleSignOut} />}
        </main>
    );
}
