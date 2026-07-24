import { RouteGuard } from "@/components/permissions/RouteGuard";
import { PermissionManagement } from "@/components/admin/permissions/PermissionManagement";

export const metadata = {
  title: "Role & Permission Management — Unnati Admin Portal",
  description: "Configure sidebar access, permissions, and dashboard widgets per role.",
};

export default function AdminPermissionsPage() {
  return (
    <RouteGuard menuKey="permissions">
      <PermissionManagement />
    </RouteGuard>
  );
}
