"use client";

import { useMemo, useState } from "react";
import {
    Download,
    Eye,
    File,
    FileText,
    FileVideo,
    Search,
    Trash2,
    Upload,
    X,
    RefreshCw,
} from "lucide-react";
import { useCurrentUserQuery } from "@/lib/redux/slices/AuthSlice";
import {
    useCreateCourseMaterialMutation,
    useDeleteCourseMaterialMutation,
    useGetCourseMaterialsQuery,
    useGetCoursesQuery,
} from "@/lib/redux/slices/AcademicSlice";

type FileType = "PDF" | "PPTX" | "MP4" | "DOCX" | "ZIP" | "OTHER";

type MaterialForm = {
    course: string;
    title: string;
    description: string;
    is_published: boolean;
    file: File | null;
};

const EMPTY_FORM: MaterialForm = {
    course: "",
    title: "",
    description: "",
    is_published: true,
    file: null,
};

function iconFor(type: FileType) {
    if (type === "PDF") return <FileText className="h-4 w-4 text-red-400" />;
    if (type === "MP4") return <FileVideo className="h-4 w-4 text-blue-400" />;
    return <File className="h-4 w-4 text-gray-400" />;
}

export default function CourseMaterials() {
    const hasAccessToken = typeof window !== "undefined" && Boolean(localStorage.getItem("access"));
    const { data: user } = useCurrentUserQuery(undefined, { skip: !hasAccessToken });
    const { data: courses = [] } = useGetCoursesQuery(undefined, { skip: !hasAccessToken });
    const { data: materials = [], refetch, isLoading } = useGetCourseMaterialsQuery(undefined, { skip: !hasAccessToken });
    const [createMaterial] = useCreateCourseMaterialMutation();
    const [deleteMaterial] = useDeleteCourseMaterialMutation();
    const [query, setQuery] = useState("");
    const [courseFilter, setCourseFilter] = useState("ALL");
    const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<MaterialForm>(EMPTY_FORM);

    const canManage = user?.role === "Lecturer" || user?.role === "Admin";
    const filteredMaterials = useMemo(() => {
        return (materials as any[]).filter((material) => {
            const text = `${material.title || ""} ${material.description || ""} ${material.course_detail?.code || ""} ${material.course_detail?.name || ""}`.toLowerCase();
            const matchesQuery = text.includes(query.toLowerCase());
            const matchesCourse = courseFilter === "ALL" || String(material.course_detail?.id || material.course_id || "") === courseFilter;
            return matchesQuery && matchesCourse;
        });
    }, [materials, query, courseFilter]);

    const handleOpenForm = () => {
        setForm({
            ...EMPTY_FORM,
            course: String(courses[0]?.id ?? ""),
        });
        setShowForm(true);
    };

    const handleUpload = async () => {
        if (!form.course || !form.file) return;
        setSaving(true);
        try {
            const payload = new FormData();
            payload.append("course", form.course);
            payload.append("title", form.title || form.file.name.replace(/\.[^.]+$/, ""));
            payload.append("description", form.description);
            payload.append("is_published", String(form.is_published));
            payload.append("file", form.file);
            await createMaterial(payload).unwrap();
            setShowForm(false);
            setForm(EMPTY_FORM);
            refetch();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteMaterial(deleteTarget.id).unwrap();
        setDeleteTarget(null);
        refetch();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Materials</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Live file repository backed by the academics API
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                        <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                    {canManage && (
                        <button
                            onClick={handleOpenForm}
                            className="flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                        >
                            <Upload size={15} />
                            Upload Material
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex flex-1 min-w-[280px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                    <Search size={16} className="text-gray-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search materials..."
                        className="w-full bg-transparent text-sm outline-none"
                    />
                </div>
                <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none"
                >
                    <option value="ALL">All Courses</option>
                    {(courses as any[]).map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                {filteredMaterials.length ? (
                    filteredMaterials.map((material: any) => (
                        <div key={material.id} className="flex items-center gap-4 border-b border-gray-50 px-4 py-4 last:border-0 hover:bg-gray-50/60">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                {iconFor((material.file_type || "OTHER") as FileType)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-gray-900">{material.title || material.filename || "Untitled material"}</p>
                                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-400">
                                    <span>{material.course_detail?.code || material.course?.code || "Course"}</span>
                                    <span>|</span>
                                    <span>{material.file_type || "OTHER"}</span>
                                    <span>|</span>
                                    <span>{material.file_size ? `${(Number(material.file_size) / 1_000_000).toFixed(1)} MB` : "Unknown size"}</span>
                                    <span>|</span>
                                    <span>{material.downloads ?? 0} downloads</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {material.file_url && (
                                    <button
                                        onClick={() => setSelectedMaterial(material)}
                                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                        title="Preview"
                                    >
                                        <Eye size={16} />
                                    </button>
                                )}
                                <a
                                    href={material.download_url || material.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    title="Download"
                                >
                                    <Download size={16} />
                                </a>
                                {canManage && (
                                    <button
                                        onClick={() => setDeleteTarget(material)}
                                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center text-sm text-gray-400">
                        No materials found.
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <p className="font-bold text-gray-900">Upload Material</p>
                            <button onClick={() => setShowForm(false)} className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="space-y-4 px-6 py-5">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Course</label>
                                <select
                                    value={form.course}
                                    onChange={(e) => setForm((prev) => ({ ...prev, course: e.target.value }))}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none"
                                >
                                    <option value="">Select a course</option>
                                    {(courses as any[]).map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.code} - {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Title</label>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none"
                                    placeholder="Material title"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none"
                                    placeholder="Short description"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-600">File</label>
                                <input
                                    type="file"
                                    onChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={form.is_published}
                                    onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                                />
                                Publish to students
                            </label>
                            <div className="flex justify-end gap-3 pt-1">
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setForm(EMPTY_FORM);
                                    }}
                                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={saving || !form.course || !form.file}
                                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                                >
                                    {saving ? "Uploading..." : "Upload"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedMaterial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <p className="font-bold text-gray-900 text-sm">{selectedMaterial.title}</p>
                                <p className="text-xs text-gray-400">{selectedMaterial.course_detail?.code || selectedMaterial.course?.code}</p>
                            </div>
                            <button onClick={() => setSelectedMaterial(null)} className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="flex min-h-[420px] items-center justify-center bg-gray-50">
                            {selectedMaterial.file_url && selectedMaterial.file_type === "PDF" ? (
                                <iframe src={selectedMaterial.file_url} className="h-[520px] w-full border-0" title={selectedMaterial.title} />
                            ) : selectedMaterial.file_url && selectedMaterial.file_type === "MP4" ? (
                                <video controls className="max-h-[480px] max-w-full rounded-lg">
                                    <source src={selectedMaterial.file_url} />
                                </video>
                            ) : (
                                <div className="p-8 text-center text-sm text-gray-500">
                                    Preview is not available for this file type.
                                    <div className="mt-4">
                                        <a
                                            href={selectedMaterial.download_url || selectedMaterial.file_url}
                                            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                                        >
                                            <Download size={13} />
                                            Download file
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900">Delete material?</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            This will permanently remove <span className="font-semibold">{deleteTarget.title}</span> from the course materials list.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
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
