"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type SchoolMapProps = {
  lat: number;
  lng: number;
  name: string;
  address: string;
};

/** Interaktivt kart (Leaflet) med marinblå markør på skolens adresse */
export function SchoolMap({ lat, lng, name, address }: SchoolMapProps) {
  return (
    <div className="overflow-hidden rounded-md border border-[#CCD2DE]" aria-label={`Kart som viser ${name}, ${address}`}>
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: 340, width: "100%" }}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-bidragsytere'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={[lat, lng]}
          radius={10}
          pathOptions={{ color: "#00205B", weight: 3, fillColor: "#00205B", fillOpacity: 0.85 }}
        >
          <Popup>
            <strong>{name}</strong>
            <br />
            {address}
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}

export default SchoolMap;
