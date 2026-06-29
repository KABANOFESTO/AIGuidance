'use client';

import { useMemo, useState } from 'react';
import { Search, Filter, Download, Plus, Eye, Pencil, Trash2, X } from 'lucide-react';

/* ── Types ── */
interface StudentRow {
    id: string;
    initials: string;
    name: string;
    studentId: string;
    department: string;
    gpa: number;
    status: 'Active' | 'At Risk' | 'Suspended';
    risk: 'low' | 'medium' | 'high';
}

interface StaffRow {
    id: string;
    initials: string;
    name: string;
    staffId: string;
    department: string;
    role: string;
    status: 'Active' | 'Inactive';
}

/* ── Seed data — replace with real API data ── */
const initialStudents: StudentRow[] = [
    { id: '1', initials: 'AJ', name: 'Alex Johnson', studentId: 'STU2024001', department: 'Computer Science', gpa: 3.8, status: 'Active', risk: 'low' },
    { id: '2', initials: 'PS', name: 'Priya Sharma', studentId: 'STU2024002', department: 'Data Science', gpa: 3.5, status: 'Active', risk: 'medium' },
    { id: '3', initials: 'MW', name: 'Marcus Williams', studentId: 'STU2024003', department: 'Computer Science', gpa: 2.8, status: 'At Risk', risk: 'high' },
    { id: '4', initials: 'FA', name: 'Fatima Al-Hassan', studentId: 'STU2024004', department: 'Software Eng', gpa: 3.9, status: 'Active', risk: 'low' },
    { id: '5', initials: 'JK', name: 'Jordan Kim', studentId: 'STU2024005', department: 'Computer Science', gpa: 3.1, status: 'Active', risk: 'medium' },
];

const initialStaff: StaffRow[] = [
    { id: '1', initials: 'SM', name: 'Dr. Sarah Mitchell', staffId: 'ADM001', department: "Registrar's Office", role: 'System Administrator', status: 'Active' },
    { id: '2', initials: 'TN', name: 'Thomas Ngabo', staffId: 'LEC014', department: 'Computer Science', role: 'Lecturer', status: 'Active' },
    { id: '3', initials: 'GU', name: 'Grace Uwase', staffId: 'ADV007', department: 'Academic Advising', role: 'Advisor', status: 'Active' },
];

const statusStyles: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-600',
    'At Risk': 'bg-amber-50 text-amber-600',
    Suspended: 'bg-red-50 text-red-600',
    Inactive: 'bg-slate-100 text-slate-500',
};

const riskStyles: Record<string, string> = {
    low: 'bg-emerald-50 text-emerald-600',
    medium: 'bg-amber-50 text-amber-600',
    high: 'bg-red-50 text-red-600',
};

const avatarColors = ['#1e3a8a', '#4338ca', '#7c3aed', '#0f766e', '#0369a1'];
const avatarColor = (seed: string) =>
    avatarColors[seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length];

export default function UserManagement() {
    const [activeTab, setActiveTab] = useState<'students' | 'staff'>('students');
    const [students, setStudents] = useState<StudentRow[]>(initialStudents);
    const [staff, setStaff] = useState<StaffRow[]>(initialStaff);
    const [query, setQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [viewRow, setViewRow] = useState<StudentRow | StaffRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', department: '', identifier: '' });

    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            const matchesQuery =
                s.name.toLowerCase().includes(query.toLowerCase()) ||
                s.studentId.toLowerCase().includes(query.toLowerCase()) ||
                s.department.toLowerCase().includes(query.toLowerCase());
            const matchesRisk = riskFilter === 'all' || s.risk === riskFilter;
            return matchesQuery && matchesRisk;
        });
    }, [students, query, riskFilter]);

    const filteredStaff = useMemo(() => {
        return staff.filter(
            (s) =>
                s.name.toLowerCase().includes(query.toLowerCase()) ||
                s.staffId.toLowerCase().includes(query.toLowerCase()) ||
                s.department.toLowerCase().includes(query.toLowerCase()),
        );
    }, [staff, query]);

    const handleDeleteConfirmed = () => {
        if (!deleteTarget) return;
        if (activeTab === 'students') {
            setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        } else {
            setStaff((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        }
        setDeleteTarget(null);
    };

    const handleExport = () => {
        const rows = activeTab === 'students' ? filteredStudents : filteredStaff;
        const headers = activeTab === 'students'
            ? ['Name', 'Student ID', 'Department', 'GPA', 'Status', 'Risk']
            : ['Name', 'Staff ID', 'Department', 'Role', 'Status'];
        const csvRows = rows.map((r: any) =>
            activeTab === 'students'
                ? [r.name, r.studentId, r.department, r.gpa, r.status, r.risk]
                : [r.name, r.staffId, r.department, r.role, r.status],
        );
        const csv = [headers, ...csvRows].map((row) => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleAddUser = () => {
        if (!newUser.name.trim()) return;
        const initials = newUser.name
            .split(' ')
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

        if (activeTab === 'students') {
            setStudents((prev) => [
                ...prev,
                {
                    id: String(Date.now()),
                    initials,
                    name: newUser.name,
                    studentId: newUser.identifier || `STU${Date.now().toString().slice(-6)}`,
                    department: newUser.department || 'Undeclared',
                    gpa: 0,
                    status: 'Active',
                    risk: 'low',
                },
            ]);
        } else {
            setStaff((prev) => [
                ...prev,
                {
                    id: String(Date.now()),
                    initials,
                    name: newUser.name,
                    staffId: newUser.identifier || `STF${Date.now().toString().slice(-6)}`,
                    department: newUser.department || 'General',
                    role: 'Lecturer',
                    status: 'Active',
                },
            ]);
        }
        setNewUser({ name: '', department: '', identifier: '' });
        setShowAddModal(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">User Management</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage student and staff accounts across the platform</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1e2a78] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#16205c]"
                >
                    <Plus size={16} />
                    Add User
                </button>
            </div>

            {/* Tabs */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-100 p-1.5">
                <button
                    onClick={() => { setActiveTab('students'); setQuery(''); }}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'students' ? 'bg-[#1e2a78] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Students ({students.length})
                </button>
                <button
                    onClick={() => { setActiveTab('staff'); setQuery(''); }}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'staff' ? 'bg-[#1e2a78] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Staff ({staff.length})
                </button>
            </div>

            {/* Table card */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white">

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 min-w-[200px]">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search users..."
                            className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setFilterOpen((v) => !v)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            <Filter size={15} />
                            Filter
                        </button>
                        {filterOpen && activeTab === 'students' && (
                            <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                                <p className="mb-2 text-xs font-bold uppercase text-slate-400">Risk level</p>
                                {(['all', 'low', 'medium', 'high'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => { setRiskFilter(level); setFilterOpen(false); }}
                                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm capitalize transition-colors ${riskFilter === level ? 'bg-[#1e2a78] text-white' : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                        <Download size={15} />
                        Export
                    </button>
                </div>

                {/* Students table */}
                {activeTab === 'students' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Student ID</th>
                                    <th className="px-6 py-3">Department</th>
                                    <th className="px-6 py-3">GPA</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Risk</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((s) => (
                                    <tr key={s.id} className="border-t border-slate-100 text-sm">
                                        <td className="flex items-center gap-3 whitespace-nowrap px-6 py-4">
                                            <span
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                                                style={{ background: avatarColor(s.name) }}
                                            >
                                                {s.initials}
                                            </span>
                                            <span className="font-semibold text-slate-800">{s.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{s.studentId}</td>
                                        <td className="px-6 py-4 text-slate-600">{s.department}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{s.gpa.toFixed(1)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[s.status]}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskStyles[s.risk]}`}>
                                                {s.risk}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <button onClick={() => setViewRow(s)} aria-label="View" className="hover:text-slate-700">
                                                    <Eye size={16} />
                                                </button>
                                                <button aria-label="Edit" className="hover:text-slate-700">
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget({ id: s.id, name: s.name })}
                                                    aria-label="Delete"
                                                    className="hover:text-red-500"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                                            No students found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Staff table */
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Staff ID</th>
                                    <th className="px-6 py-3">Department</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.map((s) => (
                                    <tr key={s.id} className="border-t border-slate-100 text-sm">
                                        <td className="flex items-center gap-3 whitespace-nowrap px-6 py-4">
                                            <span
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                                                style={{ background: avatarColor(s.name) }}
                                            >
                                                {s.initials}
                                            </span>
                                            <span className="font-semibold text-slate-800">{s.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{s.staffId}</td>
                                        <td className="px-6 py-4 text-slate-600">{s.department}</td>
                                        <td className="px-6 py-4 text-slate-600">{s.role}</td>
                                        <td className="px-6 py-4">
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[s.status]}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <button onClick={() => setViewRow(s)} aria-label="View" className="hover:text-slate-700">
                                                    <Eye size={16} />
                                                </button>
                                                <button aria-label="Edit" className="hover:text-slate-700">
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget({ id: s.id, name: s.name })}
                                                    aria-label="Delete"
                                                    className="hover:text-red-500"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStaff.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                                            No staff found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View modal */}
            {viewRow && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">User Details</h3>
                            <button onClick={() => setViewRow(null)} className="text-slate-400 hover:text-slate-700">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <span
                                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                                style={{ background: avatarColor(viewRow.name) }}
                            >
                                {viewRow.initials}
                            </span>
                            <div>
                                <p className="font-bold text-slate-900">{viewRow.name}</p>
                                <p className="text-xs text-slate-400">
                                    {'studentId' in viewRow ? viewRow.studentId : viewRow.staffId}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between border-b border-slate-100 py-2">
                                <span className="text-slate-400">Department</span>
                                <span className="font-medium text-slate-700">{viewRow.department}</span>
                            </div>
                            {'gpa' in viewRow ? (
                                <>
                                    <div className="flex justify-between border-b border-slate-100 py-2">
                                        <span className="text-slate-400">GPA</span>
                                        <span className="font-medium text-slate-700">{viewRow.gpa.toFixed(1)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 py-2">
                                        <span className="text-slate-400">Risk</span>
                                        <span className="font-medium capitalize text-slate-700">{viewRow.risk}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between border-b border-slate-100 py-2">
                                    <span className="text-slate-400">Role</span>
                                    <span className="font-medium text-slate-700">{viewRow.role}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2">
                                <span className="text-slate-400">Status</span>
                                <span className="font-medium text-slate-700">{viewRow.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900">Remove user?</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            This will permanently remove <span className="font-semibold">{deleteTarget.name}</span> from the platform.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirmed}
                                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add user modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">
                                Add {activeTab === 'students' ? 'Student' : 'Staff'}
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Full Name</label>
                                <input
                                    value={newUser.name}
                                    onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Jane Doe"
                                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Department</label>
                                <input
                                    value={newUser.department}
                                    onChange={(e) => setNewUser((p) => ({ ...p, department: e.target.value }))}
                                    placeholder="e.g. Computer Science"
                                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600">
                                    {activeTab === 'students' ? 'Student ID' : 'Staff ID'} (optional)
                                </label>
                                <input
                                    value={newUser.identifier}
                                    onChange={(e) => setNewUser((p) => ({ ...p, identifier: e.target.value }))}
                                    placeholder="Auto-generated if left blank"
                                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                className="rounded-xl bg-[#1e2a78] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16205c]"
                            >
                                Add User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}