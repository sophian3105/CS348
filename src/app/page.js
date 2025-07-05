'use client'
import { useState } from 'react';

export default function Home() {
  const [dangerous, setDangerous] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/coordinates');
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      console.log('response JSON:', json);       
      setDangerous(json.rows); 
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Loading…' : 'Get Most Dangerous'}
      </button>

      {error && (
        <p className="mt-4 text-red-600">
          ❌ {error}
        </p>
      )}

      {dangerous && (
        <div className="mt-6">
          {Array.isArray(dangerous) ? (
            <ul className="list-disc list-inside space-y-1">
              {dangerous.map((item, i) => (
                <li key={i}>
                  {typeof item === 'object'
                    ? JSON.stringify(item)
                    : String(item)}
                </li>
              ))}
            </ul>
          ) : (
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(dangerous, null, 2)}
            </pre>
          )}
        </div>
      )}
    </main>
  );
}
