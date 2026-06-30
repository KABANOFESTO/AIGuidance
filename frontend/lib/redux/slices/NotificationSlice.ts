import { apiSlice } from "./ApiSlice";

const notificationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query({
            query: () => ({ url: "notifications/", method: "GET" }),
            providesTags: ["Communication"],
        }),
        getUnreadNotificationCount: builder.query({
            query: () => ({ url: "notifications/unread-count/", method: "GET" }),
            providesTags: ["Communication"],
        }),
        markNotificationRead: builder.mutation({
            query: (id) => ({ url: `notifications/${id}/read/`, method: "PATCH" }),
            invalidatesTags: ["Communication"],
        }),
        markAllNotificationsRead: builder.mutation({
            query: () => ({ url: "notifications/mark-all-read/", method: "POST" }),
            invalidatesTags: ["Communication"],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useGetUnreadNotificationCountQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
} = notificationApi;
