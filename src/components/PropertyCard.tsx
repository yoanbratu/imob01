import React from 'react';
import { MessageCircle, ArrowUpRight, MapPin } from 'lucide-react';
import { Property } from '../types/property';
import { getPropertyWhatsAppLink } from '../utils/whatsapp';
import { TechImage } from './TechImage';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  const whatsAppUrl = getPropertyWhatsAppLink(
    property.code,
    property.title,
    property.priceFormatted
  );

  return (
    <div className="group flex flex-col bg-[#070F26] rounded-2xl overflow-hidden border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_35px_rgba(212,175,55,0.15)] transition-all duration-300">
      {/* Modern Technological Image Component */}
      <TechImage
        src={property.images[0]}
        alt={property.title}
        aspectClass="aspect-[16/10]"
        badge={`${property.purpose.toUpperCase()} · ${property.country.toUpperCase()}`}
        code={property.code}
        onClick={() => onSelect(property)}
      >
        {/* Quick bottom-overlay specs over photo */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs drop-shadow z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="truncate max-w-[200px]">
              {property.neighborhood}, {property.city}
            </span>
          </div>
          <span className="font-semibold text-xs tracking-tight text-[#E5C378] font-mono">
            {property.areaM2} m²
          </span>
        </div>
      </TechImage>

      {/* Content Block in Midnight Navy */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata Line */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-medium mb-2.5">
            <span className="text-[#D4AF37]">{property.type}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            {property.bedrooms && (
              <>
                <span>{property.bedrooms} Quartos ({property.suites || 0} suítes)</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
              </>
            )}
            {property.parkingSpots && (
              <>
                <span>{property.parkingSpots} Vagas</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
              </>
            )}
            <span>{property.bathrooms} Banh.</span>
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

        {/* Footer Area with Price in Gold & Dual Actions */}
        <div className="pt-3 border-t border-white/10 mt-auto">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                {property.purpose === 'Locação' ? 'VALOR ALUGUEL' : 'VALOR VENDA'}
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-[#ECC97E] tracking-tight">
                {property.priceFormatted}
              </span>
            </div>
            {property.country === 'Paraguai' ? (
              <span className="text-[11px] font-mono font-semibold text-[#D4AF37] bg-[#0B163B] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                PORTFÓLIO PY
              </span>
            ) : property.country === 'Estados Unidos' ? (
              <span className="text-[11px] font-mono font-semibold text-[#ECC97E] bg-[#0B163B] px-2 py-0.5 rounded border border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                PORTFÓLIO EUA / USD
              </span>
            ) : property.condoFee ? (
              <span className="text-[10px] font-mono text-[#ECC97E] bg-[#0B163B] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                Cond: {property.condoFee.includes('/') ? property.condoFee.split('/')[0] : property.condoFee}
              </span>
            ) : property.iptu ? (
              <span className="text-[10px] font-mono text-slate-400 bg-[#050B1A] px-2 py-0.5 rounded border border-white/10">
                IPTU: {property.iptu.includes('/') ? property.iptu.split('/')[0] : property.iptu.slice(0, 15)}
              </span>
            ) : null}
          </div>

          {/* Modern Technological Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onSelect(property)}
              className="tech-btn-secondary inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl cursor-pointer"
            >
              <span>Detalhes</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#ECC97E]" />
            </button>

            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tech-btn-primary inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-xl cursor-pointer"
              title="Falar no WhatsApp sobre este imóvel"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#050B1A] fill-[#050B1A]" />
              <span>Consultar</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
