import { baseApi } from "./baseApi";
import type {
  OfferLetterListItem,
  OfferLetterRecord,
  AgreementListItem,
  AgreementRecord,
  EnrollmentCertListItem,
  EnrollmentCertRecord,
} from "@/types/api";

// ─── Shared nested payload shapes ────────────────────────────────────────────

interface CollegePayload {
  collegeName: string;
  collegeAddress?: string;
  collegeRegNo?: string;
  collegeAffiliation?: string;
  collegePhone?: string;
  collegeEmail?: string;
  collegeWebsite?: string;
  logoUrl?: string;
}

interface DocumentPayload {
  refNo: string;
  issuedDateAD?: string;
  issuedDateBS?: string;
  validUntilAD?: string;
  validUntilBS?: string;
}

interface CertificationsPayload {
  isEnrolled: boolean;
  hasBacklogs: boolean;
  disciplinaryHold: boolean;
  feeDueRs?: number;
}

interface QrPayload {
  qrToken?: string;
  qrVerifyUrl?: string;
}

// ─── Offer Letter payloads ────────────────────────────────────────────────────

interface OfferLetterPayload {
  applicationId?: string;
  college: CollegePayload;
  document: DocumentPayload;
  student: {
    studentFullName: string;
    studentDobAD?: string;
    studentDobBS?: string;
    citizenshipNumber?: string;
    fatherName?: string;
    motherName?: string;
    permanentAddress?: string;
    district?: string;
    province?: string;
  };
  program?: {
    programName?: string;
    programFullName?: string;
    programAffiliation?: string;
    durationYears?: number;
    totalSemesters?: number;
    creditHours?: number;
    academicYearBS?: string;
    intakeMonthBS?: string;
  };
  fees?: {
    admissionFee?: number;
    tuitionPerSem?: number;
    examFeePerSem?: number;
    labFeePerSem?: number;
    totalApprox?: number;
  };
  conditions?: string[];
  signatories?: { name: string; designation: string; stampAreaLabel?: string }[];
  qr?: QrPayload;
}

// ─── Agreement / Bonafide payloads ────────────────────────────────────────────

interface AgreementPayload {
  applicationId?: string;
  college: CollegePayload;
  document: Omit<DocumentPayload, "validUntilAD" | "validUntilBS">;
  student: {
    studentFullName: string;
    tuRollNo?: string;
    enrollmentNo?: string;
    programName?: string;
    currentYear?: string;
    currentSemester?: string;
    academicYearBS?: string;
    studentStatus?: string;
  };
  certifications: CertificationsPayload;
  qr?: QrPayload;
}

// ─── Enrollment Certificate payloads ─────────────────────────────────────────

interface EnrollmentCertPayload {
  applicationId?: string;
  college: CollegePayload & { collegeCode?: string };
  document: Omit<DocumentPayload, "validUntilAD" | "validUntilBS">;
  student: {
    studentFullName: string;
    tuRollNo?: string;
    enrollmentNo?: string;
    programName?: string;
    currentYear?: string;
    currentSemester?: string;
    academicYearBS?: string;
    studentStatus?: string;
  };
  certifications: CertificationsPayload;
  qr?: QrPayload;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const templateApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === "development",
  endpoints: (builder) => ({

    // ── Offer Letters ────────────────────────────────────────────────────────
    createOfferLetter: builder.mutation<OfferLetterRecord, OfferLetterPayload>({
      query: (body) => ({ url: "/offer-letters", method: "POST", body }),
      invalidatesTags: [{ type: "CollegeTemplate", id: "offer-letters" }],
    }),

    getOfferLetters: builder.query<OfferLetterListItem[], void>({
      query: () => "/offer-letters",
      providesTags: [{ type: "CollegeTemplate", id: "offer-letters" }],
    }),

    getOfferLetter: builder.query<OfferLetterRecord, string>({
      query: (id) => `/offer-letters/${id}`,
      providesTags: (_r, _e, id) => [{ type: "CollegeTemplate", id: `ol-${id}` }],
    }),

    updateOfferLetter: builder.mutation<OfferLetterRecord, { id: string } & Partial<OfferLetterPayload>>({
      query: ({ id, ...body }) => ({ url: `/offer-letters/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "CollegeTemplate", id: `ol-${id}` },
        { type: "CollegeTemplate", id: "offer-letters" },
      ],
    }),

    deleteOfferLetter: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({ url: `/offer-letters/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "CollegeTemplate", id: "offer-letters" }],
    }),

    // ── Agreements (Bonafide Certificates) ───────────────────────────────────
    createAgreement: builder.mutation<AgreementRecord, AgreementPayload>({
      query: (body) => ({ url: "/agreements", method: "POST", body }),
      invalidatesTags: [{ type: "CollegeTemplate", id: "agreements" }],
    }),

    getAgreements: builder.query<AgreementListItem[], void>({
      query: () => "/agreements",
      providesTags: [{ type: "CollegeTemplate", id: "agreements" }],
    }),

    getAgreement: builder.query<AgreementRecord, string>({
      query: (id) => `/agreements/${id}`,
      providesTags: (_r, _e, id) => [{ type: "CollegeTemplate", id: `ag-${id}` }],
    }),

    updateAgreement: builder.mutation<AgreementRecord, { id: string } & Partial<AgreementPayload>>({
      query: ({ id, ...body }) => ({ url: `/agreements/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "CollegeTemplate", id: `ag-${id}` },
        { type: "CollegeTemplate", id: "agreements" },
      ],
    }),

    deleteAgreement: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({ url: `/agreements/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "CollegeTemplate", id: "agreements" }],
    }),

    // ── Enrollment Certificates ───────────────────────────────────────────────
    createEnrollmentCert: builder.mutation<EnrollmentCertRecord, EnrollmentCertPayload>({
      query: (body) => ({ url: "/enrollment-certificates", method: "POST", body }),
      invalidatesTags: [{ type: "CollegeTemplate", id: "enrollment-certs" }],
    }),

    getEnrollmentCerts: builder.query<EnrollmentCertListItem[], void>({
      query: () => "/enrollment-certificates",
      providesTags: [{ type: "CollegeTemplate", id: "enrollment-certs" }],
    }),

    getEnrollmentCert: builder.query<EnrollmentCertRecord, string>({
      query: (id) => `/enrollment-certificates/${id}`,
      providesTags: (_r, _e, id) => [{ type: "CollegeTemplate", id: `ec-${id}` }],
    }),

    updateEnrollmentCert: builder.mutation<EnrollmentCertRecord, { id: string } & Partial<EnrollmentCertPayload>>({
      query: ({ id, ...body }) => ({ url: `/enrollment-certificates/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "CollegeTemplate", id: `ec-${id}` },
        { type: "CollegeTemplate", id: "enrollment-certs" },
      ],
    }),

    deleteEnrollmentCert: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({ url: `/enrollment-certificates/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "CollegeTemplate", id: "enrollment-certs" }],
    }),
  }),
});

export const {
  useCreateOfferLetterMutation,
  useGetOfferLettersQuery,
  useGetOfferLetterQuery,
  useUpdateOfferLetterMutation,
  useDeleteOfferLetterMutation,
  useCreateAgreementMutation,
  useGetAgreementsQuery,
  useGetAgreementQuery,
  useUpdateAgreementMutation,
  useDeleteAgreementMutation,
  useCreateEnrollmentCertMutation,
  useGetEnrollmentCertsQuery,
  useGetEnrollmentCertQuery,
  useUpdateEnrollmentCertMutation,
  useDeleteEnrollmentCertMutation,
} = templateApi;
