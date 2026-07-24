import { baseApi } from "./baseApi";
import type {
  MyAccess,
  RoleRecord,
  PermissionsCatalog,
  RoleMenuStateRow,
  RoleWidgetStateRow,
  CreateRoleBody,
  UpdateRoleBody,
} from "@/types/permissions";

export const permissionsApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === "development",
  endpoints: (builder) => ({
    getMyAccess: builder.query<MyAccess, void>({
      query: () => "/permissions/me",
      providesTags: ["Permission"],
    }),

    getPermissionsCatalog: builder.query<PermissionsCatalog, void>({
      query: () => "/permissions/catalog",
      providesTags: ["Permission"],
    }),

    getRoles: builder.query<RoleRecord[], void>({
      query: () => "/permissions/roles",
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "Role" as const, id: r.id })),
              { type: "Role" as const, id: "LIST" },
            ]
          : [{ type: "Role" as const, id: "LIST" }],
    }),

    createRole: builder.mutation<RoleRecord, CreateRoleBody>({
      query: (body) => ({ url: "/permissions/roles", method: "POST", body }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),

    updateRole: builder.mutation<RoleRecord, { id: string; body: UpdateRoleBody }>({
      query: ({ id, body }) => ({ url: `/permissions/roles/${id}`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Role", id },
        { type: "Role", id: "LIST" },
      ],
    }),

    getRolePermissions: builder.query<string[], string>({
      query: (roleId) => `/permissions/roles/${roleId}/permissions`,
      providesTags: (_r, _e, roleId) => [{ type: "RolePermission", id: roleId }],
    }),

    setRolePermissions: builder.mutation<string[], { roleId: string; permissionKeys: string[] }>({
      query: ({ roleId, permissionKeys }) => ({
        url: `/permissions/roles/${roleId}/permissions`,
        method: "PUT",
        body: { permissionKeys },
      }),
      invalidatesTags: (_r, _e, { roleId }) => [{ type: "RolePermission", id: roleId }, "Permission"],
    }),

    getRoleMenu: builder.query<RoleMenuStateRow[], string>({
      query: (roleId) => `/permissions/roles/${roleId}/menu`,
      providesTags: (_r, _e, roleId) => [{ type: "RoleMenu", id: roleId }],
    }),

    setRoleMenu: builder.mutation<
      RoleMenuStateRow[],
      { roleId: string; visibleMenuItemKeys: string[] }
    >({
      query: ({ roleId, visibleMenuItemKeys }) => ({
        url: `/permissions/roles/${roleId}/menu`,
        method: "PUT",
        body: { visibleMenuItemKeys },
      }),
      invalidatesTags: (_r, _e, { roleId }) => [{ type: "RoleMenu", id: roleId }, "Permission"],
    }),

    getRoleWidgets: builder.query<RoleWidgetStateRow[], string>({
      query: (roleId) => `/permissions/roles/${roleId}/widgets`,
      providesTags: (_r, _e, roleId) => [{ type: "RoleWidget", id: roleId }],
    }),

    setRoleWidgets: builder.mutation<
      RoleWidgetStateRow[],
      { roleId: string; visibleWidgetKeys: string[] }
    >({
      query: ({ roleId, visibleWidgetKeys }) => ({
        url: `/permissions/roles/${roleId}/widgets`,
        method: "PUT",
        body: { visibleWidgetKeys },
      }),
      invalidatesTags: (_r, _e, { roleId }) => [{ type: "RoleWidget", id: roleId }, "Permission"],
    }),
  }),
});

export const {
  useGetMyAccessQuery,
  useGetPermissionsCatalogQuery,
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useGetRolePermissionsQuery,
  useSetRolePermissionsMutation,
  useGetRoleMenuQuery,
  useSetRoleMenuMutation,
  useGetRoleWidgetsQuery,
  useSetRoleWidgetsMutation,
} = permissionsApi;
