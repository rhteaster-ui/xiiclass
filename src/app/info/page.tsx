"use client";

import { useEffect, useState } from "react";
import {
  Buildings,
  MapPin,
  IdentificationCard,
  UserCheck,
  CalendarBlank,
  Code,
  Globe,
  ShieldCheck,
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { withBasePath } from "@/lib/paths";

interface SchoolData {
  name: string;
  npsn: string;
  address: string;
  headmaster: string;
  academic_year: string;
  semester: string;
}

export default function InfoPage() {
  const [school, setSchool] = useState<SchoolData | null>(null);

  useEffect(() => {
    fetch(withBasePath("/api/school"))
      .then((r) => r.json())
      .then((d) => setSchool(d.school))
      .catch(() => {});
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="animate-cascade">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
            Informasi Sekolah & Pengembang
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">
            Identitas lembaga resmi dan informasi pengembang sistem E-Rekap.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profil Sekolah */}
          <section
            aria-label="Profil Sekolah"
            className="lg:col-span-2 card-elevated rounded-3xl overflow-hidden animate-cascade"
            style={{ animationDelay: "50ms" }}
          >
            <div className="relative h-32 sm:h-40 overflow-hidden bg-[#0F5132]">
              <img
                src={withBasePath("/banner-madrasah.jpg")}
                alt="Banner Madrasah"
                className="h-full w-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A3622]/90 via-[#0F5132]/50 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-center gap-3.5 text-white">
                <img
                  src={withBasePath("/icon-madrasah.jpg")}
                  alt="Logo Sekolah"
                  width={52}
                  height={52}
                  className="h-13 w-13 rounded-xl border border-white/25 object-cover shadow-md"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100/85">
                    Profil Resmi Lembaga
                  </p>
                  <h2 className="text-lg sm:text-xl font-bold leading-tight">
                    {school?.name || "MA NU Islamiyah Asembagus"}
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 rounded-xl bg-[var(--surface-raised)] p-3.5 border border-[var(--border)]">
                <IdentificationCard size={20} weight="fill" className="text-[var(--accent)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--ink-muted)]">NPSN</p>
                  <p className="font-num text-sm font-bold text-[var(--ink)]">
                    {school?.npsn || "20584645"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[var(--surface-raised)] p-3.5 border border-[var(--border)]">
                <UserCheck size={20} weight="fill" className="text-[var(--accent)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--ink-muted)]">Kepala Madrasah</p>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {school?.headmaster || "Drs. H. Ahmad Fauzi, M.Pd.I"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[var(--surface-raised)] p-3.5 border border-[var(--border)]">
                <CalendarBlank size={20} weight="fill" className="text-[var(--accent)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--ink-muted)]">Tahun Ajaran</p>
                  <p className="font-num text-sm font-semibold text-[var(--ink)]">
                    {school ? `${school.academic_year} (${school.semester})` : "2026/2027 (Ganjil)"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[var(--surface-raised)] p-3.5 border border-[var(--border)]">
                <Buildings size={20} weight="fill" className="text-[var(--accent)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--ink-muted)]">Jenjang</p>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    Madrasah Aliyah (MA)
                  </p>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-start gap-3 rounded-xl bg-[var(--surface-raised)] p-3.5 border border-[var(--border)]">
                <MapPin size={20} weight="fill" className="text-[var(--accent)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--ink-muted)]">Alamat Sekolah</p>
                  <p className="text-sm text-[var(--ink)] leading-relaxed">
                    {school?.address ||
                      "Jl. Raya No. 170 Asembagus, Desa Trigonco, Kec. Asembagus, Kab. Situbondo, Jawa Timur"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Info Developer */}
          <section
            aria-label="Informasi Developer"
            className="card-elevated rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-5 animate-cascade"
            style={{ animationDelay: "100ms" }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Code size={20} weight="bold" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                    Pengembang Sistem
                  </p>
                  <h2 className="text-lg font-bold text-[var(--ink)]">RHMT OFC</h2>
                </div>
              </div>

              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                <strong>E-Rekap</strong> dirancang sebagai aplikasi web modern berstandar formal sekolah dengan arsitektur Next.js, database SQLite persisten, dan pemisahan hak akses publik vs Admin.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[var(--ink)]">
                  <ShieldCheck size={16} weight="fill" className="text-[var(--accent)]" />
                  <span>Mode Publik (Review) & Admin Terproteksi</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[var(--ink)]">
                  <Globe size={16} weight="fill" className="text-[var(--accent)]" />
                  <a
                    href="https://rhmt.biz.id"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--accent)] hover:underline underline-offset-4"
                  >
                    rhmt.biz.id
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--surface-muted)] p-3.5 text-xs text-[var(--ink-muted)] leading-relaxed">
              Versi Aplikasi <span className="font-num font-bold text-[var(--ink)]">1.0.0</span> • Siap cetak A4 Landscape & Ekspor Excel.
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
