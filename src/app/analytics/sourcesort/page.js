'use client'

import React, { useState, useEffect } from 'react'

export default function ReportsBySource() {
  const [reports, setReports]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [reportType, setReportType] = useState('police')

  useEffect(() => {
    setLoading(true)
    setError(null)

    const endpoint =
      reportType === 'police'
        ? '/api/policeReport'
        : '/api/userReport'

    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
        return res.json()
      })
      .then(data => {
        setReports(Array.isArray(data.rows) ? data.rows : [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [reportType])

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-4 text-center">Reports By Source</h1>

      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-6 py-4">
        <button
          onClick={() => setReportType('police')}
          className={
            reportType === 'police'
              ? 'px-6 py-3 bg-blue-700 text-white font-semibold rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500'
              : 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
          }
        >
          Police Reports
        </button>
        <button
          onClick={() => setReportType('user')}
          className={
            reportType === 'user'
              ? 'px-6 py-3 bg-blue-700 text-white font-semibold rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500'
              : 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
          }
        >
          User Reports
        </button>
      </div>

      {/* Loading / Error */}
      {loading && <p className="p-4 text-center">Loading…</p>}
      {error   && <p className="p-4 text-red-600 text-center">Error: {error}</p>}

      {/* Data Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Report ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Occurred At</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Neighborhood</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Location Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {r.report_id}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {r.occurred_at
                      ? new Date(r.occurred_at).toLocaleDateString()
                      : ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {r.neighborhood || ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 capitalize">
                    {r.location_name || ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 uppercase">
                    {r.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
