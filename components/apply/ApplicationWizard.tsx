"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setStep,
  setApplicationId,
  hydrateApplication,
  updateStepData,
  setSubmitted,
  resetApplication,
} from "@/lib/store/applicationSlice";
import {
  useCreateDraftMutation,
  useGetApplicationQuery,
  useSaveStep1Mutation,
  useSaveStep2Mutation,
  useSaveStep3Mutation,
  useSaveDraftMutation,
  useSubmitApplicationMutation,
} from "@/lib/api/applicationApi";
import { toApplicationFormData } from "@/lib/api/transforms";
import { useGetPrefillDataQuery } from "@/lib/api/marketplaceApi";
import type { DegreeLevel } from "@/types/college-marketplace";
import {
  readActiveApplicationId,
  writeActiveApplicationId,
  readStoredStep,
  writeStoredStep,
  readStoredFormFragment,
  writeStoredFormFragment,
  clearWizardSessionState,
} from "@/lib/wizardSessionState";
import type { SaveDraftStatus } from "./SaveDraftButton";
import WizardProgress from "./WizardProgress";
import Step1AboutYou from "./steps/Step1AboutYou";
import Step2Identity from "./steps/Step2Identity";
import Step3FamilyEducation from "./steps/Step3FamilyEducation";
import Step4ReviewSubmit, {
  type Step4Declaration,
} from "./steps/Step4ReviewSubmit";
import SubmissionSuccess from "./SubmissionSuccess";
import type {
  Step1FormData,
  Step2FormData,
  Step3FormData,
} from "@/lib/validations/schemas";
import Link from "next/link";
import Image from "next/image";

const slideVariants = {
  enter: { opacity: 0, x: 48 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -48 },
};

// Marketplace courses classify by DegreeLevel; the apply form classifies by
// studyType. There's no "short course" DegreeLevel, so CERTIFICATE maps to
// certification and every degree level (BACHELOR/MASTER/PHD) maps to "program".
function degreeLevelToStudyType(
  level: DegreeLevel,
): Step1FormData["studyType"] {
  switch (level) {
    case "CERTIFICATE":
      return "certification";
    case "DIPLOMA":
      return "diploma";
    case "BACHELOR":
    case "MASTER":
    case "PHD":
    default:
      return "program";
  }
}

export default function ApplicationWizard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { applicationId, currentStep, formData, submittedApplicationNumber } =
    useAppSelector((s) => s.application);

  // Derived, not separately tracked: you can't be on step N without having
  // gone through 1..N-1 via Continue, so this is always in lockstep with
  // currentStep — including right after hydration restores it on refresh,
  // with no extra state to keep in sync.
  const completedSteps = Array.from(
    { length: Math.max(0, currentStep - 1) },
    (_, i) => i + 1,
  );
  const [direction, setDirection] = useState<1 | -1>(1);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [saveDraftStatus, setSaveDraftStatus] = useState<SaveDraftStatus>("idle");
  const lastScrollY = useRef(0);

  // True until the init effect below has worked out which application this
  // page is for. Rendering is gated on it so the wizard never paints Step 1
  // for a frame and then jumps to the restored step.
  const [isInitialising, setIsInitialising] = useState(true);

  const [createDraft, { isLoading: isCreating }] = useCreateDraftMutation();
  const [saveStep1, { isLoading: isSaving1 }] = useSaveStep1Mutation();
  const [saveStep2, { isLoading: isSaving2 }] = useSaveStep2Mutation();
  const [saveStep3, { isLoading: isSaving3 }] = useSaveStep3Mutation();
  const [saveDraft] = useSaveDraftMutation();
  const [submitApplication, { isLoading: isSubmitting }] =
    useSubmitApplicationMutation();

  // ─── Which application is this page for? ─────────────────────────────────
  // Resolved once, on mount, from (in order of precedence):
  //   ?applicationId=…  resuming a specific saved draft from /dashboard/drafts
  //   ?new=1            "New Application" — always starts a fresh one
  //   sessionStorage    a refresh of the application this tab was already on
  //   nothing           a plain /apply visit with no session yet
  //
  // Only the last two branches can create an application, and only when this
  // tab genuinely has none — a refresh always finds the id in sessionStorage
  // and reuses it, so refreshing never creates (or duplicates) anything. The
  // row it creates is a *scratch* application: it exists so document uploads
  // and step saves have something to attach to, but it stays invisible in the
  // Drafts list until the student clicks Save as Draft (backend
  // `draftSavedAt`).
  const searchParams = useSearchParams();
  const collegeIdParam = searchParams.get("collegeId");
  const courseIdParam = searchParams.get("courseId");
  const requestedApplicationId = searchParams.get("applicationId");
  const wantsNewApplication = searchParams.get("new") === "1";
  const marketplaceSelectionKey =
    collegeIdParam && courseIdParam
      ? `${collegeIdParam}:${courseIdParam}`
      : null;

  // Ref, not state: this must be checked and set in the same synchronous pass
  // so React's development double-invoked effects (and any remount) can't
  // fire a second POST /applications and leave an orphan behind.
  const didInitRef = useRef(false);
  // Which college/course selection the application we're on was opened for.
  // Seeded during init so the marketplace effect below only reacts to the
  // student picking a *different* course later — never to a refresh, whose
  // selection params are the ones this application already belongs to.
  const handledSelectionRef = useRef<string | null>(null);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    handledSelectionRef.current = marketplaceSelectionKey;

    // Adopt an application this tab already knows about, restoring the page
    // it was left on before anything renders.
    const adopt = (id: string) => {
      writeActiveApplicationId(id);
      dispatch(setApplicationId({ id, number: "" }));
      const storedStep = readStoredStep(id);
      if (storedStep) dispatch(setStep(storedStep));
      setIsInitialising(false);
    };

    // Put the application in the URL as soon as it exists, and drop the
    // one-shot ?new=1 with it: a refresh then resumes this exact application
    // instead of being read as another "start a new one" (and it no longer
    // depends on sessionStorage surviving).
    const bindUrlToApplication = (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("new");
      params.set("applicationId", id);
      router.replace(`/apply?${params.toString()}`, { scroll: false });
    };

    const startFresh = (previousId: string | null) => {
      // Anything the previous application left in this tab belongs to that
      // application only — clearing it here is what stops one application's
      // typing or step position from showing up under another.
      if (previousId) clearWizardSessionState(previousId);
      dispatch(resetApplication());
      createDraft()
        .unwrap()
        .then((app) => {
          writeActiveApplicationId(app.id);
          bindUrlToApplication(app.id);
          dispatch(
            setApplicationId({ id: app.id, number: app.applicationNumber }),
          );
        })
        .catch(() => {
          toast.error(
            "Failed to start application. Please refresh and try again.",
          );
        })
        .finally(() => setIsInitialising(false));
    };

    const storedId = readActiveApplicationId();

    if (requestedApplicationId) {
      // Resuming a specific draft — never creates anything, so "Continue
      // Application" always opens that exact application.
      if (requestedApplicationId !== storedId) dispatch(resetApplication());
      adopt(requestedApplicationId);
      return;
    }

    if (wantsNewApplication) {
      startFresh(storedId);
      return;
    }

    if (storedId) {
      adopt(storedId);
      return;
    }

    startFresh(null);
    // Intentionally mount-only: the branch above is a one-time decision about
    // which application this page is for, guarded by didInitRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── College Marketplace prefill ──────────────────────────────────────────
  // Only present when arriving via /apply?collegeId=&courseId= — a direct
  // /apply visit has neither param, so this whole block is a no-op and the
  // form behaves exactly as it always has.
  //
  // Applying to a *different* college/course than the one the current
  // application already holds has to start a new application: otherwise the
  // tuition fee, course duration and study type stay frozen at whichever
  // college was applied to first. The previous application is simply left
  // behind — if it was only a scratch one the backend discards it when the
  // new one is created, and if it was an explicitly saved draft it stays
  // safely in the student's Drafts list.
  useEffect(() => {
    if (!marketplaceSelectionKey || isInitialising) return;
    if (handledSelectionRef.current === marketplaceSelectionKey) return;
    handledSelectionRef.current = marketplaceSelectionKey;

    const currentSelectionKey =
      formData.step1?.collegeId && formData.step1?.courseId
        ? `${formData.step1.collegeId}:${formData.step1.courseId}`
        : null;
    if (applicationId && currentSelectionKey === marketplaceSelectionKey)
      return;

    // No extra loading flag needed here: createDraft's own isLoading covers
    // the swap, and the render gate below waits on it.
    if (applicationId) clearWizardSessionState(applicationId);
    dispatch(resetApplication());
    createDraft()
      .unwrap()
      .then((app) => {
        writeActiveApplicationId(app.id);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("new");
        params.set("applicationId", app.id);
        router.replace(`/apply?${params.toString()}`, { scroll: false });
        dispatch(
          setApplicationId({ id: app.id, number: app.applicationNumber }),
        );
      })
      .catch(() => {
        toast.error(
          "Failed to start application. Please refresh and try again.",
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketplaceSelectionKey, isInitialising]);

  const { data: prefillData, isError: prefillError } = useGetPrefillDataQuery(
    { collegeId: collegeIdParam ?? "", courseId: courseIdParam ?? "" },
    { skip: !collegeIdParam || !courseIdParam },
  );

  useEffect(() => {
    if (!prefillData) return;
    const isAlreadyPrefilled =
      formData.step1?.collegeId === prefillData.collegeId &&
      formData.step1?.courseId === prefillData.courseId;
    if (isAlreadyPrefilled) return;
    dispatch(
      updateStepData({
        step: "step1",
        data: {
          collegeId: prefillData.collegeId,
          collegeName: prefillData.collegeName,
          courseId: prefillData.courseId,
          courseName: prefillData.courseName,
          boardUniversity: prefillData.universityName ?? "",
          courseDuration: prefillData.duration,
          tuitionFee: prefillData.tuitionFee,
          studyType: degreeLevelToStudyType(prefillData.degreeLevel),
        },
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillData, formData.step1?.collegeId, formData.step1?.courseId]);

  useEffect(() => {
    if (prefillError) {
      toast.error(
        "Selected college/course couldn't be loaded — please fill in the details manually.",
      );
    }
  }, [prefillError]);

  // ─── Resume — restore previously-saved form values ───────────────────────
  // Redux's `application` slice has no persistence, so `formData` is always
  // empty right after: a page refresh, or arriving from the Drafts list
  // (which only passes the application id in the URL, not the fields).
  // Whenever we have an id but no local form data for it yet, fetch that
  // application's own record and hydrate the wizard from it — skipped for
  // the marketplace-selection flow above, which populates step1 itself from
  // the catalog and would otherwise race with this effect.
  //
  // Everything restored here is read per applicationId — the record itself,
  // its documents (fetched by id inside the step components) and the
  // sessionStorage fragment below — so two applications can be in progress
  // without either one ever showing the other's data or documents.
  //
  // isResumingDraft (not isFetching) is deliberately what gates rendering
  // the step components below: isFetching can read false for one render
  // right after `skip` flips off (the request hasn't been dispatched into
  // RTK Query's store yet), which previously let Step1AboutYou mount one
  // render early with empty defaultValues — React Hook Form captures
  // defaultValues only at that initial mount, so the later hydrate dispatch
  // was silently ignored. hasLocalFormData is derived straight from the
  // same `formData` the steps consume, so it flips in lockstep with it —
  // no separate flag, no gap. It intentionally does NOT depend on
  // hydrationFailed (that only affects the render gate below), so a failed
  // fetch can't create a skip/refetch flip-flop.
  const hasLocalFormData = Boolean(
    formData.step1 || formData.step2 || formData.step3,
  );
  const isResumingDraft =
    Boolean(applicationId) && !hasLocalFormData && !marketplaceSelectionKey;

  const { data: existingApplication, isError: hydrationFailed } =
    useGetApplicationQuery(applicationId ?? "", { skip: !isResumingDraft });

  useEffect(() => {
    if (!applicationId || !existingApplication) return;
    const backendFormData = toApplicationFormData(existingApplication);

    // sessionStorage (this tab's most recent in-progress typing) wins over
    // the backend (only as fresh as the last Continue or Save Draft click) —
    // it's strictly newer when both exist, which is what lets a refresh in
    // the middle of a half-filled step come back with that typing intact.
    // Text fields only; uploaded documents are never kept in browser
    // storage and are always re-read from the backend for this application.
    const sessionFragment = readStoredFormFragment(applicationId);
    const mergedFormData = {
      ...backendFormData,
      step1: { ...backendFormData.step1, ...sessionFragment.step1 },
      step2: { ...backendFormData.step2, ...sessionFragment.step2 },
      step3: { ...backendFormData.step3, ...sessionFragment.step3 },
    };

    // Clamp defensively — a step number outside the wizard's 4 pages should
    // never reach the UI regardless of what's stored.
    const restoredStep = Math.min(
      4,
      Math.max(
        1,
        readStoredStep(applicationId) ?? existingApplication.currentStep ?? 1,
      ),
    );
    dispatch(
      hydrateApplication({
        id: applicationId,
        number: existingApplication.applicationNumber,
        formData: mergedFormData,
        currentStep: restoredStep,
      }),
    );
  }, [applicationId, existingApplication, dispatch]);

  useEffect(() => {
    if (hydrationFailed) {
      toast.error(
        "Couldn't load your saved progress — starting this session fresh.",
      );
    }
  }, [hydrationFailed]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (y < 10) {
        setHidden(false);
      } else if (y > lastScrollY.current + 4 && y > 80) {
        setHidden(true);
      } else if (y < lastScrollY.current - 4) {
        setHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── Navigation helpers ───────────────────────────────────────────────────
  // Every step change — forward, backward, or a direct progress-bar/review
  // "Edit" jump — goes through here. This intentionally does NOT touch the
  // backend: refreshing/navigating must never itself perform a save (that's
  // what turns "browsing the wizard" into an implicit "save as DRAFT",
  // which is exactly what this must avoid) — only Save Draft persists the
  // step position to the backend. sessionStorage is what survives a
  // same-tab refresh in the meantime.
  const changeStep = useCallback(
    (step: number) => {
      dispatch(setStep(step));
      if (applicationId) writeStoredStep(applicationId, step);
    },
    [applicationId, dispatch],
  );

  const goNext = useCallback(
    (step: number) => {
      setDirection(1);
      changeStep(step + 1);
    },
    [changeStep],
  );

  const goPrev = (step: number) => {
    setDirection(-1);
    changeStep(step - 1);
  };

  // ─── Step handlers — save fires ONLY on Continue click ───────────────────

  const handleStep1 = async (data: Step1FormData) => {
    dispatch(updateStepData({ step: "step1", data }));
    if (applicationId) {
      try {
        await saveStep1({ id: applicationId, data }).unwrap();
      } catch {
        toast.error("Failed to save. Your data is kept locally.");
      }
    }
    goNext(1);
  };

  const handleStep2 = async (data: Step2FormData) => {
    dispatch(updateStepData({ step: "step2", data }));
    if (applicationId) {
      try {
        await saveStep2({ id: applicationId, data }).unwrap();
      } catch {
        toast.error("Failed to save. Your data is kept locally.");
      }
    }
    goNext(2);
  };

  const handleStep3 = async (data: Step3FormData) => {
    dispatch(updateStepData({ step: "step3", data }));
    if (applicationId) {
      try {
        await saveStep3({ id: applicationId, data }).unwrap();
      } catch {
        toast.error("Failed to save. Your data is kept locally.");
      }
    }
    goNext(3);
  };

  // ─── Save Draft — the ONLY action that turns this application into a draft
  // the student can leave and come back to from /dashboard/drafts. Saves the
  // current step's data, then marks the application as explicitly saved
  // (backend `draftSavedAt`); nothing else — no submission, no approval, no
  // credit assessment. Works from any step and bypasses that step's zod
  // validation on purpose (the backend's step DTOs accept partial data —
  // @IsOptional() on every field — precisely so an in-progress, not-yet-valid
  // step can still be saved deliberately). data is omitted for step 4, which
  // has no form of its own to save — only the position.
  const handleSaveDraft = useCallback(
    async (
      step: number,
      data?: Step1FormData | Step2FormData | Step3FormData,
    ) => {
      if (!applicationId) return;
      setSaveDraftStatus("saving");
      try {
        if (step === 1 && data) {
          await saveStep1({ id: applicationId, data: data as Step1FormData }).unwrap();
        } else if (step === 2 && data) {
          await saveStep2({ id: applicationId, data: data as Step2FormData }).unwrap();
        } else if (step === 3 && data) {
          await saveStep3({ id: applicationId, data: data as Step3FormData }).unwrap();
        }
        await saveDraft({ id: applicationId, currentStep: step }).unwrap();
        setSaveDraftStatus("saved");
        toast.success("Draft saved. You'll find it under Drafts.");
        setTimeout(() => setSaveDraftStatus("idle"), 2500);
      } catch {
        // A 401 here is already handled centrally (baseApi.ts shows its own
        // "session expired" message and redirects) — this generic message
        // only actually reaches the user for a real save failure.
        setSaveDraftStatus("error");
        toast.error("Couldn't save your draft. Please try again.");
      }
    },
    [applicationId, saveStep1, saveStep2, saveStep3, saveDraft],
  );

  const handleSubmit = async (decl: Step4Declaration) => {
    if (!applicationId || applicationId === "undefined") {
      toast.error("Application session lost. Please refresh.");
      return;
    }
    if (!decl?.informationAccurate || !decl?.authorizeVerification) {
      toast.error("Please agree to both declarations before submitting.");
      return;
    }
    try {
      const result = await submitApplication({
        id: applicationId,
        informationAccurate: decl.informationAccurate,
        authorizeVerification: decl.authorizeVerification,
      }).unwrap();
      clearWizardSessionState(applicationId);
      dispatch(setSubmitted({ applicationNumber: result.applicationNumber }));
    } catch {
      toast.error("Submission failed. Please try again.");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (submittedApplicationNumber) {
    return (
      <SubmissionSuccess
        applicationNumber={submittedApplicationNumber}
        loanAmount={formData.step1?.loanAmount ?? 0}
        courseName={formData.step1?.courseName ?? ""}
        submittedAt={new Date().toISOString()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Fixed header with hide-on-scroll behaviour */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-40"
        animate={{ y: hidden ? "-100%" : 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div
          className={`transition-all duration-200 border-b border-border ${
            scrolled
              ? "bg-card/97 backdrop-blur-md shadow-sm shadow-black/6 border-zinc-200/80"
              : "bg-card shadow-sm"
          }`}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Image
                  src="/logo-white-bg.svg"
                  alt="Logo"
                  width={120}
                  height={120}
                />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Spacer */}
      <div className="h-14" />

      {/* Progress */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <WizardProgress
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={(s) => {
              setDirection(s < currentStep ? -1 : 1);
              changeStep(s);
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        {isInitialising ||
        isCreating ||
        (isResumingDraft && !hydrationFailed) ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            Preparing your application…
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Step header */}
              <div className="mb-8">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                  Step {currentStep} of 4
                </p>
                <h2 className="text-2xl font-bold text-foreground">
                  {currentStep === 1 && "Tell us about yourself"}
                  {currentStep === 2 && "Verify your identity"}
                  {currentStep === 3 && "Family & education details"}
                  {currentStep === 4 && "Review & submit"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1.5">
                  {currentStep === 1 &&
                    "Enter your personal contact information and your study plans."}
                  {currentStep === 2 &&
                    "Upload your identity documents. We'll auto-fill details using OCR."}
                  {currentStep === 3 &&
                    "Provide your family background and education fee information."}
                  {currentStep === 4 &&
                    "Review your application carefully before final submission."}
                </p>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm px-6 sm:px-8 py-8">
                {currentStep === 1 && (
                  <Step1AboutYou
                    defaultValues={formData.step1}
                    onNext={handleStep1}
                    onDataChange={(data) => {
                      dispatch(updateStepData({ step: "step1", data }));
                      if (applicationId) writeStoredFormFragment(applicationId, "step1", data);
                    }}
                    isSaving={isSaving1}
                    onSaveDraft={(data) => handleSaveDraft(1, data)}
                    saveDraftStatus={saveDraftStatus}
                  />
                )}
                {currentStep === 2 && (
                  <Step2Identity
                    defaultValues={formData.step2}
                    onNext={handleStep2}
                    onPrev={() => goPrev(2)}
                    onDataChange={(data) => {
                      dispatch(updateStepData({ step: "step2", data }));
                      if (applicationId)
                        writeStoredFormFragment(applicationId, "step2", data);
                    }}
                    isSaving={isSaving2}
                    onSaveDraft={(data) => handleSaveDraft(2, data)}
                    saveDraftStatus={saveDraftStatus}
                  />
                )}
                {currentStep === 3 && (
                  <Step3FamilyEducation
                    defaultValues={formData.step3}
                    onNext={handleStep3}
                    onPrev={() => goPrev(3)}
                    onDataChange={(data) => {
                      dispatch(updateStepData({ step: "step3", data }));
                      if (applicationId) writeStoredFormFragment(applicationId, "step3", data);
                    }}
                    isSaving={isSaving3}
                    onSaveDraft={(data) => handleSaveDraft(3, data)}
                    saveDraftStatus={saveDraftStatus}
                  />
                )}
                {currentStep === 4 && applicationId && (
                  <Step4ReviewSubmit
                    applicationId={applicationId}
                    formData={formData}
                    isSubmitting={isSubmitting}
                    onPrev={() => goPrev(4)}
                    onEdit={(s) => {
                      setDirection(-1);
                      changeStep(s);
                    }}
                    onSubmit={handleSubmit}
                    onSaveDraft={() => handleSaveDraft(4)}
                    saveDraftStatus={saveDraftStatus}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
