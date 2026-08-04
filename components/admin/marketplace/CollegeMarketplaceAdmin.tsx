"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CollegesTab } from "./CollegesTab";
import { CoursesTab } from "./CoursesTab";
import { UniversitiesTab } from "./UniversitiesTab";

type Tab = "colleges" | "courses" | "universities";
const VALID_TABS: Tab[] = ["colleges", "courses", "universities"];

export function CollegeMarketplaceAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: Tab = VALID_TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "colleges";

  const setTab = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">College Marketplace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage colleges, courses, and universities shown in the student marketplace — changes
          take effect immediately, no deploy or reseed required.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="colleges">Colleges</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="universities">Universities</TabsTrigger>
          </TabsList>
          <TabsContent value="colleges" className="mt-4">
            <CollegesTab />
          </TabsContent>
          <TabsContent value="courses" className="mt-4">
            <CoursesTab />
          </TabsContent>
          <TabsContent value="universities" className="mt-4">
            <UniversitiesTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
