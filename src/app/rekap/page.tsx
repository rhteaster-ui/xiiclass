"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import {
  MagnifyingGlass,
  Printer,
  FileXls,
  ArrowsDownUp,
  WarningCircle,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { withBasePath } from "@/lib/paths";

interface RekapRow {
  student_id: number;
  nis: string;
  name: string;
  gender: "L" | "P";
  class_id: number;
  class_name: string;
  homeroom_teacher: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  total: number;
  percentage: number;
  note: string;
}

interface SchoolInfo {
  name: string;
  npsn: string;
  address: string;
  academic_year: string;
  semester: string;
}

interface ClassInfo {
  id: number;
  name: string;
  homeroom_teacher: string;
}

function RekapContent() {
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState(
    () => searchParams.get("period") || new Date().toISOString().slice(0, 7)
  );
  const [classId, setClassId] = useState(() => searchParams.get("classId") || "all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "percentage">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [rows, setRows] = useState<RekapRow[]>([]);
  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeta = useCallback(async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        fetch(withBasePath("/api/school")),
        fetch(withBasePath("/api/classes")),
      ]);
      if (sRes.ok) {
        const sd = await sRes.json();
        setSchool(sd.school);
      }
      if (cRes.ok) {
        const cd = await cRes.json();
        setClasses(cd.classes || []);
      }
    } catch {
      // handled in main table fetch
    }
  }, []);

  const fetchRekap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = withBasePath(
        `/api/rekap?period=${encodeURIComponent(period)}&classId=${encodeURIComponent(classId)}&q=${encodeURIComponent(query)}`
      );
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal mengambil data rekap.");
      const data = await res.json();
      setRows(data.rows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }, [period, classId, query]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchRekap();
    }, 150);
    return () => clearTimeout(t);
  }, [fetchRekap]);

  const sortedRows = [...rows].sort((a, b) => {
    if (sortBy === "percentage") {
      return sortDir === "asc" ? a.percentage - b.percentage : b.percentage - a.percentage;
    }
    return sortDir === "asc"
      ? a.name.localeCompare(b.name, "id")
      : b.name.localeCompare(a.name, "id");
  });

  const handleSort = (col: "name" | "percentage") => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir(col === "percentage" ? "desc" : "asc");
    }
  };

  const handleExportExcel = () => {
    const exportData = sortedRows.map((r, idx) => ({
      No: idx + 1,
      "NIS/NISN": r.nis,
      "Nama Siswa": r.name,
      Kelas: r.class_name,
      "L/P": r.gender,
      "Hadir (H)": r.hadir,
      "Sakit (S)": r.sakit,
      "Izin (I)": r.izin,
      "Alpha (A)": r.alpha,
      "Persentase (%)": `${r.percentage}%`,
      Keterangan: r.note || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Kehadiran");
    const clsName =
      classId === "all"
        ? "Semua-Kelas"
        : classes.find((c) => String(c.id) === classId)?.name.replace(/\s+/g, "-") || "Kelas";
    XLSX.writeFile(wb, `Rekap-Kehadiran-${clsName}-${period}.xlsx`);
  };

  const selectedClassName =
    classId === "all"
      ? "Semua Kelas"
      : classes.find((c) => String(c.id) === classId)?.name || "-";

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Formal Kop Surat (Visible in Print Mode Only — No Signature Block) */}
        <div className="hidden print-only mb-4 border-b-2 border-black pb-3 text-center">
          <p className="text-base font-bold uppercase tracking-wide">
            {school?.name || "MA NU Islamiyah Asembagus"}
          </p>
          <p className="text-xs">
            NPSN: {school?.npsn || "20584645"} • {school?.address || ""}
          </p>
          <p className="mt-2 text-sm font-bold uppercase">
            REKAPITULASI KEHADIRAN SISWA ({selectedClassName}) — PERIODE {period}
          </p>
          <p className="text-xs">
            Tahun Ajaran {school?.academic_year || "2026/2027"} • Semester {school?.semester || "Ganjil"}
          </p>
        </div>

        {/* Screen Header & Action Controls */}
        <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-cascade">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
              Tabel Rekapitulasi Kehadiran
            </h1>
            <p className="text-sm text-[var(--ink-muted)]">
              Tampilan formal siap cetak dan ekspor spreadsheet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={sortedRows.length === 0}
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-xs hover:bg-[var(--surface-muted)] disabled:opacity-50"
            >
              <FileXls size={18} weight="bold" className="text-[var(--accent)]" />
              <span>Ekspor Excel</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={sortedRows.length === 0}
              className="btn-tactile inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              <Printer size={18} weight="bold" />
              <span>Cetak A4</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <section
          aria-label="Filter Rekap"
          className="no-print grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-[var(--surface)] p-4 border border-[var(--border)] shadow-[var(--shadow-tactile)] animate-cascade"
          style={{ animationDelay: "40ms" }}
        >
          <div className="relative">
            <MagnifyingGlass
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] pointer-events-none"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau NIS/NISN..."
              aria-label="Cari nama atau NIS"
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] pl-10 pr-3 py-2 text-sm text-[var(--ink)] min-h-[42px]"
            />
          </div>

          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            aria-label="Pilih Kelas"
            className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3.5 py-2 text-sm font-semibold text-[var(--ink)] min-h-[42px]"
          >
            <option value="all">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={String(cls.id)}>
                {cls.name}
              </option>
            ))}
          </select>

          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            aria-label="Pilih Periode Bulan"
            className="font-num rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3.5 py-2 text-sm font-semibold text-[var(--ink)] min-h-[42px]"
          />
        </section>

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="no-print flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
          >
            <div className="flex items-center gap-2">
              <WarningCircle size={18} weight="fill" className="text-red-700" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchRekap}
              className="inline-flex items-center gap-1 rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white"
            >
              <ArrowClockwise size={14} />
              <span>Muat Ulang</span>
            </button>
          </div>
        )}

        {/* Formal Table */}
        <section
          aria-label="Daftar Rekapitulasi Siswa"
          className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-tactile)] overflow-hidden animate-cascade"
          style={{ animationDelay: "80ms" }}
        >
          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-[var(--surface-muted)]" />
              ))}
            </div>
          ) : sortedRows.length === 0 ? (
            <div className="p-10 text-center space-y-1">
              <p className="text-sm font-semibold text-[var(--ink)]">
                Data siswa tidak ditemukan
              </p>
              <p className="text-xs text-[var(--ink-muted)]">
                Coba ubah kata kunci pencarian atau filter kelas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="print-table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-raised)] border-b border-[var(--border)] text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                    <th className="py-3 px-3.5 text-right w-12">No</th>
                    <th className="py-3 px-3.5">NIS/NISN</th>
                    <th
                      className="py-3 px-3.5"
                      aria-sort={
                        sortBy === "name"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handleSort("name")}
                        className="inline-flex items-center gap-1 hover:text-[var(--ink)]"
                      >
                        <span>Nama Siswa</span>
                        <ArrowsDownUp size={13} />
                      </button>
                    </th>
                    <th className="py-3 px-3">Kelas</th>
                    <th className="py-3 px-2.5 text-center">L/P</th>
                    <th className="py-3 px-3 text-right">H</th>
                    <th className="py-3 px-3 text-right">S</th>
                    <th className="py-3 px-3 text-right">I</th>
                    <th className="py-3 px-3 text-right">A</th>
                    <th
                      className="py-3 px-3.5 text-right"
                      aria-sort={
                        sortBy === "percentage"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handleSort("percentage")}
                        className="inline-flex items-center justify-end gap-1 hover:text-[var(--ink)] ml-auto"
                      >
                        <span>%</span>
                        <ArrowsDownUp size={13} />
                      </button>
                    </th>
                    <th className="py-3 px-4">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-sm">
                  {sortedRows.map((row, index) => (
                    <tr
                      key={row.student_id}
                      className="hover:bg-[var(--surface-raised)] transition-colors"
                    >
                      <td className="py-3 px-3.5 text-right font-num text-[var(--ink-muted)]">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3.5 font-num text-xs font-medium text-[var(--ink-muted)]">
                        {row.nis}
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-[var(--ink)] whitespace-nowrap">
                        {row.name}
                      </td>
                      <td className="py-3 px-3 text-xs font-semibold text-[var(--ink-muted)] whitespace-nowrap">
                        {row.class_name}
                      </td>
                      <td className="py-3 px-2.5 text-center font-num text-xs font-semibold">
                        {row.gender}
                      </td>
                      <td className="py-3 px-3 text-right font-num font-bold text-[var(--status-hadir-fg)]">
                        {row.hadir}
                      </td>
                      <td className="py-3 px-3 text-right font-num font-semibold text-[var(--status-sakit-fg)]">
                        {row.sakit}
                      </td>
                      <td className="py-3 px-3 text-right font-num font-semibold text-[var(--status-izin-fg)]">
                        {row.izin}
                      </td>
                      <td className="py-3 px-3 text-right font-num font-semibold text-[var(--status-alpha-fg)]">
                        {row.alpha}
                      </td>
                      <td className="py-3 px-3.5 text-right font-num font-bold text-[var(--ink)]">
                        {row.percentage}%
                      </td>
                      <td className="py-3 px-4 text-xs text-[var(--ink-muted)] max-w-[200px] truncate">
                        {row.note || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

export default function RekapPage() {
  return (
    <Suspense fallback={<AppShell><div className="p-8 text-sm">Memuat rekap...</div></AppShell>}>
      <RekapContent />
    </Suspense>
  );
}
