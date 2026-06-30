"use client";

import React, { useMemo, useState } from "react";
import {
    Award,
    CalendarDays,
    BookOpen,
    Target,
    MessageCircle,
    Star,
    Compass,
    BarChart3,
    ChevronRight,
    AlertTriangle,
    Briefcase,
    Clock,
    RefreshCw,
} from "lucide-react";
import {
    useGetAcademicSummaryQuery,
    useGetCoursesQuery,
} from "@/lib/redux/slices/AcademicSlice";
import {
    useGetCareerRecommendationsQuery,
    useGetCourseRecommendationsQuery,
    useGetPerformanceAnalysesQuery,
} from "@/lib/redux/slices/RecommendationSlice";
import { useGetUnreadNotificationCountQuery } from "@/lib/redux/slices/NotificationSlice";

interface StatCard {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    trend: "up" | "down" | "stable";
    trendValue?: string;
    value: string;
    label: string;
    sublabel: string;
}

interface Deadline {
    id: string;
    title: string;
    due: string;
    urgent: boolean;
}

const FALLBACK_DEADLINES: Deadline[] = [
    { id: "d1", title: "CS401 Project Report", due: "In 2 days", urgent: true },
    { id: "d2", title: "CS302 Lab Assignment", due: "In 4 days", urgent: false },
    { id: "d3", title: "MA210 Midterm Exam", due: "In 6 days", urgent: false },
];

function TrendBadge({ trend, value }: { trend: StatCard["trend"]; value?: string }) {
    if (trend === "stable") return <span className="text-xs font-medium text-gray-400">Stable</span>;
    return (
        <span className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
            {trend === "up" ? "▲" : "▼"} {value}
        </span>
    );
}

function StatCardItem({ stat }: { stat: StatCard }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}>
                    {stat.icon}
                </div>
                <TrendBadge trend={stat.trend} value={stat.trendValue} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="mt-1 text-sm font-medium text-gray-600">{stat.label}</div>
            <div className="text-xs text-gray-400">{stat.sublabel}</div>
        </div>
    );
}

function QuickActionsCard({ actions }: { actions: { icon: React.ReactNode; iconBg: string; iconColor: string; title: string; href: string }[] }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Quick Actions</h2>
            <div className="space-y-1.5">
                {actions.map((action) => (
                    <a key={action.title} href={action.href} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-gray-50">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${action.iconBg} ${action.iconColor}`}>{action.icon}</span>
                        <span className="flex-1 text-sm font-semibold text-gray-800">{action.title}</span>
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                    </a>
                ))}
            </div>
        </div>
    );
}

function DeadlineRow({ deadline }: { deadline: Deadline }) {
    return (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3.5 ${deadline.urgent ? "bg-red-50" : "bg-gray-50"}`}>
            <Clock className={`h-4 w-4 shrink-0 ${deadline.urgent ? "text-red-500" : "text-gray-400"}`} />
            <div>
                <div className="text-sm font-semibold text-gray-900">{deadline.title}</div>
                <div className={`text-xs font-medium ${deadline.urgent ? "text-red-500" : "text-gray-400"}`}>{deadline.due}</div>
            </div>
        </div>
    );
}

export default function StudentDashboardPage() {
    const [showAdviceToast, setShowAdviceToast] = useState(false);
    const { data: academicSummary } = useGetAcademicSummaryQuery();
    const { data: courseRecs = [] } = useGetCourseRecommendationsQuery();
    const { data: careerRecs = [] } = useGetCareerRecommendationsQuery();
    const { data: performance = [] } = useGetPerformanceAnalysesQuery();
    const { data: unread } = useGetUnreadNotificationCountQuery();
    const { data: courses = [] } = useGetCoursesQuery();

    const stats: StatCard[] = useMemo(() => [
        {
            icon: <Award className="h-5 w-5" />,
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-500",
            trend: "up",
            trendValue: "+",
            value: academicSummary ? String(academicSummary.overall_score ?? "--") : "--",
            label: "Overall Score",
            sublabel: academicSummary ? `Attendance ${academicSummary.attendance_rate ?? 0}%` : "Live academic summary",
        },
        {
            icon: <CalendarDays className="h-5 w-5" />,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-500",
            trend: "stable",
            value: academicSummary ? String(academicSummary.attendance_rate ?? "--") + "%" : "--",
            label: "Attendance",
            sublabel: academicSummary?.at_risk ? "Needs review" : "On track",
        },
        {
            icon: <BookOpen className="h-5 w-5" />,
            iconBg: "bg-sky-50",
            iconColor: "text-sky-500",
            trend: "stable",
            value: String(academicSummary?.total_courses ?? courses.length ?? "--"),
            label: "Courses Enrolled",
            sublabel: "Current semester",
        },
        {
            icon: <Target className="h-5 w-5" />,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
            trend: "up",
            trendValue: careerRecs[0]?.match_percentage ? `${careerRecs[0].match_percentage}%` : undefined,
            value: careerRecs[0]?.career_name ?? "Pending",
            label: "Career Match",
            sublabel: careerRecs[0]?.framework ?? "Interest framework",
        },
    ], [academicSummary, careerRecs, courses.length]);

    const quickActions = [
        { icon: <MessageCircle className="h-4 w-4" />, iconBg: "bg-purple-50", iconColor: "text-purple-500", title: "Chat with AI Advisor", href: "/student/chatbot" },
        { icon: <Star className="h-4 w-4" />, iconBg: "bg-blue-50", iconColor: "text-blue-500", title: "View Recommendations", href: "/student/courses" },
        { icon: <Compass className="h-4 w-4" />, iconBg: "bg-cyan-50", iconColor: "text-cyan-500", title: "Explore Career Paths", href: "/student/career-guide" },
        { icon: <BarChart3 className="h-4 w-4" />, iconBg: "bg-emerald-50", iconColor: "text-emerald-500", title: "My Performance Report", href: "/student/analytics" },
    ];

    const alertText = performance[0]
        ? `Performance score ${performance[0].performance_score}/100 with ${performance[0].risk_level} risk.`
        : "Your advisor will surface risk alerts here when data changes.";

    const courseTitles = courseRecs.slice(0, 3).map((rec: any) => `${rec.course} (${Math.round((rec.confidence_score ?? 0) * 100)}% match)`);
    const careerTitles = careerRecs.slice(0, 3).map((rec: any) => `${rec.career_name} (${rec.match_percentage}% match)`);

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Your live academic overview, recommendations, and risk alerts
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAdviceToast(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1e2a78] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#16205c]"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh Insights
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => <StatCardItem key={stat.label} stat={stat} />)}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900">Recommended Courses</h2>
                        <p className="mt-1 text-sm text-gray-500">Generated from your academic profile and interests</p>
                        <div className="mt-4 space-y-3">
                            {courseTitles.length ? courseTitles.map((title) => (
                                <div key={title} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                                    <span className="text-sm font-medium text-gray-800">{title}</span>
                                    <span className="text-xs text-gray-400">Live</span>
                                </div>
                            )) : <p className="text-sm text-gray-400">No course recommendations yet.</p>}
                        </div>

                        <h2 className="mt-6 text-lg font-bold text-gray-900">Career Matches</h2>
                        <div className="mt-4 space-y-3">
                            {careerTitles.length ? careerTitles.map((title) => (
                                <div key={title} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                                    <span className="text-sm font-medium text-gray-800">{title}</span>
                                    <span className="text-xs text-gray-400">Live</span>
                                </div>
                            )) : <p className="text-sm text-gray-400">No career matches yet.</p>}
                        </div>
                    </div>

                    <QuickActionsCard actions={quickActions} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-6">
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                            <h2 className="text-base font-bold text-gray-900">Academic Alert</h2>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">{alertText}</p>
                        <button
                            onClick={() => setShowAdviceToast(true)}
                            className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                        >
                            <Briefcase className="h-4 w-4" />
                            Get AI Advice
                        </button>
                        <p className="mt-3 text-xs text-gray-500">Unread notifications: {unread?.unread_count ?? 0}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Upcoming Deadlines</h2>
                        <div className="space-y-2.5">
                            {FALLBACK_DEADLINES.map((d) => <DeadlineRow key={d.id} deadline={d} />)}
                        </div>
                    </div>
                </div>
            </div>

            {showAdviceToast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-medium text-white shadow-lg">
                    Showing live insight sources from {courseRecs.length ? "course recommendations" : "your profile"}.
                </div>
            )}
        </main>
    );
}
