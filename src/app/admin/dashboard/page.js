"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isAdmin } from "@/lib/utils/admin";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (loading) return;
    if (!isAdmin(user?.uid)) {
      router.replace("/admin");
      return;
    }
    router.replace("/admin/dashboard/orders");
  }, [user, loading, router]);

  return null;
}
