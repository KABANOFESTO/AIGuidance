import { apiSlice } from "./ApiSlice";

const recommendationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCourseRecommendations: builder.query({
            query: (studentId?: string) => ({
                url: studentId ? `recommendations/courses/?student_id=${encodeURIComponent(studentId)}` : "recommendations/courses/",
                method: "GET",
            }),
            providesTags: ["CourseRecommendation"],
        }),
        generateCourseRecommendations: builder.mutation({
            query: (studentId?: string) => ({
                url: "recommendations/courses/generate/",
                method: "POST",
                body: studentId ? { student_id: studentId } : {},
            }),
            invalidatesTags: ["CourseRecommendation"],
        }),
        getCareerRecommendations: builder.query({
            query: (studentId?: string) => ({
                url: studentId ? `recommendations/careers/?student_id=${encodeURIComponent(studentId)}` : "recommendations/careers/",
                method: "GET",
            }),
            providesTags: ["CareerRecommendation"],
        }),
        generateCareerRecommendations: builder.mutation({
            query: (studentId?: string) => ({
                url: "recommendations/careers/generate/",
                method: "POST",
                body: studentId ? { student_id: studentId } : {},
            }),
            invalidatesTags: ["CareerRecommendation"],
        }),
        getPerformanceAnalyses: builder.query({
            query: (studentId?: string) => ({
                url: studentId ? `recommendations/performance/?student_id=${encodeURIComponent(studentId)}` : "recommendations/performance/",
                method: "GET",
            }),
            providesTags: ["PerformanceAnalysis"],
        }),
        generatePerformanceAnalysis: builder.mutation({
            query: (studentId?: string) => ({
                url: "recommendations/performance/generate/",
                method: "POST",
                body: studentId ? { student_id: studentId } : {},
            }),
            invalidatesTags: ["PerformanceAnalysis"],
        }),
        regenerateRecommendations: builder.mutation({
            query: (studentId?: string) => ({
                url: "recommendations/regenerate/",
                method: "POST",
                body: studentId ? { student_id: studentId } : {},
            }),
            invalidatesTags: ["CourseRecommendation", "CareerRecommendation", "PerformanceAnalysis"],
        }),
        adminRecomputeStudentAI: builder.mutation({
            query: (studentId: string) => ({
                url: "recommendations/admin/recompute/",
                method: "POST",
                body: { student_id: studentId },
            }),
            invalidatesTags: ["CourseRecommendation", "CareerRecommendation", "PerformanceAnalysis", "StudentProfile"],
        }),
        getRecommendationModelStatus: builder.query({
            query: () => ({ url: "recommendations/admin/status/", method: "GET" }),
        }),
        getRecommendationModelHistory: builder.query({
            query: (limit: number = 20) => ({ url: `recommendations/admin/history/?limit=${limit}`, method: "GET" }),
        }),
        adminTrainRecommendationModels: builder.mutation({
            query: (force: boolean = false) => ({
                url: "recommendations/admin/train/",
                method: "POST",
                body: { force },
            }),
        }),
    }),
});

export const {
    useGetCourseRecommendationsQuery,
    useGenerateCourseRecommendationsMutation,
    useGetCareerRecommendationsQuery,
    useGenerateCareerRecommendationsMutation,
    useGetPerformanceAnalysesQuery,
    useGeneratePerformanceAnalysisMutation,
    useRegenerateRecommendationsMutation,
    useAdminRecomputeStudentAIMutation,
    useGetRecommendationModelStatusQuery,
    useGetRecommendationModelHistoryQuery,
    useAdminTrainRecommendationModelsMutation,
} = recommendationApi;
