"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Send, Star } from "lucide-react";
import { useGetFeedbackAdminOverviewQuery, useSubmitFeedbackMutation } from "@/lib/redux/slices/FeedbackSlice";

type ModuleCode = "CS301" | "CS302" | "CS401" | "CS450";

const MODULE_OPTIONS: { code: ModuleCode; label: string }[] = [
    { code: "CS450", label: "CS450 - Machine Learning" },
    { code: "CS302", label: "CS302 - Database Systems" },
    { code: "CS301", label: "CS301 - Algorithms & Data Structures" },
    { code: "CS401", label: "CS401 - Advanced Algorithms" },
];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} type="button" onClick={() => onChange(i)}>
                    <Star size={22} className={i <= value ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-300"} />
                </button>
            ))}
        </div>
    );
}

export default function LecturerFeedbackPage() {
    const { data: feedback = [], refetch } = useGetFeedbackAdminOverviewQuery();
    const [submitFeedback] = useSubmitFeedbackMutation();
    const [module, setModule] = useState<ModuleCode>("CS450");
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [toast, setToast] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const averages = useMemo(() => {
        const grouped: Record<string, { total: number; count: number }> = {};
        (feedback as any[]).forEach((item) => {
            const key = String(item.category || "general");
            grouped[key] = grouped[key] || { total: 0, count: 0 };
            grouped[key].total += Number(item.rating || 0);
            grouped[key].count += 1;
        });
        return grouped;
    }, [feedback]);

    const handleSubmit = async () => {
        if (!message.trim()) return;
        setSubmitting(true);
        try {
            await submitFeedback({
                title: title.trim() || `Lecturer note - ${module}`,
                message: message.trim(),
                rating,
                category: module.toLowerCase(),
            }).unwrap();
            setToast("Feedback submitted successfully.");
            setTitle("");
            setMessage("");
            setRating(5);
            refetch();
            setTimeout(() => setToast(null), 2400);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Student Feedback</h1>
                <p className="mt-1 text-sm text-gray-500">Submit and review live feedback records from the backend</p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-4">
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-5">Average Feedback by Category</h2>
                    <div className="space-y-3">
                        {Object.keys(averages).length ? Object.entries(averages).map(([category, data]) => (
                            <div key={category} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-3.5">
                                <div>
                                    <div className="text-sm font-semibold text-gray-800 capitalize">{category}</div>
                                    <div className="text-xs text-gray-400">{data.count} reviews</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star size={15} className="fill-amber-400 text-amber-400" />
                                    <span className="text-sm font-bold text-gray-800">{(data.total / data.count).toFixed(1)}</span>
                                </div>
                            </div>
                        )) : <p className="text-sm text-gray-400">No feedback has been submitted yet.</p>}
                    </div>
                </div>

                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-5">Submit Feedback</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Module</label>
                            <select value={module} onChange={(e) => setModule(e.target.value as ModuleCode)} className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none">
                                {MODULE_OPTIONS.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional title" className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">Rating</label>
                            <StarPicker value={rating} onChange={setRating} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Comment</label>
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none" placeholder="Share detailed student feedback..." />
                        </div>
                        <button onClick={handleSubmit} disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60">
                            <Send size={15} />
                            {submitting ? "Submitting..." : "Submit Feedback"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-5">Recent Feedback Records</h2>
                <div className="divide-y divide-gray-50">
                    {(feedback as any[]).map((item) => (
                        <div key={item.id} className="py-5 first:pt-0 last:pb-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{item.user || item.student || "Student"}</div>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-700">{String(item.category || "general")}</span>
                                        <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recently"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={15} className="fill-amber-400 text-amber-400" />
                                    <span className="text-sm font-bold text-gray-800">{item.rating}</span>
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{item.message}</p>
                        </div>
                    ))}
                    {!feedback.length && <div className="py-8 text-center text-sm text-gray-400">No feedback yet.</div>}
                </div>
            </div>

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-medium text-white shadow-lg">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={15} className="text-emerald-400" />
                        {toast}
                    </div>
                </div>
            )}
        </div>
    );
}
