"use client";

import React, { useMemo, useState } from "react";
import { Plus, Check } from "lucide-react";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

type Level = "Intermediate" | "Advanced";
type FilterId = "all" | "ai" | "intermediate" | "advanced";

interface Course {
    id: string;
    code: string;
    level: Level;
    title: string;
    matchPercent: number;
    instructor: string;
    credits: number;
    department: string;
    tags: string[];
    isAi: boolean;
}

interface FilterOption {
    id: FilterId;
    label: string;
}

// ----------------------------------------------------------------------------
// Static data — swap for real recommendation-engine output
// ----------------------------------------------------------------------------

const FILTERS: FilterOption[] = [
    { id: "all", label: "All" },
    { id: "ai", label: "Ai" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
];

const COURSES: Course[] = [
    {
        id: "c1",
        code: "CS450",
        level: "Intermediate",
        title: "Machine Learning Fundamentals",
        matchPercent: 97,
        instructor: "Dr. Emily Chen",
        credits: 3,
        department: "Computer Science",
        tags: ["AI", "Python", "Data"],
        isAi: true,
    },
    {
        id: "c2",
        code: "CS460",
        level: "Advanced",
        title: "Deep Learning & Neural Networks",
        matchPercent: 94,
        instructor: "Prof. Mark Davis",
        credits: 3,
        department: "Computer Science",
        tags: ["AI", "TensorFlow", "Research"],
        isAi: true,
    },
    {
        id: "c3",
        code: "CS410",
        level: "Intermediate",
        title: "Cloud Computing & DevOps",
        matchPercent: 89,
        instructor: "Dr. Lisa Park",
        credits: 3,
        department: "Computer Science",
        tags: ["AWS", "Docker", "CI/CD"],
        isAi: false,
    },
    {
        id: "c4",
        code: "DS301",
        level: "Intermediate",
        title: "Data Mining & Analytics",
        matchPercent: 87,
        instructor: "Dr. Ahmed Hassan",
        credits: 3,
        department: "Data Science",
        tags: ["Python", "SQL", "Visualisation"],
        isAi: true,
    },
    {
        id: "c5",
        code: "CS420",
        level: "Advanced",
        title: "Software Architecture Patterns",
        matchPercent: 83,
        instructor: "Prof. Sandra Lee",
        credits: 3,
        department: "Computer Science",
        tags: ["Design", "Patterns", "System"],
        isAi: false,
    },
    {
        id: "c6",
        code: "MATH301",
        level: "Intermediate",
        title: "Applied Statistics for CS",
        matchPercent: 79,
        instructor: "Dr. James Brown",
        credits: 3,
        department: "Mathematics",
        tags: ["Statistics", "R", "Analysis"],
        isAi: true,
    },
];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function matchesFilter(course: Course, filter: FilterId): boolean {
    switch (filter) {
        case "all":
            return true;
        case "ai":
            return course.isAi;
        case "intermediate":
            return course.level === "Intermediate";
        case "advanced":
            return course.level === "Advanced";
        default:
            return true;
    }
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------

function FilterTabs({
    active,
    onChange,
}: {
    active: FilterId;
    onChange: (id: FilterId) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
                const isActive = active === f.id;
                return (
                    <button
                        key={f.id}
                        onClick={() => onChange(f.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive
                            ? "bg-[#1e2a78] text-white"
                            : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        {f.label}
                    </button>
                );
            })}
        </div>
    );
}

function LevelBadge({ level }: { level: Level }) {
    const style =
        level === "Advanced"
            ? "bg-purple-50 text-purple-600"
            : "bg-sky-50 text-sky-600";
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>
            {level}
        </span>
    );
}

function MatchBar({ percent }: { percent: number }) {
    return (
        <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
            <div
                className="h-1.5 rounded-full"
                style={{
                    width: `${percent}%`,
                    background: "linear-gradient(90deg, #1e2a78, #7c3aed)",
                }}
            />
        </div>
    );
}

function CourseCard({
    course,
    enrolled,
    onEnroll,
}: {
    course: Course;
    enrolled: boolean;
    onEnroll: (id: string) => void;
}) {
    return (
        <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {course.code}
                    </span>
                    <LevelBadge level={course.level} />
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-[#1e2a78]">
                        {course.matchPercent}%
                    </div>
                    <div className="text-xs text-gray-400">AI Match</div>
                </div>
            </div>

            <h3 className="mt-3 text-base font-bold text-gray-900">
                {course.title}
            </h3>
            <MatchBar percent={course.matchPercent} />

            <div className="mt-4 space-y-1 text-sm text-gray-500">
                <div>
                    <span className="font-medium text-gray-600">Instructor:</span>{" "}
                    {course.instructor}
                </div>
                <div>
                    <span className="font-medium text-gray-600">Credits:</span>{" "}
                    {course.credits} | <span className="font-medium text-gray-600">Dept:</span>{" "}
                    {course.department}
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                    <span
                        key={tag}
                        className="rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <button
                onClick={() => onEnroll(course.id)}
                disabled={enrolled}
                className={`mt-5 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${enrolled
                    ? "cursor-default bg-emerald-50 text-emerald-600"
                    : "bg-[#1e2a78] text-white hover:bg-[#16205c]"
                    }`}
            >
                {enrolled ? (
                    <>
                        <Check className="h-4 w-4" />
                        Enrolled
                    </>
                ) : (
                    <>
                        <Plus className="h-4 w-4" />
                        Enroll Now
                    </>
                )}
            </button>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function CourseRecommendationsPage() {
    const [activeFilter, setActiveFilter] = useState<FilterId>("all");
    const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState<string | null>(null);

    const filteredCourses = useMemo(
        () => COURSES.filter((c) => matchesFilter(c, activeFilter)),
        [activeFilter]
    );

    const handleEnroll = (id: string) => {
        const course = COURSES.find((c) => c.id === id);
        setEnrolledIds((prev) => new Set(prev).add(id));
        if (course) {
            setToast(`Enrolled in ${course.title} (${course.code})`);
            setTimeout(() => setToast(null), 2500);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Course Recommendations
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            AI-personalised course suggestions based on your grades,
                            interests, and career goals
                        </p>
                    </div>
                    <FilterTabs active={activeFilter} onChange={setActiveFilter} />
                </div>

                {/* Course grid */}
                {filteredCourses.length === 0 ? (
                    <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-400">
                        No courses match this filter yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                enrolled={enrolledIds.has(course.id)}
                                onEnroll={handleEnroll}
                            />
                        ))}
                    </div>
                )}
            </div>

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-medium text-white shadow-lg">
                    <Check className="h-4 w-4 text-emerald-400" />
                    {toast}
                </div>
            )}
        </main>
    );
}