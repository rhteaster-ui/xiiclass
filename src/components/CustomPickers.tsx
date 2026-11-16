"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarBlank, CaretDown, CaretLeft, CaretRight, Check } from "@phosphor-icons/react";

const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const MONTHS_FULL_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatPeriodLabel(period: string): string {
  const [y, m] = period.split("-");
  const idx = Number(m) - 1;
  if (!y || idx < 0 || idx > 11) return period;
  return `${MONTHS_FULL_ID[idx]} ${y}`;
}

export function PeriodPicker({
  value,
  onChange,
  variant = "light",
}: {
  value: string;
  onChange: (next: string) => void;
  variant?: "light" | "canopy";
}) {
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => Number(value.split("-")[0]) || 2026);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const y = Number(value.split("-")[0]);
    if (y) setPickerYear(y);
  }, [value]);

  useEffect(() => {
    const updatePosition = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const width = 256; // w-64
      const left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12));
      const top = Math.min(rect.bottom + 8, window.innerHeight - 280);
      setCoords({ top, left });
    };

    if (open) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
    }
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        (!popoverRef.current || !popoverRef.current.contains(target))
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const currentMonth = Number(value.split("-")[1]);
  const currentYear = Number(value.split("-")[0]);

  return (
    <div ref={ref} className={`relative inline-block ${open ? "z-50" : "z-auto"}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`btn-tactile inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors ${
          variant === "canopy"
            ? "bg-white/14 text-white ring-1 ring-white/25 backdrop-blur-md hover:bg-white/20"
            : "bg-[var(--bg)] text-[var(--ink)] ring-1 ring-[var(--border-strong)] hover:bg-[var(--surface-mint)]"
        }`}
      >
        <CalendarBlank
          size={15}
          weight="bold"
          className={variant === "canopy" ? "text-[#A3E635]" : "text-[var(--canopy)]"}
        />
        <span className="font-num whitespace-nowrap">{formatPeriodLabel(value)}</span>
        <CaretDown
          size={13}
          weight="bold"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Pilih Bulan dan Tahun"
            style={{ top: coords.top, left: coords.left }}
            className="fixed w-64 rounded-3xl bg-[var(--surface)] p-4 text-[var(--ink)] shadow-[0_22px_50px_-12px_rgba(7,41,25,0.32)] ring-1 ring-[var(--border-strong)] z-[9999] animate-cascade"
          >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setPickerYear((y) => y - 1)}
              aria-label="Tahun sebelumnya"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg)] hover:bg-[var(--surface-mint)] text-[var(--ink)]"
            >
              <CaretLeft size={14} weight="bold" />
            </button>
            <span className="font-num text-sm font-extrabold text-[var(--ink)]">
              {pickerYear}
            </span>
            <button
              type="button"
              onClick={() => setPickerYear((y) => y + 1)}
              aria-label="Tahun berikutnya"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg)] hover:bg-[var(--surface-mint)] text-[var(--ink)]"
            >
              <CaretRight size={14} weight="bold" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS_ID.map((mLabel, idx) => {
              const mNum = idx + 1;
              const selected = pickerYear === currentYear && mNum === currentMonth;
              return (
                <button
                  key={mLabel}
                  type="button"
                  onClick={() => {
                    onChange(`${pickerYear}-${String(mNum).padStart(2, "0")}`);
                    setOpen(false);
                  }}
                  className={`rounded-xl py-2 text-xs font-bold transition-colors ${
                    selected
                      ? "bg-[#0A3D26] text-[#A3E635] shadow-sm"
                      : "bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--surface-mint)] hover:text-[var(--canopy)]"
                  }`}
                >
                  {mLabel}
                </button>
              );
            })}
          </div>
        </div>,
          document.body
        )}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
}: {
  value: string;
  onChange: (next: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const current = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} className={`relative inline-block ${className} ${open ? "z-50" : "z-auto"}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="btn-tactile w-full inline-flex items-center justify-between gap-2 rounded-2xl bg-[var(--bg)] px-4 py-2.5 text-sm font-bold text-[var(--ink)] ring-1 ring-[var(--border-strong)] hover:bg-[var(--surface-mint)] min-h-[42px]"
      >
        <span className="truncate">{current?.label || "Pilih"}</span>
        <CaretDown
          size={14}
          weight="bold"
          className={`shrink-0 text-[var(--ink-muted)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 mt-2 min-w-[160px] max-h-60 overflow-y-auto rounded-2xl bg-[var(--surface)] p-1.5 shadow-[0_20px_44px_-12px_rgba(7,41,25,0.3)] ring-1 ring-[var(--border-strong)] z-50 animate-cascade"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold transition-colors ${
                    active
                      ? "bg-[#0A3D26] text-[#A3E635]"
                      : "text-[var(--ink)] hover:bg-[var(--surface-mint)]"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {active && <Check size={14} weight="bold" className="shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
