import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShieldCheck, Sparkles, Globe2, Compass, Cpu, Layers } from 'lucide-react';
import { COMPANY_INFO } from '../utils/whatsapp';

interface TechBrandEmblemProps {
  mode?: 'hero' | 'seal' | 'compact' | 'watermark';
  className?: string;
  showTelemetry?: boolean;
}

export const TechBrandEmblem: React.FC<TechBrandEmblemProps> = ({
  mode = 'hero',
  className = '',
  showTelemetry = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // 3D Tilt interactive physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 260, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);

  // Glare reflection following mouse
  const glareBg = useTransform([smoothX, smoothY], ([latestX, latestY]: any[]) => {
    const px = (Number(latestX) + 0.5) * 100;
    const py = (Number(latestY) + 0.5) * 100;
    return `radial-gradient(circle 220px at ${px}% ${py}%, rgba(212, 175, 55, 0.35), transparent 70%)`;
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(normX);
    mouseY.set(normY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Compact Mode (for Header or small badges)
  if (mode === 'compact') {
    return (
      <div className={`relative flex items-center gap-3 group ${className}`}>
        {/* Glow backlight */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D4AF37]/20 via-[#ECC97E]/10 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative flex items-center p-1.5 px-2.5 rounded-xl bg-gradient-to-r from-[#070F26]/90 via-[#0B163B]/90 to-[#070F26]/90 border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.15)] overflow-hidden">
          {/* Laser Scan line on hover */}
          <div className="absolute inset-y-0 -left-12 w-8 bg-gradient-to-r from-transparent via-[#ECC97E]/40 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[280px] transition-transform duration-1000 ease-in-out pointer-events-none" />

          <img
            src="/assets/aistudio/LOGOPNG_100042ea.png"
            alt="Logo Bratu Imobiliária"
            className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo-bratu.png';
            }}
          />

          <div className="ml-2.5 border-l border-[#D4AF37]/30 pl-2.5 hidden sm:block">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37] font-bold block leading-none">
              GOVERNANÇA
            </span>
            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
              BRASIL · EUA · PARAGUAI
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Seal Mode (for CrossBorderSection and institutional showcases)
  if (mode === 'seal') {
    return (
      <div className={`relative flex items-center justify-center p-4 ${className}`}>
        {/* Outer rotating cyber rings */}
        <div className="absolute inset-0 rounded-full border border-dashed border-[#D4AF37]/30 animate-[spin_50s_linear_infinite] pointer-events-none" />
        <div className="absolute inset-3 rounded-full border border-dotted border-[#D4AF37]/20 animate-[spin_35s_linear_infinite_reverse] pointer-events-none" />

        <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#081335]/95 via-[#050B1A]/95 to-[#040817]/95 border-2 border-[#D4AF37]/45 shadow-[0_0_30px_rgba(212,175,55,0.22)] text-center overflow-hidden group">
          {/* Laser scanning beam */}
          <div className="pointer-events-none absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#ECC97E] to-transparent shadow-[0_0_10px_#D4AF37] opacity-65 animate-laser-scan" />

          {/* Corner brackets */}
          <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-[#D4AF37]" />
          <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-[#D4AF37]" />
          <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b border-l border-[#D4AF37]" />
          <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b border-r border-[#D4AF37]" />

          <img
            src="/assets/aistudio/LOGOPNG_100042ea.png"
            alt="Selo Institucional Bratu"
            className="w-56 h-auto object-contain mx-auto transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(212,175,55,0.3)]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo-bratu.png';
            }}
          />

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-center gap-2 text-[10px] font-mono text-[#D4AF37]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="font-bold tracking-wider uppercase">PONTE CORPORATIVA & RESIDENCIAL</span>
          </div>
        </div>
      </div>
    );
  }

  // Hero Mode (Primary centerpiece showcase)
  return (
    <div
      className={`relative select-none ${className}`}
      style={{ perspective: 1100 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient Radial Bloom */}
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-[#D4AF37]/15 via-[#0E1E4C]/30 to-[#D4AF37]/10 blur-2xl pointer-events-none" />

      {/* Rotating Cyber Telemetry Ring (Outer) */}
      <div className="absolute -inset-4 sm:-inset-6 border border-dashed border-[#D4AF37]/25 rounded-[32px] pointer-events-none animate-[spin_80s_linear_infinite]" />

      {/* Rotating Cyber Telemetry Ring (Inner) */}
      <div className="absolute -inset-1 sm:-inset-2 border border-dotted border-[#D4AF37]/35 rounded-3xl pointer-events-none animate-[spin_55s_linear_infinite_reverse]" />

      {/* 3D Tilted Glass Capsule */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="relative rounded-3xl bg-gradient-to-b from-[#081335]/95 via-[#050B1A]/95 to-[#040817]/95 border-2 border-[#D4AF37]/50 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(212,175,55,0.22)] overflow-hidden backdrop-blur-xl group cursor-pointer"
      >
        {/* Dynamic Specular Glare Layer */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: glareBg,
            transform: 'translateZ(1px)',
          }}
        />

        {/* Cyber HUD Corner Crosshairs */}
        <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-[#D4AF37]" />
        <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-[#D4AF37]" />
        <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-[#D4AF37]" />
        <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 border-[#D4AF37]" />

        {/* Laser Sweep Scan Beam (Constant high-tech scan) */}
        <div className="pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#ECC97E] to-transparent shadow-[0_0_15px_#D4AF37] opacity-65 animate-laser-scan" />

        {/* Top Telemetry Header */}
        <div
          className="flex items-center justify-between gap-2 pb-4 border-b border-white/10 text-[10px] font-mono"
          style={{ transform: 'translateZ(18px)' }}
        >
          <div className="flex items-center gap-1.5 text-[#ECC97E]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
            <span className="font-bold tracking-wider uppercase">BRAND SIGNATURE · 4K</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="hidden sm:inline">CRECI-PR J-08240</span>
            <span className="text-[#D4AF37]">●</span>
            <span className="text-[#E5C378]">PY 45.290</span>
          </div>
        </div>

        {/* Central Logo Display with Architectural Glow */}
        <div
          className="relative py-6 sm:py-8 flex items-center justify-center"
          style={{ transform: 'translateZ(30px)' }}
        >
          {/* Subtle back ambient glow under skyline */}
          <div className="absolute w-3/4 h-24 bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent blur-xl pointer-events-none" />

          {/* High-Res Official Logo with Filter Enhancement */}
          <div className="relative group/logo">
            <img
              src="/assets/aistudio/LOGOPNG_100042ea.png"
              alt="Bratu Imobiliária & Administradora - Logotipo Oficial"
              className="w-full max-w-[340px] sm:max-w-[400px] h-auto object-contain drop-shadow-[0_10px_25px_rgba(212,175,55,0.35)] transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_15px_35px_rgba(212,175,55,0.55)]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo-bratu.png';
              }}
            />

            {/* Shimmer laser sweep over logo image */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />
            </div>
          </div>
        </div>

        {/* Bottom Interactive HUD Pill Telemetry */}
        {showTelemetry && (
          <div
            className="pt-4 border-t border-white/10 space-y-2.5"
            style={{ transform: 'translateZ(20px)' }}
          >
            {/* Coordinates Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <Globe2 className="w-3 h-3 text-[#D4AF37]" />
                <span className="text-white font-semibold">CWB [25°25'S]</span>
                <span className="text-white/30">·</span>
                <span className="text-white font-semibold">ASU [25°16'S]</span>
                <span className="text-white/30">·</span>
                <span className="text-white font-semibold">MIA [25°46'N]</span>
              </div>

              <div className="inline-flex items-center gap-1 text-[#ECC97E] bg-[#0B163B] px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Auditoria & Compliance</span>
              </div>
            </div>

            {/* Institutional Seal Footnote */}
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">
                Intermediação de Alto Padrão & Administração Predial
              </span>
              <span className="text-[#D4AF37] font-bold font-mono shrink-0 ml-2">
                EST. 2010
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
