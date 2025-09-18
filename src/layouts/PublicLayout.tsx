// src/layouts/PublicLayout.tsx
import { Outlet } from "react-router-dom";
import Navigation from "@/components/Navigation";

export default function PublicLayout() {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}
