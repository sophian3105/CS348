"use client";

import React, { useState, useEffect } from "react";

export default function KeywordReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("weapon");
  const [tempKeyword, setTempKeyword] = useState(keyword);

  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/keyword?keyword=${encodeURIComponent(keyword)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setReports(Array.isArray(data.rows) ? data.rows : []);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [keyword]);

  return (
    <div className="max-w-5xl mx-auto p-6 text-black">
      <h1 className="text-3xl font-bold mb-2 text-center">Keyword Search</h1>
      <p className="text-lg mb-4 text-center">
        Filter by neighborhood, location/premise/assault type, or r_ID
      </p>

      <div className="flex items-center space-x-2 mb-6">
        <input
          type="text"
          value={tempKeyword}
          onChange={(e) => setTempKeyword(e.target.value)}
          placeholder="Enter keyword..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setKeyword(tempKeyword)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </div>
      {loading && <p className="text-center">Loading…</p>}
      {error && <p className="text-center text-red-600">Error: {error}</p>}
      {!loading && !error && reports.length === 0 && (
        <p className="text-center text-gray-500">No data found.</p>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Report ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Occurred At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((r, i) => (
                <tr key={i} className="hover:bg-gray-100">
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {r.report_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {r.occured_at
                      ? new Date(r.occured_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {r.location_name || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {r.type_id || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600 uppercase">
                    {r.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
