import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const db = getDb();
  const school = db.prepare("SELECT * FROM schools WHERE id = 1").get();
  return NextResponse.json({ school });
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses Admin diperlukan." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const db = getDb();
    db.prepare(`
      UPDATE schools
      SET name = ?, npsn = ?, address = ?, headmaster = ?, academic_year = ?, semester = ?
      WHERE id = 1
    `).run(
      String(body.name || "").trim(),
      String(body.npsn || "").trim(),
      String(body.address || "").trim(),
      String(body.headmaster || "").trim(),
      String(body.academic_year || "").trim(),
      String(body.semester || "").trim()
    );

    const school = db.prepare("SELECT * FROM schools WHERE id = 1").get();
    return NextResponse.json({ ok: true, school });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui profil sekolah." }, { status: 500 });
  }
}
