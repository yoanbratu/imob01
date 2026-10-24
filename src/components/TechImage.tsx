import React, { useState } from 'react';
import { Eye, Scan, Maximize2 } from 'lucide-react';

interface TechImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  badge?: string;
  code?: string;
  showTechHud?: boolean;
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
  onClick,
  children,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden group bg-[#070F26] border border-[#D4AF37]/25 hover:border-[#D4AF37]/70 transition-all duration-500 ${aspectClass} ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Real Image or Tech Fallback */}
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover filter contrast-[1.05] brightness-[0.96] group-hover:brightness-[1.02] group-hover:scale-108 transition-all duration-700 ease-out"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#070F26] via-[#0B163B] to-[#050B1A] text-white p-6 relative">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center mb-2">
            <Scan className="w-6 h-6 text-[#D4AF37] animate-pulse" />
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#D4AF37]">
            BRATU DIGITAL ASSET
          </span>
          <span className="text-xs font-semibold text-slate-300 text-center mt-1">
            {alt}
          </span>
        </div>
      )}

      {/* Modern High-Tech Holographic & Vignette Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050B1A] via-transparent to-[#050B1A]/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050B1A]/30 via-transparent to-[#050B1A]/30 pointer-events-none" />

      {/* Futuristic Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity" />

      {/* Light Sheen Sweep Effect on Hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#D4AF37]/15 to-transparent pointer-events-none" />

      {/* Technological Corner HUD Reticle Brackets (Gold) */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-[#FFF1D0]" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-[#FFF1D0]" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37] pointer-events-none transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-[#FFF1D0]" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37] pointer-events-none transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-[#FFF1D0]" />

      {/* Micro Tech HUD Badges */}
      {showTechHud && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 text-[10px] font-mono tracking-wider">
          <div className="flex items-center gap-1.5 bg-[#050B1A]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#D4AF37]/30 text-[#E5C378]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="uppercase">{badge}</span>
          </div>

          {code && (
            <div className="bg-[#050B1A]/80 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 text-slate-300">
              <span>REF: {code}</span>
            </div>
          )}
        </div>
      )}

      {/* Hover Quick Interaction Hint */}
      {onClick && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#050B1A]/90 backdrop-blur-md border border-[#D4AF37] text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Explorar Imóvel</span>
          </div>
        </div>
      )}

      {/* Custom Children Container */}
      {children}
    </div>
  );
};
