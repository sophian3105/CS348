"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { Marker } from "react-leaflet";
import { Popup } from "react-leaflet";
import { Circle } from "react-leaflet";

export default function Map({ scale, numdays, showHeatmap }) {
  const [reports, setReports] = useState([]);
  const [heatMap, setHeatMap] = useState([]);

  const [loading, setLoading] = useState(true);

  const greenIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const blueIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    fetch(`/api/coordbins?scale=${scale}&numdays=${numdays}`)
      .then((res) => res.json())
      .then((data) => setHeatMap(data.rows))
      .catch(console.error);
  }, [scale, numdays]);

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

  const cellWidthMeters = (1 / scale) * 111_320;
  const radius = cellWidthMeters / 2;
  const maxCount = heatMap.reduce((max, h) => Math.max(max, h.occurrences), 1);

  return (
    <MapContainer
      center={[43.6595283, -79.4041597]}
      zoom={12}
      scrollWheelZoom={false}
      style={{   height: "calc(100vh - 64px)", width: "100vw" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showHeatmap &&
        heatMap.map((h, idx) => {
          const opacity = Math.min(h.occurrences / maxCount, 1) * 0.5;
          return (
            <Circle
              key={`circle-${idx}`}
              center={[Number(h.lat_bin), Number(h.long_bin)]}
              radius={radius}
              pathOptions={{
                fillColor: "red",
                color: "red",
                fillOpacity: opacity,
                weight: 1,
                stroke: true,
              }}
            />
          );
        })}

      {reports.map((r) => (
        <Marker
          key={r.r_id}
          position={[r.latitude, r.longitude]}
          icon={r.reporter_type == "user" ? greenIcon : blueIcon}
        >
          <Popup>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold truncate">
                {r.r_id.slice(0, 8)}
              </h3>
              <span
                className={`
                    px-2 py-0.5 text-xs font-semibold rounded 
                    ${
                      r.reporter_type === "user"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  `}
              >
                {r.reporter_type.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>Occurred:</strong>{" "}
                {new Date(r.occurence_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Neighborhood:</strong> {r.neighborhood}
              </p>
              <p>
                <strong>Location:</strong>{" "}
                <span className="capitalize">{r.location_type}</span>
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
