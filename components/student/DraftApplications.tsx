"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppDispatch } from "@/lib/hooks";
import { resetApplication, setApplicationId } from "@/lib/store/applicationSlice";
import { useGetMyApplicationsQuery, useDeleteDraftMutation } from "@/lib/api/applicationApi";
import type { LoanApplication } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApplicationCard, CardSkeleton } from "./ApplicationCard";
import { Plus, FileEdit } from "lucide-react";

export function DraftApplications() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: applications = [], isLoading } = useGetMyApplicationsQuery();
  const [deleteDraft, { isLoading: deleting }] = useDeleteDraftMutation();
  const [toDelete, setToDelete] = useState<LoanApplication | null>(null);

  const drafts = applications.filter((a) => a.status === "DRAFT");

  const handleContinue = (app: LoanApplication) => {
    dispatch(resetApplication());
    dispatch(setApplicationId({ id: app.id, number: app.applicationNumber }));
    router.push("/apply");
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteDraft(toDelete.id).unwrap();
      toast.success("Draft deleted.");
      setToDelete(null);
    } catch {
      toast.error("Failed to delete draft.");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Drafts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading…" : `${drafts.length} application${drafts.length !== 1 ? "s" : ""} in progress — pick up where you left off.`}
          </p>
        </div>
        <Link href="/apply">
          <Button size="sm" className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            New Application
          </Button>
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <FileEdit className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">No drafts in progress</h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Start your education loan application. It takes about 10 minutes to complete.
          </p>
          <Link href="/apply">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Start Application
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drafts.map((app) => (
            <ApplicationCard key={app.id} app={app} onContinue={handleContinue} onDelete={setToDelete} />
          ))}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.applicationNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This draft and any documents you&apos;ve uploaded for it will be permanently deleted.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
