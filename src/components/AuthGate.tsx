// src/components/AuthGate.tsx
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { loading, user } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
        Sessiestatus laden...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
