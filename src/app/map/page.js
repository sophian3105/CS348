"use client";
import dynamic from "next/dynamic";

// Disable SSR for the Map component (client-side only)
const Map = dynamic(() => import("../../components/map"), { ssr: false });
import { useState } from "react";

export default function MapPage() {
  const [scale, setScale] = useState(50);
  const [days, setDays] = useState(120);
  const [showHeatmap, setShowHeapmap] = useState(true);

  const [tempScale, setTempScale] = useState(scale);
  const [tempDays, setTempDays] = useState(days);
  const [show, setShow] = useState(showHeatmap);
  const [showMarker, setShowMarker] = useState(true);

  const applySettings = () => {
    setScale(tempScale);
    setDays(tempDays);
    setShowHeapmap(show);
  };

  return (
    <main className="relative w-full h-[calc(100vh-64px)]">
      <Map
        className="z-0"
        scale={scale}
        numdays={days}
        showHeatmap={showHeatmap}
        showMarkers={showMarker}
      />

      <div className="absolute bottom-4 right-4 z-999 flex flex-col gap-2 max-w-xs">
        <button
          onClick={() => setShowMarker(!showMarker)}
          className={`
    px-4 py-2 font-semibold rounded-lg shadow-md transition-colors duration-200
    ${
      showMarker
        ? "bg-red-500 hover:bg-red-600 text-white"
        : "bg-green-500 hover:bg-green-600 text-white"
    }
  `}
        >
          {showMarker ? "Hide Markers" : "Show Markers"}
        </button>{" "}
        <div className="bg-white rounded-lg shadow-md p-2">
          <h1 className="text-xl font-semibold text-gray-800">
            Toronto Crime Reports Map
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 space-y-2">
          <h2 className="text-base font-medium text-gray-800">
            Heatmap Settings
          </h2>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Visibility
            </span>
            <input
              type="checkbox"
              checked={show}
              onChange={() => setShow(!show)}
              className="h-4 w-4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Cell size: {`1/${tempScale}`}
            </label>
            <input
              type="range"
              min={30}
              max={400}
              step={50}
              value={tempScale}
              onChange={(e) => setTempScale(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Days back:
            </label>
            <input
              type="number"
              min={1}
              value={tempDays}
              onChange={(e) => setTempDays(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-600 text-sm"
            />
          </div>

          <button
            onClick={applySettings}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 rounded"
          >
            Apply
          </button>
        </div>
      </div>
    </main>
  );
}
