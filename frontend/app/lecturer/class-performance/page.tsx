'use client';

import { useState, useRef } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Download, X, Bell, CheckCircle } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────── */
type ModuleCode = 'CS301' | 'CS302' | 'CS401' | 'CS450';

interface GradeBucket {
    label: string;
    count: number;
}

interface ModuleCompletion {
    code: ModuleCode;
    shortName: string;
    submitted: number;
    total: number;
}

interface AtRiskStudent {
    id: string;
    name: string;
    module: ModuleCode;
    score: number;
    attendance: number;
    flagReason: 'Failing grade' | 'Low attendance' | 'Inconsistent performance';
    alertSent: boolean;
}

/* ─── Static data ────────────────────────────────────────── */
const MODULE_NAMES: Record<ModuleCode, string> = {
    CS301: 'Algorithms & Data Structures',
    CS302: 'Database Systems',
    CS401: 'Advanced Algorithms',
    CS450: 'Machine Learning Fundamentals',
};

const GRADE_DATA: Record<ModuleCode, GradeBucket[]> = {
    CS301: [
        { label: 'A (90-100)', count: 6 },
        { label: 'B (80-89)', count: 12 },
        { label: 'C (70-79)', count: 10 },
        { label: 'D (60-69)', count: 6 },
        { label: 'F (<60)', count: 4 },
    ],
    CS302: [
        { label: 'A (90-100)', count: 10 },
        { label: 'B (80-89)', count: 16 },
        { label: 'C (70-79)', count: 9 },
        { label: 'D (60-69)', count: 5 },
        { label: 'F (<60)', count: 2 },
    ],
    CS401: [
        { label: 'A (90-100)', count: 4 },
        { label: 'B (80-89)', count: 9 },
        { label: 'C (70-79)', count: 8 },
        { label: 'D (60-69)', count: 7 },
        { label: 'F (<60)', count: 3 },
    ],
    CS450: [
        { label: 'A (90-100)', count: 8 },
        { label: 'B (80-89)', count: 13 },
        { label: 'C (70-79)', count: 6 },
        { label: 'D (60-69)', count: 2 },
        { label: 'F (<60)', count: 2 },
    ],
};

const COMPLETIONS: ModuleCompletion[] = [
    { code: 'CS301', shortName: 'Algorithms', submitted: 34, total: 38 },
    { code: 'CS302', shortName: 'Databases', submitted: 40, total: 42 },
    { code: 'CS401', shortName: 'Adv. Algorithms', submitted: 25, total: 31 },
    { code: 'CS450', shortName: 'ML Fundamentals', submitted: 29, total: 31 },
];

const INITIAL_STUDENTS: AtRiskStudent[] = [
    { id: '1', name: 'Marcus Williams', module: 'CS401', score: 48, attendance: 62, flagReason: 'Failing grade', alertSent: false },
    { id: '2', name: 'Jordan Kim', module: 'CS302', score: 67, attendance: 71, flagReason: 'Low attendance', alertSent: false },
    { id: '3', name: 'Sam Lee', module: 'CS301', score: 71, attendance: 78, flagReason: 'Inconsistent performance', alertSent: false },
];

/* ─── Flag badge styles ───────────────────────────────────── */
const FLAG_STYLES: Record<AtRiskStudent['flagReason'], string> = {
    'Failing grade': 'bg-red-50 text-red-500 border border-red-200',
    'Low attendance': 'bg-orange-50 text-orange-500 border border-orange-200',
    'Inconsistent performance': 'bg-gray-100 text-gray-600 border border-gray-200',
};

const SCORE_COLOR = (s: number) =>
    s < 60 ? 'text-red-500' : s < 75 ? 'text-orange-500' : 'text-gray-800';

/* ─── Custom bar tooltip ─────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
    if (active && payload?.length) {
        return (
            <div className="rounded-xl bg-white border border-gray-100 shadow-lg px-4 py-2.5 text-sm">
                <p className="font-semibold text-gray-700">{label}</p>
                <p className="text-emerald-600 font-bold mt-0.5">{payload[0].value} students</p>
            </div>
        );
    }
    return null;
}

/* ─── Send Alert Modal ───────────────────────────────────── */
function AlertModal({
    student,
    onClose,
    onSend,
}: {
    student: AtRiskStudent;
    onClose: () => void;
    onSend: () => void;
}) {
    const defaultMsg = `Dear ${student.name},\n\nThis is a notification from your lecturer regarding your academic progress in ${MODULE_NAMES[student.module]}.\n\nCurrent Score: ${student.score}%\nAttendance: ${student.attendance}%\nFlag Reason: ${student.flagReason}\n\nPlease schedule a consultation at your earliest convenience.\n\nBest regards,\nDr. Emily Chen`;
    const [message, setMessage] = useState(defaultMsg);
    const [sending, setSending] = useState(false);

    const handleSend = () => {
        setSending(true);
        setTimeout(() => { setSending(false); onSend(); }, 900);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Bell size={16} className="text-emerald-500" />
                        <p className="font-bold text-gray-900 text-sm">Send Alert — {student.name}</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
                        <X size={17} className="text-gray-500" />
                    </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div className="flex gap-3 text-xs">
                        <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 font-semibold">{student.module}</span>
                        <span className={`rounded-full px-2.5 py-1 font-semibold ${FLAG_STYLES[student.flagReason]}`}>{student.flagReason}</span>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={9}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={sending}
                            className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
                        >
                            {sending ? 'Sending…' : 'Send Alert'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Success Toast ──────────────────────────────────────── */
function Toast({ name }: { name: string }) {
    return (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-3.5 shadow-2xl text-white text-sm font-medium animate-fade-in">
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            Alert sent to {name}
        </div>
    );
}

/* ─── PDF Export ─────────────────────────────────────────── */
function exportToPDF(
    selectedModule: ModuleCode,
    students: AtRiskStudent[],
    completions: ModuleCompletion[]
) {
    const gradeData = GRADE_DATA[selectedModule];
    const moduleName = MODULE_NAMES[selectedModule];
    const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const completionRows = completions
        .map((c) => {
            const pct = Math.round((c.submitted / c.total) * 100);
            return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;">${c.code} — ${c.shortName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;text-align:right;">${c.submitted} submitted (${pct}%)</td>
      </tr>`;
        })
        .join('');

    const studentRows = students
        .map((s) => `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#111827;">${s.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;">${s.module}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:${s.score < 60 ? '#ef4444' : s.score < 75 ? '#f97316' : '#374151'};font-weight:700;">${s.score}%</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;">${s.attendance}%</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;">${s.flagReason}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:${s.alertSent ? '#22c55e' : '#9ca3af'};">${s.alertSent ? '✔ Sent' : 'Not sent'}</td>
    </tr>`)
        .join('');

    const gradeBars = gradeData
        .map((g) => {
            const barW = Math.round((g.count / 16) * 260);
            return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <span style="width:80px;font-size:12px;color:#6b7280;">${g.label}</span>
        <div style="height:20px;background:#22c55e;border-radius:4px;width:${barW}px;min-width:4px;"></div>
        <span style="font-size:12px;color:#374151;font-weight:600;">${g.count}</span>
      </div>`;
        })
        .join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Class Performance Analytics — ${now}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, sans-serif; background: #f9fafb; padding: 40px; color: #111827; }
    h1 { font-size: 22px; font-weight: 700; }
    .sub { font-size: 13px; color: #6b7280; margin-top: 4px; margin-bottom: 32px; }
    .card { background: white; border-radius: 16px; border: 1px solid #e5e7eb; padding: 24px; margin-bottom: 20px; }
    h2 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
    .sub2 { font-size: 12px; color: #9ca3af; margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 11px; font-weight: 700; color: #9ca3af; letter-spacing: 0.05em; padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; }
    .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 32px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  </style>
</head>
<body>
  <h1>Class Performance Analytics</h1>
  <p class="sub">Detailed performance metrics for all modules you teach &nbsp;|&nbsp; Exported ${now}</p>

  <div class="grid2">
    <div class="card">
      <h2>Grade Distribution — ${selectedModule}</h2>
      <p class="sub2">${moduleName}</p>
      ${gradeBars}
    </div>
    <div class="card">
      <h2>Assignment Completion Rate</h2>
      <p class="sub2">All modules</p>
      <table>
        <thead><tr><th>Module</th><th style="text-align:right;">Submissions</th></tr></thead>
        <tbody>${completionRows}</tbody>
      </table>
    </div>
  </div>

  <div class="card">
    <h2>Students Requiring Additional Support</h2>
    <p class="sub2">At-risk students across all modules</p>
    <table>
      <thead>
        <tr>
          <th>Student</th><th>Module</th><th>Score</th><th>Attendance</th><th>Flag Reason</th><th>Alert</th>
        </tr>
      </thead>
      <tbody>${studentRows}</tbody>
    </table>
  </div>

  <p class="footer">AIGuidance Lecturer Portal &mdash; Confidential &mdash; ${now}</p>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
        win.addEventListener('load', () => {
            setTimeout(() => { win.print(); }, 400);
        });
    }
}

/* ─── Page ───────────────────────────────────────────────── */
const MODULE_CODES: ModuleCode[] = ['CS301', 'CS302', 'CS401', 'CS450'];

export default function ClassPerformance() {
    const [selectedModule, setSelectedModule] = useState<ModuleCode>('CS450');
    const [students, setStudents] = useState<AtRiskStudent[]>(INITIAL_STUDENTS);
    const [alertTarget, setAlertTarget] = useState<AtRiskStudent | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const handleSendAlert = () => {
        if (!alertTarget) return;
        setStudents((prev) =>
            prev.map((s) => s.id === alertTarget.id ? { ...s, alertSent: true } : s)
        );
        setToast(alertTarget.name);
        setAlertTarget(null);
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Class Performance Analytics</h1>
                    <p className="mt-1 text-sm text-gray-500">Detailed performance metrics for all modules you teach</p>
                </div>
                <button
                    onClick={() => exportToPDF(selectedModule, students, COMPLETIONS)}
                    className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                >
                    <Download size={15} />
                    Export as PDF
                </button>
            </div>

            {/* Top two panels */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-4">

                {/* Grade Distribution */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                    <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">
                                Grade Distribution — {selectedModule}
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">{MODULE_NAMES[selectedModule]}</p>
                        </div>
                        {/* Module switcher */}
                        <div className="flex gap-1.5 flex-wrap">
                            {MODULE_CODES.map((code) => (
                                <button
                                    key={code}
                                    onClick={() => setSelectedModule(code)}
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${selectedModule === code
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {code}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5">
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart
                                data={GRADE_DATA[selectedModule]}
                                margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
                                barCategoryGap="28%"
                            >
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={52}>
                                    {GRADE_DATA[selectedModule].map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={i === GRADE_DATA[selectedModule].length - 1 ? '#86efac' : '#22c55e'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Assignment Completion Rate */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-6">Assignment Completion Rate</h2>
                    <div className="space-y-5">
                        {COMPLETIONS.map((c) => {
                            const pct = Math.round((c.submitted / c.total) * 100);
                            return (
                                <div key={c.code}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm font-medium text-gray-700">
                                            {c.code} — {c.shortName}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {c.submitted} submitted ({pct}%)
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${pct}%`,
                                                background: 'linear-gradient(90deg, #22c55e 0%, #06b6d4 100%)',
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* At-Risk Students Table */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-6">Students Requiring Additional Support</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                {['Student', 'Module', 'Score', 'Attendance', 'Flag Reason', 'Action'].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 pb-3 pr-6"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s.id} className="border-t border-gray-50">
                                    <td className="py-4 pr-6 text-sm font-bold text-gray-900 whitespace-nowrap">{s.name}</td>
                                    <td className="py-4 pr-6">
                                        <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs font-semibold">
                                            {s.module}
                                        </span>
                                    </td>
                                    <td className={`py-4 pr-6 text-sm font-bold ${SCORE_COLOR(s.score)}`}>
                                        {s.score}%
                                    </td>
                                    <td className="py-4 pr-6 text-sm text-gray-600">{s.attendance}%</td>
                                    <td className="py-4 pr-6">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${FLAG_STYLES[s.flagReason]}`}>
                                            {s.flagReason}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        {s.alertSent ? (
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                                                <CheckCircle size={13} /> Sent
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => setAlertTarget(s)}
                                                className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                                            >
                                                Send Alert
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Alert modal */}
            {alertTarget && (
                <AlertModal
                    student={alertTarget}
                    onClose={() => setAlertTarget(null)}
                    onSend={handleSendAlert}
                />
            )}

            {/* Toast */}
            {toast && <Toast name={toast} />}
        </div>
    );
}