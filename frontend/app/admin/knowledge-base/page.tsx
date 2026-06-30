"use client";

import { useMemo, useState } from "react";
import { Database, Plus, RefreshCw, Search, Pencil, Trash2, X, Save } from "lucide-react";
import { useCreateKnowledgeBaseEntryMutation, useDeleteKnowledgeBaseEntryMutation, useGetKnowledgeBaseQuery, useUpdateKnowledgeBaseEntryMutation } from "@/lib/redux/slices/ChatbotSlice";

type KBForm = {
    question: string;
    answer: string;
    category: string;
    keywords: string;
    priority: number;
    is_active: boolean;
};

const EMPTY_FORM: KBForm = {
    question: "",
    answer: "",
    category: "general",
    keywords: "",
    priority: 1,
    is_active: true,
};

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

    const categories = useMemo(() => {
        const live = Array.from(new Set((entries as any[]).map((entry) => String(entry.category || "general"))));
        return ["all", ...live];
    }, [entries]);

    const filtered = useMemo(() => {
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
        });
    };

    const handleSave = async () => {
        if (!form.question.trim() || !form.answer.trim()) return;
        setSaving(true);
        try {
            const payload = {
                question: form.question.trim(),
                answer: form.answer.trim(),
                category: form.category.trim(),
                keywords: form.keywords.split(",").map((kw) => kw.trim()).filter(Boolean),
                priority: Number(form.priority),
                is_active: form.is_active,
            };
            if (editingId) {
                await updateEntry({ id: editingId, data: payload }).unwrap();
            } else {
                await createEntry(payload).unwrap();
            }
            resetForm();
            refetch();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteEntry(deleteTarget.id).unwrap();
        setDeleteTarget(null);
        refetch();
    };

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Knowledge Base Management</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage chatbot training content in real time</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                        <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                    <button onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700">
                        <Plus size={16} />
                        New Entry
                    </button>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {categories.map((item) => (
                    <button
                        key={item}
                        onClick={() => setCategory(item)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold ${category === item ? "bg-violet-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
                <div className="rounded-2xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 p-4">
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                            <Search size={16} className="text-slate-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search questions, answers, categories..."
                                className="w-full bg-transparent text-sm outline-none"
                            />
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {filtered.map((entry: any) => (
                            <div key={entry.id} className="flex items-start gap-4 px-5 py-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                                    <Database size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-bold text-slate-900">{entry.question}</div>
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
                        {!filtered.length && <div className="px-5 py-10 text-center text-sm text-slate-400">No knowledge base entries found.</div>}
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">{editingId ? "Edit Entry" : "Create Entry"}</h3>
                            {editingId && <button onClick={resetForm} className="text-slate-400 hover:text-slate-700"><X size={16} /></button>}
                        </div>
                        <div className="space-y-4">
                            <input value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} placeholder="Question" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400" />
                            <textarea value={form.answer} onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))} rows={5} placeholder="Answer" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400" />
                            <div className="grid grid-cols-2 gap-3">
                                <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category" className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400" />
                                <input type="number" min={1} max={10} value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: Number(e.target.value) }))} placeholder="Priority" className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400" />
                            </div>
                            <input value={form.keywords} onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))} placeholder="Keywords comma separated" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400" />
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
                        <p className="mt-2 text-sm">These records are used by the chatbot, so any update here immediately changes advisor answers.</p>
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
