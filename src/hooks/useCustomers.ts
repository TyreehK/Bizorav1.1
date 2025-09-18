// src/hooks/useCustomers.ts
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Customer = {
  id: string;
  owner: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  vat_number: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function useCustomers(search: string) {
  const key = useMemo(() => ["customers", { search }], [search]);

  const list = useQuery({
    queryKey: key,
    queryFn: async (): Promise<Customer[]> => {
      let q = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (search.trim()) {
        const s = `%${search.trim().toLowerCase()}%`;
        q = q.or(
          `name.ilike.${s},email.ilike.${s},company.ilike.${s},city.ilike.${s}`
        );
      }

      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const count = useQuery({
    queryKey: ["customers_count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  return { list, count, key };
}

export function useCustomerMutations(listKey: any[]) {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: async (payload: Partial<Customer>) => {
      const { error } = await supabase.from("customers").insert({
        name: payload.name,
        email: payload.email ?? null,
        phone: payload.phone ?? null,
        company: payload.company ?? null,
        vat_number: payload.vat_number ?? null,
        address: payload.address ?? null,
        city: payload.city ?? null,
        postal_code: payload.postal_code ?? null,
        country: payload.country ?? null,
        notes: payload.notes ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customers_count"] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Customer> }) => {
      const { error } = await supabase
        .from("customers")
        .update({
          name: patch.name,
          email: patch.email ?? null,
          phone: patch.phone ?? null,
          company: patch.company ?? null,
          vat_number: patch.vat_number ?? null,
          address: patch.address ?? null,
          city: patch.city ?? null,
          postal_code: patch.postal_code ?? null,
          country: patch.country ?? null,
          notes: patch.notes ?? null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customers_count"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customers_count"] });
    },
  });

  return { create, update, remove };
}
