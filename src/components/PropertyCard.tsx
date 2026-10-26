import React, { useState } from 'react';
import {
  MessageCircle,
  ArrowUpRight,
  MapPin,
  Star,
  Play,
  Compass,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Camera,
} from 'lucide-react';
import { Property } from '../types/property';
import { getPropertyWhatsAppLink } from '../utils/whatsapp';
import { TechImage } from './TechImage';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  const [photoIdx, setPhotoIdx] = useState(0);

  const images =
    Array.isArray(property.images) && property.images.length > 0
      ? property.images
      : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'];

  const totalPhotos = images.length;
  const activePhotoUrl = images[photoIdx % totalPhotos];

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((prev) => (prev + 1) % totalPhotos);
  };

  const whatsAppUrl = getPropertyWhatsAppLink(
    property.code,
    property.title,
    property.priceFormatted
  );

  // Calculate approximate value per m² for analytical clarity
  const pricePerM2Display = React.useMemo(() => {
    if (!property.areaM2 || property.areaM2 <= 0) return null;
    const rawNumeric = parseFloat(property.priceFormatted.replace(/[^0-9]/g, '')) || 0;
    if (!rawNumeric) return null;
    const perM2 = Math.round(rawNumeric / property.areaM2);
    const isUSD = property.priceFormatted.includes('US$');
    return `${isUSD ? 'US$' : 'R$'} ${perM2.toLocaleString('pt-BR')}/m²`;
  }, [property.priceFormatted, property.areaM2]);

  return (
    <div
      className={`group flex flex-col bg-[#070F26] rounded-2xl overflow-hidden border transition-all duration-300 ${
        property.featured
          ? 'border-[#D4AF37]/65 shadow-[0_6px_30px_rgba(212,175,55,0.22)] hover:border-[#D4AF37]'
          : 'border-[#D4AF37]/25 hover:border-[#D4AF37]/65 shadow-[0_6px_24px_rgba(0,0,0,0.45)]'
      }`}
    >
      {/* Interactive Multi-Photo High-Tech Stage */}
      <div className="relative">
        <TechImage
          src={activePhotoUrl}
          alt={`${property.title} - Foto ${photoIdx + 1}`}
          aspectClass="aspect-[16/10]"
          badge={`${property.purpose.toUpperCase()} · ${property.country.toUpperCase()}`}
          code={property.code}
          onClick={() => onSelect(property)}
        >
          {/* Top Feature, 360, Video & Photo Counter Badges */}
          <div className="absolute top-11 right-2.5 flex flex-col items-end gap-1.5 z-20 pointer-events-none">
            {property.featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                <Star className="w-3 h-3 fill-[#050B1A]" />
                <span>DESTAQUE</span>
              </span>
            )}
            {(property.virtualTour360Url || property.virtualTour360Image) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950/90 text-cyan-300 backdrop-blur-md border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <Compass className="w-2.5 h-2.5 text-cyan-400" />
                <span>TOUR 360°</span>
              </span>
            )}
            {property.youtubeUrl && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-red-600/90 text-white backdrop-blur-md border border-red-400/40 shadow-md">
                <Play className="w-2.5 h-2.5 fill-white" />
                <span>VÍDEO 4K</span>
              </span>
            )}
          </div>

          {/* Interactive Prev / Next Photo Scrubbing Arrows (when > 1 photo) */}
          {totalPhotos > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                aria-label="Foto anterior"
                title="Foto anterior"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#050B1A]/85 hover:bg-[#D4AF37] text-white hover:text-[#050B1A] border border-[#D4AF37]/50 flex items-center justify-center transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer pointer-events-auto shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                aria-label="Próxima foto"
                title="Próxima foto"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#050B1A]/85 hover:bg-[#D4AF37] text-white hover:text-[#050B1A] border border-[#D4AF37]/50 flex items-center justify-center transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer pointer-events-auto shadow-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Photo Counter & Fullscreen Trigger Pill */}
          <div className="absolute top-11 left-2.5 z-20 flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(property);
              }}
              title="Abrir Galeria Completa em Alta Definição"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#050B1A]/85 hover:bg-[#0B163B] border border-[#D4AF37]/40 text-[#ECC97E] text-[10px] font-mono font-semibold backdrop-blur-md transition-colors cursor-pointer shadow-md"
            >
              <Camera className="w-3 h-3 text-[#D4AF37]" />
              <span className="tabular-nums">
                {photoIdx + 1}/{totalPhotos}
              </span>
              <Maximize2 className="w-2.5 h-2.5 ml-0.5 opacity-80" />
            </button>
          </div>

          {/* Interactive Segmented Photo Progress Bars */}
          {totalPhotos > 1 && (
            <div
              className="absolute bottom-9 left-3 right-3 z-20 flex items-center gap-1 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {images.slice(0, 8).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotoIdx(idx)}
                  aria-label={`Ver foto ${idx + 1}`}
                  className={`h-1 flex-1 rounded-full transition-all cursor-pointer ${
                    idx === photoIdx
                      ? 'bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]'
                      : 'bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </TechImage>
      </div>

      {/* Content Block in Midnight Navy */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Area Header Row */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-300 mb-2">
            <div className="flex items-center gap-1.5 font-medium min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">
                {property.neighborhood}, {property.city}
              </span>
            </div>
            <span className="font-mono font-bold text-xs tabular-nums text-[#E5C378] shrink-0">
              {property.areaM2} m²
            </span>
          </div>

          {/* Unboxed Metadata Line */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-medium mb-2.5">
            <span className="text-[#D4AF37] font-semibold">{property.type}</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            {property.bedrooms !== undefined && (
              <>
                <span className="tabular-nums">
                  {property.bedrooms} Dorm. ({property.suites || 0} suítes)
                </span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
              </>
            )}
            {property.parkingSpots !== undefined && (
              <>
                <span className="tabular-nums">{property.parkingSpots} Vagas</span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
              </>
            )}
            <span className="tabular-nums">{property.bathrooms} Banh.</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(property)}
            className="text-lg font-bold text-white group-hover:text-[#E5C378] transition-colors line-clamp-1 cursor-pointer mb-1"
          >
            {property.title}
          </h3>

          {/* Condomínio / Edifício if present */}
          {property.condoName && (
            <div className="text-[11px] font-mono text-[#ECC97E] flex items-center gap-1.5 mb-1.5 truncate">
              <span className="text-[10px] text-[#D4AF37] font-bold">EDIFÍCIO:</span>
              <span className="truncate text-slate-300">{property.condoName}</span>
            </div>
          )}

          {/* Subtitle / Key Hook */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {property.subtitle}
          </p>
        </div>

        {/* Footer Area with Price in Gold, Value/m² & Dual Actions */}
        <div className="pt-3 border-t border-white/10 mt-auto">
          <div className="flex items-end justify-between gap-2 mb-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                {property.purpose === 'Locação' ? 'LOCAÇÃO MENSAL' : 'VALOR DE INVESTIMENTO'}
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-[#ECC97E] tracking-tight">
                {property.priceFormatted}
              </span>
            </div>

            <div className="text-right">
              {pricePerM2Display && property.purpose === 'Venda' && (
                <span className="text-[10px] font-mono tabular-nums text-slate-400 block">
                  {pricePerM2Display}
                </span>
              )}
              {property.country === 'Paraguai' ? (
                <span className="text-[10px] font-mono font-semibold text-[#D4AF37]">
                  ATIVOS PARAGUAI
                </span>
              ) : property.country === 'Estados Unidos' ? (
                <span className="text-[10px] font-mono font-semibold text-[#ECC97E]">
                  ATIVOS EUA · USD
                </span>
              ) : property.condoFee ? (
                <span className="text-[10px] font-mono tabular-nums text-slate-400">
                  Cond: {property.condoFee.includes('/') ? property.condoFee.split('/')[0] : property.condoFee}
                </span>
              ) : null}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onSelect(property)}
              className="tech-btn-secondary inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl cursor-pointer whitespace-nowrap"
            >
              <span>Galeria & Ficha</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#ECC97E]" />
            </button>

            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tech-btn-primary inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap"
              title="Falar no WhatsApp sobre este imóvel"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#050B1A] fill-[#050B1A]" />
              <span>Atendimento</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
