import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || new Date().toISOString().slice(0, 7);
    const classIdParam = searchParams.get("classId");

    const school = db.prepare("SELECT * FROM schools WHERE id = 1").get();
    const classes = db
      .prepare(`
        SELECT c.id, c.name, c.homeroom_teacher, COUNT(s.id) as student_count
        FROM classes c
        LEFT JOIN students s ON s.class_id = c.id
        GROUP BY c.id
        ORDER BY c.name ASC
      `)
      .all() as Array<{
        id: number;
        name: string;
        homeroom_teacher: string;
        student_count: number;
      }>;

    const classFilter = classIdParam && classIdParam !== "all" ? Number(classIdParam) : null;

    const summaryQuery = classFilter
      ? `
        SELECT
          COUNT(s.id) as total_students,
          COALESCE(SUM(r.hadir), 0) as total_hadir,
          COALESCE(SUM(r.sakit), 0) as total_sakit,
          COALESCE(SUM(r.izin), 0) as total_izin,
          COALESCE(SUM(r.alpha), 0) as total_alpha
        FROM students s
        LEFT JOIN rekap_records r ON r.student_id = s.id AND r.period = ?
        WHERE s.class_id = ?
      `
      : `
        SELECT
          COUNT(s.id) as total_students,
          COALESCE(SUM(r.hadir), 0) as total_hadir,
          COALESCE(SUM(r.sakit), 0) as total_sakit,
          COALESCE(SUM(r.izin), 0) as total_izin,
          COALESCE(SUM(r.alpha), 0) as total_alpha
        FROM students s
        LEFT JOIN rekap_records r ON r.student_id = s.id AND r.period = ?
      `;

    const summary = (
      classFilter
        ? db.prepare(summaryQuery).get(period, classFilter)
        : db.prepare(summaryQuery).get(period)
    ) as {
      total_students: number;
      total_hadir: number;
      total_sakit: number;
      total_izin: number;
      total_alpha: number;
    };

    const classBreakdown = db
      .prepare(`
        SELECT
          c.id,
          c.name,
          c.homeroom_teacher,
          COUNT(s.id) as total_students,
          COALESCE(SUM(r.hadir), 0) as hadir,
          COALESCE(SUM(r.sakit), 0) as sakit,
          COALESCE(SUM(r.izin), 0) as izin,
          COALESCE(SUM(r.alpha), 0) as alpha
        FROM classes c
        LEFT JOIN students s ON s.class_id = c.id
        LEFT JOIN rekap_records r ON r.student_id = s.id AND r.period = ?
        GROUP BY c.id
        ORDER BY c.name ASC
      `)
      .all(period);

    const totalSessions =
      summary.total_hadir + summary.total_sakit + summary.total_izin + summary.total_alpha;
    const attendanceRate =
      totalSessions > 0 ? Math.round((summary.total_hadir / totalSessions) * 1000) / 10 : 0;

    return NextResponse.json({
      period,
      school,
      classes,
      summary: {
        ...summary,
        attendance_rate: attendanceRate,
      },
      classBreakdown,
    });
  } catch {
    return NextResponse.json({ error: "Gagal memuat data dashboard." }, { status: 500 });
  }
}
