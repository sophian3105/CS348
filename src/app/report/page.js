"use client"

import { useState, useRef, useEffect } from "react"
import { CalendarIcon, MapPin, AlertTriangle, CheckCircle, ChevronDown, Search, X } from "lucide-react"
import { neighbourhoods } from "./neighbourhoods"

function SearchSelect({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  displayKey = "name", 
  valueKey = "id",
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOption, setSelectedOption] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const option = options.find(opt => opt[valueKey].toString() === value)
    setSelectedOption(option || null)
  }, [value, options, valueKey])

  const filteredOptions = options.filter(option =>
    option[displayKey].toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (option) => {
    setSelectedOption(option)
    onChange(option[valueKey].toString())
    setSearchTerm("")
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleClear = (e) => {
    e.stopPropagation()
    setSelectedOption(null)
    onChange("")
    setSearchTerm("")
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            {selectedOption ? (
              <span className="truncate text-gray-900">{selectedOption[displayKey]}</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center ml-2">
            {selectedOption && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full mr-1"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-900"
                  onClick={() => handleSelect(option)}
                >
                  {option[displayKey]}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReportForm() {
  const [formData, setFormData] = useState({
    assault_type: "",
    premises_type_id: "",
    incident_date: "",
    incident_time: "",
    neighbourhood: "",
    latitude: "",
    longitude: "",
    description: "",
    reporter_email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [reportId, setReportId] = useState("")



  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/userReport/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit report')
      }

      setReportId(result.reportId)
      setSubmitSuccess(true)
      setTimeout(() => {
        setSubmitSuccess(false)
        setFormData({
          assault_type: "",
          premises_type_id: "",
          incident_date: "",
          incident_time: "",
          neighbourhood: "",
          latitude: "",
          longitude: "",
          description: "",
          reporter_email: "",
        })
      }, 3000)
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const assaultTypes = [
    { id: 1, label: "Administering Noxious Thing" },
    { id: 2, label: "Assault" },
    { id: 3, label: "Aggravated Assault" },
    { id: 4, label: "Assault Bodily Harm" },
    { id: 5, label: "Assault Peace Officer" },
    { id: 6, label: "Assault With Weapon" },
    { id: 7, label: "Discharge Firearm With Intent" },
    { id: 8, label: "Pointing A Firearm" },
    { id: 9, label: "Other" },
  ]

  const premisesTypes = [
    { id: 1, label: "Apartment" },
    { id: 2, label: "Outside" },
    { id: 3, label: "Commercial" },
    { id: 4, label: "House" },
    { id: 5, label: "Transit" },
    { id: 6, label: "Educational" },
    { id: 7, label: "Other" },
  ]

  const isFormValid = () => {
    return (
      formData.assault_type &&
      formData.premises_type_id &&
      formData.incident_date &&
      formData.incident_time &&
      formData.neighbourhood &&
      formData.latitude &&
      formData.longitude &&
      formData.description.trim().length > 10 &&
      formData.reporter_email
    )
  }

  if (submitSuccess) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-800 to-indigo-700 flex items-center justify-center py-12 px-2">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold text-green-800">Report Submitted Successfully</h3>
            <p className="text-gray-600">
              Thank you for your report. It has been recorded and will be reviewed by the appropriate authorities.
            </p>
            <p className="text-sm text-gray-500">
              Report ID: {reportId}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-800 to-indigo-700 flex items-center justify-center py-12 px-2">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl max-w-2xl w-full mx-auto">
        <div className="p-8 border-b border-gray-200">
          <h1 className="text-2xl font-bold flex items-center text-gray-900">
            <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
            Submit Assault Report
          </h1>
          <p className="text-gray-600 mt-2">
            Report an assault incident to help improve community safety. All reports are confidential and will be
            handled appropriately.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <div className="flex items-start">
              <div className="text-red-800 text-sm">
                <strong className="text-red-800">Emergency:</strong> If this is an emergency or the incident is currently happening, please call
                911 immediately.
              </div>
            </div>
          </div>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Assault Type */}
            <div className="space-y-2">
              <label htmlFor="assault_type" className="block text-sm font-semibold text-gray-800">
                Type of Assault <span className="text-red-500">*</span>
              </label>
              <SearchSelect
                options={assaultTypes}
                value={formData.assault_type}
                onChange={(value) => handleInputChange("assault_type", value)}
                placeholder="Select assault type"
                displayKey="label"
                valueKey="id"
                className="w-full"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="incident_date" className="block text-sm font-semibold text-gray-800">
                  Incident Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="incident_date"
                    type="date"
                    value={formData.incident_date}
                    onChange={(e) => handleInputChange("incident_date", e.target.value)}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    max={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="incident_time" className="block text-sm font-semibold text-gray-800">
                  Incident Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="incident_time"
                  type="time"
                  value={formData.incident_time}
                  onChange={(e) => handleInputChange("incident_time", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label htmlFor="neighbourhood" className="block text-sm font-semibold text-gray-800">
                Neighbourhood <span className="text-red-500">*</span>
              </label>
              <SearchSelect
                options={neighbourhoods}
                value={formData.neighbourhood}
                onChange={(value) => handleInputChange("neighbourhood", value)}
                placeholder="Select neighbourhood"
                displayKey="name"
                valueKey="id"
                className="w-full"
              />
            </div>

            {/* Premises Type */}
            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-semibold text-gray-800">
                Premises Type <span className="text-red-500">*</span>
              </label>
              <SearchSelect
                options={premisesTypes}
                value={formData.premises_type_id}
                onChange={(value) => handleInputChange("premises_type_id", value)}
                placeholder="Select premise type"
                displayKey="label"
                valueKey="id"
                className="w-full"
              />
            </div>


            {/* Coordinates (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="latitude" className="block text-sm font-semibold text-gray-800">
                  Latitude <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="43.6532"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="longitude" className="block text-sm font-semibold text-gray-800">
                  Longitude <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="-79.3832"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                placeholder="Please provide a detailed description of the incident. Include relevant details such as time, location specifics, and what happened."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900"
              />
              <p className="text-sm text-gray-500">
                {formData.description.length}/500 characters (minimum 10 required)
              </p>
            </div>

            {/* Reporter Email */}
            <div className="space-y-2">
              <label htmlFor="reporter_email" className="block text-sm font-semibold text-gray-800">
                Your Email <span className="text-red-500">*</span>
              </label>
              <input
                id="reporter_email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.reporter_email}
                onChange={(e) => handleInputChange("reporter_email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              <p className="text-sm text-gray-500">
                Your email will be kept confidential and used only for follow-up if necessary.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors shadow-sm mt-2"
            >
              {isSubmitting ? "Submitting Report..." : "Submit Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
