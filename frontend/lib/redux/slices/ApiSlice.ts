import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearStoredAuthTokens } from "@/lib/auth/session";
import { toast } from "sonner";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/`,
    prepareHeaders: (headers) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("access");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
        }
        return headers;
    },
});

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: async (args, api, extraOptions) => {
        const result = await rawBaseQuery(args, api, extraOptions);
        if ("error" in result && result.error && typeof result.error === "object" && "status" in result.error) {
            const errorData = (result.error as { data?: any }).data;
            const errorStatus = (result.error as { status?: string | number }).status;
            const message =
                errorData?.detail ||
                errorData?.error ||
                errorData?.message ||
                (typeof errorData === "string" ? errorData : null) ||
                "Request failed.";

            if (errorStatus === 401) {
                clearStoredAuthTokens();
                toast.error("Your session expired. Please sign in again.");
            } else if (typeof errorStatus === "number" && errorStatus >= 400) {
                toast.error(message);
            }
        }
        return result;
    },
    tagTypes: [
        "Auth",
        "AuditLog",
        "User",
        "StudentProfile",
        "BehaviourLog",
        "Course",
        "CourseEnrollment",
        "AcademicRecord",
        "AttendanceRecord",
        "CourseMaterial",
        "CourseRecommendation",
        "CareerRecommendation",
        "PerformanceAnalysis",
        "ChatConversation",
        "KnowledgeBase",
        "Feedback",
        "Analytics",
        "Communication",
        "AdminAnalytics",
        "AdminReport",
    ],
    endpoints: () => ({}),
});
