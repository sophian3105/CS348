"use client";
import Map from "../../components/map";

export default function MapPage() {
  return (
    <main className="relative w-full h-screen">
      <Map className="z-0" />

      <header className="absolute top-4 right-4 z-999 bg-white bg-opacity-80 p-3 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-black">Police Reports Map</h1>
      </header>
    </main>
  );
}
