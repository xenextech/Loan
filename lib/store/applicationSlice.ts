"use client";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ApplicationFormData } from "@/types/application";

interface ApplicationState {
  // Active draft tracking
  applicationId: string | null;
  applicationNumber: string | null;
  // Wizard state
  currentStep: number;
  formData: ApplicationFormData;
  autoSaveStatus: "idle" | "saving" | "saved" | "error";
  lastSavedAt: string | null;
  hasUnsavedChanges: boolean;
  // Post-submission
  submittedApplicationNumber: string | null;
}

const initialState: ApplicationState = {
  applicationId: null,
  applicationNumber: null,
  currentStep: 1,
  formData: {},
  autoSaveStatus: "idle",
  lastSavedAt: null,
  hasUnsavedChanges: false,
  submittedApplicationNumber: null,
};

const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    setApplicationId(state, action: PayloadAction<{ id: string; number: string }>) {
      state.applicationId = action.payload.id;
      state.applicationNumber = action.payload.number;
    },

    // Restores a previously-saved draft's form fields into the wizard —
    // used when resuming a draft (from the Drafts list, or after a page
    // refresh) where Redux has an applicationId but no in-memory formData
    // for it yet. Full replace (not merge) is safe here: this only ever
    // runs before the step components have mounted with real user input
    // (see ApplicationWizard's hydration gate).
    hydrateApplication(
      state,
      action: PayloadAction<{ id: string; number: string; formData: ApplicationFormData }>,
    ) {
      state.applicationId = action.payload.id;
      state.applicationNumber = action.payload.number;
      state.formData = action.payload.formData;
    },

    setStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },

    updateStepData(
      state,
      action: PayloadAction<{
        step: keyof ApplicationFormData;
        data: ApplicationFormData[keyof ApplicationFormData];
      }>
    ) {
      const { step, data } = action.payload;
      state.formData[step] = {
        ...state.formData[step],
        ...data,
      } as ApplicationFormData[typeof step];
      state.hasUnsavedChanges = true;
    },

    setAutoSaveStatus(state, action: PayloadAction<ApplicationState["autoSaveStatus"]>) {
      state.autoSaveStatus = action.payload;
      if (action.payload === "saved") {
        state.lastSavedAt = new Date().toISOString();
        state.hasUnsavedChanges = false;
      }
    },

    setSubmitted(
      state,
      action: PayloadAction<{ applicationNumber: string }>
    ) {
      state.submittedApplicationNumber = action.payload.applicationNumber;
    },

    resetApplication(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setApplicationId,
  hydrateApplication,
  setStep,
  updateStepData,
  setAutoSaveStatus,
  setSubmitted,
  resetApplication,
} = applicationSlice.actions;

export default applicationSlice.reducer;
