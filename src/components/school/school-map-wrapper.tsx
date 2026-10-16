"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { SchoolMapProps } from "./school-map";

/** Wrapper: laster Leaflet-kartet kun i klienten (unngår SSR-problemer) */
const SchoolMap = dynamic(() => import("./school-map"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-[340px] w-full rounded-md border border-[#CCD2DE] bg-sky-pale" aria-label="Kartet laster …" />
  ),
});

export function SchoolMapWrapper(props: SchoolMapProps) {
  return <SchoolMap {...props} />;
}
