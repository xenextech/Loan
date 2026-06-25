import { baseApi } from "./baseApi";
import type {
  LoanApplication,
  AdminDashboardStats,
  AdminQuery,
  PaginatedData,
} from "@/types/api";
import type { Application } from "@/types/application";
import { toFrontendApplication } from "./transforms";

export const adminApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === 'development',
  endpoints: (builder) => ({
    // Dashboard stats
    getAdminDashboard: builder.query<AdminDashboardStats, void>({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard"],
    }),

    // List submitted applications with server-side search + filter + sort
    getAdminApplications: builder.query<
      // Returns paginated backend data + pre-transformed frontend array for the UI
      { paginated: PaginatedData<LoanApplication>; items: Application[] },
      AdminQuery
    >({
      query: ({ search, status, page = 1, limit = 50, sortBy, sortOrder }) => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (status) params.set("status", status);
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (sortBy) params.set("sortBy", sortBy);
        if (sortOrder) params.set("sortOrder", sortOrder);
        return `/admin/applications?${params.toString()}`;
      },
      transformResponse: (raw: PaginatedData<LoanApplication>) => ({
        paginated: raw,
        items: (raw.data ?? []).map(toFrontendApplication),
      }),
      providesTags: ["AdminApp"],
    }),

    // Full application detail (includes documents)
    getAdminApplicationDetail: builder.query<LoanApplication, string>({
      query: (id) => `/admin/applications/${id}`,
      providesTags: (_r, _e, id) => [{ type: "AdminApp", id }],
    }),

    // Export CSV — returns a Blob URL trigger (handled in component)
    exportCsv: builder.query<string, AdminQuery>({
      query: ({ search, status, sortBy, sortOrder }) => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (status) params.set("status", status);
        if (sortBy) params.set("sortBy", sortBy);
        if (sortOrder) params.set("sortOrder", sortOrder);
        return {
          url: `/admin/applications/export/csv?${params.toString()}`,
          responseHandler: async (res) => {
            const blob = await res.blob();
            return URL.createObjectURL(blob);
          },
          cache: "no-cache",
        };
      },
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetAdminApplicationsQuery,
  useGetAdminApplicationDetailQuery,
  useLazyExportCsvQuery,
} = adminApi;
