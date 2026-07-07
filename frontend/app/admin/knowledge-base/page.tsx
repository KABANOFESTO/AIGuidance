"use client";

import { useMemo, useState } from "react";
import { Database, Plus, RefreshCw, Search, Pencil, Trash2, X, Save, Sparkles, BookOpen, MessageSquareMore, Pin } from "lucide-react";
import { useCreateKnowledgeBaseEntryMutation, useDeleteKnowledgeBaseEntryMutation, useGetKnowledgeBaseQuery, useUpdateKnowledgeBaseEntryMutation } from "@/lib/redux/slices/ChatbotSlice";
import { toast } from "sonner";

type KBForm = {
    question: string;
    answer: string;
    category: string;
    keywords: string;
    priority: number;
    is_active: boolean;
    is_pinned: boolean;
};

const EMPTY_FORM: KBForm = {
    question: "",
    answer: "",
    category: "general",
    keywords: "",
    priority: 1,
    is_active: true,
    is_pinned: false,
};

const CATEGORY_OPTIONS = ["general", "courses", "career", "performance", "auth", "admin"];

const QUICK_TEMPLATES = [
    {
        question: "How do I reset my password?",
        answer: "Use the Forgot Password link on the login page, then follow the email reset instructions to create a new password.",
        category: "auth",
        keywords: ["password", "login", "reset"],
    },
    {
        question: "How do I verify my email?",
        answer: "Check your inbox for the verification email after signup. If it is missing, ask the admin to resend the verification link.",
        category: "auth",
        keywords: ["email", "verify", "signup"],
    },
    {
        question: "How does course recommendation work?",
        answer: "The system uses your grades, attendance, interests, and course history to rank the best course matches.",
        category: "courses",
        keywords: ["recommendation", "courses", "grades"],
    },
    {
        question: "How does career guidance work?",
        answer: "Career suggestions are generated from your interests, academic strengths, and a built-in career framework.",
        category: "career",
        keywords: ["career", "guidance", "interest"],
    },
];

export default function KnowledgeBaseManagement() {
    const { data: entries = [], isLoading, refetch } = useGetKnowledgeBaseQuery(undefined);
    const [createEntry] = useCreateKnowledgeBaseEntryMutation();
    const [updateEntry] = useUpdateKnowledgeBaseEntryMutation();
    const [deleteEntry] = useDeleteKnowledgeBaseEntryMutation();
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("all");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [form, setForm] = useState<KBForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [showTemplates, setShowTemplates] = useState(true);

    const stats = useMemo(() => {
        const active = (entries as any[]).filter((entry) => entry.is_active).length;
        const pinned = (entries as any[]).filter((entry) => entry.is_pinned).length;
        return {
            total: (entries as any[]).length,
            active,
            pinned,
            inactive: Math.max((entries as any[]).length - active, 0),
            categories: new Set((entries as any[]).map((entry) => entry.category || "general")).size,
        };
    }, [entries]);

    const filteredEntries = useMemo(() => {
        return (entries as any[]).filter((entry) => {
            const matchesQuery =
                String(entry.question || "").toLowerCase().includes(query.toLowerCase()) ||
                String(entry.answer || "").toLowerCase().includes(query.toLowerCase()) ||
                String(entry.category || "").toLowerCase().includes(query.toLowerCase());
            const matchesCategory = category === "all" || String(entry.category || "") === category;
            return matchesQuery && matchesCategory;
        });
    }, [entries, query, category]);

    const resetForm = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    const handleEdit = (entry: any) => {
        setEditingId(entry.id);
        setForm({
            question: entry.question || "",
            answer: entry.answer || "",
            category: entry.category || "general",
            keywords: Array.isArray(entry.keywords) ? entry.keywords.join(", ") : "",
            priority: Number(entry.priority ?? 1),
            is_active: Boolean(entry.is_active ?? true),
            is_pinned: Boolean(entry.is_pinned ?? false),
        });
        setShowTemplates(false);
    };

    const handleTemplate = (template: typeof QUICK_TEMPLATES[number]) => {
        setEditingId(null);
        setForm({
            question: template.question,
            answer: template.answer,
            category: template.category,
            keywords: template.keywords.join(", "),
            priority: 3,
            is_active: true,
            is_pinned: false,
        });
        setShowTemplates(false);
    };

    const handleSave = async () => {
        if (!form.question.trim() || !form.answer.trim()) {
            toast.error("Question and answer are required.");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                question: form.question.trim(),
                answer: form.answer.trim(),
                category: form.category.trim() || "general",
                keywords: form.keywords.split(",").map((kw) => kw.trim()).filter(Boolean),
                priority: Number(form.priority) || 1,
                is_active: form.is_active,
                is_pinned: form.is_pinned,
            };
            if (editingId) {
                await updateEntry({ id: editingId, data: payload }).unwrap();
                toast.success("Knowledge base entry updated.");
            } else {
                await createEntry(payload).unwrap();
                toast.success("Knowledge base entry created.");
            }
            resetForm();
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.detail || "Unable to save knowledge base entry.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteEntry(deleteTarget.id).unwrap();
            toast.success("Knowledge base entry deleted.");
            setDeleteTarget(null);
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.detail || "Unable to delete entry.");
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-sky-900 p-6 text-white shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
                                <Sparkles className="h-3.5 w-3.5" />
                                Staff tools
                            </div>
                            <h1 className="mt-3 text-3xl font-bold">Knowledge Base Management</h1>
                            <p className="mt-2 max-w-2xl text-sm text-sky-50/85">Manage chatbot training content, fallback answers, and staff guidance in one place.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                            <div className="rounded-2xl bg-white/10 px-4 py-3">
                                <div className="text-xs text-sky-100/70">Entries</div>
                                <div className="mt-1 text-2xl font-bold">{stats.total}</div>
                            </div>
                            <div className="rounded-2xl bg-white/10 px-4 py-3">
                                <div className="text-xs text-sky-100/70">Active</div>
                                <div className="mt-1 text-2xl font-bold">{stats.active}</div>
                            </div>
                            <div className="rounded-2xl bg-white/10 px-4 py-3">
                                <div className="text-xs text-sky-100/70">Pinned</div>
                                <div className="mt-1 text-2xl font-bold">{stats.pinned}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-slate-400">Total entries</div>
                        <div className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-slate-400">Active entries</div>
                        <div className="mt-2 text-2xl font-bold text-emerald-600">{stats.active}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-slate-400">Pinned entries</div>
                        <div className="mt-2 text-2xl font-bold text-violet-600">{stats.pinned}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-slate-400">Categories</div>
                        <div className="mt-2 text-2xl font-bold text-sky-600">{stats.categories}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
                    <div className="space-y-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                                    <Search size={16} className="text-slate-400" />
                                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions, answers, categories..." className="w-full bg-transparent text-sm outline-none" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                                        <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                                        Refresh
                                    </button>
                                    <button onClick={() => setShowTemplates((prev) => !prev)} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700">
                                        <BookOpen size={16} />
                                        {showTemplates ? "Hide Templates" : "Show Templates"}
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {['all', ...CATEGORY_OPTIONS].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setCategory(item)}
                                        className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${category === item ? 'bg-violet-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {showTemplates && (
                            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 shadow-sm">
                                <div className="mb-3 flex items-center gap-2 text-sky-900">
                                    <MessageSquareMore size={16} />
                                    <h3 className="text-sm font-bold">Quick templates</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {QUICK_TEMPLATES.map((template) => (
                                        <button key={template.question} onClick={() => handleTemplate(template)} className="rounded-2xl border border-sky-100 bg-white p-4 text-left hover:bg-sky-50">
                                            <div className="text-sm font-bold text-slate-900">{template.question}</div>
                                            <p className="mt-2 text-sm text-slate-500">{template.answer}</p>
                                            <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-sky-600">{template.category}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="divide-y divide-slate-100">
                                {filteredEntries.map((entry: any) => (
                                    <div key={entry.id} className="flex items-start gap-4 px-5 py-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                                            <Database size={18} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                                                <span>{entry.question}</span>
                                                {entry.is_pinned && <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700"><Pin size={12} />Pinned</span>}
                                            </div>
                                            <p className="mt-1 text-sm text-slate-500">{entry.answer}</p>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-600">{entry.category}</span>
                                                <span>Priority {entry.priority}</span>
                                                <span>{entry.is_active ? "Active" : "Inactive"}</span>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2 text-slate-400">
                                            <button onClick={() => handleEdit(entry)} className="rounded-lg p-2 hover:bg-slate-50 hover:text-slate-700">
                                                <Pencil size={15} />
                                            </button>
                                            <button onClick={() => setDeleteTarget(entry)} className="rounded-lg p-2 hover:bg-slate-50 hover:text-red-500">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {!filteredEntries.length && <div className="px-5 py-10 text-center text-sm text-slate-400">No knowledge base entries found.</div>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-base font-bold text-slate-900">{editingId ? "Edit Entry" : "Create Entry"}</h3>
                                {editingId && <button onClick={resetForm} className="text-slate-400 hover:text-slate-700"><X size={16} /></button>}
                            </div>
                            <div className="space-y-4">
                                <input value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} placeholder="Question" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400" />
                                <textarea value={form.answer} onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))} rows={5} placeholder="Answer" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400" />
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400">
                                        {CATEGORY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                                    </select>
                                    <input type="number" min={1} max={10} value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: Number(e.target.value) }))} placeholder="Priority" className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400" />
                                </div>
                                <input value={form.keywords} onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))} placeholder="Keywords comma separated" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400" />
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm((p) => ({ ...p, is_pinned: e.target.checked }))} />
                                    Pin this answer to the top
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} />
                                    Active
                                </label>
                                <button onClick={handleSave} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
                                    <Save size={15} />
                                    {saving ? "Saving..." : editingId ? "Save Changes" : "Add Entry"}
                                </button>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-6 text-violet-800">
                            <h3 className="text-sm font-bold">Knowledge Base Notes</h3>
                            <p className="mt-2 text-sm">Pinned entries are treated as higher priority, so the chatbot will prefer them when multiple answers match.</p>
                        </div>
                    </div>
                </div>
            </div>

            {deleteTarget && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900">Delete entry?</h3>
                        <p className="mt-2 text-sm text-slate-500">This will remove <span className="font-semibold">{deleteTarget.question}</span> from the active knowledge base.</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleDelete} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
