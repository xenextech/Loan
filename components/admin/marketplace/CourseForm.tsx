"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Save, BookOpen, Wallet, ListChecks, Briefcase, Layers, Settings2 } from "lucide-react";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RepeatableTable, type RepeatableTableColumn } from "@/components/initiator/loan-assessment/ui/RepeatableTable";
import { useGetCollegesQuery, useCreateCourseMutation, useUpdateCourseMutation } from "@/lib/api/marketplaceApi";
import { CATEGORY_LABELS, DEGREE_LABELS, DURATIONS } from "@/components/student/college-marketplace/constants";
import { courseFormSchema, courseFormDefaults, type CourseFormValues, type CourseSubmitValues } from "./courseFormSchema";
import { ImageUploadField } from "./ImageUploadField";
import { SearchableSelect } from "./SearchableSelect";
import type { CreateCourseInput, MarketplaceCourseDetail } from "@/types/college-marketplace";

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  return "Something went wrong. Please try again.";
}

function toFormValues(course: MarketplaceCourseDetail): CourseFormValues {
  return {
    collegeId: course.collegeId,
    name: course.name,
    category: course.category,
    degreeLevel: course.degreeLevel,
    duration: course.duration,
    durationMonths: course.durationMonths ?? "",
    description: course.description ?? "",
    aboutContent: course.aboutContent ?? "",
    eligibility: course.eligibility ?? "",
    seatsAvailable: course.seatsAvailable ?? "",
    tuitionFee: course.tuitionFee,
    admissionFee: course.admissionFee ?? "",
    totalFee: course.totalFee,
    bannerUrl: course.bannerUrl ?? "",
    learningOutcomes: (course.learningOutcomes ?? []).map((value) => ({ value })),
    careerOutcomes: (course.careerOutcomes ?? []).map((c) => ({
      title: c.title,
      description: c.description ?? "",
      salaryRange: c.salaryRange ?? "",
    })),
    curriculum: (course.curriculum ?? []).map((c) => ({
      semester: c.semester,
      subjects: c.subjects.join(", "),
    })),
    feeBreakdown: (course.feeBreakdown ?? []).map((f) => ({ label: f.label, amount: f.amount })),
    industryDemand: course.industryDemand ?? "",
    intake: course.intake ?? "",
    credits: course.credits ?? "",
    medium: course.medium ?? "",
    attendanceType: course.attendanceType ?? "",
    isFeatured: course.isFeatured,
    isPopular: course.isPopular,
    isActive: course.isActive,
  };
}

function toApiInput(values: CourseSubmitValues): CreateCourseInput {
  return {
    collegeId: values.collegeId,
    name: values.name.trim(),
    category: values.category as CreateCourseInput["category"],
    degreeLevel: values.degreeLevel as CreateCourseInput["degreeLevel"],
    duration: values.duration,
    durationMonths: values.durationMonths,
    description: values.description?.trim() || undefined,
    aboutContent: values.aboutContent?.trim() || undefined,
    eligibility: values.eligibility?.trim() || undefined,
    seatsAvailable: values.seatsAvailable,
    tuitionFee: values.tuitionFee,
    admissionFee: values.admissionFee,
    totalFee: values.totalFee,
    bannerUrl: values.bannerUrl?.trim() || undefined,
    learningOutcomes: values.learningOutcomes.map((o) => o.value.trim()).filter(Boolean),
    careerOutcomes: values.careerOutcomes.length
      ? values.careerOutcomes.map((c) => ({
          title: c.title.trim(),
          description: c.description?.trim() || null,
          salaryRange: c.salaryRange?.trim() || null,
        }))
      : undefined,
    curriculum: values.curriculum.length
      ? values.curriculum.map((c) => ({
          semester: c.semester.trim(),
          subjects: c.subjects.split(",").map((s) => s.trim()).filter(Boolean),
        }))
      : undefined,
    feeBreakdown: values.feeBreakdown.length
      ? values.feeBreakdown.map((f) => ({ label: f.label.trim(), amount: f.amount }))
      : undefined,
    industryDemand: values.industryDemand?.trim() || undefined,
    intake: values.intake?.trim() || undefined,
    credits: values.credits,
    medium: values.medium?.trim() || undefined,
    attendanceType: values.attendanceType?.trim() || undefined,
    isFeatured: values.isFeatured,
    isPopular: values.isPopular,
    isActive: values.isActive,
  };
}

const SectionHeading = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  </div>
);

interface CourseFormProps {
  mode: "create" | "edit";
  courseId?: string;
  initialValues?: MarketplaceCourseDetail;
  defaultCollegeId?: string;
}

export function CourseForm({ mode, courseId, initialValues, defaultCollegeId }: CourseFormProps) {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const { data: collegesData } = useGetCollegesQuery({ includeInactive: true, limit: 100 });
  const colleges = collegesData?.data ?? [];

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      ...courseFormDefaults,
      ...(defaultCollegeId && { collegeId: defaultCollegeId }),
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(toFormValues(initialValues));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const learningOutcomes = useFieldArray({ control: form.control, name: "learningOutcomes" });
  const careerOutcomes = useFieldArray({ control: form.control, name: "careerOutcomes" });
  const curriculum = useFieldArray({ control: form.control, name: "curriculum" });
  const feeBreakdown = useFieldArray({ control: form.control, name: "feeBreakdown" });

  const [createCourse, { isLoading: creating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: updating }] = useUpdateCourseMutation();
  const isSaving = creating || updating;

  const onSubmit = async (values: CourseFormValues) => {
    const body = toApiInput(courseFormSchema.parse(values));
    try {
      if (mode === "edit" && courseId) {
        await updateCourse({ id: courseId, body }).unwrap();
        toast.success("Course updated.");
      } else {
        await createCourse(body).unwrap();
        toast.success("Course created.");
      }
      router.push(`${basePath}/college-marketplace?tab=courses`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const learningOutcomeColumns: RepeatableTableColumn[] = [
    {
      key: "value",
      header: "Outcome",
      render: (i) => (
        <FormField
          control={form.control}
          name={`learningOutcomes.${i}.value`}
          render={({ field }) => (
            <Input placeholder="e.g. Build production-grade REST APIs" {...field} className="h-9 text-sm" />
          )}
        />
      ),
    },
  ];

  const careerOutcomeColumns: RepeatableTableColumn[] = [
    {
      key: "title",
      header: "Role",
      render: (i) => (
        <FormField
          control={form.control}
          name={`careerOutcomes.${i}.title`}
          render={({ field }) => <Input placeholder="e.g. Software Engineer" {...field} className="h-9 text-sm" />}
        />
      ),
    },
    {
      key: "salaryRange",
      header: "Salary Range",
      render: (i) => (
        <FormField
          control={form.control}
          name={`careerOutcomes.${i}.salaryRange`}
          render={({ field }) => <Input placeholder="NPR 40,000 – 80,000/mo" {...field} className="h-9 text-sm" />}
        />
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (i) => (
        <FormField
          control={form.control}
          name={`careerOutcomes.${i}.description`}
          render={({ field }) => <Input placeholder="Optional" {...field} className="h-9 text-sm" />}
        />
      ),
    },
  ];

  const curriculumColumns: RepeatableTableColumn[] = [
    {
      key: "semester",
      header: "Semester",
      className: "w-40",
      render: (i) => (
        <FormField
          control={form.control}
          name={`curriculum.${i}.semester`}
          render={({ field }) => <Input placeholder="e.g. Semester 1" {...field} className="h-9 text-sm" />}
        />
      ),
    },
    {
      key: "subjects",
      header: "Subjects (comma-separated)",
      render: (i) => (
        <FormField
          control={form.control}
          name={`curriculum.${i}.subjects`}
          render={({ field }) => <Input placeholder="e.g. Programming, Discrete Math, Physics" {...field} className="h-9 text-sm" />}
        />
      ),
    },
  ];

  const feeBreakdownColumns: RepeatableTableColumn[] = [
    {
      key: "label",
      header: "Label",
      render: (i) => (
        <FormField
          control={form.control}
          name={`feeBreakdown.${i}.label`}
          render={({ field }) => <Input placeholder="e.g. Tuition Fee" {...field} className="h-9 text-sm" />}
        />
      ),
    },
    {
      key: "amount",
      header: "Amount (NPR)",
      className: "w-40",
      render: (i) => (
        <FormField
          control={form.control}
          name={`feeBreakdown.${i}.amount`}
          render={({ field }) => (
            <Input
              type="number"
              inputMode="decimal"
              value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              className="h-9 text-sm"
            />
          )}
        />
      ),
    },
  ];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        // Pressing Enter inside any single-line <input> (e.g. an Outcome/Semester
        // row field, or just Course Name) natively submits the nearest <form> —
        // that's the browser, not the "Add" buttons (already type="button").
        // Block it everywhere except <textarea>, which doesn't submit on Enter anyway.
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
            e.preventDefault();
          }
        }}
        className="space-y-5 pb-10"
      >
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border shadow-none">
            <CardHeader className="px-5 py-4 border-b border-border">
              <SectionHeading icon={BookOpen} title="Course Basics" />
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="collegeId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>College</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={colleges.map((c) => ({ value: c.id, label: c.name }))}
                        placeholder="Select college"
                        searchPlaceholder="Search colleges…"
                        emptyText="No college found."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Course Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Bachelor of Computer Engineering" {...field} className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="degreeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(DEGREE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm w-full">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DURATIONS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (months, optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className="h-9 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Short description</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="One or two sentences shown on the course card." {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aboutContent"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>About (long-form)</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Longer About-section content for the course detail page." {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eligibility"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Eligibility</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bannerUrl"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Banner (optional)</FormLabel>
                    <FormControl>
                      <ImageUploadField
                        label="Upload Banner"
                        hint="Wide image shown on the course detail page"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <Card className="border-border shadow-none">
            <CardHeader className="px-5 py-4 border-b border-border">
              <SectionHeading icon={Wallet} title="Fees & Seats" />
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tuitionFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tuition Fee (NPR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className="h-9 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="admissionFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Fee (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className="h-9 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Fee (NPR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className="h-9 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seatsAvailable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seats Available (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className="h-9 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <Card className="border-border shadow-none">
            <CardHeader className="px-5 py-4 border-b border-border">
              <SectionHeading icon={ListChecks} title="Learning Outcomes" description="What a student will be able to do after finishing this course." />
            </CardHeader>
            <CardContent className="p-5">
              <RepeatableTable
                columns={learningOutcomeColumns}
                rowCount={learningOutcomes.fields.length}
                onAdd={() => learningOutcomes.append({ value: "" })}
                onRemove={learningOutcomes.remove}
                addLabel="Add Outcome"
                emptyLabel="No learning outcomes added yet."
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="border-border shadow-none">
            <CardHeader className="px-5 py-4 border-b border-border">
              <SectionHeading icon={Briefcase} title="Career Outcomes" description="Roles and salary ranges graduates typically move into." />
            </CardHeader>
            <CardContent className="p-5">
              <RepeatableTable
                columns={careerOutcomeColumns}
                rowCount={careerOutcomes.fields.length}
                onAdd={() => careerOutcomes.append({ title: "", description: "", salaryRange: "" })}
                onRemove={careerOutcomes.remove}
                addLabel="Add Career Outcome"
                emptyLabel="No career outcomes added yet."
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border shadow-none">
            <CardHeader className="px-5 py-4 border-b border-border">
              <SectionHeading icon={Layers} title="Curriculum" description="Semester-by-semester subject list." />
            </CardHeader>
            <CardContent className="p-5">
              <RepeatableTable
                columns={curriculumColumns}
                rowCount={curriculum.fields.length}
                onAdd={() => curriculum.append({ semester: "", subjects: "" })}
                onRemove={curriculum.remove}
                addLabel="Add Semester"
                emptyLabel="No curriculum added yet."
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card className="border-border shadow-none">
            <CardHeader className="px-5 py-4 border-b border-border">
              <SectionHeading icon={Wallet} title="Fee Breakdown" description="Itemized fee lines shown on the course detail page." />
            </CardHeader>
            <CardContent className="p-5">
              <RepeatableTable
                columns={feeBreakdownColumns}
                rowCount={feeBreakdown.fields.length}
                onAdd={() => feeBreakdown.append({ label: "", amount: 0 })}
                onRemove={feeBreakdown.remove}
                addLabel="Add Fee Line"
                emptyLabel="No fee breakdown added yet."
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <Card className="border-border shadow-none">
            <CardHeader className="px-5 py-4 border-b border-border">
              <SectionHeading icon={Settings2} title="Additional Details" />
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industryDemand"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Industry Demand (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="intake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intake (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Fall & Spring" {...field} className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className="h-9 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medium (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. English" {...field} className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="attendanceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attendance Type (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Full-time" {...field} className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                      <Label htmlFor="course-featured" className="text-sm">
                        Featured
                      </Label>
                      <Switch id="course-featured" checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPopular"
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                      <Label htmlFor="course-popular" className="text-sm">
                        Popular
                      </Label>
                      <Switch id="course-popular" checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />
                {mode === "edit" && (
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                        <Label htmlFor="course-active" className="text-sm">
                          Active
                        </Label>
                        <Switch id="course-active" checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push(`${basePath}/college-marketplace?tab=courses`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="gap-1.5 px-6">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {mode === "edit" ? "Save Changes" : "Create Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
