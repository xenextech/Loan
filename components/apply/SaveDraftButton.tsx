"use client";
import { Button } from "@/components/ui/button";
import { Loader2, Check, RotateCcw, Save } from "lucide-react";

export type SaveDraftStatus = "idle" | "saving" | "saved" | "error";

interface SaveDraftButtonProps {
  status: SaveDraftStatus;
  onClick: () => void;
}

// Explicit "persist this as a DRAFT now" action, separate from Continue —
// Continue only validates and advances the wizard locally; this is the one
// action that actually tells the backend to save the current progress.
export default function SaveDraftButton({ status, onClick }: SaveDraftButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="h-12 px-6"
      disabled={status === "saving"}
      onClick={onClick}
    >
      {status === "saving" && (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Saving…
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="w-4 h-4 mr-2" />
          Saved
        </>
      )}
      {status === "error" && (
        <>
          <RotateCcw className="w-4 h-4 mr-2" />
          Retry
        </>
      )}
      {status === "idle" && (
        <>
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </>
      )}
    </Button>
  );
}
