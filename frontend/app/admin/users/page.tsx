"use client";

import { useMemo, useState } from "react";
import { Search, Filter, Plus, RefreshCw, Trash2, ShieldCheck, UserX, UserCheck } from "lucide-react";
import { useCreateUserMutation, useDeleteUserMutation, useGetAllUsersQuery, useToggleUserActiveMutation } from "@/lib/redux/slices/AuthSlice";

type RoleFilter = "all" | "Admin" | "Student" | "Lecturer";

export default function UserManagement() {
    const { data: users = [], isLoading, refetch } = useGetAllUsersQuery();
    const [createUser] = useCreateUserMutation();
    const [deleteUser] = useDeleteUserMutation();
    const [toggleUserActive] = useToggleUserActiveMutation();
    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ username: "", email: "", role: "Student" as "Admin" | "Student" | "Lecturer" });

    const filtered = useMemo(() => {
        return users.filter((user: any) => {
            const matchesQuery =
                user.username?.toLowerCase().includes(query.toLowerCase()) ||
                user.email?.toLowerCase().includes(query.toLowerCase()) ||
                user.role?.toLowerCase().includes(query.toLowerCase());
            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            return matchesQuery && matchesRole;
        });
    }, [users, query, roleFilter]);

    const handleAdd = async () => {
        if (!form.username.trim() || !form.email.trim()) return;
        await createUser(form).unwrap();
        setForm({ username: "", email: "", role: "Student" });
        setShowForm(false);
        refetch();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">User Management</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage student, lecturer, and admin accounts from a single workspace</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                        <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                    <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#1e2a78] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#16205c]">
                        <Plus size={16} />
                        Add User
                    </button>
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 min-w-[200px]">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search users..."
                            className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={15} className="text-slate-400" />
                        {(["all", "Admin", "Student", "Lecturer"] as const).map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold ${roleFilter === role ? "bg-[#1e2a78] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                            >
                                {role === "all" ? "All" : role}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((user: any) => (
                                <tr key={user.id} className="border-t border-slate-100 text-sm">
                                    <td className="px-6 py-4 font-semibold text-slate-800">{user.username}</td>
                                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{user.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.is_active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                                            {user.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <button onClick={() => toggleUserActive(user.id)} className="rounded-lg p-2 hover:bg-slate-50 hover:text-emerald-600" title="Toggle status">
                                                {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                                            </button>
                                            <button onClick={() => deleteUser(user.id)} className="rounded-lg p-2 hover:bg-slate-50 hover:text-red-500" title="Delete user">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!filtered.length && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900">Add User</h3>
                        <div className="mt-4 space-y-3">
                            <input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} placeholder="Username" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
                            <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
                            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as any }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
                                <option value="Student">Student</option>
                                <option value="Lecturer">Lecturer</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleAdd} className="rounded-xl bg-[#1e2a78] px-4 py-2 text-sm font-semibold text-white">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
