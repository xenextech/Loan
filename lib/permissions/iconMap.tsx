import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Wallet,
  Calendar,
  Activity,
  FolderOpen,
  ShieldCheck,
  Percent,
  History,
  Inbox,
  Scale,
  Archive,
  KeyRound,
  Bell,
  Landmark,
  Users,
  type LucideIcon,
} from "lucide-react";

// MenuItem.icon is a plain string (backend can't serialize a component) —
// this is the single lookup point every dynamic sidebar consumer uses to
// turn that name back into a renderable icon. Extend here when a new
// MenuItem is seeded with an icon name not yet listed.
export const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  GitBranch,
  Wallet,
  Calendar,
  Activity,
  FolderOpen,
  ShieldCheck,
  Percent,
  History,
  Inbox,
  Scale,
  Archive,
  KeyRound,
  Bell,
  Landmark,
  Users,
};

export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? FileText;
}
