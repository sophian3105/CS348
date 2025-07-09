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
        const { address } = await request.json();

        const location = await getLocation(address);
        const riskRating = await getRisk(location);

        return NextResponse.json({
            success: true,
            route: location, riskRating,
            metadata: {
                analysisTime: new Date().toISOString(),
                dataSource: "assault database",
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

async function getLocation(address) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        throw new Error("Check ");
    }

    // get location from the users 
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    const location = data.results[0].geometry.location;

    return {
        lat: location.lat,
        lng: location.lng,
    };
}

async function getRisk(point) {
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
}

