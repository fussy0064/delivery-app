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
});

const destIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  startLat?: number;
  startLng?: number;
  destLat?: number;
  destLng?: number;
};

// Small helper to keep map centered on driver
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function Map({
  startLat = -6.7924,
  startLng = 39.2083,
  destLat = -6.78,
  destLng = 39.22,
}: Props) {
  const [driverPos, setDriverPos] = useState<[number, number]>([startLat, startLng]);
  const [progress, setProgress] = useState(0);

  // Live movement simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 0.8; // speed of movement
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Calculate current position between start and destination
  useEffect(() => {
    const lat = startLat + (destLat - startLat) * (progress / 100);
    const lng = startLng + (destLng - startLng) * (progress / 100);
    setDriverPos([lat, lng]);
  }, [progress, startLat, startLng, destLat, destLng]);

  return (
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

      {/* Route line */}
      <Polyline
        positions={[
          [startLat, startLng],
          [destLat, destLng],
        ]}
        color="#f97316"
        weight={4}
        opacity={0.7}
      />

      {/* Moving driver */}
      <Marker position={driverPos} icon={driverIcon}>
        <Popup>
          Driver is moving<br />
          Progress: {Math.round(progress)}%
        </Popup>
      </Marker>

      {/* Destination */}
      <Marker position={[destLat, destLng]} icon={destIcon}>
        <Popup>Delivery location</Popup>
      </Marker>

      <Recenter lat={driverPos[0]} lng={driverPos[1]} />
    </MapContainer>
  );
}
