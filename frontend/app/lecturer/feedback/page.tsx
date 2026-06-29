'use client';

import { useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────── */
type ModuleCode = 'CS301' | 'CS302' | 'CS401' | 'CS450';

interface ModuleRating {
  code: ModuleCode;
  name: string;
  reviews: number;
  rating: number;
}

interface Student {
  id: string;
  name: string;
  initials: string;
  color: string;
}

interface FeedbackEntry {
  id: string;
  studentId: string;
  studentName: string;
  initials: string;
  avatarColor: string;
  module: ModuleCode;
  rating: number;
  comment: string;
  postedAt: string;
}

/* ─── Static data ────────────────────────────────────────── */
const MODULE_RATINGS: ModuleRating[] = [
  { code: 'CS450', name: 'ML Fundamentals',  reviews: 28, rating: 4.6 },
  { code: 'CS302', name: 'Databases',         reviews: 38, rating: 4.2 },
  { code: 'CS301', name: 'Algorithms',        reviews: 31, rating: 3.9 },
  { code: 'CS401', name: 'Adv. Algorithms',   reviews: 22, rating: 4.1 },
];

const STUDENTS: Student[] = [
  { id: 'STU001', name: 'Alex Johnson',  initials: 'AJ', color: '#22c55e' },
  { id: 'STU002', name: 'Priya Sharma',  initials: 'PS', color: '#22c55e' },
  { id: 'STU003', name: 'Marcus Williams', initials: 'MW', color: '#6366f1' },
  { id: 'STU004', name: 'Jordan Kim',    initials: 'JK', color: '#f59e0b' },
  { id: 'STU005', name: 'Sam Lee',       initials: 'SL', color: '#ec4899' },
];

const MODULE_OPTIONS: { code: ModuleCode; label: string }[] = [
  { code: 'CS450', label: 'CS450 — Machine Learning' },
  { code: 'CS302', label: 'CS302 — Database Systems' },
  { code: 'CS301', label: 'CS301 — Algorithms & Data Structures' },
  { code: 'CS401', label: 'CS401 — Advanced Algorithms' },
];

const INITIAL_FEEDBACK: FeedbackEntry[] = [
  {
    id: 'f1',
    studentId: 'STU001',
    studentName: 'Alex Johnson',
    initials: 'AJ',
    avatarColor: '#22c55e',
    module: 'CS450',
    rating: 5,
    comment: '"Excellent course material. The practical examples in ML really helped connect theory to real applications."',
    postedAt: '2 days ago',
  },
  {
    id: 'f2',
    studentId: 'STU002',
    studentName: 'Priya Sharma',
    initials: 'PS',
    avatarColor: '#22c55e',
    module: 'CS302',
    rating: 4,
    comment: '"Very well structured. Would appreciate more practice exercises for query optimization."',
    postedAt: '3 days ago',
  },
  {
    id: 'f3',
    studentId: 'STU003',
    studentName: 'Marcus Williams',
    initials: 'MW',
    avatarColor: '#6366f1',
    module: 'CS401',
    rating: 4,
    comment: '"The course content is challenging but rewarding. More worked examples would help."',
    postedAt: '5 days ago',
  },
];

/* ─── Star display (read-only) ───────────────────────────── */
function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

/* ─── Star picker (interactive) ──────────────────────────── */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= (hovered || value);
        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              size={22}
              className={filled ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-100'}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ─── Module badge ───────────────────────────────────────── */
function ModuleBadge({ code }: { code: ModuleCode }) {
  return (
    <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs font-semibold">
      {code}
    </span>
  );
}

/* ─── Toast ──────────────────────────────────────────────── */
function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-3.5 shadow-2xl text-white text-sm font-medium">
      <CheckCircle size={16} className="text-emerald-400 shrink-0" />
      {message}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function StudentFeedback() {
  /* Form state */
  const [selectedStudentId, setSelectedStudentId] = useState<string>(STUDENTS[0].id);
  const [selectedModule, setSelectedModule] = useState<ModuleCode>('CS450');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  /* Feedback list */
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>(INITIAL_FEEDBACK);
  const [moduleRatings, setModuleRatings] = useState<ModuleRating[]>(MODULE_RATINGS);

  /* Toast */
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  /* Validate & submit */
  const handleSubmit = () => {
    const errs: typeof errors = {};
    if (rating === 0) errs.rating = 'Please select a rating.';
    if (!comment.trim()) errs.comment = 'Please enter feedback comments.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const student = STUDENTS.find((s) => s.id === selectedStudentId)!;
    const newEntry: FeedbackEntry = {
      id: `f${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      initials: student.initials,
      avatarColor: student.color,
      module: selectedModule,
      rating,
      comment: `"${comment.trim()}"`,
      postedAt: 'Just now',
    };

    setFeedbackList((prev) => [newEntry, ...prev]);

    /* Update module avg rating (running average approximation) */
    setModuleRatings((prev) =>
      prev.map((m) => {
        if (m.code !== selectedModule) return m;
        const newCount = m.reviews + 1;
        const newAvg = Math.round(((m.rating * m.reviews + rating) / newCount) * 10) / 10;
        return { ...m, reviews: newCount, rating: newAvg };
      })
    );

    /* Reset */
    setRating(0);
    setComment('');
    setErrors({});
    showToast(`Feedback submitted for ${student.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Student Feedback</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and submit feedback about student learning and course engagement
        </p>
      </div>

      {/* Top two panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-4">

        {/* Module Satisfaction Ratings */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Module Satisfaction Ratings</h2>
          <div className="space-y-1">
            {moduleRatings.map((m) => (
              <div
                key={m.code}
                className="flex items-center justify-between rounded-xl px-3 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {m.code} — {m.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.reviews} reviews</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Star size={15} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-gray-800">{m.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Feedback Form */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Submit Student Feedback</h2>

          <div className="space-y-4">
            {/* Student selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {STUDENTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Module selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Module</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value as ModuleCode)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {MODULE_OPTIONS.map((m) => (
                  <option key={m.code} value={m.code}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Star rating */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Rating</label>
              <StarPicker value={rating} onChange={(v) => { setRating(v); setErrors((e) => ({ ...e, rating: undefined })); }} />
              {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating}</p>}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Feedback Comments</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => { setComment(e.target.value); setErrors((er) => ({ ...er, comment: undefined })); }}
                placeholder="Provide detailed feedback about this student's performance..."
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none ${
                  errors.comment ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.comment && <p className="mt-1 text-xs text-red-500">{errors.comment}</p>}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5">
          Recent Student Feedback on Your Modules
        </h2>
        <div className="divide-y divide-gray-50">
          {feedbackList.map((f) => (
            <div key={f.id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                {/* Left: avatar + name + module */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: f.avatarColor }}
                  >
                    {f.initials}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{f.studentName}</span>
                    <ModuleBadge code={f.module} />
                  </div>
                </div>
                {/* Right: stars */}
                <StarDisplay rating={f.rating} size={15} />
              </div>
              <p className="mt-2.5 text-sm text-gray-600 leading-relaxed pl-12">{f.comment}</p>
              <p className="mt-1.5 text-xs text-gray-400 pl-12">{f.postedAt}</p>
            </div>
          ))}
        </div>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}