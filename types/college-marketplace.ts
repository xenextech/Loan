export type DegreeLevel = "CERTIFICATE" | "DIPLOMA" | "BACHELOR" | "MASTER" | "PHD";

export type CourseCategory =
  | "ENGINEERING"
  | "MANAGEMENT"
  | "IT_COMPUTER_SCIENCE"
  | "MEDICINE_HEALTH_SCIENCE"
  | "SCIENCE"
  | "HUMANITIES_SOCIAL_SCIENCE"
  | "LAW"
  | "EDUCATION"
  | "HOSPITALITY_TOURISM"
  | "AGRICULTURE"
  | "OTHER";

export interface MarketplaceUniversity {
  id: string;
  name: string;
  shortName?: string | null;
  isActive: boolean;
}

// List-card shape returned by GET /marketplace/colleges
export interface MarketplaceCollege {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  address?: string | null;
  province?: string | null;
  district?: string | null;
  municipality?: string | null;
  university: { id: string; name: string; shortName?: string | null } | null;
  startingTuition: number | null;
  durationRange: string | null;
  courseCount: number;
  accreditation?: string | null;
  isFeatured: boolean;
  isActive: boolean;
}

export interface CareerOutcome {
  title: string;
  description?: string | null;
  salaryRange?: string | null;
}

export interface CurriculumSemester {
  semester: string;
  subjects: string[];
}

export interface FeeBreakdownItem {
  label: string;
  amount: number;
}

export interface MarketplaceCourse {
  id: string;
  collegeId: string;
  name: string;
  slug: string;
  category: CourseCategory;
  degreeLevel: DegreeLevel;
  duration: string;
  durationMonths?: number | null;
  description?: string | null;
  eligibility?: string | null;
  seatsAvailable?: number | null;
  tuitionFee: number;
  admissionFee?: number | null;
  totalFee: number;
  isFeatured: boolean;
  isPopular: boolean;
  isActive: boolean;
}

// Detail shape returned by GET /marketplace/colleges/:id
export interface MarketplaceCollegeDetail extends Omit<MarketplaceCollege, "startingTuition" | "durationRange" | "courseCount"> {
  website?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  eligibility?: string | null;
  requiredDocs?: string | null;
  courses: MarketplaceCourse[];
}

// Detail shape returned by GET /marketplace/courses/:id — the rich Course
// Detail page content. All new fields are optional: a course without them
// still renders a complete page, just without that section.
export interface MarketplaceCourseDetail extends MarketplaceCourse {
  bannerUrl?: string | null;
  learningOutcomes: string[];
  careerOutcomes?: CareerOutcome[] | null;
  curriculum?: CurriculumSemester[] | null;
  feeBreakdown?: FeeBreakdownItem[] | null;
  industryDemand?: string | null;
  intake?: string | null;
  credits?: number | null;
  medium?: string | null;
  attendanceType?: string | null;
  college: MarketplaceCollegeDetail;
}

// GET /marketplace/courses/:id/related — each course includes its parent
// college (+ affiliated university) since related courses can belong to a
// different college than the one currently being viewed.
export interface RelatedCourse extends MarketplaceCourse {
  college: {
    id: string;
    name: string;
    university: { id: string; name: string; shortName?: string | null } | null;
  };
}

export interface CollegePrefillData {
  collegeId: string;
  collegeName: string;
  courseId: string;
  courseName: string;
  universityName: string | null;
  duration: string;
  tuitionFee: number;
  degreeLevel: DegreeLevel;
  category: CourseCategory;
}

export interface CollegeListFilters {
  search?: string;
  province?: string;
  district?: string;
  universityId?: string;
  category?: CourseCategory;
  degreeLevel?: DegreeLevel;
  duration?: string;
  minFee?: number;
  maxFee?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
