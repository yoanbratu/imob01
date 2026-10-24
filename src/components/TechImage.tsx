import React, { useState } from 'react';
import { Eye, Scan, Sparkles, Compass, Cpu, Layers } from 'lucide-react';
import { TechEffectType } from '../types/property';

interface TechImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  badge?: string;
  code?: string;
  showTechHud?: boolean;
  techEffect?: TechEffectType;
  allowEffectToggle?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const TechImage: React.FC<TechImageProps> = ({
  src,
  alt,
  className = '',
  aspectClass = 'aspect-[16/10]',
  badge = '4K ULTRA-HD · SCANNER 3D',
  code,
  showTechHud = true,
  techEffect = 'holo-gold',
  allowEffectToggle = true,
  onClick,
  children,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeEffect, setActiveEffect] = useState<TechEffectType>(techEffect);
  const [isScanning, setIsScanning] = useState(false);

  const cycleEffect = (e: React.MouseEvent) => {
    e.stopPropagation();
    const modes: TechEffectType[] = ['holo-gold', 'cyber-lidar', 'blueprint', 'matrix'];
    const nextIdx = (modes.indexOf(activeEffect) + 1) % modes.length;
    setActiveEffect(modes[nextIdx]);
  };

  const triggerScan = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2400);
  };

  // Color theme variables based on active tech mode
  const theme = {
    'holo-gold': {
      border: 'border-[#D4AF37]/35 group-hover:border-[#D4AF37]',
      bracket: 'border-[#D4AF37]',
      accentText: 'text-[#E5C378]',
      accentBg: 'bg-[#D4AF37]',
      badgeBorder: 'border-[#D4AF37]/40',
      beam: 'from-transparent via-[#D4AF37]/70 to-transparent',
      beamLine: 'bg-[#FFE29A] shadow-[0_0_12px_#D4AF37,0_0_24px_#D4AF37]',
      filterStyle: 'contrast-[1.08] saturate-[1.12]',
      hudLabel: 'HOLO-GOLD // 3D LIDAR',
      gridColor: 'rgba(212,175,55,0.06)',
    },
    'cyber-lidar': {
      border: 'border-cyan-500/40 group-hover:border-cyan-400',
      bracket: 'border-cyan-400',
      accentText: 'text-cyan-300',
      accentBg: 'bg-cyan-400',
      badgeBorder: 'border-cyan-400/40',
      beam: 'from-transparent via-cyan-400/70 to-transparent',
      beamLine: 'bg-cyan-200 shadow-[0_0_14px_#06b6d4,0_0_28px_#06b6d4]',
      filterStyle: 'contrast-[1.15] hue-rotate-[-10deg] saturate-[1.18]',
      hudLabel: 'CYBER-LIDAR // TELEMETRY',
      gridColor: 'rgba(6,182,212,0.08)',
    },
    'blueprint': {
      border: 'border-sky-400/40 group-hover:border-sky-300',
      bracket: 'border-sky-300',
      accentText: 'text-sky-300',
      accentBg: 'bg-sky-400',
      badgeBorder: 'border-sky-400/40',
      beam: 'from-transparent via-sky-400/60 to-transparent',
      beamLine: 'bg-white shadow-[0_0_12px_#38bdf8]',
      filterStyle: 'contrast-[1.2] brightness-[0.92] saturate-[0.85] sepia-[0.15] hue-rotate-[180deg]',
      hudLabel: 'ARCH-BLUEPRINT // CAD-BIM',
      gridColor: 'rgba(56,189,248,0.12)',
    },
    'matrix': {
      border: 'border-emerald-500/40 group-hover:border-emerald-400',
      bracket: 'border-emerald-400',
      accentText: 'text-emerald-300',
      accentBg: 'bg-emerald-400',
      badgeBorder: 'border-emerald-400/40',
      beam: 'from-transparent via-emerald-400/70 to-transparent',
      beamLine: 'bg-emerald-200 shadow-[0_0_14px_#10b981,0_0_28px_#10b981]',
      filterStyle: 'contrast-[1.12] brightness-[0.95] hue-rotate-[60deg] saturate-[1.15]',
      hudLabel: 'NEO-MATRIX // SPATIAL AI',
      gridColor: 'rgba(16,185,129,0.08)',
    },
  }[activeEffect];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden group bg-[#050B1A] border transition-all duration-500 select-none ${aspectClass} ${className} ${theme.border} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Real Image or Tech Fallback */}
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-106 ${theme.filterStyle}`}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#070F26] via-[#0B163B] to-[#050B1A] text-white p-6 relative">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-2">
            <Scan className={`w-6 h-6 ${theme.accentText} animate-pulse`} />
          </div>
          <span className={`text-[10px] font-mono tracking-widest uppercase ${theme.accentText}`}>
            BRATU HIGH-TECH ASSET
          </span>
          <span className="text-xs font-semibold text-slate-300 text-center mt-1">
            {alt}
          </span>
        </div>
      )}

      {/* Cybernetic Geometric Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-45 group-hover:opacity-75 transition-opacity duration-300"
        style={{
          backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Modern High-Tech Holographic & Vignette Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050B1A]/95 via-transparent to-[#050B1A]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050B1A]/40 via-transparent to-[#050B1A]/40 pointer-events-none" />

      {/* Scanline Texture Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity" />

      {/* Animated Glowing Laser Scanning Beam (Continuous pulse & on-demand scan) */}
      <div
        className={`absolute inset-x-0 pointer-events-none transition-opacity duration-300 ${
          isHovered || isScanning ? 'opacity-100' : 'opacity-60'
        }`}
        style={{
          top: 0,
          bottom: 0,
          animation: isHovered || isScanning ? 'techLidarScan 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'techLidarScan 6s ease-in-out infinite',
        }}
      >
        <div className={`h-16 w-full bg-gradient-to-b ${theme.beam}`} />
        <div className={`h-[2px] w-full ${theme.beamLine}`} />
      </div>

      {/* Light Sheen Sweep Effect on Hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* High-Tech Reticle Center Crosshair (appears on hover) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-60 transition-opacity duration-500">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className={`w-full h-[1px] ${theme.accentBg} opacity-40`} />
          <div className={`h-full w-[1px] absolute ${theme.accentBg} opacity-40`} />
          <div className={`w-8 h-8 rounded-full border border-dashed ${theme.bracket} opacity-60 animate-spin`} style={{ animationDuration: '10s' }} />
          <div className={`w-1.5 h-1.5 rounded-full ${theme.accentBg} shadow-sm`} />
        </div>
      </div>

      {/* Technological Corner HUD Reticle Brackets with Tick Marks */}
      <div className={`absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 ${theme.bracket} pointer-events-none transition-all duration-300 group-hover:w-5 group-hover:h-5`} />
      <div className={`absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 ${theme.bracket} pointer-events-none transition-all duration-300 group-hover:w-5 group-hover:h-5`} />
      <div className={`absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 ${theme.bracket} pointer-events-none transition-all duration-300 group-hover:w-5 group-hover:h-5`} />
      <div className={`absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 ${theme.bracket} pointer-events-none transition-all duration-300 group-hover:w-5 group-hover:h-5`} />

      {/* Micro Tech HUD Badges & Telemetry */}
      {showTechHud && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 text-[9px] sm:text-[10px] font-mono tracking-wider">
          <div className={`flex items-center gap-1.5 bg-[#050B1A]/85 backdrop-blur-md px-2.5 py-1 rounded-md border ${theme.badgeBorder} ${theme.accentText} shadow-lg`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.accentBg} animate-ping`} />
            <span className="uppercase font-semibold">{badge}</span>
          </div>

          <div className="flex items-center gap-2">
            {code && (
              <div className="bg-[#050B1A]/85 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-slate-300">
                <span>REF: {code}</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1 bg-[#050B1A]/85 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-slate-400">
              <Compass className="w-3 h-3 text-[#D4AF37]" />
              <span>LAT 25.42° S</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Telemetry Bar & Interactive Tech Modes Control */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        {/* Telemetry Indicator */}
        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 bg-[#050B1A]/75 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10">
          <span className={`w-1.5 h-1.5 rounded-full ${theme.accentBg} animate-pulse`} />
          <span className="font-semibold">{theme.hudLabel}</span>
        </div>

        {/* Interactive Controls (Clickable) */}
        {allowEffectToggle && (
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Quick Laser Scanner Trigger */}
            <button
              type="button"
              onClick={triggerScan}
              title="Ativar varredura LIDAR a laser 3D"
              className="p-1 rounded bg-[#050B1A]/85 hover:bg-[#0B163B] border border-white/20 text-slate-300 hover:text-white text-[10px] transition-colors cursor-pointer"
            >
              <Scan className="w-3.5 h-3.5" />
            </button>

            {/* Mode Switcher */}
            <button
              type="button"
              onClick={cycleEffect}
              title="Alternar modo visual tecnológico (Holo-Gold, Cyber-Lidar, Blueprint, Matrix)"
              className={`px-2 py-0.5 rounded bg-[#050B1A]/85 hover:bg-[#0B163B] border ${theme.badgeBorder} ${theme.accentText} text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer`}
            >
              <Cpu className="w-3 h-3" />
              <span>MODO: {activeEffect.toUpperCase()}</span>
            </button>
          </div>
        )}
      </div>

      {/* Hover Quick Interaction Hint */}
      {onClick && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#050B1A]/95 backdrop-blur-md border border-[#D4AF37] text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_25px_rgba(212,175,55,0.45)]">
            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Explorar Detalhes</span>
          </div>
        </div>
      )}

      {/* Custom Children Container */}
      {children}
    </div>
  );
};

