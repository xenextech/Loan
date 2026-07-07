import type { InitiatorApplicationDetail } from "@/components/initiator/types/initiator";
import type { ApplicationStage } from "@/types/dashboard";

/** Row shown in the Checker's queue — reuses the same shape as the Approval Workflow
 *  queue, since both list applications from the shared `/dashboard/applications` endpoint. */
export type { ApprovalListItem as CheckerApplicationListItem } from "@/components/initiator/approval/types";

/** Everything the Checker's review screen needs: the full read-only initiator record
 *  (student/parent/college/documents/assessment) plus the real workflow-stage fields
 *  from the dashboard record, so the page can show the current stage and any prior
 *  rejection/send-back reason without a third query. */
export interface CheckerApplicationDetail extends InitiatorApplicationDetail {
  stage: ApplicationStage | null;
  branch?: string;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
  sentBackReason?: string | null;
  sentBackAt?: string | null;
  sentBackToStage?: ApplicationStage | null;
}
