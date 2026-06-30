import { apiSlice } from "./ApiSlice";

const auditLogApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAuditLogs: builder.query({
            query: () => ({
                url: "audit-logs/",
                method: "GET",
            }),
            providesTags: ["AuditLog"],
        }),
        getAuditLogById: builder.query({
            query: (id) => ({
                url: `audit-logs/${id}/`,
                method: "GET",
            }),
            providesTags: ["AuditLog"],
        }),
    }),
});

export const {
    useGetAuditLogsQuery,
    useGetAuditLogByIdQuery,
} = auditLogApi;
