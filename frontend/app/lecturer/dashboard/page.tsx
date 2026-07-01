"use client";

import React, { useMemo } from "react";
import { Award, BookOpen, Users, AlertTriangle, RefreshCw, TrendingUp, TrendingDown, Minus, FileText, Layers3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useCurrentUserQuery } from "@/lib/redux/slices/AuthSlice";
import { useGetCoursesQuery, useGetCourseMaterialsQuery } from "@/lib/redux/slices/AcademicSlice";
import { useGetStudentProfilesQuery } from "@/lib/redux/slices/StudentSlice";
import { hasValidAccessToken } from "@/lib/auth/session";

interface StatCard {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    value: string | number;
    label: string;
    trend: "up" | "down" | "stable";
    trendValue: string;
}

function TrendBadge({ trend, value }: { trend: StatCard["trend"]; value: string }) {
    if (trend === "stable") return <span className="flex items-center gap-1 text-xs font-medium text-gray-400"><Minus size={12} />{value}</span>;
    return trend === "up" ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500"><TrendingUp size={13} />{value}</span> : <span className="flex items-center gap-1 text-xs font-semibold text-red-400"><TrendingDown size={13} />{value}</span>;
}

function StatCardView({ card }: { card: StatCard }) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: card.iconBg, color: card.iconColor }}>
                    {card.icon}
                </div>
                <TrendBadge trend={card.trend} value={card.trendValue} />
            </div>
            <div>
                <p className="text-3xl font-bold text-gray-900 leading-none">{card.value}</p>
                <p className="mt-1.5 text-sm text-gray-400 font-medium">{card.label}</p>
            </div>
        </div>
    );
}

function CourseRow({ course }: { course: any }) {
    return (
        <div className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <BookOpen size={16} className="text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{course.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{course.code} - {course.department || "General"}</p>
            </div>
            <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-800">{course.credits ?? 0} credits</p>
                <p className="text-xs text-gray-400">{course.is_active ? "active" : "inactive"}</p>
            </div>
        </div>
    );
}

export default function LecturerDashboard() {
    const hasAccessToken = hasValidAccessToken();
    const { data: me } = useCurrentUserQuery(undefined, { skip: !hasAccessToken });
    const { data: students = [], refetch: refetchStudents } = useGetStudentProfilesQuery(undefined);
    const { data: courses = [], refetch: refetchCourses } = useGetCoursesQuery(undefined);
    const { data: materials = [], refetch: refetchMaterials } = useGetCourseMaterialsQuery(undefined);

    const stats: StatCard[] = useMemo(
        () => [
            {
                icon: <BookOpen size={18} className="text-emerald-500" />,
                iconBg: "#f0fdf4",
                iconColor: "#10b981",
                value: courses.length,
                label: "Courses Managed",
                trend: "stable",
                trendValue: "Live",
            },
            {
                icon: <Users size={18} className="text-indigo-500" />,
                iconBg: "#eef2ff",
                iconColor: "#6366f1",
                value: students.length,
                label: "Students Visible",
                trend: "up",
                trendValue: "Live",
            },
            {
                icon: <FileText size={18} className="text-violet-500" />,
                iconBg: "#f5f3ff",
                iconColor: "#8b5cf6",
                value: materials.length,
                label: "Course Materials",
                trend: "up",
                trendValue: "Live",
            },
            {
                icon: <AlertTriangle size={18} className="text-amber-500" />,
                iconBg: "#fffbeb",
                iconColor: "#f59e0b",
                value: students.filter((student: any) => student.is_at_risk).length,
                label: "At-Risk Students",
                trend: "down",
                trendValue: "Needs review",
            },
        ],
        [courses.length, students, materials.length]
    );

    const chartData = courses.slice(0, 6).map((course: any) => ({
        name: course.code,
        Students: students.length ? Math.max(Math.round(students.length / Math.max(courses.length, 1)) + (course.credits || 0), 1) : 0,
        Materials: materials.filter((item: any) => item.course_id === course.id || item.course_detail?.id === course.id).length,
    }));

    const topCourses = courses.slice(0, 6);

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hello, {me?.username ?? "Lecturer"}</h1>
                    <p className="mt-1 text-sm text-gray-500">Lecturer Dashboard - live academic overview</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => Promise.all([refetchStudents(), refetchCourses(), refetchMaterials()])}
                        className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                    >
                        <RefreshCw size={15} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
                {stats.map((card) => <StatCardView key={card.label} card={card} />)}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <h2 className="text-base font-bold text-gray-900 mb-2">Course Load</h2>
                    <p className="text-sm text-gray-500">Live course and material distribution</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%" barGap={4}>
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                            <Bar dataKey="Students" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={36} />
                            <Bar dataKey="Materials" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={36} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <h2 className="text-base font-bold text-gray-900 mb-4">My Courses</h2>
                    <div className="divide-y divide-gray-50">
                        {topCourses.length ? topCourses.map((course: any) => <CourseRow key={course.id} course={course} />) : <div className="py-8 text-center text-sm text-gray-400">No courses have been created yet.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
