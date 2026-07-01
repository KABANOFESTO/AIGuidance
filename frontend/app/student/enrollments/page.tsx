"use client";

import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, RefreshCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { useEnrollInCourseMutation, useGetCoursesQuery, useGetEnrollmentsQuery } from "@/lib/redux/slices/AcademicSlice";

export default function StudentEnrollmentsPage() {
    const { data: courses = [], refetch: refetchCourses, isLoading } = useGetCoursesQuery(undefined);
    const { data: enrollments = [], refetch: refetchEnrollments } = useGetEnrollmentsQuery(undefined);
    const [enrollInCourse] = useEnrollInCourseMutation();
    const [query, setQuery] = useState("");
    const [savingId, setSavingId] = useState<number | null>(null);

    const enrolledCourseIds = useMemo(() => new Set((enrollments as any[]).map((item) => String(item.course_detail?.id ?? item.course_id ?? item.course))), [enrollments]);
    const filteredCourses = useMemo(() => {
        const q = query.toLowerCase();
        return (courses as any[]).filter((course) => {
            if (!course.is_active) return false;
            const searchable = `${course.code} ${course.name} ${course.description} ${course.department} ${course.level}`.toLowerCase();
            return searchable.includes(q);
        });
    }, [courses, query]);

    const handleEnroll = async (course: any) => {
        setSavingId(course.id);
        try {
            await enrollInCourse({ course_id: course.id }).unwrap();
            toast.success(`Enrolled in ${course.code}.`);
            await Promise.all([refetchCourses(), refetchEnrollments()]);
        } catch (error: any) {
            toast.error(error?.data?.detail ?? "Unable to enroll in course.");
        } finally {
            setSavingId(null);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="rounded-3xl bg-gradient-to-r from-[#1e2a78] to-[#1b7fbe] p-6 text-white shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-sky-100">Student workspace</p>
                            <h1 className="mt-2 text-3xl font-bold">Enroll in Courses</h1>
                            <p className="mt-2 max-w-2xl text-sm text-sky-50/90">
                                Browse active courses, enroll immediately, and keep the list synced with your recommendations and materials.
                            </p>
                        </div>
                        <button
                            onClick={() => Promise.all([refetchCourses(), refetchEnrollments()])}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#1e2a78] hover:bg-sky-50"
                        >
                            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-gray-400">Active courses</p>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{filteredCourses.length}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-gray-400">Your enrollments</p>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{enrollments.length}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-gray-400">AI ready</p>
                        <div className="mt-2 text-2xl font-bold text-gray-900">Live</div>
                    </div>
                </div>

                <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Course Catalogue</h2>
                            <p className="mt-1 text-sm text-gray-500">Enroll in active courses to unlock materials and better AI recommendations.</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                            <Search size={16} className="text-gray-400" />
                            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses..." className="w-64 bg-transparent text-sm outline-none" />
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredCourses.length ? filteredCourses.map((course: any) => {
                            const enrolled = enrolledCourseIds.has(String(course.id));
                            return (
                                <div key={course.id} className="rounded-2xl border border-gray-100 p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">{course.code}</span>
                                            <h3 className="mt-3 text-base font-bold text-gray-900">{course.name}</h3>
                                        </div>
                                        <div className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${enrolled ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                            {enrolled ? "Enrolled" : "Available"}
                                        </div>
                                    </div>
                                    <p className="mt-3 line-clamp-3 text-sm text-gray-500">{course.description}</p>
                                    <p className="mt-3 text-xs text-gray-400">{course.department || "General"} • {course.level || "N/A"} • {course.credits ?? 0} credits</p>
                                    <button
                                        onClick={() => handleEnroll(course)}
                                        disabled={enrolled || savingId === course.id}
                                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e2a78] px-4 py-3 text-sm font-semibold text-white hover:bg-[#16205c] disabled:cursor-not-allowed disabled:bg-emerald-50 disabled:text-emerald-700"
                                    >
                                        {enrolled ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4" />
                                                Enrolled
                                            </>
                                        ) : (
                                            savingId === course.id ? "Enrolling..." : "Enroll Now"
                                        )}
                                    </button>
                                </div>
                            );
                        }) : (
                            <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
                                No active courses are available yet.
                            </div>
                        )}
                    </div>
                </section>

                <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900">My Enrollments</h2>
                    <p className="mt-1 text-sm text-gray-500">These enrollments control your course access and materials.</p>
                    <div className="mt-5 divide-y divide-gray-100 rounded-2xl border border-gray-100">
                        {enrollments.length ? enrollments.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{item.course_detail?.name || item.course?.name}</p>
                                    <p className="mt-1 text-xs text-gray-400">{item.course_detail?.code || item.course?.code} • {item.status}</p>
                                </div>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{item.status}</span>
                            </div>
                        )) : (
                            <div className="px-4 py-10 text-center text-sm text-gray-400">You have not enrolled in any courses yet.</div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
