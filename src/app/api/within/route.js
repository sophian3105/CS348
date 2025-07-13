// src/app/api/reportsWithin/route.js
export const runtime = 'nodejs'

import db from '../../../lib/db'
import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

// load SQL once at startup
const sqlPath = path.join(process.cwd(), 'src', 'sql', 'within.sql')
const fileSql = await fs.readFile(sqlPath, 'utf8')

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const lat      = parseFloat(searchParams.get('lat'))
  const lng      = parseFloat(searchParams.get('lng'))
  const radiusKm = parseFloat(searchParams.get('radiusKm'))

  // params line up with the two “(?)” blocks in your SQL
  const params = [lat, lng, lat, radiusKm, lat, lng, lat, radiusKm]

  try {
    const [rows] = await db.query(fileSql, params)
    return NextResponse.json({ rows })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
