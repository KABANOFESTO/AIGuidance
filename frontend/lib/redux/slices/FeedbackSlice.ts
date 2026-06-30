import { apiSlice } from "./ApiSlice";

const feedbackApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFeedback: builder.query({
            query: () => ({ url: "feedback/", method: "GET" }),
            providesTags: ["Feedback"],
        }),
        submitFeedback: builder.mutation({
            query: (data) => ({ url: "feedback/", method: "POST", body: data }),
            invalidatesTags: ["Feedback"],
        }),
        getFeedbackAdminOverview: builder.query({
            query: () => ({ url: "feedback/admin-overview/", method: "GET" }),
            providesTags: ["Feedback"],
        }),
    }),
});

export const {
    useGetFeedbackQuery,
    useSubmitFeedbackMutation,
    useGetFeedbackAdminOverviewQuery,
} = feedbackApi;
