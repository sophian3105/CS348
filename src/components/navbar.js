"use client"

import Link from "next/link"
import { useState } from "react"
import { HiMenu, HiX } from "react-icons/hi"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const mainLinks = [
    { href: "/", label: "Home" },
    { href: "/reports", label: "Reports" },
    { href: "/search", label: "Search" },
    { href: "/submit", label: "Submit" },
  ]

  const analyticsLinks = [
    { href: "/analytics/sourcesort", label: "Reports By Source" },
    { href: "/analytics/keyword", label: "Keyword Search" },
    { href: "/analytics/time", label: "View Recent" },
    { href: "/analytics/assaultType", label: "Assault Types" },
    { href: "/analytics/worst", label: "Dangerous Neigbourhoods" },
  ]

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        zIndex: 50,
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "64px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "#2563eb",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            ⚠
          </div>
          <span
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#2563eb",
            }}
          >
            AssaultTracker
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div
          style={{
            display: "none",
            alignItems: "center",
            gap: "2rem",
          }}
          className="desktop-nav"
        >
          {mainLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                color: "#374151",
                textDecoration: "none",
                fontWeight: "500",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#2563eb"
                e.target.style.backgroundColor = "#eff6ff"
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#374151"
                e.target.style.backgroundColor = "transparent"
              }}
            >
              {label}
            </Link>
          ))}

          {/* Analytics Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#374151",
                background: "none",
                border: "none",
                fontWeight: "500",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#2563eb"
                e.target.style.backgroundColor = "#eff6ff"
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#374151"
                e.target.style.backgroundColor = "transparent"
              }}
            >
              📊 Analytics ▼
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: "0.5rem",
                  width: "240px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  border: "1px solid #e5e7eb",
                  padding: "0.5rem 0",
                  zIndex: 50,
                }}
              >
                <div
                  style={{
                    padding: "0.5rem 1rem",
                    borderBottom: "1px solid #e5e7eb",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: "600",
                      color: "#111827",
                      margin: 0,
                      fontSize: "14px",
                    }}
                  >
                    SQL Analytics
                  </h3>
                </div>
                {analyticsLinks.map((feature) => (
                  <Link
                    key={feature.href}
                    href={feature.href}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: "block",
                      padding: "0.5rem 1rem",
                      color: "#374151",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#eff6ff"
                      e.target.style.color = "#2563eb"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent"
                      e.target.style.color = "#374151"
                    }}
                  >
                    {feature.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Map Button */}
          <Link
            href="/map"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#2563eb",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#1d4ed8"
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#2563eb"
            }}
          >
            🗺️ View Map
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: "block",
            background: "none",
            border: "none",
            color: "#374151",
            cursor: "pointer",
            padding: "0.5rem",
          }}
          className="mobile-menu-btn"
        >
          {open ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            backgroundColor: "white",
            borderTop: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ padding: "1rem" }}>
            {mainLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "0.75rem 1rem",
                  color: "#374151",
                  textDecoration: "none",
                  borderRadius: "6px",
                  marginBottom: "0.25rem",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#eff6ff"
                  e.target.style.color = "#2563eb"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent"
                  e.target.style.color = "#374151"
                }}
              >
                {label}
              </Link>
            ))}

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: "1rem",
                marginTop: "1rem",
              }}
            >
              <div
                style={{
                  padding: "0.5rem 1rem",
                  fontWeight: "600",
                  color: "#111827",
                  fontSize: "14px",
                }}
              >
                Analytics
              </div>
              {analyticsLinks.map((feature) => (
                <Link
                  key={feature.href}
                  href={feature.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    padding: "0.5rem 1rem",
                    color: "#6b7280",
                    textDecoration: "none",
                    fontSize: "14px",
                    marginLeft: "1rem",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#eff6ff"
                    e.target.style.color = "#2563eb"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent"
                    e.target.style.color = "#6b7280"
                  }}
                >
                  {feature.label}
                </Link>
              ))}
            </div>

            <Link
              href="/map"
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                backgroundColor: "#2563eb",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "500",
                marginTop: "1rem",
              }}
            >
              🗺️ View Map
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  )
}
