"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { captureUtmFromUrl } from "@/lib/utils/utm";

export default function UtmCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    captureUtmFromUrl(searchParams);
  }, [searchParams]);

  return null;
}
