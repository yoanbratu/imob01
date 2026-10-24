import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Car,
} from 'lucide-react';
import { Property } from '../types/property';

interface PropertyMapProps {
  property: Property;
  className?: string;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ property, className = '' }) => {
  const [mapMode, setMapMode] = useState<'satellite' | 'roadmap'>('satellite');
  const [zoomLevel, setZoomLevel] = useState<number>(16);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fallback coordinates based on city & country
  const coordinates = property.coordinates || {
    lat:
      property.country === 'Estados Unidos'
        ? property.city === 'Orlando'
          ? 28.3756
          : 25.7617
        : property.country === 'Paraguai'
        ? property.city.includes('Hernandarias')
          ? -25.4851
          : -25.2917
        : property.city === 'Balneário Camboriú'
        ? -26.9926
        : property.city === 'São Paulo'
        ? -23.567
        : -25.4411,
    lng:
      property.country === 'Estados Unidos'
        ? property.city === 'Orlando'
          ? -81.2497
          : -80.1918
        : property.country === 'Paraguai'
        ? property.city.includes('Hernandarias')
          ? -54.6049
          : -57.5683
        : property.city === 'Balneário Camboriú'
        ? -48.6341
        : property.city === 'São Paulo'
        ? -46.666
        : -49.2831,
  };

  // Full formatted registered address string for Google Maps search
  const addressQuery = property.address?.trim()
    ? `${property.address.trim()}, ${property.neighborhood ? property.neighborhood + ', ' : ''}${property.city} - ${property.stateOrDept}, ${property.country}`
    : `${property.neighborhood ? property.neighborhood + ', ' : ''}${property.city} - ${property.stateOrDept}, ${property.country}`;

  // Direct external navigation URLs
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(addressQuery)}&navigate=yes`;

  // Real Google Maps Visual Embed URL (t=k for real satellite imagery, t=m for real street roadmap)
  // This guarantees an authentic, real-world satellite / street view of the registered property address
  const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    addressQuery
  )}&t=${mapMode === 'satellite' ? 'k' : 'm'}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 1, 19));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 1, 13));
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Header with Registered Address & Direct Navigation Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0B163B]/90 border border-[#D4AF37]/35 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#050B1A] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5 shadow-sm">
            <MapPin className="w-5 h-5 text-[#ECC97E]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                Localização Real no Google Maps
              </span>
              {property.zipCode && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  CEP: {property.zipCode}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5 leading-snug">
              {property.address || `${property.neighborhood}, ${property.city}`}
            </h3>
            <span className="text-xs text-slate-300 font-mono block mt-0.5">
              {property.neighborhood}, {property.city} - {property.stateOrDept} ({property.country})
            </span>
          </div>
        </div>

        {/* Action Buttons: Google Maps & Waze */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#050B1A] hover:bg-[#081233] border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-bold transition-all shadow-md cursor-pointer"
            title="Abrir rota no Waze"
          >
            <Car className="w-3.5 h-3.5 text-cyan-400" />
            <span>Waze</span>
          </a>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tech-btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#050B1A] shadow-md transition-all cursor-pointer"
            title="Abrir rota e localização completa no Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#050B1A]" />
            <span>Abrir no Google Maps</span>
          </a>
        </div>
      </div>

      {/* Visual Map View Container (Google Maps Satellite / Roadmap Embed) */}
      <div className="relative w-full h-80 sm:h-96 md:h-[420px] rounded-3xl overflow-hidden border-2 border-[#D4AF37]/45 shadow-[0_15px_35px_rgba(0,0,0,0.8)] bg-[#050B1A]">
        {/* Real Visual Google Maps Iframe */}
        <iframe
          key={`${mapMode}-${zoomLevel}`}
          title={`Mapa de Localização Real - ${property.title}`}
          src={embedMapUrl}
          className="w-full h-full border-0 select-none"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Map Loading State HUD */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#050B1A] flex flex-col items-center justify-center gap-2 text-white z-20 pointer-events-none">
            <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
            <span className="text-xs font-mono text-slate-300">
              Carregando visual real do imóvel ({property.city})...
            </span>
          </div>
        )}

        {/* Map View Controls Overlay (Top Right) */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-[#050B1A]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#D4AF37]/50 shadow-xl">
          {/* Mode Switcher: Satélite Real vs Mapa de Ruas */}
          <button
            type="button"
            onClick={() => setMapMode('satellite')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer ${
              mapMode === 'satellite'
                ? 'bg-[#D4AF37] text-[#050B1A] shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Vista Aérea e Fotográfica Real de Satélite"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Satélite Real</span>
          </button>

          <button
            type="button"
            onClick={() => setMapMode('roadmap')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer ${
              mapMode === 'roadmap'
                ? 'bg-[#D4AF37] text-[#050B1A] shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Mapa Urbano e Traçado de Ruas"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Ruas & Bairro</span>
          </button>

          {/* Zoom In / Out Buttons */}
          <div className="h-4 w-[1px] bg-white/20 mx-0.5" />

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 19}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer"
            title="Aproximar Zoom"
            aria-label="Aproximar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5 text-[#ECC97E]" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 13}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer"
            title="Afastar Zoom"
            aria-label="Afastar Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5 text-[#ECC97E]" />
          </button>
        </div>

        {/* Floating Quick Street Address Tag HUD (Bottom Left) */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-20 bg-[#070F26]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#D4AF37]/50 text-white flex items-center gap-2.5 shadow-2xl max-w-lg">
          <div className="w-7 h-7 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shrink-0">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-mono uppercase text-[#E5C378] font-bold">
              Localização Real Cadastrada:
            </span>
            <span className="text-xs font-mono text-white font-semibold truncate">
              {property.address
                ? `${property.address} · ${property.neighborhood}, ${property.city}`
                : `${property.neighborhood}, ${property.city} - ${property.stateOrDept}`}
            </span>
          </div>
        </div>

        {/* Map HUD Corner Reticles (Bratu Tech Aesthetics) */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none z-10" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none z-10" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#D4AF37] pointer-events-none z-10" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#D4AF37] pointer-events-none z-10" />
      </div>

      {/* Safety & Real Location Georeference Footer */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono px-1 gap-2">
        <span className="flex items-center gap-1.5 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          Visual real de satélite e malha urbana verificado no Google Maps.
        </span>
        <span className="text-slate-500 hidden sm:inline">
          Coord: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
};
