// src/components/dashboard/Sidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Banknote,
  Percent,
  FileSignature,
  FolderOpen,
  Briefcase,
  Users,
  Clock3,
  UserCircle2,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overzicht" },
  { to: "/dashboard/invoices", icon: FileText, label: "Verkoop" },
  { to: "/dashboard/purchases", icon: ShoppingCart, label: "Inkoop" },
  { to: "/dashboard/banking", icon: Banknote, label: "Bank" },
  { to: "/dashboard/vat", icon: Percent, label: "BTW aangifte" },
  { to: "/dashboard/contracts", icon: FileSignature, label: "Contracten" },
  { to: "/dashboard/documents", icon: FolderOpen, label: "Documenten" },
  { to: "/dashboard/projects", icon: Briefcase, label: "Projecten" },
  { to: "/dashboard/customers", icon: Users, label: "Klanten" },
  { to: "/dashboard/timesheets", icon: Clock3, label: "Uren" },
  { to: "/dashboard/hr", icon: UserCircle2, label: "HR" },
  { to: "/dashboard/reports", icon: BarChart3, label: "Rapportages" },
  { to: "/dashboard/settings", icon: Settings, label: "Instellingen" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      className="
        fixed left-0 top-0 z-40
        h-screen w-64
        border-r border-white/10
        bg-background/70 backdrop-blur
        supports-[backdrop-filter]:bg-background/50
        overflow-y-auto
      "
    >
      {/* Logo / brand */}
      <div className="h-16 px-4 flex items-center border-b border-white/10">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <span className="ml-2 text-lg font-semibold">Bizora</span>
      </div>

      {/* Nav items */}
      <nav className="p-2">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + "/");
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-white/70")} />
              <span className="truncate">{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
