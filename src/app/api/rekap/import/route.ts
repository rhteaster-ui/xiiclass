import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface ImportRow {
  nis: string;
  name: string;
  class_name: string;
  gender: "L" | "P";
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  note: string;
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Login Admin diperlukan untuk mengimpor backup." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const period = String(body.period || new Date().toISOString().slice(0, 7)).trim();
    const rows = body.rows as ImportRow[];

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "File Excel kosong atau format kolom tidak sesuai." },
        { status: 400 }
      );
    }

    const db = getDb();

    const findClass = db.prepare("SELECT id FROM classes WHERE name = ?");
    const insertClass = db.prepare(
      "INSERT INTO classes (name, homeroom_teacher) VALUES (?, '-')"
    );
    const findStudent = db.prepare(
      "SELECT id FROM students WHERE nis = ? AND class_id = ?"
    );
    const insertStudent = db.prepare(
      "INSERT INTO students (class_id, nis, name, gender) VALUES (?, ?, ?, ?)"
    );
    const updateStudent = db.prepare(
      "UPDATE students SET name = ?, gender = ? WHERE id = ?"
    );
    const upsertRekap = db.prepare(`
      INSERT INTO rekap_records (student_id, period, hadir, sakit, izin, alpha, note, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(student_id, period) DO UPDATE SET
        hadir = excluded.hadir,
        sakit = excluded.sakit,
        izin = excluded.izin,
        alpha = excluded.alpha,
        note = excluded.note,
        updated_at = CURRENT_TIMESTAMP
    `);

    let importedCount = 0;
    const tx = db.transaction(() => {
      for (const r of rows) {
        const nis = String(r.nis || "").trim();
        const name = String(r.name || "").trim();
        const className = String(r.class_name || "").trim() || "Umum";
        if (!nis || !name) continue;

        let cls = findClass.get(className) as { id: number } | undefined;
        if (!cls) {
          const res = insertClass.run(className);
          cls = { id: Number(res.lastInsertRowid) };
        }

        const gender = String(r.gender || "L").toUpperCase() === "P" ? "P" : "L";
        let st = findStudent.get(nis, cls.id) as { id: number } | undefined;
        if (!st) {
          const res = insertStudent.run(cls.id, nis, name, gender);
          st = { id: Number(res.lastInsertRowid) };
        } else {
          updateStudent.run(name, gender, st.id);
        }

        upsertRekap.run(
          st.id,
          period,
          Math.max(0, Number(r.hadir) || 0),
          Math.max(0, Number(r.sakit) || 0),
          Math.max(0, Number(r.izin) || 0),
          Math.max(0, Number(r.alpha) || 0),
          String(r.note || "").trim()
        );
        importedCount++;
      }
    });

    tx();
    return NextResponse.json({ ok: true, importedCount });
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses impor backup Excel." },
      { status: 500 }
    );
  }
}
