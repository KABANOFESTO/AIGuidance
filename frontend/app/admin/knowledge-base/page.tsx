'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Database, RefreshCw, X } from 'lucide-react';

/* ── Types ── */
type Tab = 'Courses' | 'Careers' | 'Policies' | 'Faqs';
type Status = 'Active' | 'Draft';

interface Entry {
    id: string;
    title: string;
    category: string;
    tab: Tab;
    status: Status;
    content: string;
    updatedAt: string;
}

const tabs: Tab[] = ['Courses', 'Careers', 'Policies', 'Faqs'];

const categoryByTab: Record<Tab, string[]> = {
    Courses: ['Course', 'Guidelines'],
    Careers: ['Career Guide'],
    Policies: ['Policy'],
    Faqs: ['FAQ'],
};

const categoryTagStyle = 'rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700';

/* ── Seed data — replace with real API data ── */
const initialEntries: Entry[] = [
    { id: '1', title: 'Machine Learning Fundamentals', category: 'Course', tab: 'Courses', status: 'Active', content: 'Overview of supervised and unsupervised learning concepts.', updatedAt: '2 days ago' },
    { id: '2', title: 'Software Engineering Career Path', category: 'Career Guide', tab: 'Careers', status: 'Active', content: 'Typical progression from junior to senior engineer roles.', updatedAt: '1 week ago' },
    { id: '3', title: 'Academic Probation Policy', category: 'Policy', tab: 'Policies', status: 'Active', content: 'Conditions and process for academic probation.', updatedAt: '1 month ago' },
    { id: '4', title: 'Course Registration Guidelines', category: 'Guidelines', tab: 'Courses', status: 'Active', content: 'Steps for registering and dropping courses each semester.', updatedAt: '3 days ago' },
    { id: '5', title: 'Data Science Prerequisites', category: 'Course', tab: 'Courses', status: 'Draft', content: 'Recommended math and programming background.', updatedAt: '5 days ago' },
];

export default function KnowledgeBaseManagement() {
    const [entries, setEntries] = useState<Entry[]>(initialEntries);
    const [activeTab, setActiveTab] = useState<Tab>('Courses');
    const [query, setQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
    const [retraining, setRetraining] = useState(false);
    const [lastRetrained, setLastRetrained] = useState('6 hours ago');

    const [form, setForm] = useState({ title: '', category: categoryByTab.Courses[0], content: '' });

    const visibleEntries = useMemo(
        () =>
            entries.filter(
                (e) =>
                    e.tab === activeTab &&
                    (e.title.toLowerCase().includes(query.toLowerCase()) ||
                        e.category.toLowerCase().includes(query.toLowerCase())),
            ),
        [entries, activeTab, query],
    );

    const resetForm = () => {
        setForm({ title: '', category: categoryByTab[activeTab][0], content: '' });
        setEditingId(null);
    };

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setQuery('');
        setForm({ title: '', category: categoryByTab[tab][0], content: '' });
        setEditingId(null);
    };

    const handleSubmit = () => {
        if (!form.title.trim() || !form.content.trim()) return;

        if (editingId) {
            setEntries((prev) =>
                prev.map((e) =>
                    e.id === editingId
                        ? { ...e, title: form.title, category: form.category, content: form.content, updatedAt: 'just now' }
                        : e,
                ),
            );
        } else {
            setEntries((prev) => [
                {
                    id: String(Date.now()),
                    title: form.title,
                    category: form.category,
                    tab: activeTab,
                    status: 'Draft',
                    content: form.content,
                    updatedAt: 'just now',
                },
                ...prev,
            ]);
        }
        resetForm();
    };

    const handleEditClick = (entry: Entry) => {
        setEditingId(entry.id);
        setForm({ title: entry.title, category: entry.category, content: entry.content });
    };

    const handleDeleteConfirmed = () => {
        if (!deleteTarget) return;
        setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        if (editingId === deleteTarget.id) resetForm();
        setDeleteTarget(null);
    };

    const toggleStatus = (id: string) => {
        setEntries((prev) =>
            prev.map((e) => (e.id === id ? { ...e, status: e.status === 'Active' ? 'Draft' : 'Active' } : e)),
        );
    };

    const handleRetrain = () => {
        setRetraining(true);
        setTimeout(() => {
            setRetraining(false);
            setLastRetrained('just now');
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Knowledge Base Management</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Update and manage the AI training data, course information, and academic policies
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); document.getElementById('kb-title-input')?.focus(); }}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
                >
                    <Plus size={16} />
                    Add Entry
                </button>
            </div>

            {/* Tabs */}
            <div className="mt-6 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">

                {/* Entries list */}
                <div className="rounded-2xl border border-slate-200 bg-white lg:col-span-2">
                    <div className="border-b border-slate-100 p-4">
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                            <Search size={16} className="shrink-0 text-slate-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search knowledge base..."
                                className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {visibleEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center gap-4 px-5 py-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                                    <Database size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-slate-900">{entry.title}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className={categoryTagStyle}>{entry.category}</span>
                                        <span className="text-xs text-slate-400">Updated {entry.updatedAt}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleStatus(entry.id)}
                                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${entry.status === 'Active'
                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                    title="Click to toggle status"
                                >
                                    {entry.status}
                                </button>
                                <div className="flex shrink-0 items-center gap-3 text-slate-400">
                                    <button onClick={() => handleEditClick(entry)} aria-label="Edit" className="hover:text-slate-700">
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget({ id: entry.id, title: entry.title })}
                                        aria-label="Delete"
                                        className="hover:text-red-500"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {visibleEntries.length === 0 && (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">
                                No entries found in {activeTab}.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-5">

                    {/* Add / edit entry form */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">
                                {editingId ? 'Edit Entry' : 'Add New Entry'}
                            </h3>
                            {editingId && (
                                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600" aria-label="Cancel edit">
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700">Title</label>
                                <input
                                    id="kb-title-input"
                                    value={form.title}
                                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                    placeholder="Entry title..."
                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700">Category</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                >
                                    {categoryByTab[activeTab].map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700">Content</label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                                    placeholder="Enter knowledge base content..."
                                    rows={5}
                                    className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-violet-700"
                            >
                                {editingId ? 'Save Changes' : 'Add Entry'}
                            </button>
                        </div>
                    </div>

                    {/* AI Training card */}
                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white">
                                <RefreshCw size={14} className={retraining ? 'animate-spin' : ''} />
                            </div>
                            <h3 className="text-sm font-bold text-violet-800">AI Training</h3>
                        </div>
                        <p className="mt-3 text-sm text-violet-700">
                            Last model retrained: {lastRetrained}. {entries.length} knowledge entries indexed.
                        </p>
                        <button
                            onClick={handleRetrain}
                            disabled={retraining}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-60"
                        >
                            <RefreshCw size={14} className={retraining ? 'animate-spin' : ''} />
                            {retraining ? 'Retraining...' : 'Retrain AI Model'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete confirm modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900">Delete entry?</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            This will permanently remove <span className="font-semibold">{deleteTarget.title}</span> from the knowledge base.
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
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}