import { baseApi } from "./baseApi";
import type { PaginatedData } from "@/types/api";
import type {
  AdminCourseListItem,
  CollegeListFilters,
  CollegePrefillData,
  CreateCollegeInput,
  CreateCourseInput,
  CreateUniversityInput,
  MarketplaceCollege,
  MarketplaceCollegeDetail,
  MarketplaceCourseDetail,
  MarketplaceUniversity,
  QueryCoursesAdminFilters,
  RelatedCourse,
  UpdateCollegeInput,
  UpdateCourseInput,
  UpdateUniversityInput,
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
  if (filters.includeInactive) params.set("includeInactive", "true");
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));
  return params.toString();
};

const buildCoursesAdminQuery = (filters: QueryCoursesAdminFilters) => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.collegeId) params.set("collegeId", filters.collegeId);
  if (filters.category) params.set("category", filters.category);
  if (filters.degreeLevel) params.set("degreeLevel", filters.degreeLevel);
  if (filters.includeInactive) params.set("includeInactive", "true");
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));
  return params.toString();
};

export const marketplaceApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === "development",
  endpoints: (builder) => ({
    getUniversities: builder.query<MarketplaceUniversity[], { includeInactive?: boolean } | void>({
      query: (args) =>
        args?.includeInactive
          ? "/marketplace/universities?includeInactive=true"
          : "/marketplace/universities",
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

    // ─── Admin: Universities ────────────────────────────────────────────────

    createUniversity: builder.mutation<MarketplaceUniversity, CreateUniversityInput>({
      query: (body) => ({ url: "/marketplace/universities", method: "POST", body }),
      invalidatesTags: ["CollegeCatalog"],
    }),

    updateUniversity: builder.mutation<
      MarketplaceUniversity,
      { id: string; body: UpdateUniversityInput }
    >({
      query: ({ id, body }) => ({ url: `/marketplace/universities/${id}`, method: "PATCH", body }),
      invalidatesTags: ["CollegeCatalog"],
    }),

    deleteUniversity: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/marketplace/universities/${id}`, method: "DELETE" }),
      invalidatesTags: ["CollegeCatalog"],
    }),

    // ─── Admin: Colleges ────────────────────────────────────────────────────

    createCollege: builder.mutation<MarketplaceCollegeDetail, CreateCollegeInput>({
      query: (body) => ({ url: "/marketplace/colleges", method: "POST", body }),
      invalidatesTags: ["CollegeCatalog"],
    }),

    updateCollege: builder.mutation<
      MarketplaceCollegeDetail,
      { id: string; body: UpdateCollegeInput }
    >({
      query: ({ id, body }) => ({ url: `/marketplace/colleges/${id}`, method: "PATCH", body }),
      invalidatesTags: ["CollegeCatalog"],
    }),

    deleteCollege: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/marketplace/colleges/${id}`, method: "DELETE" }),
      invalidatesTags: ["CollegeCatalog"],
    }),

    // ─── Admin: Courses ─────────────────────────────────────────────────────

    getCoursesAdmin: builder.query<PaginatedData<AdminCourseListItem>, QueryCoursesAdminFilters>({
      query: (filters) => `/marketplace/courses?${buildCoursesAdminQuery(filters)}`,
      providesTags: ["CollegeCatalog"],
    }),

    createCourse: builder.mutation<MarketplaceCourseDetail, CreateCourseInput>({
      query: (body) => ({ url: "/marketplace/courses", method: "POST", body }),
      invalidatesTags: ["CollegeCatalog"],
    }),

    updateCourse: builder.mutation<
      MarketplaceCourseDetail,
      { id: string; body: UpdateCourseInput }
    >({
      query: ({ id, body }) => ({ url: `/marketplace/courses/${id}`, method: "PATCH", body }),
      invalidatesTags: ["CollegeCatalog"],
    }),

    deleteCourse: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/marketplace/courses/${id}`, method: "DELETE" }),
      invalidatesTags: ["CollegeCatalog"],
    }),

    // Not tied to an existing college/course id — returns a public URL the
    // caller stores into logoUrl/bannerUrl on a subsequent create/update call,
    // so it also works while filling out a brand-new "create" form.
    uploadMarketplaceImage: builder.mutation<{ url: string }, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/marketplace/uploads/image",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
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
  useCreateUniversityMutation,
  useUpdateUniversityMutation,
  useDeleteUniversityMutation,
  useCreateCollegeMutation,
  useUpdateCollegeMutation,
  useDeleteCollegeMutation,
  useGetCoursesAdminQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useUploadMarketplaceImageMutation,
} = marketplaceApi;
