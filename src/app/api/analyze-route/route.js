import { NextResponse } from "next/server";
import db from "../../../lib/db";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

// sql query to calculate the risk score
const sqlPath = path.join(process.cwd(), "src", "sql", "calculateRisk.sql");
const riskCalculationSql = await fs.readFile(sqlPath, "utf8");

export async function POST(request) {
    try {
        const { startAddress, endAddress } = await request.json();

        // check that we have a start and end address
        if (!startAddress || !endAddress) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const routeData = await getRoute(startAddress, endAddress);

        const segmentRisks = await analyzeSegments(routeData.coordinates);

        const overallRisk = calculateOverallRisk(segmentRisks);

        const recommendations = generateRecommendations(overallRisk, segmentRisks);

        return NextResponse.json({
            success: true,
            route: routeData,
            overallRisk,
            segmentRisks,
            recommendations,
            metadata: {
                analysisTime: new Date().toISOString(),
                dataSource: "Google Maps API + Toronto Assault Database",
                segmentsAnalyzed: segmentRisks.length,
            },
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to analyze route" },
            { status: 500 }
        );
    }
}

async function getRoute(startAddress, endAddress) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        throw new Error("Google Maps API key not configured");
    }

    // get directions 
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(startAddress)}&destination=${encodeURIComponent(endAddress)}&mode=walking&key=${apiKey}`;

    console.log("Making request to Google Maps API...");
    console.log("Start address:", startAddress);
    console.log("End address:", endAddress);

    const response = await fetch(url);
    const data = await response.json();

    console.log("Google Maps API response:", data);

    const route = data.routes[0];
    const leg = route.legs[0];

    // get coordinates
    const coordinates = [{ lat: leg.start_location.lat, lng: leg.start_location.lng }];

    leg.steps.forEach((step) => {
        coordinates.push({
            lat: step.end_location.lat,
            lng: step.end_location.lng,
        });
    });

    return {
        distance: leg.distance.text,
        duration: leg.duration.text,
        coordinates,
    };
}

async function analyzeSegments(coordinates) {
    // create 4 segments
    const segments = [];
    const segmentCount = 4;

    for (let i = 0; i < segmentCount; i++) {
        const startIdx = Math.floor(i * coordinates.length / segmentCount);
        const endIdx = Math.floor((i + 1) * coordinates.length / segmentCount);
        const endCoord = coordinates[endIdx - 1] || coordinates[coordinates.length - 1];

        segments.push({
            start: coordinates[startIdx],
            end: endCoord,
            midpoint: {
                lat: (coordinates[startIdx].lat + endCoord.lat) / 2,
                lng: (coordinates[startIdx].lng + endCoord.lng) / 2,
            },
        });
    }

    const segmentRisks = [];
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const risk = await calculateSegmentRisk(segment.midpoint);

        segmentRisks.push({
            start: segment.start,
            end: segment.end,
            midpoint: segment.midpoint,
            riskScore: risk.score,
            incidentCount: risk.count,
            riskLevel: risk.level,
            details: risk.details,
        });
    }

    return segmentRisks;
}

// calculating the risk for each segment using SQL query 
async function calculateSegmentRisk(point) {
    try {
        const [results] = await db.query(riskCalculationSql, [
            point.lat, point.lng, point.lat
        ]);

        const data = results[0] || {
            total_incidents: 0,
            risk_score: 0,
            risk_level: "LOW"
        };

        return {
            score: Math.round((data.risk_score || 0) * 100) / 100,
            count: data.total_incidents || 0,
            level: data.risk_level || "LOW",
            details: {
                avgDistance: Math.round((data.avg_distance || 0) * 1000) / 1000,
                assaultTypes: data.assault_types ? data.assault_types.split(",") : [],
                neighborhoods: data.neighborhoods ? data.neighborhoods.split(",") : [],
                premiseTypes: data.premise_types ? data.premise_types.split(",") : [],
                policeReports: data.police_reports || 0,
                userReports: data.user_reports || 0,
            },
        };
    } catch (error) {
        console.error("Database error:", error);
        return {
            score: 0,
            count: 0,
            level: "LOW",
            details: {
                avgDistance: 0,
                assaultTypes: [],
                neighborhoods: [],
                premiseTypes: [],
                policeReports: 0,
                userReports: 0,
            },
        };
    }
}

function calculateOverallRisk(segmentRisks) {
    if (segmentRisks.length === 0) return { score: 0, level: "LOW" };

    let totalScore = 0;
    for (let i = 0; i < segmentRisks.length; i++) {
        totalScore += segmentRisks[i].riskScore;
    }
    const avgScore = totalScore / segmentRisks.length;

    let maxScore = 0;
    for (let i = 0; i < segmentRisks.length; i++) {
        if (segmentRisks[i].riskScore > maxScore) {
            maxScore = segmentRisks[i].riskScore;
        }
    }

    let level;
    if (avgScore >= 7) {
        level = "HIGH";
    } else if (avgScore >= 3) {
        level = "MEDIUM";
    } else {
        level = "LOW";
    }

    return {
        score: Math.round(avgScore * 100) / 100,
        level,
        avgScore: Math.round(avgScore * 100) / 100,
        maxScore: Math.round(maxScore * 100) / 100,
    };
}

// give some recommendations just based off the danger level 
function generateRecommendations(overallRisk, segmentRisks) {
    const recommendations = [];

    if (overallRisk.level === "HIGH") {
        recommendations.push("⚠️ High risk route detected. Consider alternative routes if possible.");
    } else if (overallRisk.level === "MEDIUM") {
        recommendations.push("⚡ Moderate risk detected. Stay alert and consider well-lit, populated areas.");
    } else {
        recommendations.push("✅ This route shows relatively low risk based on historical data.");
    }

    // find most dangerous part
    if (segmentRisks.length > 0) {
        const highestRisk = segmentRisks.reduce((max, seg) => (seg.riskScore > max.riskScore ? seg : max));

        if (highestRisk.riskScore >= 7) {
            const area = highestRisk.details.neighborhoods[0] || "this area";
            recommendations.push(`🔴 Highest risk area detected around ${area}`);
        }
    }

    if (overallRisk.score >= 5) {
        recommendations.push("🚶‍♀️ Consider traveling with others when possible");
        recommendations.push("💡 Stick to well-lit main streets and avoid shortcuts through quiet areas");
    }

    return recommendations;
}

export async function GET() {
    return NextResponse.json({
        message: "Route Safety Analysis API",
        status: "Active",
        methods: ["POST"],
    });
}