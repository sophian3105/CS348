"use client"

import Link from "next/link"
import { useState } from "react"
import { HiMenu, HiX } from "react-icons/hi"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const mainLinks = [
    { href: "/", label: "Home" },
    { href: "/reports", label: "Dashboard" },
    { href: "/search", label: "Report" },
  ]

  const analyticsLinks = [
    { href: "/analytics/sourcesort", label: "Reports By Source" },
    { href: "/analytics/keyword", label: "Keyword Search" },
    { href: "/analytics/time", label: "View Recent" },
    { href: "/analytics/assaultType", label: "Assault Types" },
    { href: "/analytics/worst", label: "Dangerous Neigbourhoods" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-999">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white text-lg font-bold">
            ⚠
          </div>
          <span className="text-xl font-bold text-blue-600">AssaultTracker</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {mainLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-gray-700 font-medium py-2 px-3 rounded-md transition-colors duration-200 hover:text-blue-600 hover:bg-blue-50"
            >
              {label}
            </Link>
          ))}

          {/* Analytics Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 text-gray-700 font-medium py-2 px-3 rounded-md transition-colors duration-200 hover:text-blue-600 hover:bg-blue-50 focus:outline-none"
            >
              📊 Analytics <span className="text-sm">▼</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-6 w-60 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 pb-2 border-b border-gray-200 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 m-0">SQL Analytics</h3>
                </div>
                {analyticsLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-gray-700 text-sm transition-colors duration-200 hover:text-blue-600 hover:bg-blue-50"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* View Map Button */}
          <Link
            href="/map"
            className="flex items-center gap-1 bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 hover:bg-blue-700"
          >
            🗺️ View Map
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-gray-700 focus:outline-none"
        >
          {open ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="bg-white border-t border-gray-200 shadow-md md:hidden">
          <div className="px-4 py-2">
            {mainLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block text-gray-700 py-2 px-3 rounded-md mb-1 transition-colors duration-200 hover:text-blue-600 hover:bg-blue-50"
              >
                {label}
              </Link>
            ))}

            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="px-3 text-sm font-semibold text-gray-900 mb-1">Analytics</div>
              {analyticsLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block text-gray-500 text-sm py-2 pl-5 px-3 mb-1 transition-colors duration-200 hover:text-blue-600 hover:bg-blue-50"
                >
                  {label}
                </Link>
              ))}
            </div>

            <Link
              href="/map"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1 mt-2 py-2 px-4 bg-blue-600 text-white font-medium rounded-md transition-colors duration-200 hover:bg-blue-700"
            >
              🗺️ View Map
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
