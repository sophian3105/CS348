"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Marker } from "react-leaflet";
import { Popup } from "react-leaflet";

export default function Map() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coordinates")
      .then((res) => res.json())
      .then((data) => {
        console.log("fetched data:", data);
        setReports(data.rows);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-600">Loading map…</span>
      </div>
    );
  }
  return (
    <MapContainer
      center={[43.6595283, -79.4041597]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: "100vh", width: "100vw" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {reports.map((r) => (
        <Marker key={r.r_id} position={[r.latitude, r.longitude]}>
          <Popup>
            <div className="space-y-1">
              <h2 className="font-semibold">Report #{r.r_id}</h2>
              <p className="text-sm">Neighborhood: {r.neighborhood}</p>
              <p className="text-sm capitalize">Type: {r.location_type}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
