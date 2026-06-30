"use client";

import { useMemo, useState } from "react";
import { Check, Download, Eye, File, FileText, FileVideo, RefreshCw, Star } from "lucide-react";
import { useGetAcademicSummaryQuery, useGetCourseMaterialsQuery, useGetCoursesQuery } from "@/lib/redux/slices/AcademicSlice";
import { useGenerateCourseRecommendationsMutation, useGetCourseRecommendationsQuery } from "@/lib/redux/slices/RecommendationSlice";

type FilterId = "all" | "top" | "new" | "science";

function safeText(value: any, fallback = "Unknown") {
    if (typeof value === "string" && value.trim()) return value;
    return fallback;
}

function formatCourse(rec: any) {
    const course = rec?.course_detail?.name || rec?.course_detail?.title || rec?.course?.name || rec?.course || "Course";
    const code = rec?.course_detail?.code || rec?.course?.code || "";
    return { course, code };
}

function materialIcon(type?: string) {
    if (type === "PDF") return <FileText className="h-4 w-4 text-red-400" />;
    if (type === "MP4") return <FileVideo className="h-4 w-4 text-blue-400" />;
    return <File className="h-4 w-4 text-gray-400" />;
}

export default function CourseRecommendationsPage() {
    const [activeFilter, setActiveFilter] = useState<FilterId>("all");
    const { data: recommendations = [], isLoading, refetch } = useGetCourseRecommendationsQuery(undefined);
    const { data: academicSummary } = useGetAcademicSummaryQuery(undefined);
    const { data: courses = [] } = useGetCoursesQuery(undefined);
    const { data: materials = [] } = useGetCourseMaterialsQuery(undefined);
    const [generateRecommendations, { isLoading: generating }] = useGenerateCourseRecommendationsMutation();
    const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState<string | null>(null);
    const [materialQuery, setMaterialQuery] = useState("");

    const filtered = useMemo(() => {
        return (recommendations as any[]).filter((rec) => {
            const course = formatCourse(rec);
            const confidence = Number(rec.confidence_score ?? rec.match_percentage ?? 0);
            const department = String(rec.metadata?.department || rec.department || "").toLowerCase();
            if (activeFilter === "top") return confidence >= 85;
            if (activeFilter === "new") return !enrolledIds.has(String(rec.id));
            if (activeFilter === "science") return department.includes("science") || department.includes("computer");
            return true;
        });
    }, [recommendations, activeFilter, enrolledIds]);

    const handleEnroll = (rec: any) => {
        const { course, code } = formatCourse(rec);
        setEnrolledIds((prev) => new Set(prev).add(String(rec.id ?? course)));
        setToast(`Saved ${course}${code ? ` (${code})` : ""} to your plan`);
        setTimeout(() => setToast(null), 2500);
    };

    const handleRefresh = async () => {
        await generateRecommendations(undefined).unwrap();
        refetch();
    };

    const publishedMaterials = useMemo(() => {
        return (materials as any[]).filter((material) => {
            const searchable = `${material.title || ""} ${material.description || ""} ${material.course_detail?.code || ""} ${material.course_detail?.name || ""}`.toLowerCase();
            return searchable.includes(materialQuery.toLowerCase());
        });
    }, [materials, materialQuery]);

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Course Recommendations</h1>
                        <p className="mt-1 text-sm text-gray-500">Live recommendations based on your academic records and interests</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {(["all", "top", "new", "science"] as FilterId[]).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold ${activeFilter === filter ? "bg-[#1e2a78] text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
                            >
                                {filter === "all" ? "All" : filter === "top" ? "Top Matches" : filter === "new" ? "Fresh" : "Science / CS"}
                            </button>
                        ))}
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                        >
                            <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
                            Refresh AI
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="text-sm text-gray-500">GPA</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{academicSummary ? academicSummary.overall_score : "--"}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="text-sm text-gray-500">Attendance</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{academicSummary ? `${academicSummary.attendance_rate}%` : "--"}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="text-sm text-gray-500">Available Courses</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{courses.length}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="text-sm text-gray-500">Recommendations</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{recommendations.length}</div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {(filtered as any[]).map((rec) => {
                        const { course, code } = formatCourse(rec);
                        const score = Math.round(Number(rec.confidence_score ?? rec.match_percentage ?? 0));
                        const enrolled = enrolledIds.has(String(rec.id ?? course));
                        return (
                            <div key={rec.id ?? course} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {code && <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{code}</span>}
                                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">AI Match</span>
                                        </div>
                                        <h3 className="mt-3 text-base font-bold text-gray-900">{course}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-[#1e2a78]">{score}%</div>
                                        <div className="text-xs text-gray-400">confidence</div>
                                    </div>
                                </div>
                                <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
                                    <div className="h-1.5 rounded-full bg-gradient-to-r from-[#1e2a78] to-[#7c3aed]" style={{ width: `${score}%` }} />
                                </div>
                                <p className="mt-4 text-sm text-gray-500">{safeText(rec.reason || rec.explanation || rec.metadata?.reason, "Generated from your live profile.")}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {Array.isArray(rec.metadata?.tags) && rec.metadata.tags.map((tag: string) => (
                                        <span key={tag} className="rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">{tag}</span>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleEnroll(rec)}
                                    disabled={enrolled}
                                    className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold ${enrolled ? "bg-emerald-50 text-emerald-600" : "bg-[#1e2a78] text-white hover:bg-[#16205c]"}`}
                                >
                                    {enrolled ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Saved
                                        </>
                                    ) : (
                                        <>
                                            <Star className="h-4 w-4" />
                                            Save Recommendation
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {!isLoading && filtered.length === 0 && (
                    <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
                        No recommendations yet. Click refresh to regenerate them from your current academic profile.
                    </div>
                )}

                <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Published Course Materials</h2>
                            <p className="mt-1 text-sm text-gray-500">Files shared by lecturers for the courses you can access</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                            <input
                                value={materialQuery}
                                onChange={(e) => setMaterialQuery(e.target.value)}
                                placeholder="Search materials..."
                                className="w-64 bg-transparent text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {publishedMaterials.length ? publishedMaterials.map((material: any) => (
                            <div key={material.id} className="rounded-2xl border border-gray-100 p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50">
                                            {materialIcon(material.file_type)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{material.title || material.file_name || "Material"}</p>
                                            <p className="text-xs text-gray-400">{material.course_detail?.code || material.course?.code}</p>
                                        </div>
                                    </div>
                                    {material.is_published && <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">Published</span>}
                                </div>

                                <p className="mt-3 max-h-20 overflow-hidden text-sm text-gray-500">
                                    {material.description || "No description provided."}
                                </p>

                                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                                    <span>{material.file_type || "OTHER"}</span>
                                    <span>{material.downloads ?? 0} downloads</span>
                                </div>

                                <div className="mt-4 flex items-center gap-2">
                                    <a
                                        href={material.download_url || material.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1e2a78] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#16205c]"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </a>
                                    {material.file_url && (
                                        <a
                                            href={material.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2.5 text-gray-600 hover:bg-gray-50"
                                            title="Preview"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
                                No published materials available yet. Your lecturers will see them here once they upload and publish files.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-medium text-white shadow-lg">
                    {toast}
                </div>
            )}
        </main>
    );
}
