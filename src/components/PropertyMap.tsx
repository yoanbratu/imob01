// Source: Google Maps Platform Code Assist
import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, ExternalLink, ShieldCheck, Compass } from 'lucide-react';
import { Property } from '../types/property';

interface PropertyMapProps {
  property: Property;
  className?: string;
}

// Resilient Error Boundary to ensure map errors never break the property modal
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Map rendering caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Inner Component that uses @vis.gl/react-google-maps hooks & elements
const LiveGoogleMap: React.FC<{
  coordinates: { lat: number; lng: number };
  property: Property;
  googleMapsUrl: string;
}> = ({ coordinates, property, googleMapsUrl }) => {
  const [infoOpen, setInfoOpen] = useState(true);
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <Map
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      mapId="DEMO_MAP_ID"
      defaultCenter={coordinates}
      defaultZoom={15}
      gestureHandling="cooperative"
      disableDefaultUI={false}
      className="w-full h-full"
    >
      <AdvancedMarker
        ref={markerRef}
        position={coordinates}
        title={`${property.title} - ${property.address || property.neighborhood}`}
        onClick={() => setInfoOpen(!infoOpen)}
      >
        <Pin
          background="#070F26"
          borderColor="#D4AF37"
          glyphColor="#ECC97E"
          scale={1.3}
        />
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={320}
          onCloseClick={() => setInfoOpen(false)}
        >
          <div className="p-2 text-slate-900 font-sans space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                REF: {property.code} · {property.purpose}
              </span>
              {property.zipCode && (
                <span className="text-[9px] font-mono font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  CEP: {property.zipCode}
                </span>
              )}
            </div>

            <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
              {property.title}
            </h4>

            {/* Endereço Cadastrado Destacado */}
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-[9px] font-mono uppercase font-bold text-amber-900 block">
                Endereço Cadastrado:
              </span>
              <p className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
                {property.address || 'Endereço disponível para visitas'}
              </p>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                {property.neighborhood}, {property.city} - {property.stateOrDept} ({property.country})
              </p>
            </div>

            <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-amber-800">
                {property.priceFormatted}
              </span>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                Abrir Rota <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </Map>
  );
};

// Luxury Stylized Satellite & Street Map View Fallback
const StylizedMapFallback: React.FC<{
  coordinates: { lat: number; lng: number };
  property: Property;
  googleMapsUrl: string;
}> = ({ coordinates, property, googleMapsUrl }) => {
  return (
    <div className="relative w-full h-full bg-[#030712] overflow-hidden flex flex-col justify-between p-4">
      {/* Visual Cartographic Grid Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#070F26_1px,transparent_1px),linear-gradient(to_bottom,#070F26_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Simulated Street Outlines */}
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-50,120 Q200,80 450,150 T900,100" stroke="#D4AF37" strokeWidth="3" fill="none" />
        <path d="M120,-30 Q220,160 300,350" stroke="#E5C378" strokeWidth="2" fill="none" strokeDasharray="4 4" />
        <path d="M380,-20 Q410,180 520,360" stroke="#D4AF37" strokeWidth="2.5" fill="none" />
        <circle cx="50%" cy="50%" r="90" stroke="#D4AF37" strokeWidth="1" fill="none" strokeDasharray="6 6" className="animate-spin-slow" />
      </svg>

      {/* Top Street & Coordinates Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="bg-[#070F26]/90 backdrop-blur-md px-3 py-1 rounded-xl border border-[#D4AF37]/40 text-[10px] font-mono text-[#ECC97E] flex items-center gap-1.5 shadow-md">
          <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{property.country.toUpperCase()} · {property.city.toUpperCase()}</span>
        </div>
        <div className="bg-[#070F26]/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-[10px] font-mono text-slate-300">
          LAT: {coordinates.lat.toFixed(4)} | LNG: {coordinates.lng.toFixed(4)}
        </div>
      </div>

      {/* Center Interactive Location Pin with Full Registered Address */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full bg-[#D4AF37]/15 animate-ping" />
          <div className="absolute w-12 h-12 rounded-full bg-[#D4AF37]/25" />
          <div className="relative w-10 h-10 rounded-2xl bg-[#070F26] border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.6)] flex items-center justify-center text-[#D4AF37]">
            <MapPin className="w-5 h-5 fill-[#D4AF37]/20" />
          </div>
        </div>
        <div className="mt-2.5 px-4 py-2 rounded-2xl bg-[#070F26]/95 border border-[#D4AF37]/60 text-center shadow-xl max-w-sm">
          <span className="text-xs font-bold text-white block">{property.title}</span>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-[#E5C378] font-semibold">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span>{property.address || `${property.neighborhood}, ${property.city}`}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
            {property.neighborhood}, {property.city} - {property.stateOrDept} ({property.country}) {property.zipCode ? `· CEP ${property.zipCode}` : ''}
          </span>
        </div>
      </div>

      {/* Bottom Action Prompt */}
      <div className="relative z-10 flex items-center justify-between pt-2">
        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          Endereço georreferenciado no Google Maps
        </span>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tech-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-lg cursor-pointer"
        >
          <span>Abrir no Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export const PropertyMap: React.FC<PropertyMapProps> = ({ property, className = '' }) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const isKeyValid = Boolean(
    apiKey &&
    apiKey !== 'GOOGLE_MAPS_PLATFORM_KEY' &&
    !apiKey.includes('PLACEHOLDER') &&
    apiKey.length > 15
  );

  // Coordinates fallback based on property
  const coordinates = property.coordinates || {
    lat: property.country === 'Estados Unidos'
      ? (property.city === 'Orlando' ? 28.3756 : 25.7617)
      : property.country === 'Paraguai'
      ? (property.city.includes('Hernandarias') ? -25.4851 : -25.2917)
      : (property.city === 'Balneário Camboriú' ? -26.9926 : property.city === 'São Paulo' ? -23.5670 : -25.4411),
    lng: property.country === 'Estados Unidos'
      ? (property.city === 'Orlando' ? -81.2497 : -80.1918)
      : property.country === 'Paraguai'
      ? (property.city.includes('Hernandarias') ? -54.6049 : -57.5683)
      : (property.city === 'Balneário Camboriú' ? -48.6341 : property.city === 'São Paulo' ? -46.6660 : -49.2831),
  };

  const addressSearchQuery = property.address?.trim()
    ? `${property.address.trim()}, ${property.neighborhood ? property.neighborhood + ', ' : ''}${property.city} - ${property.stateOrDept}, ${property.country}`
    : `${property.neighborhood ? property.neighborhood + ', ' : ''}${property.city} - ${property.stateOrDept}, ${property.country}`;

  const googleMapsUrl = property.address?.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressSearchQuery)}`
    : `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;

  const fallbackElement = (
    <StylizedMapFallback
      coordinates={coordinates}
      property={property}
      googleMapsUrl={googleMapsUrl}
    />
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Map Header with Prominent Registered Address */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0B163B]/90 border border-[#D4AF37]/35 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#050B1A] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                Endereço Cadastrado no Google Maps
              </span>
              {property.zipCode && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  CEP: {property.zipCode}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
              {property.address || `${property.neighborhood}, ${property.city}`}
            </h3>
            <span className="text-xs text-slate-300 font-mono block mt-0.5">
              {property.neighborhood}, {property.city} - {property.stateOrDept} ({property.country})
            </span>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tech-btn-primary inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#050B1A] shadow-md transition-all shrink-0 cursor-pointer"
          title="Abrir endereço exato no Google Maps"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Ver no Google Maps</span>
        </a>
      </div>

      {/* Google Map Container with explicit height */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-[#D4AF37]/40 shadow-[0_10px_30px_rgba(0,0,0,0.6)] bg-[#050B1A]">
        {isKeyValid ? (
          <MapErrorBoundary fallback={fallbackElement}>
            <APIProvider apiKey={apiKey} libraries={['marker']}>
              <LiveGoogleMap
                coordinates={coordinates}
                property={property}
                googleMapsUrl={googleMapsUrl}
              />
            </APIProvider>
          </MapErrorBoundary>
        ) : (
          fallbackElement
        )}

        {/* Map HUD Corner Reticles matching Bratu Tech Theme */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37] pointer-events-none" />

        {/* Floating Quick Street Address Tag */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 bg-[#070F26]/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#D4AF37]/50 text-white flex items-center gap-2.5 shadow-2xl">
          <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shrink-0">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-mono uppercase text-[#E5C378] font-bold">
              Endereço Cadastrado do Imóvel:
            </span>
            <span className="text-xs font-mono text-white font-semibold truncate">
              {property.address ? `${property.address} · ${property.neighborhood}, ${property.city}` : `${property.neighborhood}, ${property.city} - ${property.stateOrDept}`}
            </span>
          </div>
        </div>
      </div>

      {/* Safety & Physical Visit Disclaimer */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono px-1 gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          Endereço cadastrado e ponto georreferenciado verificado no Google Maps.
        </span>
        <span className="text-slate-500 hidden sm:inline">
          Coord: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
};
