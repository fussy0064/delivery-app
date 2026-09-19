"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

const driverIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const destIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type Props = {
  startLat?: number;
  startLng?: number;
  destLat?: number;
  destLng?: number;
};

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function Map({
  startLat = -6.7924,
  startLng = 39.2083,
  destLat = -6.78,
  destLng = 39.22,
}: Props) {
  const [driverPos, setDriverPos] = useState<[number, number]>([startLat, startLng]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 0.6;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const lat = startLat + (destLat - startLat) * (progress / 100);
    const lng = startLng + (destLng - startLng) * (progress / 100);
    setDriverPos([lat, lng]);
  }, [progress, startLat, startLng, destLat, destLng]);

  const distance = getDistanceKm(startLat, startLng, destLat, destLng);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={driverPos}
        zoom={14}
        style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={[
            [startLat, startLng],
            [destLat, destLng],
          ]}
          color="#f97316"
          weight={5}
          opacity={0.8}
        />

        <Marker position={driverPos} icon={driverIcon}>
          <Popup>
            <strong>Driver</strong>
            <br />
            Progress: {Math.round(progress)}%
          </Popup>
        </Marker>

        <Marker position={[destLat, destLng]} icon={destIcon}>
          <Popup>
            <strong>Delivery Point</strong>
          </Popup>
        </Marker>

        <Recenter lat={driverPos[0]} lng={driverPos[1]} />
      </MapContainer>

      <div className="absolute top-3 left-3 bg-white/95 px-3 py-1.5 rounded-full shadow text-sm font-medium z-[1000]">
        📍 {distance} km
      </div>
    </div>
  );
}
