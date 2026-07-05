import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActingRole } from "@/lib/store/roleOverrideSlice";
import type { ApprovalActionRole } from "@/types/dashboard";

export const APPROVAL_ROLES: ApprovalActionRole[] = ["SUPPORTER", "CHECKER", "CREDIT_MANAGER", "APPROVER"];

export const ROLE_OPTIONS: { value: ApprovalActionRole; label: string }[] = [
  { value: "SUPPORTER", label: "Supporter" },
  { value: "CHECKER", label: "Checker" },
  { value: "CREDIT_MANAGER", label: "Credit Manager" },
  { value: "APPROVER", label: "Approver" },
];

/**
 * The role the initiator portal is currently "acting as" for approval-workflow
 * actions — shared globally (sidebar role switcher + the Approval Workflow
 * detail page both read/write the same Redux slice, so they always agree).
 * Defaults to the signed-in user's own role when it's one of the four approval
 * roles, otherwise Supporter, until something explicitly sets an override.
 */
export function useActingRole(): [ApprovalActionRole, (role: ApprovalActionRole) => void] {
  const dispatch = useAppDispatch();
  const override = useAppSelector((s) => s.roleOverride.actingRole);
  const authRole = useAppSelector((s) => s.auth.user?.role);

  const role =
    override ?? (authRole && APPROVAL_ROLES.includes(authRole as ApprovalActionRole) ? (authRole as ApprovalActionRole) : "SUPPORTER");

  return [role, (next: ApprovalActionRole) => dispatch(setActingRole(next))];
}
