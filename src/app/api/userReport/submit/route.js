import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getNeighbourhoodById } from '../../../report/neighbourhoods';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      assault_type,
      premises_type_id,
      incident_date,
      incident_time,
      neighbourhood,
      latitude,
      longitude,
      description,
      reporter_email
    } = body;

    if (!assault_type || !incident_date || !incident_time || !neighbourhood || !latitude || !longitude || !description || !reporter_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const neighbourhoodData = getNeighbourhoodById(neighbourhood);
    if (!neighbourhoodData) {
      return NextResponse.json(
        { error: 'Invalid neighbourhood selected' },
        { status: 400 }
      );
    }
    const neighbourhoodName = neighbourhoodData.name;

    const assaultTypeMap = {
      1: "Physical Assault",
      2: "Verbal Harassment", 
      3: "Theft",
      4: "Robbery",
      5: "Assault With Weapon",
      6: "Sexual Assault",
      7: "Other"
    };
    const assaultTypeName = assaultTypeMap[assault_type] || assault_type;

    const premiseTypeMap = {
      1: 'Apartment',
      2: 'Outside',
      3: 'Commercial',
      4: 'House',
      5: 'Transit',
      6: 'Educational',
      7: 'Other'
    };
    const premiseTypeName = premiseTypeMap[premises_type_id] || 'Other';

    const reportId = uuidv4();
    const userId = uuidv4();

    const occurrenceDateTime = `${incident_date} ${incident_time}:00`;

    // Insert into users table 
    const userInsertQuery = `
      INSERT INTO users (user_id, email, full_name, created_at, birth_date)
      VALUES (?, ?, ?, CURDATE(), NULL)
    `;
    
    await db.query(userInsertQuery, [userId, reporter_email, 'Anonymous User']);

    // Insert into userReports table
    const reportInsertQuery = `
      INSERT INTO userReports (r_id, assault_type, occurence_date, reported_date, user_id)
      VALUES (?, ?, ?, CURDATE(), ?)
    `;
    
    await db.query(reportInsertQuery, [reportId, assaultTypeName, occurrenceDateTime, userId]);

    // Insert into userLocation table
    const locationInsertQuery = `
      INSERT INTO userLocation (r_id, longitude, latitude, neighborhood, location_type, premise_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.query(locationInsertQuery, [
      reportId,
      longitude,
      latitude,
      neighbourhoodName,
      premiseTypeName,
      premiseTypeName
    ]);

    return NextResponse.json({ 
      success: true, 
      reportId: reportId,
      message: 'Report submitted successfully' 
    });

  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report', details: error.message },
      { status: 500 }
    );
  }
} 