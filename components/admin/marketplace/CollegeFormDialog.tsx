"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Save } from "lucide-react";
import {
  useCreateCollegeMutation,
  useUpdateCollegeMutation,
  useGetUniversitiesQuery,
} from "@/lib/api/marketplaceApi";
import { PROVINCES } from "@/components/student/college-marketplace/constants";
import { ImageUploadField } from "./ImageUploadField";
import type {
  MarketplaceCollege,
  MarketplaceCollegeDetail,
} from "@/types/college-marketplace";

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message)
      return Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message;
  }
  return "Something went wrong. Please try again.";
}

const NONE_UNIVERSITY = "__none__";

const emptyForm = {
  name: "",
  description: "",
  aboutContent: "",
  logoUrl: "",
  bannerUrl: "",
  address: "",
  province: "",
  district: "",
  municipality: "",
  universityId: NONE_UNIVERSITY,
  website: "",
  contactEmail: "",
  contactPhone: "",
  eligibility: "",
  requiredDocs: "",
  accreditation: "",
  isFeatured: false,
  isActive: true,
};

type CollegeLike = MarketplaceCollege | MarketplaceCollegeDetail;

interface CollegeFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: CollegeLike | null;
}

export function CollegeFormDialog({
  open,
  onOpenChange,
  editing,
}: CollegeFormDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const { data: universities } = useGetUniversitiesQuery({
    includeInactive: true,
  });

  const [createCollege, { isLoading: creating }] = useCreateCollegeMutation();
  const [updateCollege, { isLoading: updating }] = useUpdateCollegeMutation();
  const isLoading = creating || updating;

  // Reset fields when the dialog transitions to open, adjusted during render
  // (React's recommended alternative to a reset effect) rather than in a
  // useEffect, so there's no extra render pass between "opened" and "populated".
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      // no-op: fields stay as-is while closed/animating out
    } else if (!editing) {
      setForm(emptyForm);
    } else {
      const detail = editing as Partial<MarketplaceCollegeDetail>;
      setForm({
        name: editing.name ?? "",
        description: editing.description ?? "",
        aboutContent: detail.aboutContent ?? "",
        logoUrl: editing.logoUrl ?? "",
        bannerUrl: editing.bannerUrl ?? "",
        address: editing.address ?? "",
        province: editing.province ?? "",
        district: editing.district ?? "",
        municipality: editing.municipality ?? "",
        universityId: editing.university?.id ?? NONE_UNIVERSITY,
        website: detail.website ?? "",
        contactEmail: detail.contactEmail ?? "",
        contactPhone: detail.contactPhone ?? "",
        eligibility: detail.eligibility ?? "",
        requiredDocs: detail.requiredDocs ?? "",
        accreditation: editing.accreditation ?? "",
        isFeatured: editing.isFeatured ?? false,
        isActive: editing.isActive ?? true,
      });
    }
  }

  const set = <K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const body = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      aboutContent: form.aboutContent.trim() || undefined,
      logoUrl: form.logoUrl.trim() || undefined,
      bannerUrl: form.bannerUrl.trim() || undefined,
      address: form.address.trim() || undefined,
      province: form.province || undefined,
      district: form.district.trim() || undefined,
      municipality: form.municipality.trim() || undefined,
      universityId:
        form.universityId === NONE_UNIVERSITY ? undefined : form.universityId,
      website: form.website.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
      eligibility: form.eligibility.trim() || undefined,
      requiredDocs: form.requiredDocs.trim() || undefined,
      accreditation: form.accreditation.trim() || undefined,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
    };
    try {
      if (editing) {
        await updateCollege({ id: editing.id, body }).unwrap();
        toast.success("College updated.");
      } else {
        await createCollege(body).unwrap();
        toast.success("College created.");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl sm:max-w-7xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit College" : "Add College"}</DialogTitle>
          <DialogDescription>
            Colleges are the institutions students browse in the marketplace.
            Courses are added separately, under a college.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="college-name">Name</Label>
              <Input
                id="college-name"
                placeholder="e.g. Kathmandu College of Management"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Affiliated University (optional)</Label>
              <Select
                value={form.universityId}
                onValueChange={(v) => set("universityId", v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_UNIVERSITY}>None</SelectItem>
                  {universities?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="college-description">Short description</Label>
              <Textarea
                id="college-description"
                placeholder="One or two sentences shown on the college card."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="text-sm"
                rows={2}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="college-about">About (long-form)</Label>
              <Textarea
                id="college-about"
                placeholder="Longer About-section content for the college detail page."
                value={form.aboutContent}
                onChange={(e) => set("aboutContent", e.target.value)}
                className="text-sm"
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Logo</Label>
              <ImageUploadField
                label="Upload Logo"
                hint="Square image works best"
                value={form.logoUrl}
                onChange={(url) => set("logoUrl", url)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Banner</Label>
              <ImageUploadField
                label="Upload Banner"
                hint="Wide image shown on the college page"
                value={form.bannerUrl}
                onChange={(url) => set("bannerUrl", url)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="college-address">Address</Label>
              <Input
                id="college-address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Province</Label>
              <Select
                value={form.province || undefined}
                onValueChange={(v) => set("province", v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="college-district">District</Label>
              <Input
                id="college-district"
                value={form.district}
                onChange={(e) => set("district", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="college-municipality">Municipality</Label>
              <Input
                id="college-municipality"
                value={form.municipality}
                onChange={(e) => set("municipality", e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="college-website">Website</Label>
              <Input
                id="college-website"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="college-accreditation">Accreditation</Label>
              <Input
                id="college-accreditation"
                placeholder="e.g. UGC Accredited"
                value={form.accreditation}
                onChange={(e) => set("accreditation", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="college-email">Contact email</Label>
              <Input
                id="college-email"
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="college-phone">Contact phone</Label>
              <Input
                id="college-phone"
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="college-eligibility">Eligibility</Label>
              <Textarea
                id="college-eligibility"
                value={form.eligibility}
                onChange={(e) => set("eligibility", e.target.value)}
                className="text-sm"
                rows={2}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="college-required-docs">Required documents</Label>
              <Textarea
                id="college-required-docs"
                value={form.requiredDocs}
                onChange={(e) => set("requiredDocs", e.target.value)}
                className="text-sm"
                rows={2}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div>
              <Label htmlFor="college-featured" className="text-sm">
                Featured
              </Label>
              <p className="text-xs text-muted-foreground">
                Highlighted in the marketplace.
              </p>
            </div>
            <Switch
              id="college-featured"
              checked={form.isFeatured}
              onCheckedChange={(v) => set("isFeatured", v)}
            />
          </div>

          {editing && (
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div>
                <Label htmlFor="college-active" className="text-sm">
                  Active
                </Label>
                <p className="text-xs text-muted-foreground">
                  Inactive colleges are hidden from the student-facing
                  marketplace.
                </p>
              </div>
              <Switch
                id="college-active"
                checked={form.isActive}
                onCheckedChange={(v) => set("isActive", v)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            disabled={isLoading || !form.name.trim()}
            onClick={handleSave}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : editing ? (
              <Save className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            {editing ? "Save Changes" : "Create College"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
