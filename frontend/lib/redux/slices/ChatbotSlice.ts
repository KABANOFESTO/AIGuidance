import { apiSlice } from "./ApiSlice";

const chatbotApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        sendChatMessage: builder.mutation({
            query: (data) => ({
                url: "chatbot/message/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["ChatConversation"],
        }),
        getChatHistory: builder.query({
            query: (sessionId?: string) => ({
                url: sessionId ? `chatbot/history/?session_id=${encodeURIComponent(sessionId)}` : "chatbot/history/",
                method: "GET",
            }),
            providesTags: ["ChatConversation"],
        }),
        getKnowledgeBase: builder.query({
            query: () => ({ url: "chatbot/knowledge-base/", method: "GET" }),
            providesTags: ["KnowledgeBase"],
        }),
        createKnowledgeBaseEntry: builder.mutation({
            query: (data) => ({ url: "chatbot/knowledge-base/", method: "POST", body: data }),
            invalidatesTags: ["KnowledgeBase"],
        }),
        updateKnowledgeBaseEntry: builder.mutation({
            query: ({ id, data }) => ({ url: `chatbot/knowledge-base/${id}/`, method: "PUT", body: data }),
            invalidatesTags: ["KnowledgeBase"],
        }),
        deleteKnowledgeBaseEntry: builder.mutation({
            query: (id) => ({ url: `chatbot/knowledge-base/${id}/`, method: "DELETE" }),
            invalidatesTags: ["KnowledgeBase"],
        }),
        getChatbotHealth: builder.query({
            query: () => ({ url: "chatbot/health/", method: "GET" }),
        }),
    }),
});

export const {
    useSendChatMessageMutation,
    useGetChatHistoryQuery,
    useGetKnowledgeBaseQuery,
    useCreateKnowledgeBaseEntryMutation,
    useUpdateKnowledgeBaseEntryMutation,
    useDeleteKnowledgeBaseEntryMutation,
    useGetChatbotHealthQuery,
} = chatbotApi;
