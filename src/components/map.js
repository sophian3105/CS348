"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Marker } from "react-leaflet";
import { Popup } from "react-leaflet";
import { Circle } from "react-leaflet";
import { Search } from "lucide-react";
import L from "leaflet";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

function DrawControl({ onCircle, onModeChange }) {
  const map = useMap();
  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: false,
        polyline: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
        circle: {
          shapeOptions: { color: "#ff7800", weight: 2 },
        },
      },
      edit: {
        featureGroup: drawnItems,
        edit: true,
        remove: true,
      },
    });
    map.addControl(drawControl);
    map.on(L.Draw.Event.EDITSTART, () => onModeChange("edit"));
    map.on(L.Draw.Event.EDITSTOP, () => onModeChange("none"));
    map.on(L.Draw.Event.DELETESTART, () => onModeChange("delete"));
    map.on(L.Draw.Event.DELETESTOP, () => onModeChange("none"));

    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      layer.options.interactive = true;
      drawnItems.addLayer(layer);
      onCircle({
        id: layer._leaflet_id, // ← unique per circle
        center: layer.getLatLng(),
        radius: layer.getRadius(),
      });
    });
    map.on(L.Draw.Event.EDITED, (e) => {
      e.layers.eachLayer((layer) => {
        const { lat, lng } = layer.getLatLng();
        const r = layer.getRadius();
        onCircle({
          id: layer._leaflet_id,
          center: layer.getLatLng(),
          radius: layer.getRadius(),
        });
      });
    });
    map.on(L.Draw.Event.DELETED, (e) => {
      e.layers.eachLayer((layer) => {
        const { lat, lng } = layer.getLatLng();
        const r = layer.getRadius();
        onCircle({
          deleted: {
            id: layer._leaflet_id,
            center: { lat, lng },
            radius: r,
          },
        });
      });
    });

    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.DELETED);
      map.off(L.Draw.Event.EDITSTART);
      map.off(L.Draw.Event.EDITSTOP);
      map.off(L.Draw.Event.DELETESTART);
      map.off(L.Draw.Event.DELETESTOP);
    };
  }, [map, onModeChange]);
  return null;
}

export default function Map({
  scale,
  numdays,
  showHeatmap,
  showPolice,
  showUser,
}) {
  const [reports, setReports] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [tempKey, setTempKey] = useState(keyword);

  const [heatMap, setHeatMap] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selections, setSelections] = useState([]);
  const [drawMode, setDrawMode] = useState("none");

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

  const redIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
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

  useEffect(() => {
    if (keyword){
    fetch(`/api/keywordMap?keyword=${keyword}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("fetched data:", data);
        setSearchResults(data.rows);
      })
      .catch(console.error);
    }
  }, [keyword]);

  const handleCircle = useCallback(async (payload) => {
    if (payload.deleted) {
      const { id } = payload.deleted;
      setSelections((sels) => sels.filter((sel) => sel.id !== id));
      return;
    }
    const { id, center, radius } = payload;
    const res = await fetch(
      `/api/within?lat=${center.lat}&lng=${center.lng}&radiusKm=${(
        radius / 1000
      ).toFixed(3)}`
    );
    const { rows } = await res.json();
    setSelections((sels) => {
      const idx = sels.findIndex((sel) => sel.id === id);
      if (idx !== -1) {
        const next = [...sels];
        next[idx] = { ...next[idx], center, radius, reports: rows };
        return next;
      }
      return [...sels, { id, center, radius, reports: rows }];
    });
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
      style={{ height: "calc(100vh - 64px)", width: "100vw" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DrawControl onCircle={handleCircle} onModeChange={setDrawMode} />
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

      {reports
        .filter(
          (r) =>
            (r.reporter_type === "police" && showPolice) ||
            (r.reporter_type === "user" && showUser)
        )
        .filter((r) => r.latitude != null && r.longitude != null && !isNaN(r.latitude) && !isNaN(r.longitude))
        .map((r) => {
          const isUser = r.reporter_type === "user";
          const color = isUser ? "green" : "blue";
          const icon = isUser ? greenIcon : blueIcon;

          return (
            <Marker
              key={r.r_id}
              position={[r.latitude, r.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold truncate">
                    {r.r_id.slice(0, 8)}
                  </h3>
                  <span
                    className={`
                px-2 py-0.5 text-xs font-semibold rounded
                bg-${color}-100 text-${color}-800
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
          );
        })}

      {searchResults.length > 0 &&
        searchResults.map((r) => {
          const isUser = r.reporter_type === "user";
          const color = isUser ? "green" : "blue";

          return (
            <Marker
              key={r.r_id}
              position={[r.latitude, r.longitude]}
              icon={redIcon}
            >
              <Popup>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold truncate">
                    {r.r_id.slice(0, 8)}
                  </h3>
                  <span
                    className={`
                px-2 py-0.5 text-xs font-semibold rounded
                bg-${color}-100 text-${color}-800
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
          );
        })}

      {drawMode === "none" &&
        selections.map((sel, i) => (
          <Circle
            key={i}
            center={[sel.center.lat, sel.center.lng]}
            radius={sel.radius}
            pathOptions={{ color: "orange" }}
          >
            <Popup maxWidth={500}>
              <div className="space-y-1">
                <h3 className="font-bold text-lg mb-4">
                  {sel.reports.length} report{sel.reports.length !== 1 && "s"}{" "}
                  inside
                </h3>
                <div className="overflow-auto max-h-40">
                  <table className="table-auto w-full text-sm">
                    <thead className="bg-orange-200">
                      <tr>
                        <th className="px-2 py-1 text-left font-medium">ID</th>
                        <th className="px-2 py-1 text-left font-medium">
                          Occurred
                        </th>
                        <th className="px-2 py-1 text-left font-medium">
                          Location
                        </th>
                        <th className="px-2 py-1 text-left font-medium">
                          Neighborhood
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sel.reports.length > 0 ? (
                        sel.reports.map((r) => (
                          <tr key={r.r_id} className="hover:bg-gray-50">
                            <td className="px-2 py-1">{r.r_id.slice(0, 8)}</td>
                            <td className="px-2 py-1">
                              {new Date(r.occurence_date).toLocaleDateString()}
                            </td>
                            <td className="px-2 py-1 capitalize">
                              {r.location_type}
                            </td>
                            <td className="px-2 py-1">{r.neighborhood}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-2 py-1 text-center">
                            No reports found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}
      <div className="absolute top-4 w-[400px] px-4 z-999 left-10">
        <div className="relative">
          <input
            type="text"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            placeholder="Enter keyword…"
            className="w-full rounded-full bg-white text-black pl-4 py-2 pr-8 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setKeyword(tempKey)}
            className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-400 hover:text-blue-600"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </MapContainer>
  );
}
