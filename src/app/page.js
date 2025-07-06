"use client"

import { useState } from "react"
import Link from "next/link"

export default function Home() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchTop3 = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/mostdangerous")
      const json = await res.json()
      setData(json.rows)
    } catch (e) {
      console.error(e)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3730a3 100%)",
          color: "white",
          padding: "5rem 1rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
              lineHeight: "1.2",
            }}
          >
            Toronto Assault Dashboard
          </h1>

          <p
            style={{
              fontSize: "1.25rem",
              marginBottom: "2.5rem",
              opacity: "0.9",
              maxWidth: "800px",
              margin: "0 auto 2.5rem auto",
              lineHeight: "1.6",
            }}
          >
            Explore assault trends across Toronto, view hot-spots on an interactive map, and help keep our community
            safe by reporting incidents.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <button
              onClick={fetchTop3}
              disabled={loading}
              style={{
                padding: "1rem 2rem",
                backgroundColor: "white",
                color: "#1e40af",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.2s",
                minWidth: "250px",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#f3f4f6"
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "white"
                }
              }}
            >
              {loading ? "Loading..." : "Show Top 3 Dangerous Areas"}
            </button>

            <Link
              href="/map"
              style={{
                display: "inline-block",
                padding: "1rem 2rem",
                border: "2px solid white",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "1rem",
                transition: "all 0.2s",
                minWidth: "250px",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "white"
                e.target.style.color = "#1e40af"
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent"
                e.target.style.color = "white"
              }}
            >
              View Interactive Map
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: "4rem 1rem",
          backgroundColor: "white",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "1rem",
              }}
            >
              Comprehensive Safety Analytics
            </h2>
            <p
              style={{
                fontSize: "1.25rem",
                color: "#6b7280",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Access powerful tools and insights to understand and improve community safety
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              {
                icon: "🗺️",
                title: "Interactive Map",
                description: "Explore assault incidents across Toronto with our detailed interactive map",
              },
              {
                icon: "📈",
                title: "Trend Analysis",
                description: "View statistical trends and patterns in assault data over time",
              },
              {
                icon: "🛡️",
                title: "Safety Reports",
                description: "Access comprehensive safety reports for different neighborhoods",
              },
              {
                icon: "⚠️",
                title: "Report Incidents",
                description: "Submit new incident reports to help keep the community informed",
              },
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "12px",
                  transition: "all 0.3s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f3f4f6"
                  e.target.style.transform = "translateY(-4px)"
                  e.target.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#f9fafb"
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "none"
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "1rem",
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "0.75rem",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "#6b7280",
                    lineHeight: "1.6",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top 3 Results */}
      {data.length > 0 && (
        <section
          style={{
            padding: "4rem 1rem",
            backgroundColor: "#fef2f2",
          }}
        >
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: "1rem",
                }}
              >
                High-Risk Areas
              </h2>
              <p
                style={{
                  fontSize: "1.25rem",
                  color: "#6b7280",
                }}
              >
                Areas requiring increased attention and safety measures
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
              }}
            >
              {data.map((row, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "white",
                    padding: "2rem",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    borderLeft: "4px solid #dc2626",
                    position: "relative",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-4px)"
                    e.target.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)"
                    e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                    }}
                  >
                    #{i + 1}
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        fontSize: "2rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      ⚠️
                    </div>
                    <h3
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#111827",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {row.worstNbhd}
                    </h3>
                    <p style={{ color: "#6b7280" }}>High incident concentration area</p>
                  </div>

                  <Link
                    href={`/map?area=${encodeURIComponent(row.worstNbhd)}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      color: "#dc2626",
                      textDecoration: "none",
                      fontWeight: "600",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "#991b1b"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "#dc2626"
                    }}
                  >
                    View on Map 🗺️
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        style={{
          padding: "4rem 1rem",
          background: "linear-gradient(135deg, #1e40af 0%, #3730a3 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Help Keep Toronto Safe
          </h2>

          <p
            style={{
              fontSize: "1.25rem",
              marginBottom: "2rem",
              opacity: "0.9",
            }}
          >
            Your reports and awareness contribute to a safer community for everyone
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <Link
              href="/submit"
              style={{
                display: "inline-block",
                padding: "1rem 2rem",
                backgroundColor: "white",
                color: "#1e40af",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "1rem",
                transition: "all 0.2s",
                minWidth: "200px",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f3f4f6"
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "white"
              }}
            >
              Report an Incident
            </Link>
            <Link
              href="/reports"
              style={{
                display: "inline-block",
                padding: "1rem 2rem",
                border: "2px solid white",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "1rem",
                transition: "all 0.2s",
                minWidth: "200px",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "white"
                e.target.style.color = "#1e40af"
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent"
                e.target.style.color = "white"
              }}
            >
              View All Reports
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
