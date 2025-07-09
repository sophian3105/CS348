"use client";

import React, { useState } from "react";
import { MapPin, AlertTriangle, Shield } from "lucide-react";

export default function RouteSafetyPage() {
    const [address, setAddress] = useState("");
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!address) return;
        
        setLoading(true);
        setAnalysis(null);

        try {
            const response = await fetch("/api/analyze-route", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address }),
            });

            const data = await response.json();
            if (data.success) setAnalysis(data);
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case "HIGH": return "bg-red-100 text-red-700 border-red-300";
            case "MEDIUM": return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "LOW": return "bg-green-100 text-green-700 border-green-300";
            default: return "bg-gray-100 text-gray-700 border-gray-300";
        }
    };

    const getRiskIcon = (level) => {
        return level === "LOW" ? <Shield className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 to-indigo-700">
                <div className="text-white text-xl">Analyzing location...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-800 to-indigo-700 py-20 px-4">
            <div className="max-w-4xl mx-auto mt-16">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-6">
                        Toronto Location Safety Analyzer
                    </h1>
                    <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                        Explore location safety across Toronto, view risk assessments on specific addresses, and help keep our community safe by checking incident data.
                    </p>
                </div>

                {/* Input Form */}
                <div className="bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-xl mb-8">
                    <div className="mb-6">
                        <label className="block text-lg font-semibold text-gray-700 mb-4">
                            <MapPin className="inline h-5 w-5 mr-3" />
                            Address
                        </label>
                    </div>
                    <div className="flex gap-6">
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500 text-gray-900 shadow-sm"
                            placeholder="e.g., Union Station, Toronto, ON"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!address}
                            className="px-10 py-4 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition shadow-lg"
                        >
                            Analyze
                        </button>
                    </div>
                </div>

                {/* Results */}
                {analysis && (
                    <div className="bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-xl">
                        {/* Risk Level */}
                        <div className="text-center mb-8">
                            <div className={`inline-flex items-center px-6 py-3 rounded-xl border-2 ${getRiskColor(analysis.riskRating.level)} mb-4`}>
                                {getRiskIcon(analysis.riskRating.level)}
                                <span className="ml-3 font-bold text-lg">
                                    {analysis.riskRating.level} RISK
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                                {analysis.riskRating.score}/10
                            </div>
                            <div className="text-gray-500">Risk Score</div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {analysis.riskRating.count}
                                </div>
                                <div className="text-sm text-gray-600">Total Incidents</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {analysis.riskRating.details.policeReports}
                                </div>
                                <div className="text-sm text-gray-600">Police Reports</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {analysis.riskRating.details.userReports}
                                </div>
                                <div className="text-sm text-gray-600">User Reports</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {analysis.riskRating.details.avgDistance}km
                                </div>
                                <div className="text-sm text-gray-600">Avg Distance</div>
                            </div>
                        </div>

                        {/* Details */}
                        {analysis.riskRating.details.assaultTypes.length > 0 && (
                            <div className="mb-6">
                                <span className="text-gray-700 font-semibold mb-2 block">
                                    Assault Types:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.riskRating.details.assaultTypes.map((type, i) => (
                                        <span key={i} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.riskRating.details.neighborhoods.length > 0 && (
                            <div className="mb-6">
                                <span className="text-gray-700 font-semibold mb-2 block">
                                    Neighborhoods:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.riskRating.details.neighborhoods.map((area, i) => (
                                        <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.riskRating.details.premiseTypes.length > 0 && (
                            <div className="mb-6">
                                <span className="text-gray-700 font-semibold mb-2 block">
                                    Premise Types:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.riskRating.details.premiseTypes.map((type, i) => (
                                        <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location Info */}
                        <div className="border-t pt-6">
                            <div className="text-center text-gray-600 text-sm">
                                <div>
                                    <span className="font-semibold">Location:</span> {analysis.route.lat.toFixed(4)}, {analysis.route.lng.toFixed(4)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}