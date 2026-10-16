"use client";

// Taktfast /sok — kartvisning (klient-wrapper): leaflet lastes kun i nettleseren via dynamic()
import dynamic from "next/dynamic";
import type { SchoolPin } from "./params";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div
      className="h-[600px] w-full animate-pulse rounded-md bg-sky-pale"
      role="status"
      aria-label="Kartet laster …"
    />
  ),
});

export function MapView({ pins, center, zoom }: { pins: SchoolPin[]; center: [number, number]; zoom: number }) {
  return (
    <div className="relative z-0">
      <LeafletMap pins={pins} center={center} zoom={zoom} />
    </div>
  );
}
