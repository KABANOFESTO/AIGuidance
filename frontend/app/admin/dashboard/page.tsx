'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Users, UserCheck, MessageSquare, AlertTriangle } from 'lucide-react';

/* ── Stat cards data ── */
const stats = [
    {
        label: 'Total Students',
        value: '640',
        sub: '38 new this month',
        change: '+4.2%',
        changeColor: 'text-emerald-500',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
        icon: Users,
    },
    {
        label: 'Active Staff',
        value: '114',
        sub: 'Advisors + Lecturers',
        change: '+4.2%',
        changeColor: 'text-emerald-500',
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
        icon: UserCheck,
    },
    {
        label: 'AI Chat Sessions',
        value: '2,847',
        sub: 'This week',
        change: '+4.2%',
        changeColor: 'text-emerald-500',
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-600',
        icon: MessageSquare,
    },
    {
        label: 'At-Risk Students',
        value: '60',
        sub: '12 critical',
        change: '-1.8%',
        changeColor: 'text-red-500',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        icon: AlertTriangle,
    },
];

/* ── User growth chart data ── */
const growthData = [
    { month: 'Jan', students: 320, staff: 80 },
    { month: 'Feb', students: 380, staff: 85 },
    { month: 'Mar', students: 430, staff: 92 },
    { month: 'Apr', students: 500, staff: 98 },
    { month: 'May', students: 570, staff: 105 },
    { month: 'Jun', students: 640, staff: 114 },
];

/* ── Risk status data ── */
const riskData = [
    { name: 'On Track', value: 312, color: '#22c55e' },
    { name: 'At Risk', value: 48, color: '#f59e0b' },
    { name: 'Critical', value: 12, color: '#ef4444' },
];

/* ── Daily activity data ── */
const activityData = [
    { day: 'Mon', sessions: 130 },
    { day: 'Tue', sessions: 185 },
    { day: 'Wed', sessions: 225 },
    { day: 'Thu', sessions: 190 },
    { day: 'Fri', sessions: 150 },
    { day: 'Sat', sessions: 65 },
    { day: 'Sun', sessions: 45 },
];

/* ── Recent events data ── */
const events = [
    { text: '15 new student registrations', time: '2 min ago', dotColor: 'bg-emerald-500' },
    { text: 'Knowledge base updated by Admin', time: '1 hr ago', dotColor: 'bg-blue-500' },
    { text: '3 students flagged as at-risk', time: '2 hr ago', dotColor: 'bg-amber-500' },
    { text: 'System backup completed', time: '4 hr ago', dotColor: 'bg-emerald-500' },
];

export default function Dashboard() {
    return (
        <div className="space-y-6 bg-slate-50 p-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(({ label, value, sub, change, changeColor, iconBg, iconColor, icon: Icon }) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
                                <Icon size={18} />
                            </div>
                            <span className={`text-sm font-semibold ${changeColor}`}>{change}</span>
                        </div>
                        <p className="mt-4 text-2xl font-extrabold text-slate-900">{value}</p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-700">{label}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                {/* User Growth */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <h3 className="text-base font-bold text-slate-900">User Growth</h3>
                    <p className="mt-0.5 text-sm text-slate-400">Students and staff over 6 months</p>
                    <div className="mt-4 h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="studentsFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="students"
                                    stroke="#7c3aed"
                                    strokeWidth={2.5}
                                    fill="url(#studentsFill)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="staff"
                                    stroke="#a855f7"
                                    strokeWidth={2}
                                    fill="transparent"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <span className="h-0.5 w-4 rounded bg-violet-700" /> Students
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-0.5 w-4 rounded bg-violet-400" /> Staff
                        </span>
                    </div>
                </div>

                {/* Student Risk Status */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-base font-bold text-slate-900">Student Risk Status</h3>
                    <div className="mt-4 flex h-56 items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={3}
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    {riskData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2.5">
                        {riskData.map(({ name, value, color }) => (
                            <div key={name} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-slate-600">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                                    {name}
                                </span>
                                <span className="font-bold text-slate-900">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                {/* Daily System Activity */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-base font-bold text-slate-900">Daily System Activity</h3>
                    <p className="mt-0.5 text-sm text-slate-400">Chat sessions per day</p>
                    <div className="mt-4 h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="sessions" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent System Events */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-base font-bold text-slate-900">Recent System Events</h3>
                    <div className="mt-4 divide-y divide-slate-100">
                        {events.map(({ text, time, dotColor }) => (
                            <div key={text} className="flex items-center justify-between py-3.5">
                                <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                    <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
                                    {text}
                                </span>
                                <span className="shrink-0 text-xs text-slate-400">{time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}