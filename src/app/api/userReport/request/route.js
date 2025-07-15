import db from '../../../../lib/db'
import fs from 'fs/promises';
import path from 'path';
export const runtime = 'nodejs';

const sqlPath = path.join(process.cwd(), 'src', 'sql', 'userReport.sql');
const fileSql = await fs.readFile(sqlPath, 'utf8');

import { NextResponse } from 'next/server';


export async function GET(request){
    try {
    const [rows] = await db.query(fileSql);
    return NextResponse.json({ rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}