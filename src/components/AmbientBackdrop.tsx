"use client";

export function AmbientBackdrop({ variant = "light" }: { variant?: "light" | "canopy" }) {
  if (variant === "canopy") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-orb absolute -top-12 -right-10 h-44 w-44 rounded-full bg-[#A3E635]/15 blur-2xl" />
        <div className="animate-float-orb-rev absolute -bottom-16 left-1/4 h-52 w-52 rounded-full bg-emerald-400/12 blur-2xl" />
        <svg
          className="animate-spin-slow absolute -right-12 -bottom-12 h-56 w-56 text-white/8"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="1" strokeDasharray="6 8" />
          <circle cx="100" cy="100" r="64" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" />
        </svg>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div className="animate-float-orb absolute -top-24 right-[-6%] h-96 w-96 rounded-full bg-[#A3E635]/20 blur-3xl" />
      <div className="animate-float-orb-rev absolute top-[38%] -left-24 h-80 w-80 rounded-full bg-[#115737]/12 blur-3xl" />
      <svg
        className="animate-spin-slow absolute top-24 right-[8%] h-72 w-72 text-[#0A3D26]/[0.06]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="1.2" strokeDasharray="6 8" />
        <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" />
      </svg>
      {/* Floating tactile geometric spheres */}
      <div className="animate-float-orb absolute top-32 left-[10%] hidden md:block h-5 w-5 rounded-full bg-gradient-to-br from-[#A3E635] to-[#115737] opacity-65 shadow-md" />
      <div className="animate-float-orb-rev absolute top-72 right-[14%] hidden md:block h-8 w-8 rounded-2xl rotate-12 bg-gradient-to-br from-emerald-400/40 to-[#0A3D26]/30 ring-1 ring-[#0A3D26]/15 backdrop-blur-sm" />
      <div className="animate-float-orb absolute bottom-28 left-[16%] hidden md:block h-4 w-4 rounded-full bg-[#0A3D26]/25" />
    </div>
  );
}
