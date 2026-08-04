import { RouteGuard } from "@/components/permissions/RouteGuard";
import { CollegeMarketplaceAdmin } from "@/components/admin/marketplace/CollegeMarketplaceAdmin";

export const metadata = {
  title: "College Marketplace — Unnati Admin Portal",
  description: "Manage colleges, courses, and universities shown in the student marketplace.",
};

export default function AdminCollegeMarketplacePage() {
  return (
    <RouteGuard menuKey="college-marketplace">
      <CollegeMarketplaceAdmin />
    </RouteGuard>
  );
}
