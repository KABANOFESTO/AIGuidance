import { apiSlice } from "./ApiSlice";

const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({ url: "auth/login/", method: "POST", body: data }),
            invalidatesTags: ["Auth"],
        }),
        logout: builder.mutation({
            query: (data) => ({ url: "auth/logout/", method: "POST", body: data }),
            invalidatesTags: ["Auth"],
        }),
        register: builder.mutation({
            query: (data) => ({ url: "auth/register/", method: "POST", body: data }),
        }),
        createUser: builder.mutation({
            query: (data) => ({ url: "auth/admin/users/create/", method: "POST", body: data }),
            invalidatesTags: ["User"],
        }),
        updateProfile: builder.mutation({
            query: (data) => ({ url: "auth/update-profile/", method: "PUT", body: data }),
            invalidatesTags: ["Auth", "User"],
        }),
        forgotPassword: builder.mutation({
            query: (data) => ({ url: "auth/forgot-password/", method: "POST", body: data }),
        }),
        resetPassword: builder.mutation({
            query: (data) => ({ url: "auth/reset-password/", method: "POST", body: data }),
        }),
        verifyEmail: builder.mutation({
            query: ({ uidb64, token }) => ({ url: `auth/verify-email/${uidb64}/${token}/`, method: "GET" }),
        }),
        resendVerification: builder.mutation({
            query: (data) => ({ url: "auth/resend-verification/", method: "POST", body: data }),
        }),
        getAllUsers: builder.query({
            query: () => ({ url: "auth/users/", method: "GET" }),
            providesTags: ["User"],
        }),
        getMyDetails: builder.mutation({
            query: () => ({ url: "auth/me/", method: "GET" }),
        }),
        currentUser: builder.query({
            query: () => ({ url: "auth/me/", method: "GET" }),
            providesTags: ["Auth"],
        }),
        updateUser: builder.mutation({
            query: ({ id, data }) => ({ url: `auth/admin/users/${id}/update/`, method: "PUT", body: data }),
            invalidatesTags: ["User"],
        }),
        deleteUser: builder.mutation({
            query: (id) => ({ url: `auth/admin/users/${id}/delete/`, method: "DELETE" }),
            invalidatesTags: ["User"],
        }),
        toggleUserActive: builder.mutation({
            query: (id) => ({ url: `auth/admin/users/${id}/toggle-active/`, method: "PATCH" }),
            invalidatesTags: ["User"],
        }),
        getAdminAnalytics: builder.query({
            query: () => ({ url: "auth/admin/analytics/", method: "GET" }),
            providesTags: ["AdminAnalytics"],
        }),
        getAdminReportSummary: builder.query({
            query: () => ({ url: "auth/admin/reports/summary/", method: "GET" }),
            providesTags: ["AdminReport"],
        }),
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useVerifyEmailMutation,
    useResendVerificationMutation,
    useRegisterMutation,
    useUpdateProfileMutation,
    useGetAllUsersQuery,
    useGetMyDetailsMutation,
    useCurrentUserQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useToggleUserActiveMutation,
    useGetAdminAnalyticsQuery,
    useGetAdminReportSummaryQuery,
} = authApi;
