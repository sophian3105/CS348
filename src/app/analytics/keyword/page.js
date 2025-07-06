'use client'

import React, { useState, useEffect } from 'react'

export default function KeywordReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch('/api/keyword')   // calls R8a/R8b SQL with hard-coded '%brampton%'
      .then(res => {
        if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
        return res.json()
      })
      .then(data => setReports(Array.isArray(data.rows) ? data.rows : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-6 text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">Keyword Search: “Brampton”</h1>
      {loading && <p className="text-center">Loading…</p>}
      {error   && <p className="text-center text-red-600">Error: {error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occurred At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((r, i) => (
                <tr key={i} className="hover:bg-gray-100">
                  <td className="px-6 py-4 text-sm text-gray-700">{r.report_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {r.occured_at ? new Date(r.occured_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.location_name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.type_id || '-'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600 uppercase">{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
