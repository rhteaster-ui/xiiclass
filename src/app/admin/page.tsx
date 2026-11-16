"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShieldCheck,
  SignOut,
  FloppyDisk,
  Plus,
  Trash,
  CheckCircle,
  WarningCircle,
  LockKey,
  Users,
  Buildings,
  Table,
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { withBasePath } from "@/lib/paths";

interface RekapEntry {
  student_id: number;
  nis: string;
  name: string;
  gender: "L" | "P";
  class_id: number;
  class_name: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  note: string;
}

interface ClassItem {
  id: number;
  name: string;
  homeroom_teacher: string;
  student_count: number;
}

interface SchoolForm {
  name: string;
  npsn: string;
  address: string;
  headmaster: string;
  academic_year: string;
  semester: string;
}

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState("");

  // Login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active tab
  const [tab, setTab] = useState<"rekap" | "master" | "school">("rekap");

  // Toast feedback
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const showToast = (type: "ok" | "err", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // Rekap edit state
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [entries, setEntries] = useState<RekapEntry[]>([]);
  const [savingRekap, setSavingRekap] = useState(false);

  // Master data state
  const [newClassName, setNewClassName] = useState("");
  const [newClassTeacher, setNewClassTeacher] = useState("");
  const [newStudentNis, setNewStudentNis] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentGender, setNewStudentGender] = useState<"L" | "P">("L");

  // School & password settings
  const [school, setSchool] = useState<SchoolForm>({
    name: "",
    npsn: "",
    address: "",
    headmaster: "",
    academic_year: "",
    semester: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(withBasePath("/api/auth/session"));
      const data = await res.json();
      setAuthenticated(Boolean(data.authenticated));
      setAdminName(data.admin?.displayName || "Admin");
    } catch {
      setAuthenticated(false);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  const loadMeta = useCallback(async () => {
    const [cRes, sRes] = await Promise.all([
      fetch(withBasePath("/api/classes")),
      fetch(withBasePath("/api/school")),
    ]);
    if (cRes.ok) {
      const cd = await cRes.json();
      const list = (cd.classes || []) as ClassItem[];
      setClasses(list);
      if (list.length > 0 && !selectedClassId) {
        setSelectedClassId(String(list[0].id));
      }
    }
    if (sRes.ok) {
      const sd = await sRes.json();
      if (sd.school) setSchool(sd.school);
    }
  }, [selectedClassId]);

  const loadRekapEntries = useCallback(async () => {
    if (!selectedClassId) return;
    const res = await fetch(
      withBasePath(
        `/api/rekap?period=${encodeURIComponent(period)}&classId=${encodeURIComponent(selectedClassId)}`
      )
    );
    if (res.ok) {
      const data = await res.json();
      setEntries(data.rows || []);
    }
  }, [selectedClassId, period]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (authenticated) {
      loadMeta();
    }
  }, [authenticated, loadMeta]);

  useEffect(() => {
    if (authenticated && selectedClassId) {
      loadRekapEntries();
    }
  }, [authenticated, selectedClassId, period, loadRekapEntries]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch(withBasePath("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Login gagal.");
      } else {
        setAuthenticated(true);
        setAdminName(data.admin?.displayName || "Admin");
        setPassword("");
        window.dispatchEvent(new Event("erekap-auth-changed"));
      }
    } catch {
      setLoginError("Gagal menghubungi server.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch(withBasePath("/api/auth/logout"), { method: "POST" });
    setAuthenticated(false);
    window.location.reload();
  };

  const updateEntryField = (
    studentId: number,
    field: "hadir" | "sakit" | "izin" | "alpha" | "note",
    value: number | string
  ) => {
    setEntries((prev) =>
      prev.map((item) => {
        if (item.student_id !== studentId) return item;
        if (field === "note") return { ...item, note: String(value) };
        return { ...item, [field]: Math.max(0, Number(value) || 0) };
      })
    );
  };

  const handleSaveRekap = async () => {
    setSavingRekap(true);
    try {
      const res = await fetch(withBasePath("/api/rekap"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period,
          entries: entries.map((e) => ({
            student_id: e.student_id,
            hadir: e.hadir,
            sakit: e.sakit,
            izin: e.izin,
            alpha: e.alpha,
            note: e.note,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan.");
      showToast("ok", `Rekap berhasil disimpan (${data.count} siswa).`);
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Gagal menyimpan rekap.");
    } finally {
      setSavingRekap(false);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(withBasePath("/api/classes"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClassName, homeroom_teacher: newClassTeacher }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast("err", data.error || "Gagal menambah kelas.");
      return;
    }
    setNewClassName("");
    setNewClassTeacher("");
    showToast("ok", "Kelas baru ditambahkan.");
    await loadMeta();
  };

  const handleDeleteClass = async (id: number) => {
    const res = await fetch(withBasePath(`/api/classes?id=${id}`), { method: "DELETE" });
    if (res.ok) {
      showToast("ok", "Kelas dihapus.");
      if (selectedClassId === String(id)) setSelectedClassId("");
      await loadMeta();
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;
    const res = await fetch(withBasePath("/api/students"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: Number(selectedClassId),
        nis: newStudentNis,
        name: newStudentName,
        gender: newStudentGender,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast("err", data.error || "Gagal menambah siswa.");
      return;
    }
    setNewStudentNis("");
    setNewStudentName("");
    showToast("ok", "Siswa ditambahkan.");
    await loadRekapEntries();
    await loadMeta();
  };

  const handleDeleteStudent = async (id: number) => {
    const res = await fetch(withBasePath(`/api/students?id=${id}`), { method: "DELETE" });
    if (res.ok) {
      showToast("ok", "Siswa dihapus.");
      await loadRekapEntries();
      await loadMeta();
    }
  };

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(withBasePath("/api/school"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(school),
    });
    if (res.ok) {
      showToast("ok", "Profil sekolah diperbarui.");
    } else {
      showToast("err", "Gagal memperbarui profil sekolah.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(withBasePath("/api/auth/password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast("err", data.error || "Gagal mengganti password.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    showToast("ok", "Password Admin berhasil diperbarui.");
  };

  return (
    <AppShell>
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg border ${
            toast.type === "ok"
              ? "bg-[var(--accent)] text-white border-emerald-800"
              : "bg-red-700 text-white border-red-900"
          }`}
        >
          {toast.type === "ok" ? <CheckCircle size={18} weight="fill" /> : <WarningCircle size={18} weight="fill" />}
          <span>{toast.text}</span>
        </div>
      )}

      {!authChecked ? (
        <div className="py-12 text-center text-sm text-[var(--ink-muted)]">
          Memeriksa sesi Admin...
        </div>
      ) : !authenticated ? (
        <div className="mx-auto max-w-md py-6 animate-cascade">
          <div className="rounded-2xl bg-[var(--surface)] p-6 sm:p-7 border border-[var(--border)] shadow-[var(--shadow-tactile)] space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <LockKey size={22} weight="fill" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--ink)]">Login Admin Rekap</h1>
                <p className="text-xs text-[var(--ink-muted)]">
                  Siswa & guru tetap dapat melihat Dashboard dan Rekap tanpa login.
                </p>
              </div>
            </div>

            {loginError && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-semibold text-red-800"
              >
                <WarningCircle size={16} weight="fill" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="admin-username" className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Username
                </label>
                <input
                  id="admin-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3.5 py-2.5 text-sm text-[var(--ink)] min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3.5 py-2.5 text-sm text-[var(--ink)] min-h-[44px]"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="btn-tactile w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60 min-h-[46px]"
              >
                {loginLoading ? "Memverifikasi..." : "Masuk sebagai Admin"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Admin Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-cascade">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <ShieldCheck size={22} weight="fill" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)]">
                  Panel Admin — {adminName}
                </h1>
                <p className="text-xs text-[var(--ink-muted)]">
                  Kelola data rekapitulasi, daftar kelas, siswa, dan profil sekolah.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn-tactile inline-flex items-center gap-2 self-start rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--surface-muted)]"
            >
              <SignOut size={16} />
              <span>Keluar Admin</span>
            </button>
          </div>

          {/* Admin Sub-tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
            {[
              { id: "rekap" as const, label: "Edit Rekap", icon: Table },
              { id: "master" as const, label: "Kelas & Siswa", icon: Users },
              { id: "school" as const, label: "Profil & Akun", icon: Buildings },
            ].map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`btn-tactile inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    active
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--surface)] text-[var(--ink-muted)] border border-[var(--border)] hover:text-[var(--ink)]"
                  }`}
                >
                  <Icon size={17} weight={active ? "fill" : "regular"} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: EDIT REKAP */}
          {tab === "rekap" && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl card-elevated p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    aria-label="Pilih Kelas"
                    className="rounded-xl well-recessed px-3.5 py-2 text-sm font-bold min-h-[42px]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="month"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    aria-label="Pilih Periode"
                    className="font-num rounded-xl well-recessed px-3.5 py-2 text-sm font-bold min-h-[42px]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveRekap}
                  disabled={savingRekap || entries.length === 0}
                  className="btn-tactile inline-flex items-center gap-2 rounded-xl bg-[#0F5132] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_-6px_rgba(15,81,50,0.55)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
                >
                  <FloppyDisk size={18} weight="fill" />
                  <span>{savingRekap ? "Menyimpan..." : "Simpan Rekap"}</span>
                </button>
              </div>

              {/* Mobile Edit Cards (< 768px) */}
              <div className="md:hidden space-y-3">
                {entries.map((entry) => (
                  <div key={entry.student_id} className="card-elevated rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-extrabold text-[var(--ink)]">{entry.name}</p>
                        <p className="font-num text-xs font-medium text-[var(--ink-muted)]">{entry.nis}</p>
                      </div>
                      <span className="font-num rounded-full well-recessed px-2.5 py-0.5 text-xs font-bold text-[var(--ink-muted)]">
                        {entry.gender}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {([
                        { field: "hadir" as const, label: "Hadir", cls: "bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)]" },
                        { field: "sakit" as const, label: "Sakit", cls: "bg-[var(--status-sakit-bg)] text-[var(--status-sakit-fg)]" },
                        { field: "izin" as const, label: "Izin", cls: "bg-[var(--status-izin-bg)] text-[var(--status-izin-fg)]" },
                        { field: "alpha" as const, label: "Alpha", cls: "bg-[var(--status-alpha-bg)] text-[var(--status-alpha-fg)]" },
                      ]).map((f) => (
                        <div key={f.field} className={`rounded-xl p-2 text-center ${f.cls}`}>
                          <label className="block text-[10px] font-bold uppercase">{f.label}</label>
                          <input
                            type="number"
                            min={0}
                            value={entry[f.field]}
                            onChange={(e) =>
                              updateEntryField(entry.student_id, f.field, e.target.value)
                            }
                            aria-label={`${f.label} ${entry.name}`}
                            className="font-num mt-1 w-full rounded-lg bg-white/85 py-1 text-center text-sm font-extrabold text-[var(--ink)]"
                          />
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={entry.note}
                      onChange={(e) =>
                        updateEntryField(entry.student_id, "note", e.target.value)
                      }
                      placeholder="Catatan opsional..."
                      className="w-full rounded-xl well-recessed px-3 py-2 text-xs font-medium text-[var(--ink)]"
                    />
                  </div>
                ))}
              </div>

              {/* Desktop Edit Table (>= 768px) */}
              <div className="hidden md:block card-elevated rounded-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--surface-raised)] border-b border-[var(--border-strong)] text-xs font-bold uppercase text-[var(--ink-muted)]">
                      <th className="py-3 px-4">Siswa</th>
                      <th className="py-3 px-2 text-center w-20">Hadir</th>
                      <th className="py-3 px-2 text-center w-20">Sakit</th>
                      <th className="py-3 px-2 text-center w-20">Izin</th>
                      <th className="py-3 px-2 text-center w-20">Alpha</th>
                      <th className="py-3 px-4 min-w-[180px]">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] text-sm">
                    {entries.map((entry) => (
                      <tr key={entry.student_id}>
                        <td className="py-3 px-4">
                          <p className="font-bold text-[var(--ink)]">{entry.name}</p>
                          <p className="font-num text-xs text-[var(--ink-muted)]">{entry.nis}</p>
                        </td>
                        {(["hadir", "sakit", "izin", "alpha"] as const).map((field) => (
                          <td key={field} className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min={0}
                              value={entry[field]}
                              onChange={(e) =>
                                updateEntryField(entry.student_id, field, e.target.value)
                              }
                              aria-label={`${field} ${entry.name}`}
                              className="font-num w-16 rounded-xl well-recessed px-2 py-1.5 text-center text-sm font-extrabold"
                            />
                          </td>
                        ))}
                        <td className="py-2.5 px-4">
                          <input
                            type="text"
                            value={entry.note}
                            onChange={(e) =>
                              updateEntryField(entry.student_id, "note", e.target.value)
                            }
                            placeholder="Catatan opsional..."
                            className="w-full rounded-xl well-recessed px-3 py-1.5 text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 2: MASTER DATA KELAS & SISWA */}
          {tab === "master" && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kelola Kelas */}
              <div className="rounded-2xl bg-[var(--surface)] p-5 border border-[var(--border)] shadow-[var(--shadow-tactile)] space-y-4">
                <h2 className="text-base font-bold text-[var(--ink)]">Tambah Kelas Baru</h2>
                <form onSubmit={handleAddClass} className="space-y-3">
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Nama Kelas (misal: XII IPA 2)"
                    className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3.5 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    value={newClassTeacher}
                    onChange={(e) => setNewClassTeacher(e.target.value)}
                    placeholder="Nama Wali Kelas"
                    className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3.5 py-2.5 text-sm"
                  />
                  <button
                    type="submit"
                    className="btn-tactile inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white"
                  >
                    <Plus size={16} weight="bold" />
                    <span>Tambah Kelas</span>
                  </button>
                </form>

                <div className="pt-3 border-t border-[var(--border)] space-y-2">
                  <p className="text-xs font-bold uppercase text-[var(--ink-muted)]">Daftar Kelas</p>
                  {classes.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-xl bg-[var(--surface-raised)] px-3.5 py-2.5 border border-[var(--border)]"
                    >
                      <div>
                        <p className="text-sm font-bold">{c.name}</p>
                        <p className="text-xs text-[var(--ink-muted)]">
                          {c.homeroom_teacher} • {c.student_count} siswa
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteClass(c.id)}
                        aria-label={`Hapus kelas ${c.name}`}
                        className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kelola Siswa */}
              <div className="rounded-2xl bg-[var(--surface)] p-5 border border-[var(--border)] shadow-[var(--shadow-tactile)] space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[var(--ink)]">Tambah Siswa</h2>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    aria-label="Kelas tujuan siswa"
                    className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-semibold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <form onSubmit={handleAddStudent} className="space-y-3">
                  <input
                    type="text"
                    required
                    value={newStudentNis}
                    onChange={(e) => setNewStudentNis(e.target.value)}
                    placeholder="NIS / NISN"
                    className="font-num w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3.5 py-2.5 text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Nama Lengkap Siswa"
                      className="flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3.5 py-2.5 text-sm"
                    />
                    <select
                      value={newStudentGender}
                      onChange={(e) => setNewStudentGender(e.target.value === "P" ? "P" : "L")}
                      aria-label="Jenis Kelamin"
                      className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3 py-2.5 text-sm font-semibold"
                    >
                      <option value="L">L</option>
                      <option value="P">P</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn-tactile inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white"
                  >
                    <Plus size={16} weight="bold" />
                    <span>Tambah Siswa</span>
                  </button>
                </form>

                <div className="pt-3 border-t border-[var(--border)] space-y-2 max-h-72 overflow-y-auto">
                  <p className="text-xs font-bold uppercase text-[var(--ink-muted)]">
                    Siswa di Kelas Terpilih
                  </p>
                  {entries.map((st) => (
                    <div
                      key={st.student_id}
                      className="flex items-center justify-between rounded-xl bg-[var(--surface-raised)] px-3.5 py-2 border border-[var(--border)]"
                    >
                      <div>
                        <p className="text-sm font-semibold">{st.name}</p>
                        <p className="font-num text-xs text-[var(--ink-muted)]">
                          {st.nis} • {st.gender}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(st.student_id)}
                        aria-label={`Hapus siswa ${st.name}`}
                        className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: PENGATURAN SEKOLAH & AKUN */}
          {tab === "school" && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form
                onSubmit={handleSaveSchool}
                className="rounded-2xl bg-[var(--surface)] p-5 border border-[var(--border)] shadow-[var(--shadow-tactile)] space-y-3"
              >
                <h2 className="text-base font-bold text-[var(--ink)]">Profil Sekolah (Info & Kop Cetak)</h2>
                {[
                  { key: "name" as const, label: "Nama Sekolah / Madrasah" },
                  { key: "npsn" as const, label: "NPSN" },
                  { key: "address" as const, label: "Alamat Lengkap" },
                  { key: "headmaster" as const, label: "Kepala Madrasah" },
                  { key: "academic_year" as const, label: "Tahun Ajaran" },
                  { key: "semester" as const, label: "Semester" },
                ].map((f) => (
                  <div key={f.key} className="space-y-1">
                    <label className="block text-xs font-bold text-[var(--ink-muted)]">{f.label}</label>
                    <input
                      type="text"
                      value={school[f.key]}
                      onChange={(e) => setSchool({ ...school, [f.key]: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3.5 py-2 text-sm"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  className="btn-tactile inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <FloppyDisk size={17} weight="fill" />
                  <span>Simpan Profil Sekolah</span>
                </button>
              </form>

              <form
                onSubmit={handleChangePassword}
                className="rounded-2xl bg-[var(--surface)] p-5 border border-[var(--border)] shadow-[var(--shadow-tactile)] space-y-4 self-start"
              >
                <h2 className="text-base font-bold text-[var(--ink)]">Ganti Password Admin</h2>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[var(--ink-muted)]">Password Saat Ini</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[var(--ink-muted)]">Password Baru (min. 6 karakter)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3.5 py-2.5 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-tactile inline-flex items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <LockKey size={17} weight="fill" />
                  <span>Perbarui Password</span>
                </button>
              </form>
            </section>
          )}
        </div>
      )}
    </AppShell>
  );
}
