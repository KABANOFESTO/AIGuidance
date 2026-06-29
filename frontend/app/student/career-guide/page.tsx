"use client";

import React, { useMemo, useState } from "react";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

interface CareerMatch {
    id: string;
    title: string;
    badge: string;
    badgeColor: string;
    description: string;
    matchPercent: number;
    salaryRange: string;
    jobGrowth: string;
    demand: "Low" | "Medium" | "High";
    tags: string[];
}

interface AssessmentCategory {
    id: string;
    label: string;
    value: number; // 0-100
}

// ----------------------------------------------------------------------------
// Static data
// ----------------------------------------------------------------------------

const CAREERS: CareerMatch[] = [
    {
        id: "swe",
        title: "Software Engineer",
        badge: "Top Match",
        badgeColor: "bg-blue-50 text-blue-600",
        description:
            "Design and build scalable software systems. Ideal for strong programming + problem solving.",
        matchPercent: 95,
        salaryRange: "$95k–$150k",
        jobGrowth: "+25%",
        demand: "High",
        tags: ["Python", "Algorithms", "System Design", "Git"],
    },
    {
        id: "ds",
        title: "Data Scientist",
        badge: "Trending",
        badgeColor: "bg-purple-50 text-purple-600",
        description:
            "Extract insights from large datasets. Strong fit given your math and AI interests.",
        matchPercent: 88,
        salaryRange: "$90k–$140k",
        jobGrowth: "+35%",
        demand: "High",
        tags: ["Python", "Statistics", "ML", "SQL"],
    },
    {
        id: "aiml",
        title: "AI/ML Engineer",
        badge: "High Growth",
        badgeColor: "bg-cyan-50 text-cyan-600",
        description:
            "Build and train AI systems. Top growth field matching your academic trajectory.",
        matchPercent: 84,
        salaryRange: "$100k–$160k",
        jobGrowth: "+40%",
        demand: "High",
        tags: ["TensorFlow", "PyTorch", "Math", "Research"],
    },
    {
        id: "cloud",
        title: "Cloud Architect",
        badge: "High Growth",
        badgeColor: "bg-cyan-50 text-cyan-600",
        description: "Design cloud infrastructure. High demand across all sectors.",
        matchPercent: 76,
        salaryRange: "$110k–$170k",
        jobGrowth: "+28%",
        demand: "High",
        tags: ["AWS", "Azure", "DevOps", "Networking"],
    },
];

const INITIAL_ASSESSMENT: AssessmentCategory[] = [
    { id: "programming", label: "Programming & Development", value: 88 },
    { id: "math", label: "Mathematics & Analytics", value: 82 },
    { id: "research", label: "Research & Innovation", value: 76 },
    { id: "communication", label: "Communication & Leadership", value: 70 },
];

// Radar axes, in clockwise order starting at the top.
// Programming + Math + Research + Communication are tied to the sliders above;
// Teamwork and Problem Solving are derived so the shape still feels alive.
const RADAR_AXES = [
    "Programming",
    "Math",
    "Problem Solving",
    "Communication",
    "Research",
    "Teamwork",
] as const;

// ----------------------------------------------------------------------------
// Radar chart geometry
// ----------------------------------------------------------------------------

const RADAR_SIZE = 260;
const RADAR_CENTER = RADAR_SIZE / 2;
const RADAR_MAX_RADIUS = RADAR_SIZE / 2 - 38;
const RING_LEVELS = [0.25, 0.5, 0.75, 1];

function axisPoint(index: number, total: number, radiusRatio: number) {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const radius = RADAR_MAX_RADIUS * radiusRatio;
    return {
        x: RADAR_CENTER + radius * Math.cos(angle),
        y: RADAR_CENTER + radius * Math.sin(angle),
    };
}

function buildPolygonPoints(values: number[]): string {
    return values
        .map((v, i) => {
            const { x, y } = axisPoint(i, values.length, v / 100);
            return `${x},${y}`;
        })
        .join(" ");
}

function buildRingPoints(total: number, radiusRatio: number): string {
    return Array.from({ length: total })
        .map((_, i) => {
            const { x, y } = axisPoint(i, total, radiusRatio);
            return `${x},${y}`;
        })
        .join(" ");
}

function labelPosition(index: number, total: number) {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const radius = RADAR_MAX_RADIUS + 26;
    return {
        x: RADAR_CENTER + radius * Math.cos(angle),
        y: RADAR_CENTER + radius * Math.sin(angle),
    };
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------

function DemandPill({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone: "blue" | "green" | "purple";
}) {
    const toneMap: Record<string, string> = {
        blue: "bg-blue-50 text-blue-700",
        green: "bg-emerald-50 text-emerald-600",
        purple: "bg-purple-50 text-purple-600",
    };
    return (
        <div className={`rounded-xl px-4 py-3 text-center ${toneMap[tone]}`}>
            <div className="text-sm font-bold">{value}</div>
            <div className="text-xs font-medium opacity-80">{label}</div>
        </div>
    );
}

function CareerCard({
    career,
    expanded,
    onToggle,
}: {
    career: CareerMatch;
    expanded: boolean;
    onToggle: (id: string) => void;
}) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-bold text-gray-900">
                            {career.title}
                        </h3>
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${career.badgeColor}`}
                        >
                            {career.badge}
                        </span>
                    </div>
                    <p className="mt-1.5 text-sm text-gray-500">{career.description}</p>
                </div>
                <div className="shrink-0 text-right">
                    <div className="text-2xl font-bold text-[#1e2a78]">
                        {career.matchPercent}%
                    </div>
                    <div className="text-xs text-gray-400">match</div>
                </div>
            </div>

            <div className="mt-4 h-1.5 w-full rounded-full bg-gray-100">
                <div
                    className="h-1.5 rounded-full"
                    style={{
                        width: `${career.matchPercent}%`,
                        background: "linear-gradient(90deg, #1e2a78, #7c3aed)",
                    }}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <DemandPill label="Salary Range" value={career.salaryRange} tone="blue" />
                <DemandPill label="Job Growth" value={career.jobGrowth} tone="green" />
                <DemandPill label="Demand" value={career.demand} tone="purple" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {career.tags.map((tag) => (
                    <span
                        key={tag}
                        className="rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <button
                onClick={() => onToggle(career.id)}
                className="mt-4 text-sm font-semibold text-blue-700 hover:underline"
            >
                {expanded ? "Hide career path ↑" : "View career path →"}
            </button>

            {expanded && (
                <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                    <p className="font-semibold text-gray-800">
                        Suggested next steps for {career.title}:
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>Take recommended courses covering {career.tags.slice(0, 2).join(" & ")}</li>
                        <li>Build 1–2 portfolio projects showcasing these skills</li>
                        <li>Seek an internship or research opportunity in this field</li>
                    </ul>
                </div>
            )}
        </div>
    );
}

function InterestRadar({
    programming,
    math,
    research,
    communication,
}: {
    programming: number;
    math: number;
    research: number;
    communication: number;
}) {
    // Derived axes so the hexagon doesn't feel static when sliders move.
    const problemSolving = Math.min(100, Math.round((programming + math) / 2 + 4));
    const teamwork = Math.min(100, Math.round((communication + research) / 2 + 2));

    const values = [
        programming,
        math,
        problemSolving,
        communication,
        research,
        teamwork,
    ];

    const polygonPoints = buildPolygonPoints(values);

    return (
        <svg
            viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
            className="mx-auto h-64 w-64"
        >
            {/* Rings */}
            {RING_LEVELS.map((level) => (
                <polygon
                    key={level}
                    points={buildRingPoints(RADAR_AXES.length, level)}
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth={1}
                />
            ))}

            {/* Spokes */}
            {RADAR_AXES.map((_, i) => {
                const outer = axisPoint(i, RADAR_AXES.length, 1);
                return (
                    <line
                        key={i}
                        x1={RADAR_CENTER}
                        y1={RADAR_CENTER}
                        x2={outer.x}
                        y2={outer.y}
                        stroke="rgba(255,255,255,0.25)"
                        strokeWidth={1}
                    />
                );
            })}

            {/* Data polygon */}
            <polygon
                points={polygonPoints}
                fill="rgba(96,165,250,0.45)"
                stroke="#93c5fd"
                strokeWidth={2}
            />

            {/* Data points */}
            {values.map((v, i) => {
                const { x, y } = axisPoint(i, values.length, v / 100);
                return <circle key={i} cx={x} cy={y} r={3.5} fill="#bfdbfe" />;
            })}

            {/* Axis labels */}
            {RADAR_AXES.map((label, i) => {
                const { x, y } = labelPosition(i, RADAR_AXES.length);
                let anchor: "start" | "middle" | "end" = "middle";
                if (x > RADAR_CENTER + 10) anchor = "start";
                else if (x < RADAR_CENTER - 10) anchor = "end";
                return (
                    <text
                        key={label}
                        x={x}
                        y={y}
                        textAnchor={anchor}
                        dominantBaseline="middle"
                        fontSize="11"
                        fontWeight={600}
                        fill="white"
                    >
                        {label}
                    </text>
                );
            })}
        </svg>
    );
}

function AssessmentSlider({
    category,
    onChange,
}: {
    category: AssessmentCategory;
    onChange: (id: string, value: number) => void;
}) {
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{category.label}</span>
                <span className="font-semibold text-gray-900">{category.value}%</span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-gray-100">
                <div
                    className="h-2 rounded-full"
                    style={{
                        width: `${category.value}%`,
                        background: "linear-gradient(90deg, #1e2a78, #7c3aed)",
                    }}
                />
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={category.value}
                    onChange={(e) => onChange(category.id, Number(e.target.value))}
                    className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
                    aria-label={category.label}
                />
                <div
                    className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-[#1e2a78] shadow"
                    style={{ left: `calc(${category.value}% - 8px)` }}
                />
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function CareerGuidePage() {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [assessment, setAssessment] = useState<AssessmentCategory[]>(
        INITIAL_ASSESSMENT
    );
    const [savedToast, setSavedToast] = useState(false);

    const getValue = (id: string) =>
        assessment.find((a) => a.id === id)?.value ?? 0;

    const updateAssessment = (id: string, value: number) => {
        setAssessment((prev) =>
            prev.map((a) => (a.id === id ? { ...a, value } : a))
        );
    };

    const handleToggleCard = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const handleSaveAssessment = () => {
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2200);
    };

    const sortedCareers = useMemo(
        () => [...CAREERS].sort((a, b) => b.matchPercent - a.matchPercent),
        []
    );

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Career Guide</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        AI-matched career paths based on your academic profile and
                        interests
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                    {/* Career cards */}
                    <div className="space-y-6">
                        {sortedCareers.map((career) => (
                            <CareerCard
                                key={career.id}
                                career={career}
                                expanded={expandedId === career.id}
                                onToggle={handleToggleCard}
                            />
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div
                            className="rounded-2xl p-6 text-white shadow-sm"
                            style={{
                                background: "linear-gradient(150deg, #312e81, #7c3aed)",
                            }}
                        >
                            <h2 className="mb-2 text-base font-bold">
                                Your Interest Profile
                            </h2>
                            <InterestRadar
                                programming={getValue("programming")}
                                math={getValue("math")}
                                research={getValue("research")}
                                communication={getValue("communication")}
                            />
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900">
                                Interest Assessment
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Adjust the sliders to refine your career recommendations —
                                the profile chart above updates live.
                            </p>

                            <div className="mt-5 space-y-5">
                                {assessment.map((category) => (
                                    <AssessmentSlider
                                        key={category.id}
                                        category={category}
                                        onChange={updateAssessment}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleSaveAssessment}
                                className="mt-5 w-full rounded-xl bg-[#1e2a78] py-2.5 text-sm font-semibold text-white transition hover:bg-[#16205c]"
                            >
                                Save Assessment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {savedToast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-medium text-white shadow-lg">
                    Assessment saved — recommendations will refresh shortly.
                </div>
            )}
        </main>
    );
}