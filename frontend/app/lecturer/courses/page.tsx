"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit3, PlusCircle, RefreshCcw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    useCreateCourseMutation,
    useDeleteCourseMutation,
    useGetCoursesQuery,
    useUpdateCourseMutation,
} from "@/lib/redux/slices/AcademicSlice";

const EMPTY_FORM = {
    code: "",
    name: "",
    description: "",
    department: "",
    level: "",
    credits: 3,
    keywords: "",
    is_active: true,
};

export default function LecturerCoursesPage() {
    const { data: courses = [], refetch, isLoading } = useGetCoursesQuery(undefined);
    const [createCourse] = useCreateCourseMutation();
    const [updateCourse] = useUpdateCourseMutation();
    const [deleteCourse] = useDeleteCourseMutation();
    const [query, setQuery] = useState("");
    const [editingCourse, setEditingCourse] = useState<any | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const filteredCourses = useMemo(() => {
        const q = query.toLowerCase();
        return (courses as any[]).filter((course) => {
            const searchable = `${course.code} ${course.name} ${course.description} ${course.department} ${course.level}`.toLowerCase();
            return searchable.includes(q);
        });
    }, [courses, query]);

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingCourse(null);
    };

    const openCreate = () => {
        resetForm();
    };

    const openEdit = (course: any) => {
        setEditingCourse(course);
        setForm({
            code: course.code ?? "",
            name: course.name ?? "",
            description: course.description ?? "",
            department: course.department ?? "",
            level: course.level ?? "",
            credits: Number(course.credits ?? 3),
            keywords: Array.isArray(course.keywords) ? course.keywords.join(", ") : String(course.keywords ?? ""),
            is_active: Boolean(course.is_active),
        });
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);
        const payload = {
            ...form,
            keywords: form.keywords
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            credits: Number(form.credits || 0),
        };
        try {
            if (editingCourse) {
                await updateCourse({ id: editingCourse.id, data: payload }).unwrap();
                toast.success("Course updated.");
            } else {
                await createCourse(payload).unwrap();
                toast.success("Course created.");
            }
            resetForm();
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.detail ?? "Unable to save course.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await deleteCourse(id).unwrap();
            toast.success("Course removed.");
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.detail ?? "Unable to delete course.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="rounded-3xl bg-[#1a237e] p-6 text-white shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-sky-200">Lecturer workspace</p>
                            <h1 className="mt-2 text-3xl font-bold">Course Management</h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-200">
                                Create and maintain the course catalogue that students can enroll in and use for recommendation matching.
                            </p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1a237e] hover:bg-sky-50"
                        >
                            <RefreshCcw size={15} className={isLoading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
                    <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{editingCourse ? "Edit Course" : "Add Course"}</h2>
                                <p className="mt-1 text-sm text-gray-500">Keep the catalogue aligned with the lecturer portal and student enrollment flow.</p>
                            </div>
                            <button type="button" onClick={openCreate} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200">
                                New
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            <input value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))} placeholder="Course code" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none" />
                            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Course name" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none" />
                            <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={4} placeholder="Description" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none" />
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <input value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} placeholder="Department" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none" />
                                <input value={form.level} onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))} placeholder="Level" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none" />
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <input type="number" value={form.credits} onChange={(e) => setForm((prev) => ({ ...prev, credits: Number(e.target.value) }))} placeholder="Credits" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none" />
                                <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))} />
                                    Active course
                                </label>
                            </div>
                            <textarea value={form.keywords} onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))} rows={3} placeholder="Keywords, comma separated" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none" />
                        </div>

                        <button type="submit" disabled={saving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a237e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#12194f] disabled:opacity-60">
                            <PlusCircle size={15} />
                            {saving ? "Saving..." : editingCourse ? "Update Course" : "Create Course"}
                        </button>
                    </form>

                    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Course Catalogue</h2>
                                <p className="mt-1 text-sm text-gray-500">Search, review, update, and remove active courses.</p>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                                <Search size={16} className="text-gray-400" />
                                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses..." className="w-64 bg-transparent text-sm outline-none" />
                            </div>
                        </div>

                        <div className="mt-5 divide-y divide-gray-100 rounded-2xl border border-gray-100">
                            {filteredCourses.length ? filteredCourses.map((course: any) => (
                                <div key={course.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">{course.code}</span>
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${course.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                                {course.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <h3 className="mt-2 text-sm font-bold text-gray-900">{course.name}</h3>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-500">{course.description}</p>
                                        <p className="mt-1 text-xs text-gray-400">{course.department || "General"} • {course.level || "N/A"} • {course.credits ?? 0} credits</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(course)} className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                                            <Edit3 size={13} />
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(course.id)} disabled={deletingId === course.id} className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
                                            <Trash2 size={13} />
                                            {deletingId === course.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="px-4 py-10 text-center text-sm text-gray-400">No courses found.</div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
