// src/pages/Dashboard.tsx
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { ShoppingCart, FileText, FileSpreadsheet, Folder, Briefcase, Users, LayoutDashboard, Receipt, Banknote, BarChart3, Clock, UserCog, TrendingUp } from "lucide-react";

const modules = [
  { key: "overview", label: "Overzicht", icon: LayoutDashboard },
  { key: "purchases", label: "Inkoop", icon: ShoppingCart },
  { key: "sales", label: "Verkoop", icon: TrendingUp },
  { key: "invoices", label: "Facturen", icon: Receipt },
  { key: "vat", label: "Btw aangifte", icon: FileSpreadsheet },
  { key: "contracts", label: "Contracten", icon: FileText },
  { key: "documents", label: "Documenten", icon: Folder },
  { key: "projects", label: "Projecten", icon: Briefcase },
  { key: "customers", label: "Klanten", icon: Users },
  { key: "banking", label: "Bank", icon: Banknote },
  { key: "reports", label: "Rapportages", icon: BarChart3 },
  { key: "timesheets", label: "Uren", icon: Clock },
  { key: "hr", label: "HRM", icon: UserCog },
];

export default function DashboardLayout() {
  const { user } = useSupabaseAuth();
  const loc = useLocation();

  return (
    <div className="pt-20">
      <div className="container-page grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <div className="card p-3 sticky top-20">
            <div className="px-2 py-2 text-xs text-white/60">Welkom</div>
            <div className="px-2 text-sm font-medium truncate">{user?.email}</div>
            <nav className="mt-3">
              <ul className="space-y-1">
                {modules.map((m) => {
                  const Icon = m.icon;
                  const to = m.key === "overview" ? "/dashboard" : `/dashboard/${m.key}`;
                  const active = loc.pathname === to;
                  return (
                    <li key={m.key}>
                      <NavLink
                        to={to}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition
                          ${active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5 hover:text-white"}`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{m.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="card p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
