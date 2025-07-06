"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "../components/footer";

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTop3 = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/filter");
      const json = await res.json();
      setData(json.rows);
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: "🗺️",
      title: "Interactive Map",
      description:
        "Explore assault incidents across Toronto with our detailed interactive map",
    },
    {
      icon: "📈",
      title: "Trend Analysis",
      description:
        "View statistical trends and patterns in assault data over time",
    },
    {
      icon: "🛡️",
      title: "Safety Reports",
      description:
        "Access comprehensive safety reports for different neighborhoods",
    },
    {
      icon: "⚠️",
      title: "Report Incidents",
      description:
        "Submit new incident reports to help keep the community informed",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-800 to-indigo-700 text-white text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Toronto Assault Dashboard
          </h1>
          <p className="text-xl mb-10 opacity-90 mx-auto max-w-2xl leading-relaxed">
            Explore assault trends across Toronto, view hot-spots on an
            interactive map, and help keep our community safe by reporting
            incidents.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={fetchTop3}
              disabled={loading}
              className="bg-white text-blue-800 font-semibold text-lg rounded-lg px-8 py-4 transition hover:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Show Top 3 Dangerous Areas"}
            </button>
            <Link
              href="/map"
              className="border-2 border-white text-white font-semibold text-lg rounded-lg px-8 py-4 transition hover:bg-white hover:text-blue-800"
            >
              View Interactive Map
            </Link>
          </div>
        </div>
      </section>

      {data.length > 0 && (
        <section className="py-16 px-4 bg-red-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                High-Risk Areas
              </h2>
              <p className="text-xl text-gray-500">
                Areas requiring increased attention and safety measures
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {data.map((row, i) => (
                <div
                  key={i}
                  className="relative bg-white p-8 rounded-xl shadow-md border-l-4 border-red-600 transition transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="absolute top-4 right-4 bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                    #{i + 1}
                  </span>
                  <div className="text-3xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {row.worstNbhd}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    High incident concentration area
                  </p>
                  <Link
                    href={`/map?area=${encodeURIComponent(row.worstNbhd)}`}
                    className="inline-flex items-center text-red-600 font-semibold hover:text-red-800"
                  >
                    View on Map 🗺️
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Safety Analytics
            </h2>
            <p className="text-xl text-gray-500 mx-auto max-w-lg">
              Access powerful tools and insights to understand and improve
              community safety
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-8 rounded-xl transition transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-800 to-indigo-700 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Help Keep Toronto Safe</h2>
          <p className="text-xl mb-8 opacity-90">
            Your reports and awareness contribute to a safer community for
            everyone
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/submit"
              className="bg-white text-blue-800 font-semibold text-lg rounded-lg px-8 py-4 transition hover:bg-gray-100"
            >
              Report an Incident
            </Link>
            <Link
              href="/reports"
              className="border-2 border-white text-white font-semibold text-lg rounded-lg px-8 py-4 transition hover:bg-white hover:text-blue-800"
            >
              View All Reports
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
