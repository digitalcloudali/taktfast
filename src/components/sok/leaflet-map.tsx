"use client";

// Taktfast /sok — selve Leaflet-kartet (kun i nettleseren, hentes via dynamic() i map-view.tsx)
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { SchoolPin } from "./params";

export default function LeafletMap({
  pins,
  center,
  zoom,
}: {
  pins: SchoolPin[];
  center: [number, number];
  zoom: number;
}) {
  // Nøkkel på sentrum/zoom gjør at kartet re-sentreres når byfilteret endres
  return (
    <MapContainer
      key={`${center[0].toFixed(4)}-${center[1].toFixed(4)}-${zoom}`}
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="h-[600px] w-full rounded-md"
      aria-label="Kart over danseskoler"
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-bidragsytere'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin) => (
        <CircleMarker
          key={pin.schoolSlug}
          center={[pin.lat, pin.lng]}
          radius={9}
          pathOptions={{
            color: "#00205B",
            weight: 2,
            fillColor: pin.tintHex || "#8BB8E8",
            fillOpacity: 0.8,
          }}
        >
          <Popup>
            <div className="min-w-40 space-y-1">
              <p className="font-display font-bold text-navy">{pin.schoolName}</p>
              <p className="text-sm text-tf-muted">
                {pin.district ? `${pin.district}, ` : ""}
                {pin.city}
              </p>
              <p className="text-sm">
                {pin.count} kurs på denne siden
              </p>
              <Link href={`/danseskoler/${pin.schoolSlug}`} className="inline-block font-semibold text-navy underline underline-offset-4">
                Se danseskolen <span aria-hidden="true">›</span>
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
