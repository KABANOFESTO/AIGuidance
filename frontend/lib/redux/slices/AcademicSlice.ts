import { apiSlice } from "./ApiSlice";

const academicApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCourses: builder.query({
            query: () => ({ url: "academics/courses/", method: "GET" }),
            providesTags: ["Course"],
        }),
        createCourse: builder.mutation({
            query: (data) => ({ url: "academics/courses/", method: "POST", body: data }),
            invalidatesTags: ["Course"],
        }),
        updateCourse: builder.mutation({
            query: ({ id, data }) => ({ url: `academics/courses/${id}/`, method: "PUT", body: data }),
            invalidatesTags: ["Course"],
        }),
        deleteCourse: builder.mutation({
            query: (id) => ({ url: `academics/courses/${id}/`, method: "DELETE" }),
            invalidatesTags: ["Course"],
        }),
        getEnrollments: builder.query({
            query: (studentId?: string) => ({
                url: studentId ? `academics/enrollments/?student_id=${encodeURIComponent(studentId)}` : "academics/enrollments/",
                method: "GET",
            }),
            providesTags: ["CourseEnrollment"],
        }),
        enrollInCourse: builder.mutation({
            query: (data) => ({ url: "academics/enrollments/", method: "POST", body: data }),
            invalidatesTags: ["CourseEnrollment", "CourseMaterial", "AcademicRecord", "StudentProfile"],
        }),
        updateEnrollment: builder.mutation({
            query: ({ id, data }) => ({ url: `academics/enrollments/${id}/`, method: "PATCH", body: data }),
            invalidatesTags: ["CourseEnrollment", "CourseMaterial", "AcademicRecord", "StudentProfile"],
        }),
        deleteEnrollment: builder.mutation({
            query: (id) => ({ url: `academics/enrollments/${id}/`, method: "DELETE" }),
            invalidatesTags: ["CourseEnrollment", "CourseMaterial", "AcademicRecord", "StudentProfile"],
        }),
        getAcademicRecords: builder.query({
            query: (studentId?: string) => ({
                url: studentId ? `academics/records/?student_id=${encodeURIComponent(studentId)}` : "academics/records/",
                method: "GET",
            }),
            providesTags: ["AcademicRecord"],
        }),
        createAcademicRecord: builder.mutation({
            query: (data) => ({ url: "academics/records/", method: "POST", body: data }),
            invalidatesTags: ["AcademicRecord"],
        }),
        getAttendanceRecords: builder.query({
            query: (studentId?: string) => ({
                url: studentId ? `academics/attendance/?student_id=${encodeURIComponent(studentId)}` : "academics/attendance/",
                method: "GET",
            }),
            providesTags: ["AttendanceRecord"],
        }),
        createAttendanceRecord: builder.mutation({
            query: (data) => ({ url: "academics/attendance/", method: "POST", body: data }),
            invalidatesTags: ["AttendanceRecord"],
        }),
        getAcademicSummary: builder.query({
            query: (studentId?: string) => ({
                url: studentId ? `academics/summary/?student_id=${encodeURIComponent(studentId)}` : "academics/summary/",
                method: "GET",
            }),
            providesTags: ["Analytics"],
        }),
        getCourseMaterials: builder.query({
            query: (courseId?: string) => ({
                url: courseId ? `academics/materials/?course_id=${encodeURIComponent(courseId)}` : "academics/materials/",
                method: "GET",
            }),
            providesTags: ["CourseMaterial"],
        }),
        createCourseMaterial: builder.mutation({
            query: (formData) => ({
                url: "academics/materials/",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["CourseMaterial"],
        }),
        updateCourseMaterial: builder.mutation({
            query: ({ id, data }) => ({
                url: `academics/materials/${id}/`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["CourseMaterial"],
        }),
        deleteCourseMaterial: builder.mutation({
            query: (id) => ({
                url: `academics/materials/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["CourseMaterial"],
        }),
    }),
});

export const {
    useGetCoursesQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation,
    useGetEnrollmentsQuery,
    useEnrollInCourseMutation,
    useUpdateEnrollmentMutation,
    useDeleteEnrollmentMutation,
    useGetAcademicRecordsQuery,
    useCreateAcademicRecordMutation,
    useGetAttendanceRecordsQuery,
    useCreateAttendanceRecordMutation,
    useGetAcademicSummaryQuery,
    useGetCourseMaterialsQuery,
    useCreateCourseMaterialMutation,
    useUpdateCourseMaterialMutation,
    useDeleteCourseMaterialMutation,
} = academicApi;
