"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix default marker icons in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  driverLat?: number;
  driverLng?: number;
  destLat?: number;
  destLng?: number;
};

export default function Map({ driverLat = -6.7924, driverLng = 39.2083, destLat = -6.7800, destLng = 39.2200 }: Props) {
  useEffect(() => {
    // Fix for default markers
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
  }, []);

  return (
    <MapContainer
      center={[driverLat, driverLng]}
      zoom={14}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[driverLat, driverLng]} icon={icon}>
        <Popup>Driver is here</Popup>
      </Marker>
      <Marker position={[destLat, destLng]} icon={icon}>
        <Popup>Delivery location</Popup>
      </Marker>
    </MapContainer>
  );
}
