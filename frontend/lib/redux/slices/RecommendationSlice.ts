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
    }),
});

export const {
    useGetCourseRecommendationsQuery,
    useGenerateCourseRecommendationsMutation,
    useGetCareerRecommendationsQuery,
    useGenerateCareerRecommendationsMutation,
    useGetPerformanceAnalysesQuery,
    useGeneratePerformanceAnalysisMutation,
} = recommendationApi;
