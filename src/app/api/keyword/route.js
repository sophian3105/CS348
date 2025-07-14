import db from "../../../lib/db";
import fs from "fs/promises";
import path from "path";
export const runtime = "nodejs";

const sqlPath = path.join(process.cwd(), "src", "sql", "keyword.sql");
const fileSql = await fs.readFile(sqlPath, "utf8");

import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const raw = searchParams.get("keyword") ?? "";
  const pattern = `%${raw.toLowerCase()}%`;
  const sql = fileSql.replace(/:keyword/g, `'${pattern}'`);
  try {
    const [rows] = await db.query(sql);
    return NextResponse.json({ rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
