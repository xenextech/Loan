import { baseApi } from "./baseApi";
import type { PaginatedData } from "@/types/api";
import type {
  CollegeListFilters,
  CollegePrefillData,
  MarketplaceCollege,
  MarketplaceCollegeDetail,
  MarketplaceCourseDetail,
  MarketplaceUniversity,
  RelatedCourse,
} from "@/types/college-marketplace";

const buildCollegeQuery = (filters: CollegeListFilters) => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.province) params.set("province", filters.province);
  if (filters.district) params.set("district", filters.district);
  if (filters.universityId) params.set("universityId", filters.universityId);
  if (filters.category) params.set("category", filters.category);
  if (filters.degreeLevel) params.set("degreeLevel", filters.degreeLevel);
  if (filters.duration) params.set("duration", filters.duration);
  if (filters.minFee !== undefined) params.set("minFee", String(filters.minFee));
  if (filters.maxFee !== undefined) params.set("maxFee", String(filters.maxFee));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));
  return params.toString();
};

export const marketplaceApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === "development",
  endpoints: (builder) => ({
    getUniversities: builder.query<MarketplaceUniversity[], void>({
      query: () => "/marketplace/universities",
      providesTags: ["CollegeCatalog"],
    }),

    getColleges: builder.query<PaginatedData<MarketplaceCollege>, CollegeListFilters>({
      query: (filters) => `/marketplace/colleges?${buildCollegeQuery(filters)}`,
      providesTags: ["CollegeCatalog"],
    }),

    getCollegeById: builder.query<MarketplaceCollegeDetail, string>({
      query: (id) => `/marketplace/colleges/${id}`,
      providesTags: (_r, _e, id) => [{ type: "CollegeCatalog", id }],
    }),

    getCourseById: builder.query<MarketplaceCourseDetail, string>({
      query: (id) => `/marketplace/courses/${id}`,
      providesTags: (_r, _e, id) => [{ type: "CollegeCatalog", id }],
    }),

    getRelatedCourses: builder.query<RelatedCourse[], string>({
      query: (courseId) => `/marketplace/courses/${courseId}/related`,
      providesTags: ["CollegeCatalog"],
    }),

    getPrefillData: builder.query<
      CollegePrefillData,
      { collegeId: string; courseId: string }
    >({
      query: ({ collegeId, courseId }) =>
        `/marketplace/prefill?collegeId=${collegeId}&courseId=${courseId}`,
    }),
  }),
});

export const {
  useGetUniversitiesQuery,
  useGetCollegesQuery,
  useGetCollegeByIdQuery,
  useGetCourseByIdQuery,
  useGetRelatedCoursesQuery,
  useGetPrefillDataQuery,
} = marketplaceApi;
