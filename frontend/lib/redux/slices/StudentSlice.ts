import { apiSlice } from "./ApiSlice";

const studentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getStudentProfiles: builder.query({
            query: () => ({ url: "students/profiles/", method: "GET" }),
            providesTags: ["StudentProfile"],
        }),
        getStudentProfileById: builder.query({
            query: (id) => ({ url: `students/profiles/${id}/`, method: "GET" }),
            providesTags: ["StudentProfile"],
        }),
        getMyStudentProfile: builder.query({
            query: () => ({ url: "students/profiles/me/", method: "GET" }),
            providesTags: ["StudentProfile"],
        }),
        updateMyStudentProfile: builder.mutation({
            query: (data) => ({ url: "students/profiles/me/", method: "PUT", body: data }),
            invalidatesTags: ["StudentProfile"],
        }),
        patchMyStudentProfile: builder.mutation({
            query: (data) => ({ url: "students/profiles/me/", method: "PATCH", body: data }),
            invalidatesTags: ["StudentProfile"],
        }),
        adminUpdateStudentProfile: builder.mutation({
            query: ({ id, data }) => ({ url: `students/profiles/${id}/admin-update/`, method: "PATCH", body: data }),
            invalidatesTags: ["StudentProfile"],
        }),
        getBehaviourLogs: builder.query({
            query: (studentId?: string) => ({
                url: studentId ? `students/behaviour-logs/?student_id=${encodeURIComponent(studentId)}` : "students/behaviour-logs/",
                method: "GET",
            }),
            providesTags: ["BehaviourLog"],
        }),
        createBehaviourLog: builder.mutation({
            query: (data) => ({ url: "students/behaviour-logs/", method: "POST", body: data }),
            invalidatesTags: ["BehaviourLog"],
        }),
    }),
});

export const {
    useGetStudentProfilesQuery,
    useGetStudentProfileByIdQuery,
    useGetMyStudentProfileQuery,
    useUpdateMyStudentProfileMutation,
    usePatchMyStudentProfileMutation,
    useAdminUpdateStudentProfileMutation,
    useGetBehaviourLogsQuery,
    useCreateBehaviourLogMutation,
} = studentApi;
