"use client";

import React, { useState } from "react";
import { MapPin, AlertTriangle, Shield, Navigation, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Footer from "../../components/footer";

export default function RouteSafetyPage() {
    const [formData, setFormData] = useState({
        startAddress: "",
        endAddress: "",
    });
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        console.log("Button clicked!", formData);
        setLoading(true);
        setError("");
        setAnalysis(null);

        try {
            console.log("Making API request...");
            const response = await fetch("/api/analyze-route", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            console.log("Response received:", response.status);
            const data = await response.json();
            console.log("Response data:", data);

            if (data.success) {
                setAnalysis(data);
                console.log("Analysis set successfully");
            } else {
                setError(data.error || "Failed to analyze route");
                console.log("Error from API:", data.error);
            }
        } catch (err) {
            console.error("Network error:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
            console.log("Loading finished");
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case "HIGH":
                return "text-red-600 bg-red-50 border-red-200";
            case "MEDIUM":
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "LOW":
                return "text-green-600 bg-green-50 border-green-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    const getRiskIcon = (level) => {
        switch (level) {
            case "HIGH":
                return <AlertTriangle className="h-5 w-5" />;
            case "MEDIUM":
                return <AlertTriangle className="h-5 w-5" />;
            case "LOW":
                return <Shield className="h-5 w-5" />;
            default:
                return <Shield className="h-5 w-5" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="text-gray-600">Analyzing route…</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-800 to-indigo-700 text-white text-center py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center mb-6">
                        <Link
                            href="/"
                            className="flex items-center text-white/80 hover:text-white mr-4"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back to Home
                        </Link>
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Route Safety Analyzer
                    </h1>
                    <p className="text-xl mb-10 opacity-90 mx-auto max-w-2xl leading-relaxed">
                        Analyze the safety of your planned route based on historical assault
                        data in Toronto. Get real-time risk assessments and safety
                        recommendations.
                    </p>
                </div>
            </section>

            {/* Input Form Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Plan Your Route
                        </h2>
                        <p className="text-xl text-gray-500">
                            Enter your starting point and destination to get a safety analysis
                        </p>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-xl shadow-md max-w-2xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    <MapPin className="inline h-4 w-4 mr-2" />
                                    Starting Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.startAddress}
                                    onChange={(e) =>
                                        setFormData({ ...formData, startAddress: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="e.g., Union Station, Toronto, ON"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    <Navigation className="inline h-4 w-4 mr-2" />
                                    Destination Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.endAddress}
                                    onChange={(e) =>
                                        setFormData({ ...formData, endAddress: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="e.g., CN Tower, Toronto, ON"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={
                                loading || !formData.startAddress || !formData.endAddress
                            }
                            className="mt-8 w-full bg-blue-800 text-white font-semibold text-lg rounded-lg px-8 py-4 transition hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? "Analyzing Route..." : "Analyze Route Safety"}
                        </button>
                    </div>
                </div>
            </section>

            {/* Error Display */}
            {error && (
                <section className="py-8 px-4 bg-red-100">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-600">
                            <div className="flex items-center">
                                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                                <span className="text-red-700 font-semibold">{error}</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Analysis Results */}
            {analysis && (
                <>
                    {/* Overall Risk Summary */}
                    <section className="py-16 px-4 bg-gray-50">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                    Route Safety Assessment
                                </h2>
                                <p className="text-xl text-gray-500">
                                    Based on historical assault data and route analysis
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-xl shadow-md">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                    <div className="text-center">
                                        <div
                                            className={`inline-flex items-center px-6 py-4 rounded-xl border-2 ${getRiskColor(
                                                analysis.overallRisk.level
                                            )} mb-6`}
                                        >
                                            {getRiskIcon(analysis.overallRisk.level)}
                                            <span className="ml-3 font-bold text-xl">
                                                {analysis.overallRisk.level} RISK
                                            </span>
                                        </div>
                                        <div className="text-4xl font-bold text-gray-900 mb-2">
                                            {analysis.overallRisk.score}/10
                                        </div>
                                        <div className="text-gray-500">Overall Risk Score</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-6 rounded-lg text-center">
                                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                                {analysis.overallRisk.avgScore}
                                            </div>
                                            <div className="text-sm text-gray-600">Average Risk</div>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-lg text-center">
                                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                                {analysis.overallRisk.maxScore}
                                            </div>
                                            <div className="text-sm text-gray-600">Peak Risk</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 text-xl mb-4">
                                        🛡️ Safety Recommendations
                                    </h3>
                                    {analysis.recommendations.map((rec, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg"
                                        >
                                            <div className="text-blue-600 mt-1 text-lg">
                                                {rec.includes("⚠️")
                                                    ? "⚠️"
                                                    : rec.includes("⚡")
                                                        ? "⚡"
                                                        : rec.includes("🔴")
                                                            ? "🔴"
                                                            : "✅"}
                                            </div>
                                            <span className="text-blue-800 leading-relaxed">
                                                {rec
                                                    .replace(/[⚠️⚡✅🔴🚶‍♀️💡]/g, "")
                                                    .trim()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Route Details */}
                    <section className="py-16 px-4 bg-white">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                    Route Information
                                </h2>
                                <p className="text-xl text-gray-500">
                                    Distance and duration details
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-gray-50 p-8 rounded-xl text-center transition transform hover:-translate-y-1 hover:shadow-lg">
                                    <div className="text-4xl mb-4">📍</div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        Total Distance
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {analysis.route.distance}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-8 rounded-xl text-center transition transform hover:-translate-y-1 hover:shadow-lg">
                                    <div className="text-4xl mb-4">⏱️</div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        Estimated Duration
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {analysis.route.duration}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Detailed Segment Analysis */}
                    <section className="py-16 px-4 bg-gray-50">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                    Detailed Segment Analysis
                                </h2>
                                <p className="text-xl text-gray-500">
                                    Risk breakdown for each part of your route
                                </p>
                            </div>
                            <div className="space-y-6">
                                {analysis.segmentRisks.map((segment, index) => (
                                    <div
                                        key={index}
                                        className="bg-white p-8 rounded-xl shadow-md border-l-4 border-gray-300 transition transform hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                Segment {index + 1}
                                            </h3>
                                            <div
                                                className={`px-4 py-2 rounded-full border-2 ${getRiskColor(
                                                    segment.riskLevel
                                                )}`}
                                            >
                                                <span className="font-semibold">
                                                    {segment.riskLevel} ({segment.riskScore}/10)
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-gray-600 mb-6">
                                            <span className="font-semibold">Route:</span> (
                                            {segment.start.lat.toFixed(4)},{" "}
                                            {segment.start.lng.toFixed(4)}) → (
                                            {segment.end.lat.toFixed(4)},{" "}
                                            {segment.end.lng.toFixed(4)})
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                                <div className="text-xl font-bold text-gray-900 mb-1">
                                                    {segment.incidentCount}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Total Incidents
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                                <div className="text-xl font-bold text-gray-900 mb-1">
                                                    {segment.details.policeReports}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Police Reports
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                                <div className="text-xl font-bold text-gray-900 mb-1">
                                                    {segment.details.userReports}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    User Reports
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                                <div className="text-xl font-bold text-gray-900 mb-1">
                                                    {segment.details.avgDistance}km
                                                </div>
                                                <div className="text-sm text-gray-600">Avg Distance</div>
                                            </div>
                                        </div>

                                        {segment.details.assaultTypes.length > 0 && (
                                            <div className="mb-4">
                                                <span className="text-gray-700 font-semibold mb-2 block">
                                                    Assault Types:
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {segment.details.assaultTypes.map((type, i) => (
                                                        <span
                                                            key={i}
                                                            className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold"
                                                        >
                                                            {type}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {segment.details.neighborhoods &&
                                            segment.details.neighborhoods.length > 0 && (
                                                <div className="mb-4">
                                                    <span className="text-gray-700 font-semibold mb-2 block">
                                                        Neighborhoods:
                                                    </span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {segment.details.neighborhoods.map(
                                                            (neighborhood, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold"
                                                                >
                                                                    {neighborhood}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* CTA Section */}
            <section className="py-16 px-4 bg-gradient-to-br from-blue-800 to-indigo-700 text-white text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold mb-4">
                        Explore More Safety Features
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Discover additional tools to help keep Toronto safe
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/map"
                            className="bg-white text-blue-800 font-semibold text-lg rounded-lg px-8 py-4 transition hover:bg-gray-100"
                        >
                            View Interactive Map
                        </Link>
                        <Link
                            href="/report"
                            className="border-2 border-white text-white font-semibold text-lg rounded-lg px-8 py-4 transition hover:bg-white hover:text-blue-800"
                        >
                            Report an Incident
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}