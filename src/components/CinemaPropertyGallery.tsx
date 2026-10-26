import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Scan,
  Layers,
  Compass,
  Play,
  Pause,
  MapPin,
  BedDouble,
  Bath,
  Car,
  MessageCircle,
  ArrowUpRight,
  Camera,
  ZoomIn,
  ZoomOut,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Property } from '../types/property';
import { getPropertyWhatsAppLink } from '../utils/whatsapp';

interface CinemaPropertyGalleryProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const CinemaPropertyGallery: React.FC<CinemaPropertyGalleryProps> = ({
  properties,
  onSelectProperty,
}) => {
  const [selectedPropIdx, setSelectedPropIdx] = useState(0);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [lensMode, setLensMode] = useState<'hdr' | 'lidar' | 'blueprint'>('hdr');
  const [zoomLevel, setZoomLevel] = useState<1 | 1.35 | 1.75>(1);
  const [isAutoSlide, setIsAutoSlide] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const safeProperties = properties.length > 0 ? properties : [];
  const currentProperty =
    safeProperties.length > 0
      ? safeProperties[selectedPropIdx % safeProperties.length]
      : null;

  const images =
    currentProperty && Array.isArray(currentProperty.images) && currentProperty.images.length > 0
      ? currentProperty.images
      : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1800&q=85'];

  // Reset photo index and zoom when switching property
  useEffect(() => {
    setActivePhotoIdx(0);
    setZoomLevel(1);
  }, [selectedPropIdx]);

  // Auto-slideshow timer
  useEffect(() => {
    if (!isAutoSlide || images.length <= 1) return;
    const timer = setInterval(() => {
      setActivePhotoIdx((prev) => (prev + 1) % images.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isAutoSlide, images.length]);

  if (!currentProperty) return null;

  const activePhotoUrl = images[activePhotoIdx % images.length];

  const handlePrevPhoto = () => {
    setActivePhotoIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextPhoto = () => {
    setActivePhotoIdx((prev) => (prev + 1) % images.length);
  };

  const cycleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.35 : prev === 1.35 ? 1.75 : 1));
  };

  const whatsAppUrl = getPropertyWhatsAppLink(
    currentProperty.code,
    currentProperty.title,
    currentProperty.priceFormatted
  );

  const lensFilter = {
    hdr: 'contrast-[1.08] saturate-[1.12]',
    lidar: 'contrast-[1.2] saturate-[1.25] hue-rotate-[-10deg]',
    blueprint: 'contrast-[1.25] brightness-[0.88] saturate-[0.65] sepia-[0.2] hue-rotate-[175deg]',
  }[lensMode];

  return (
    <div className="mb-12 rounded-3xl bg-[#070F26] border border-[#D4AF37]/45 shadow-[0_25px_70px_rgba(0,0,0,0.75)] overflow-hidden">
      {/* Top Cinema Control Header */}
      <div className="px-4 sm:px-6 py-3.5 bg-[#050B1A] border-b border-[#D4AF37]/25 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Camera className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ECC97E]">
            GALERIA INTERATIVA 4K · INSPECIONADOR ARQUITETÔNICO
          </span>
        </div>

        {/* Optical Lens & Slideshow Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#070F26] border border-[#D4AF37]/30">
            <button
              type="button"
              onClick={() => setLensMode('hdr')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                lensMode === 'hdr'
                  ? 'bg-[#D4AF37] text-[#050B1A] font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              HDR Real
            </button>
            <button
              type="button"
              onClick={() => setLensMode('lidar')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                lensMode === 'lidar'
                  ? 'bg-[#D4AF37] text-[#050B1A] font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Scan className="w-3 h-3" />
              <span>Scanner 3D</span>
            </button>
            <button
              type="button"
              onClick={() => setLensMode('blueprint')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                lensMode === 'blueprint'
                  ? 'bg-sky-400 text-[#050B1A] font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>CAD/BIM</span>
            </button>
          </div>

          <button
            type="button"
            onClick={cycleZoom}
            className="px-2.5 py-1.5 rounded-xl bg-[#070F26] hover:bg-[#0B163B] border border-[#D4AF37]/30 text-xs font-mono text-[#ECC97E] flex items-center gap-1 cursor-pointer whitespace-nowrap"
            title="Alternar nível de zoom óptico"
          >
            {zoomLevel > 1 ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
            <span className="tabular-nums">{zoomLevel}x</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAutoSlide(!isAutoSlide)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isAutoSlide
                ? 'bg-[#D4AF37] text-[#050B1A] border-[#D4AF37] font-bold'
                : 'bg-[#070F26] text-slate-300 hover:text-white border-[#D4AF37]/30'
            }`}
          >
            {isAutoSlide ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoSlide ? 'Pausar Tour' : 'Auto-Play'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Stage: 8 Cols Photo Stage + 4 Cols Telemetry & Property Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left: Widescreen Interactive Photo Viewer & Filmstrip */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-[#050B1A] border-b lg:border-b-0 lg:border-r border-[#D4AF37]/25">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#030712] group">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentProperty.id}-${activePhotoIdx}`}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.2 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full overflow-hidden flex items-center justify-center"
              >
                {!imgErrors[activePhotoUrl] ? (
                  <img
                    src={activePhotoUrl}
                    alt={`${currentProperty.title} - Ambiente ${activePhotoIdx + 1}`}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setImgErrors((prev) => ({ ...prev, [activePhotoUrl]: true }))
                    }
                    style={{ transform: `scale(${zoomLevel})` }}
                    className={`w-full h-full object-cover transition-transform duration-500 ${lensFilter}`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#070F26] to-[#050B1A] text-slate-300 p-6">
                    <Scan className="w-8 h-8 text-[#D4AF37] mb-2" />
                    <span className="text-xs font-mono text-[#ECC97E]">
                      {currentProperty.title}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Architectural Grid Overlay */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                lensMode === 'blueprint'
                  ? 'opacity-80 bg-[linear-gradient(rgba(56,189,248,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.14)_1px,transparent_1px)] bg-[size:28px_28px]'
                  : lensMode === 'lidar'
                  ? 'opacity-70 bg-[linear-gradient(rgba(212,175,55,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.1)_1px,transparent_1px)] bg-[size:24px_24px]'
                  : 'opacity-25 tech-grid-pattern'
              }`}
            />

            {/* Laser Beam in LiDAR/Blueprint mode */}
            {lensMode !== 'hdr' && (
              <div className="pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#ECC97E] to-transparent shadow-[0_0_16px_#D4AF37] animate-laser-scan" />
            )}

            {/* Corner Framing Brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37] pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37] pointer-events-none" />

            {/* Top Overlay Info */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
              <div className="px-3 py-1 rounded-xl bg-[#050B1A]/85 backdrop-blur-md border border-[#D4AF37]/40 text-xs font-mono text-[#ECC97E] flex items-center gap-2">
                <span className="font-bold">{currentProperty.code}</span>
                <span>·</span>
                <span className="tabular-nums">
                  FOTO {activePhotoIdx + 1} DE {images.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelectProperty(currentProperty)}
                className="pointer-events-auto px-3 py-1.5 rounded-xl bg-[#050B1A]/90 hover:bg-[#D4AF37] text-white hover:text-[#050B1A] border border-[#D4AF37]/50 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Tela Cheia & Ficha</span>
              </button>
            </div>

            {/* Prev / Next Navigation Controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#050B1A]/85 hover:bg-[#D4AF37] text-white hover:text-[#050B1A] border border-[#D4AF37]/50 flex items-center justify-center transition-all cursor-pointer shadow-xl"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  aria-label="Próxima foto"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#050B1A]/85 hover:bg-[#D4AF37] text-white hover:text-[#050B1A] border border-[#D4AF37]/50 flex items-center justify-center transition-all cursor-pointer shadow-xl"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Interactive Thumbnail Filmstrip */}
          <div className="p-3 bg-[#050B1A] border-t border-[#D4AF37]/20 flex items-center gap-2.5 overflow-x-auto scrollbar-none">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative w-20 sm:w-24 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  idx === activePhotoIdx
                    ? 'border-[#D4AF37] scale-105 shadow-[0_0_15px_rgba(212,175,55,0.45)]'
                    : 'border-white/10 opacity-55 hover:opacity-100'
                }`}
              >
                {!imgErrors[imgUrl] ? (
                  <img
                    src={imgUrl}
                    alt={`Miniatura ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setImgErrors((prev) => ({ ...prev, [imgUrl]: true }))
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0B163B] flex items-center justify-center text-[10px] font-mono text-[#D4AF37]">
                    {idx + 1}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Property Telemetry & Quick Portfolio Switcher */}
        <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between bg-[#070F26]">
          <div>
            {/* Portfolio Switcher Header */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-white/10">
              <span className="text-[11px] font-mono text-[#E5C378] font-bold uppercase tracking-wider">
                IMÓVEL {selectedPropIdx + 1} DE {safeProperties.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPropIdx(
                      (prev) => (prev - 1 + safeProperties.length) % safeProperties.length
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#0B163B] hover:bg-[#13255c] text-xs font-mono text-[#ECC97E] border border-[#D4AF37]/35 cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPropIdx((prev) => (prev + 1) % safeProperties.length)
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#0B163B] hover:bg-[#13255c] text-xs font-mono text-[#ECC97E] border border-[#D4AF37]/35 cursor-pointer flex items-center gap-1"
                >
                  <span>Próximo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Location & Purpose */}
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-mono mb-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {currentProperty.neighborhood}, {currentProperty.city} ({currentProperty.country})
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
              {currentProperty.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-5">
              {currentProperty.description || currentProperty.subtitle}
            </p>

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="p-3 rounded-xl bg-[#0B163B]/90 border border-[#D4AF37]/25">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  Área Total
                </span>
                <span className="text-sm font-bold font-mono tabular-nums text-white">
                  {currentProperty.areaM2} m²
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B163B]/90 border border-[#D4AF37]/25">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  Tipologia
                </span>
                <span className="text-sm font-bold text-[#ECC97E] truncate block">
                  {currentProperty.type} · {currentProperty.purpose}
                </span>
              </div>

              {currentProperty.bedrooms !== undefined && (
                <div className="p-3 rounded-xl bg-[#0B163B]/90 border border-[#D4AF37]/25 flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Dormitórios</span>
                    <span className="text-xs font-bold font-mono tabular-nums text-white">
                      {currentProperty.bedrooms} ({currentProperty.suites || 0} suítes)
                    </span>
                  </div>
                </div>
              )}

              {currentProperty.parkingSpots !== undefined && (
                <div className="p-3 rounded-xl bg-[#0B163B]/90 border border-[#D4AF37]/25 flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Garagem</span>
                    <span className="text-xs font-bold font-mono tabular-nums text-white">
                      {currentProperty.parkingSpots} vagas
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Horizontal Property Selector Mini-Pills */}
            <div className="mb-5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                Navegar Rápido pelo Portfólio:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                {safeProperties.slice(0, 12).map((prop, idx) => (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => setSelectedPropIdx(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      idx === selectedPropIdx
                        ? 'bg-[#D4AF37] text-[#050B1A] font-extrabold'
                        : 'bg-[#050B1A] text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {prop.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Price & Primary Actions */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[10px] font-mono uppercase text-slate-400">
                VALOR DE AVALIAÇÃO
              </span>
              <span className="text-2xl font-extrabold font-mono tabular-nums text-[#ECC97E]">
                {currentProperty.priceFormatted}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onSelectProperty(currentProperty)}
                className="tech-btn-secondary py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Abrir Ficha & 360°</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#ECC97E]" />
              </button>

              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tech-btn-primary py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#050B1A] fill-[#050B1A]" />
                <span>Falar com Consultor</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
