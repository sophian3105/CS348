'use client'

import React, { useState, useEffect } from 'react'

export default function WorstNeighborhoods() {
  const [areas, setAreas]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch('/api/worst')        // calls R10a SQL, LIMIT 3
      .then(res => {
        if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
        return res.json()
      })
      .then(data => setAreas(Array.isArray(data.rows) ? data.rows : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto p-6 text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">Top 3 Worst Neighborhoods</h1>
      {loading && <p className="text-center">Loading…</p>}
      {error   && <p className="text-center text-red-600">Error: {error}</p>}
      {!loading && !error && (
        <ol className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {areas.map((a, i) => (
            <li key={i} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
              <span className="text-lg font-medium text-gray-800">#{i+1}: {a.worstNbhd}</span>
              <span className="text-sm text-gray-500">Rank {i+1}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
