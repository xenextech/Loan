// ─── RBAC: Permission Engine ────────────────────────────────────────────────
// Mirrors the backend's Role/Permission/MenuItem/DashboardWidget models
// (src/modules/permissions on the backend) — see PermissionsService for the
// exact shapes these are transformed from.

export interface MenuItemEntry {
  key: string;
  label: string;
  /** Role-relative path (e.g. "/applications", "" for the dashboard root) —
   *  prepend useDashboardBasePath() before rendering as a Link href. */
  href: string;
  /** Lucide icon name — resolve via the icon lookup map, not a direct import. */
  icon: string;
  order: number;
}

export interface MenuGroup {
  groupLabel: string | null;
  items: MenuItemEntry[];
}

export interface MyAccess {
  role: string;
  permissions: string[];
  menu: MenuGroup[];
  widgets: string[];
}

export interface RoleRecord {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionRecord {
  id: string;
  key: string;
  module: string;
  action: string;
  description: string | null;
  createdAt: string;
}

export interface PermissionModuleGroup {
  module: string;
  permissions: PermissionRecord[];
}

export interface MenuItemCatalogRecord {
  id: string;
  key: string;
  label: string;
  href: string;
  icon: string;
  groupLabel: string | null;
  order: number;
  isApiGuarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetRecord {
  id: string;
  key: string;
  label: string;
  description: string | null;
  createdAt: string;
}

export interface PermissionsCatalog {
  permissionModules: PermissionModuleGroup[];
  menuItems: MenuItemCatalogRecord[];
  widgets: WidgetRecord[];
}

export interface RoleMenuStateRow {
  key: string;
  label: string;
  href: string;
  icon: string;
  groupLabel: string | null;
  order: number;
  isApiGuarded: boolean;
  visible: boolean;
}

export interface RoleWidgetStateRow {
  key: string;
  label: string;
  description: string | null;
  visible: boolean;
}

export interface CreateRoleBody {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateRoleBody {
  name?: string;
  description?: string;
}
