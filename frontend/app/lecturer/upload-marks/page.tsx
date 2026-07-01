"use client";

import { FormEvent, useState } from "react";
import { Save, Sparkles, Users, BookOpen, CalendarDays } from "lucide-react";
import { useCreateAcademicRecordMutation, useCreateAttendanceRecordMutation, useGetCoursesQuery } from "@/lib/redux/slices/AcademicSlice";
import { useGetStudentProfilesQuery } from "@/lib/redux/slices/StudentSlice";
import { useRegenerateRecommendationsMutation } from "@/lib/redux/slices/RecommendationSlice";
import { useGetRecommendationModelStatusQuery } from "@/lib/redux/slices/RecommendationSlice";
import { toast } from "sonner";

export default function UploadMarksPage() {
    const { data: students = [] } = useGetStudentProfilesQuery(undefined);
    const { data: courses = [] } = useGetCoursesQuery(undefined);
    const { data: modelStatus } = useGetRecommendationModelStatusQuery(undefined);
    const [createAcademicRecord] = useCreateAcademicRecordMutation();
    const [createAttendanceRecord] = useCreateAttendanceRecordMutation();
    const [regenerateRecommendations] = useRegenerateRecommendationsMutation();
    const [savingMarks, setSavingMarks] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);
    const [marksForm, setMarksForm] = useState({
        student_id: "",
        course_id: "",
        assignment_score: "",
        exam_score: "",
        attendance_score: "",
        grade: "A",
        semester: "",
        notes: "",
    });
    const [attendanceForm, setAttendanceForm] = useState({
        student_id: "",
        course_id: "",
        date: "",
        status: "present",
        notes: "",
    });
    const stats = [
        { label: "Students", value: String((students as any[]).length), hint: "Live profiles loaded", icon: <Users className="h-5 w-5" /> },
        { label: "Courses", value: String((courses as any[]).length), hint: "Available course list", icon: <BookOpen className="h-5 w-5" /> },
        { label: "AI Refresh", value: "Auto", hint: "Recommendations update instantly", icon: <Sparkles className="h-5 w-5" /> },
        { label: "Attendance", value: "Live", hint: "Feeds student risk scoring", icon: <CalendarDays className="h-5 w-5" /> },
        {
            label: "AI Model",
            value: modelStatus?.version ?? "Loading",
            hint: modelStatus?.performance_model_ready ? "Recommendation engine online" : "Training artifacts loading",
            icon: <Sparkles className="h-5 w-5" />,
        },
    ];

    const resetMarksForm = () => {
        setMarksForm({
            student_id: "",
            course_id: "",
            assignment_score: "",
            exam_score: "",
            attendance_score: "",
            grade: "A",
            semester: "",
            notes: "",
        });
    };

    const resetAttendanceForm = () => {
        setAttendanceForm({
            student_id: "",
            course_id: "",
            date: "",
            status: "present",
            notes: "",
        });
    };

    const handleMarksSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSavingMarks(true);
        try {
            await createAcademicRecord({
                student_id: marksForm.student_id,
                course_id: Number(marksForm.course_id),
                assignment_score: Number(marksForm.assignment_score || 0),
                exam_score: Number(marksForm.exam_score || 0),
                attendance_score: Number(marksForm.attendance_score || 0),
                grade: marksForm.grade,
                semester: marksForm.semester,
                notes: marksForm.notes,
            }).unwrap();
            await regenerateRecommendations(marksForm.student_id).unwrap();
            toast.success("Marks saved and recommendations refreshed.");
            resetMarksForm();
        } catch (error: any) {
            toast.error(error?.data?.detail || "Unable to save marks.");
        } finally {
            setSavingMarks(false);
        }
    };

    const handleAttendanceSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSavingAttendance(true);
        try {
            await createAttendanceRecord({
                student_id: attendanceForm.student_id,
                course_id: Number(attendanceForm.course_id),
                date: attendanceForm.date,
                status: attendanceForm.status,
                notes: attendanceForm.notes,
            }).unwrap();
            await regenerateRecommendations(attendanceForm.student_id).unwrap();
            toast.success("Attendance saved and recommendations refreshed.");
            resetAttendanceForm();
        } catch (error: any) {
            toast.error(error?.data?.detail || "Unable to save attendance.");
        } finally {
            setSavingAttendance(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 rounded-3xl bg-[#1e2a78] p-6 text-white shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.2em] text-sky-200">Lecturer workflow</p>
                            <h1 className="mt-2 text-3xl font-bold">Upload Marks</h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-200">
                                Record assignment marks, exams, attendance, and remarks. The backend updates the student profile and regenerates AI recommendations immediately.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-sky-50">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Live AI refresh
                            </div>
                            <div className="mt-1 text-xs text-sky-100/80">Marks feed course, career, and performance suggestions</div>
                            <div className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-sky-50">
                                Model status: {modelStatus?.performance_model_ready ? "ready" : "loading"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-400">{stat.label}</p>
                                    <div className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</div>
                                    <p className="mt-1 text-xs text-gray-500">{stat.hint}</p>
                                </div>
                                <div className="rounded-2xl bg-[#1e2a78]/10 p-3 text-[#1e2a78]">{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <form onSubmit={handleMarksSubmit} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-[#1e2a78]" />
                            <h2 className="text-lg font-bold text-gray-900">Academic Record</h2>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Enter course results for a student. Recommendations refresh automatically after save.</p>
                        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                            <select value={marksForm.student_id} onChange={(e) => setMarksForm((p) => ({ ...p, student_id: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                                <option value="">Select student</option>
                                {(students as any[]).map((student) => (
                                    <option key={student.student_id} value={student.student_id}>
                                        {student.student_id} - {student.user}
                                    </option>
                                ))}
                            </select>
                            <select value={marksForm.course_id} onChange={(e) => setMarksForm((p) => ({ ...p, course_id: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                                <option value="">Select course</option>
                                {(courses as any[]).map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.code} - {course.name}
                                    </option>
                                ))}
                            </select>
                            <input value={marksForm.assignment_score} onChange={(e) => setMarksForm((p) => ({ ...p, assignment_score: e.target.value }))} type="number" placeholder="Assignment score" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                            <input value={marksForm.exam_score} onChange={(e) => setMarksForm((p) => ({ ...p, exam_score: e.target.value }))} type="number" placeholder="Exam score" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                            <input value={marksForm.attendance_score} onChange={(e) => setMarksForm((p) => ({ ...p, attendance_score: e.target.value }))} type="number" placeholder="Attendance score" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                            <select value={marksForm.grade} onChange={(e) => setMarksForm((p) => ({ ...p, grade: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                                {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"].map((grade) => (
                                    <option key={grade} value={grade}>
                                        {grade}
                                    </option>
                                ))}
                            </select>
                            <input value={marksForm.semester} onChange={(e) => setMarksForm((p) => ({ ...p, semester: e.target.value }))} type="text" placeholder="Semester" className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2" />
                            <textarea value={marksForm.notes} onChange={(e) => setMarksForm((p) => ({ ...p, notes: e.target.value }))} rows={4} placeholder="Optional lecturer notes" className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2" />
                        </div>
                        <button type="submit" disabled={savingMarks} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1e2a78] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16205c] disabled:opacity-60">
                            <Save className="h-4 w-4" />
                            {savingMarks ? "Saving..." : "Save Marks"}
                        </button>
                    </form>

                    <form onSubmit={handleAttendanceSubmit} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-emerald-600" />
                            <h2 className="text-lg font-bold text-gray-900">Attendance Record</h2>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Attendance also impacts student risk, performance, and recommendations.</p>
                        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                            <select value={attendanceForm.student_id} onChange={(e) => setAttendanceForm((p) => ({ ...p, student_id: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                                <option value="">Select student</option>
                                {(students as any[]).map((student) => (
                                    <option key={student.student_id} value={student.student_id}>
                                        {student.student_id} - {student.user}
                                    </option>
                                ))}
                            </select>
                            <select value={attendanceForm.course_id} onChange={(e) => setAttendanceForm((p) => ({ ...p, course_id: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                                <option value="">Select course</option>
                                {(courses as any[]).map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.code} - {course.name}
                                    </option>
                                ))}
                            </select>
                            <input value={attendanceForm.date} onChange={(e) => setAttendanceForm((p) => ({ ...p, date: e.target.value }))} type="date" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                            <select value={attendanceForm.status} onChange={(e) => setAttendanceForm((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                                {["present", "absent", "late", "excused"].map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            <textarea value={attendanceForm.notes} onChange={(e) => setAttendanceForm((p) => ({ ...p, notes: e.target.value }))} rows={4} placeholder="Optional attendance notes" className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2" />
                        </div>
                        <button type="submit" disabled={savingAttendance} className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60">
                            <Users className="h-4 w-4" />
                            {savingAttendance ? "Saving..." : "Save Attendance"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
