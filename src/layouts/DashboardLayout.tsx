// src/layouts/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import HeaderBar from "@/components/dashboard/HeaderBar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Vaste linker zijbalk */}
      <Sidebar />

      {/* Contentgebied: padding-left gelijk aan sidebar-breedte */}
      <div className="pl-64">
        {/* Sticky header met zoek + avatar + uitloggen */}
        <HeaderBar />
        {/* Hoofdcontent */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
