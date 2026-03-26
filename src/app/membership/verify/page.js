"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { activateMembership } from "@/lib/firebase/firestore";

export default function MembershipVerifyPage() {
  return (
    <Suspense>
      <MembershipVerifyInner />
    </Suspense>
  );
}

function MembershipVerifyInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying"); // verifying | success | error

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference) {
      setStatus("error");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/paystack?reference=${reference}`);
        const data = await res.json();

        if (!data.success) {
          setStatus("error");
          return;
        }

        const meta = data.data?.metadata || {};
        const userId = meta.userId;

        if (!userId) {
          setStatus("error");
          return;
        }

        await activateMembership(userId, {
          joinedAt: new Date().toISOString(),
          paystackRef: reference,
        });

        setStatus("success");
        setTimeout(() => router.replace("/account"), 3500);
      } catch {
        setStatus("error");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "verifying") {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500">Activating your membership…</p>
        </div>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Welcome to the club!</h1>
          <p className="text-sm text-gray-500 mb-2">
            Your <span className="font-semibold text-black">10% member discount</span> is now active on every order.
          </p>
          <p className="text-xs text-gray-400">Redirecting to your account…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-black mb-2">Activation failed</h1>
        <p className="text-sm text-gray-500 mb-6">
          If you were charged, contact support with your payment reference.
        </p>
        <a
          href="/contact"
          className="text-xs font-semibold underline text-black"
        >
          Contact Support
        </a>
      </div>
    </main>
  );
}
