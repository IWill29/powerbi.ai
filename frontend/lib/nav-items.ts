import {
  Activity,
  ClipboardCheck,
  LayoutDashboard,
  List,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};

export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Requests",
    href: "/requests",
    icon: List,
  },
  {
    title: "Approvals",
    href: "/approvals",
    icon: ClipboardCheck,
    badge: 3,
  },
  {
    title: "Activity",
    href: "/activity",
    icon: Activity,
  },
];
