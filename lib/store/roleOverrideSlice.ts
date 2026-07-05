"use client";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ApprovalActionRole } from "@/types/dashboard";

/**
 * The role the initiator portal is currently "acting as" for approval-workflow
 * actions (Support/Check/Approve/Reject/Send Back). Set from the sidebar's role
 * switcher, or from the Approval Workflow detail page itself — both read/write
 * this same slice, so they always agree. `null` means "no explicit choice yet",
 * in which case consumers fall back to the signed-in user's own role.
 */
interface RoleOverrideState {
  actingRole: ApprovalActionRole | null;
}

const initialState: RoleOverrideState = {
  actingRole: null,
};

const roleOverrideSlice = createSlice({
  name: "roleOverride",
  initialState,
  reducers: {
    setActingRole(state, action: PayloadAction<ApprovalActionRole>) {
      state.actingRole = action.payload;
    },
  },
});

export const { setActingRole } = roleOverrideSlice.actions;
export default roleOverrideSlice.reducer;
