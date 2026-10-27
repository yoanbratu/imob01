import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Property, PropertyCategory, PropertyFilters } from '../types/property';
import { PropertyCard } from './PropertyCard';
import { CinemaPropertyGallery } from './CinemaPropertyGallery';
import { getPropertyWhatsAppLink } from '../utils/whatsapp';
import { ParallaxSection, RevealBlock } from './ParallaxReveal';

/** Staggered Grid Container Variants */
const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.04,
    },
  },
};

/** High-tech card staggered fade-in with smooth spring elevation & subtle unblur */
const cardItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 26,
    scale: 0.965,
    filter: 'blur(6px)',
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 260,
      mass: 0.75,
    },
  },
};

/** Staggered List Container Variants */
const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

/** Executive List Item staggered fade-in */
const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.98,
    filter: 'blur(4px)',
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 22,
      stiffness: 240,
      mass: 0.7,
    },
  },
};
import {
  SlidersHorizontal,
  RotateCcw,
  Building,
  Home,
  Briefcase,
  Gem,
  Compass,
  Sparkles,
  Search,
  MapPin,
  X,
  Building2,
  Globe2,
  Mic,
  MicOff,
  Volume2,
  Star,
  Play,
  LayoutGrid,
  Film,
  List,
  ArrowUpRight,
  MessageCircle,
  Scale,
} from 'lucide-react';

interface PropertyGridProps {
  properties: Property[];
  filters: PropertyFilters;
  onFilterChange: (filters: Partial<PropertyFilters>) => void;
  onResetFilters: () => void;
  onSelectProperty: (property: Property) => void;
  forceCinemaMode?: boolean;
  onResetCinemaMode?: () => void;
  comparedPropertyIds?: string[];
  onToggleCompare?: (property: Property) => void;
}

const CATEGORIES: { id: PropertyCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'todos', label: 'Todos os Imóveis', icon: Compass },
  { id: 'residencial', label: 'Residenciais', icon: Home },
  { id: 'comercial', label: 'Comerciais', icon: Briefcase },
  { id: 'lancamento', label: 'Lançamentos', icon: Building },
  { id: 'alto-padrao', label: 'Alto Padrão', icon: Gem },
];

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectProperty,
  forceCinemaMode = false,
  onResetCinemaMode,
  comparedPropertyIds = [],
  onToggleCompare,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'hybrid' | 'grid' | 'list'>('hybrid');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Unique signature for active filters & property set to re-trigger staggered cascade
  const filterKey = useMemo(() => {
    const idsHash = properties.map((p) => p.id).join(',');
    return `${filters.purpose}-${filters.category}-${filters.onlyFeatured}-${filters.hasVirtualTour360}-${filters.type}-${filters.location}-${filters.priceRange}-${(filters.searchQuery || '').trim().toLowerCase()}-${viewMode}-${idsHash}`;
  }, [filters, viewMode, properties]);

  useEffect(() => {
    if (forceCinemaMode) {
      setViewMode('hybrid');
      if (onResetCinemaMode) onResetCinemaMode();
    }
  }, [forceCinemaMode, onResetCinemaMode]);

  // Web Speech API State
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceFeedback('Busca por voz não suportada neste navegador. Digite sua pesquisa.');
      setTimeout(() => setVoiceFeedback(null), 4000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
      setVoiceFeedback(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback('Ouvindo... Diga o bairro, cidade ou tipo (ex: Batel, Miami, Cobertura)');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          onFilterChange({ searchQuery: transcript });
          setIsDropdownOpen(true);
          setVoiceFeedback(`Comando reconhecido: "${transcript}"`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceFeedback('Permissão do microfone negada no navegador.');
        } else if (event.error === 'no-speech') {
          setVoiceFeedback('Nenhuma voz detectada. Tente falar novamente.');
        } else {
          setVoiceFeedback('Comando de voz finalizado.');
        }
        setTimeout(() => setVoiceFeedback(null), 3500);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => setVoiceFeedback(null), 3000);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech error on start:', err);
      setIsListening(false);
      setVoiceFeedback('Não foi possível iniciar o microfone.');
      setTimeout(() => setVoiceFeedback(null), 3500);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute distinct neighborhoods & cities with counts from all properties
  const { neighborhoods, cities } = useMemo(() => {
    const nMap = new Map<string, { name: string; city: string; country: string; count: number }>();
    const cMap = new Map<string, { name: string; country: string; count: number }>();

    properties.forEach((p) => {
      if (p.neighborhood) {
        const key = p.neighborhood.trim();
        const existing = nMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          nMap.set(key, {
            name: key,
            city: p.city,
            country: p.country,
            count: 1,
          });
        }
      }

      if (p.city) {
        const key = p.city.trim();
        const existing = cMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          cMap.set(key, {
            name: key,
            country: p.country,
            count: 1,
          });
        }
      }
    });

    return {
      neighborhoods: Array.from(nMap.values()).sort((a, b) => b.count - a.count),
      cities: Array.from(cMap.values()).sort((a, b) => b.count - a.count),
    };
  }, [properties]);

  // Filtered auto-complete suggestions based on input
  const query = (filters.searchQuery || '').trim().toLowerCase();

  const filteredSuggestions = useMemo(() => {
    if (!query) {
      return {
        matchedNeighborhoods: neighborhoods.slice(0, 5),
        matchedCities: cities.slice(0, 4),
      };
    }

    return {
      matchedNeighborhoods: neighborhoods.filter(
        (n) => n.name.toLowerCase().includes(query) || n.city.toLowerCase().includes(query)
      ),
      matchedCities: cities.filter((c) => c.name.toLowerCase().includes(query)),
    };
  }, [neighborhoods, cities, query]);

  // Quick Featured Properties highlighted for fast suggestions
  const quickFeaturedProperties = useMemo(() => {
    return properties.filter((p) => p.featuredInQuickSuggestions || p.featured).slice(0, 6);
  }, [properties]);

  const featuredTotalCount = useMemo(() => {
    return properties.filter((p) => p.featured).length;
  }, [properties]);

  const tour360TotalCount = useMemo(() => {
    return properties.filter((p) => Boolean(p.virtualTour360Url)).length;
  }, [properties]);

  const handleSelectSuggestion = (value: string) => {
    onFilterChange({ searchQuery: value });
    setIsDropdownOpen(false);
  };

  const handleClearSearch = () => {
    onFilterChange({ searchQuery: '' });
    setIsDropdownOpen(false);
  };

  const popularLocations = [
    { label: 'Batel (Curitiba)', value: 'Batel' },
    { label: 'Miami · Brickell (EUA)', value: 'Miami' },
    { label: 'Orlando · Lake Nona (EUA)', value: 'Orlando' },
    { label: 'Santa Teresa (Asunción · PY)', value: 'Santa Teresa' },
    { label: 'Jardins (São Paulo)', value: 'Jardins' },
    { label: 'Balneário Camboriú', value: 'Balneário Camboriú' },
    { label: 'Paraná Country Club (PY)', value: 'Paraná Country Club' },
  ];

  return (
    <ParallaxSection
      id="imoveis"
      parallaxOffset={24}
      className="py-24 bg-[#050B1A] text-white scroll-mt-14 relative overflow-hidden"
    >
      {/* Background Tech Texture */}
      <div className="absolute inset-0 tech-grid-pattern opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <RevealBlock distance={24} parallaxStrength={12} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-[#D4AF37] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>CURADORIA EXCLUSIVA BRATU</span>
              <span className="text-white/20">·</span>
              <span>CATÁLOGO DIGITAL</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Imóveis em Destaque
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              Propriedades rigorosamente selecionadas por padrão arquitetônico, liquidez e valorização patrimonial no Brasil, Estados Unidos e Paraguai.
            </p>
          </div>

          {/* Quick Purpose Switcher with Modern Tech Buttons */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#070F26] border border-[#D4AF37]/30 rounded-2xl self-start md:self-auto shadow-inner">
            <button
              onClick={() => onFilterChange({ purpose: 'Todos', onlyFeatured: false })}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                filters.purpose === 'Todos' && !filters.onlyFeatured
                  ? 'tech-btn-primary'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Todos ({properties.length})
            </button>
            <button
              onClick={() => onFilterChange({ onlyFeatured: !filters.onlyFeatured })}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                filters.onlyFeatured
                  ? 'tech-btn-primary'
                  : 'bg-gradient-to-r from-[#ECC97E]/20 to-[#D4AF37]/30 text-[#E5C378] border border-[#D4AF37]/40 hover:border-[#D4AF37]'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Em Destaque ({featuredTotalCount})</span>
            </button>
            {tour360TotalCount > 0 && (
              <button
                onClick={() => onFilterChange({ hasVirtualTour360: !filters.hasVirtualTour360 })}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  filters.hasVirtualTour360
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400'
                }`}
                title="Filtrar imóveis que possuem Tour Virtual 360°"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tour 360° ({tour360TotalCount})</span>
              </button>
            )}
            <button
              onClick={() => onFilterChange({ purpose: 'Venda' })}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                filters.purpose === 'Venda' && !filters.onlyFeatured
                  ? 'tech-btn-primary'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Comprar
            </button>
            <button
              onClick={() => onFilterChange({ purpose: 'Locação' })}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                filters.purpose === 'Locação' && !filters.onlyFeatured
                  ? 'tech-btn-primary'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Alugar
            </button>
          </div>
        </RevealBlock>

        {/* ======================================================== */}
        {/* FAST AUTO-COMPLETE SEARCH CONSOLE (Bairro & Cidade em Tempo Real) */}
        {/* ======================================================== */}
        <div ref={searchContainerRef} className="relative mb-8 z-30">
          <div className="p-3 sm:p-4 rounded-2xl bg-[#070F26]/95 border border-[#D4AF37]/40 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Input Box with High-Tech Glow */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#D4AF37]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={filters.searchQuery || ''}
                  onChange={(e) => {
                    onFilterChange({ searchQuery: e.target.value });
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsDropdownOpen(false);
                  }}
                  placeholder="Buscar rapidamente por bairro (ex: Batel, Jardins, Santa Teresa) ou use a voz..."
                  className={`w-full pl-10 pr-28 py-3 bg-[#050B1A] border rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-all font-medium ${
                    isListening
                      ? 'border-red-500 ring-2 ring-red-500/30'
                      : 'border-[#D4AF37]/35 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30'
                  }`}
                />

                {/* Right controls: Voice mic button, Clear button, and keyboard shortcut indicator */}
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    title={
                      isListening
                        ? 'Ouvindo... Clique para parar busca por voz'
                        : 'Buscar por voz (Web Speech API)'
                    }
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                      isListening
                        ? 'bg-red-500 text-white border-red-400 ring-2 ring-red-400/50 animate-pulse'
                        : 'bg-[#070F26] text-[#E5C378] border-[#D4AF37]/40 hover:bg-[#0B163B] hover:text-white shadow-xs'
                    }`}
                  >
                    <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce text-white' : 'text-[#ECC97E]'}`} />
                  </button>

                  {filters.searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      aria-label="Limpar busca"
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-[#070F26] rounded border border-white/10">
                    ESC
                  </span>
                </div>
              </div>

              {/* Status info & active counter */}
              <div className="flex items-center justify-between md:justify-end gap-3 text-xs shrink-0">
                <div className="font-mono text-[#ECC97E] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold">{properties.length}</span>
                  <span className="text-slate-400 text-[11px]">
                    {properties.length === 1 ? 'imóvel no portfólio' : 'imóveis no portfólio'}
                  </span>
                </div>
              </div>
            </div>

            {/* Voice Feedback Banner */}
            {voiceFeedback && (
              <div className="mt-3 px-3.5 py-2 rounded-xl bg-[#0B163B] border border-[#D4AF37]/50 text-xs font-mono text-[#ECC97E] flex items-center justify-between gap-3 shadow-md animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  {isListening ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  )}
                  <span>{voiceFeedback}</span>
                </div>
                {isListening && (
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className="text-[10px] text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    Parar
                  </button>
                )}
              </div>
            )}

            {/* Popular Shortcut Pills with Featured Quick Suggestions */}
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#ECC97E] mr-1 flex items-center gap-1 font-bold">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Sugestões Rápidas:
              </span>

              {/* Quick Toggle: ⭐ Apenas Em Destaque */}
              <button
                type="button"
                onClick={() => onFilterChange({ onlyFeatured: !filters.onlyFeatured })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                  filters.onlyFeatured
                    ? 'tech-btn-primary text-[#050B1A]'
                    : 'bg-gradient-to-r from-[#ECC97E]/20 to-[#D4AF37]/35 text-[#E5C378] border border-[#D4AF37]/50 hover:border-[#D4AF37]'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>⭐ Ver Em Destaque ({featuredTotalCount})</span>
              </button>

              {/* Quick Pills for Featured Properties in Suggestions */}
              {quickFeaturedProperties.slice(0, 3).map((prop) => (
                <button
                  key={prop.id}
                  type="button"
                  onClick={() => onSelectProperty(prop)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#0B163B] text-slate-200 hover:text-white border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all cursor-pointer flex items-center gap-1.5 max-w-[200px] truncate group shadow-xs"
                  title={`Abrir imóvel em destaque: ${prop.title}`}
                >
                  <span className="text-[#D4AF37] font-mono font-bold text-[10px]">
                    {prop.code}
                  </span>
                  <span className="truncate group-hover:text-[#ECC97E]">{prop.title}</span>
                </button>
              ))}

              {popularLocations.map((item) => {
                const isSelected = filters.searchQuery?.toLowerCase() === item.value.toLowerCase();
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleSelectSuggestion(item.value)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'tech-btn-primary text-[#050B1A] font-bold shadow-xs'
                        : 'bg-[#0B163B] text-slate-300 hover:text-white border border-[#D4AF37]/25 hover:border-[#D4AF37]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto-Complete Dropdown Menu with Featured Section */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#070F26] border border-[#D4AF37]/50 rounded-2xl shadow-[0_15px_45px_rgba(0,0,0,0.7)] backdrop-blur-xl overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="max-h-[420px] overflow-y-auto divide-y divide-white/10">
                {/* Imóveis em Destaque no Topo das Sugestões Rápidas */}
                {quickFeaturedProperties.length > 0 && (
                  <div className="p-3 bg-gradient-to-b from-[#0B163B]/80 to-transparent">
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#ECC97E] font-bold flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                        <span>Imóveis em Destaque (Sugestões Rápidas)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {quickFeaturedProperties.length} imóveis
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                      {quickFeaturedProperties.map((prop) => (
                        <button
                          key={prop.id}
                          type="button"
                          onClick={() => {
                            onSelectProperty(prop);
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#0B163B] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-left transition-all cursor-pointer group bg-[#050B1A]/80 shadow-sm"
                        >
                          <img
                            src={prop.images[0]}
                            alt={prop.title}
                            className="w-12 h-10 object-cover rounded-lg border border-[#D4AF37]/30 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono font-bold text-[#E5C378] bg-[#070F26] px-1.5 py-0.2 rounded border border-[#D4AF37]/30">
                                {prop.code}
                              </span>
                              {prop.youtubeUrl && (
                                <span className="text-[9px] font-mono text-red-400 flex items-center gap-0.5">
                                  <Play className="w-2.5 h-2.5 fill-current" /> Vídeo
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-white group-hover:text-[#ECC97E] block truncate mt-0.5">
                              {prop.title}
                            </span>
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-0.5">
                              <span className="truncate">{prop.neighborhood}, {prop.city}</span>
                              <span className="text-[#ECC97E] font-bold shrink-0">{prop.priceFormatted}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Neighborhoods Section */}
                {filteredSuggestions.matchedNeighborhoods.length > 0 && (
                  <div className="p-3">
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] font-bold flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#D4AF37]" />
                      <span>Bairros em Destaque</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                      {filteredSuggestions.matchedNeighborhoods.map((n) => (
                        <button
                          key={n.name}
                          type="button"
                          onClick={() => handleSelectSuggestion(n.name)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#0B163B] text-left transition-colors cursor-pointer group"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-xs font-semibold text-white group-hover:text-[#ECC97E] block truncate">
                              {n.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {n.city} · {n.country}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#050B1A] text-[#E5C378] border border-[#D4AF37]/30 shrink-0">
                            {n.count} {n.count === 1 ? 'imóvel' : 'imóveis'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cities Section */}
                {filteredSuggestions.matchedCities.length > 0 && (
                  <div className="p-3">
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#ECC97E] font-bold flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-[#ECC97E]" />
                      <span>Cidades no Brasil & Paraguai</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                      {filteredSuggestions.matchedCities.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleSelectSuggestion(c.name)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#0B163B] text-left transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="text-sm">
                              {c.country === 'Paraguai' ? '🇵🇾' : '🇧🇷'}
                            </span>
                            <div>
                              <span className="text-xs font-semibold text-white group-hover:text-[#ECC97E] block truncate">
                                {c.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {c.country}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#050B1A] text-[#E5C378] border border-[#D4AF37]/30 shrink-0">
                            {c.count} {c.count === 1 ? 'imóvel' : 'imóveis'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results message in dropdown */}
                {filteredSuggestions.matchedNeighborhoods.length === 0 &&
                  filteredSuggestions.matchedCities.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Nenhum bairro ou cidade correspondente a "<strong className="text-white">{query}</strong>".
                      <div className="mt-2 text-[11px] text-slate-500">
                        Pressione Enter para buscar esse termo no texto completo dos imóveis.
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Category Tabs & View Mode Switcher */}
        <div id="categorias" className="scroll-mt-24 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onFilterChange({ category: cat.id })}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'tech-btn-primary'
                      : 'tech-btn-secondary text-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#050B1A]' : 'text-[#D4AF37]'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* High-Performance Gallery Layout Switcher */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#070F26] border border-[#D4AF37]/35 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('hybrid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'hybrid'
                  ? 'bg-[#D4AF37] text-[#050B1A] font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Cinema 4K + Grade</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'grid'
                  ? 'bg-[#D4AF37] text-[#050B1A] font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Apenas Grade</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'list'
                  ? 'bg-[#D4AF37] text-[#050B1A] font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista Executiva</span>
            </button>
          </div>
        </div>

        {/* Active Filter Status & Reset Action */}
        {(filters.purpose !== 'Todos' ||
          filters.category !== 'todos' ||
          filters.type !== 'Todos' ||
          filters.location !== '' ||
          filters.searchQuery !== '' ||
          filters.priceRange !== 'Todos') && (
          <div className="flex items-center justify-between py-2.5 px-4 mb-8 bg-[#070F26] border border-[#D4AF37]/30 rounded-xl text-xs text-slate-300 shadow-md">
            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                Filtros ativos:{' '}
                {filters.searchQuery && (
                  <span className="text-[#E5C378] font-semibold">
                    [Busca: "{filters.searchQuery}"]{' '}
                  </span>
                )}
                {filters.purpose !== 'Todos' && `[${filters.purpose}] `}
                {filters.category !== 'todos' && `[${filters.category}] `}
                {filters.type !== 'Todos' && `[${filters.type}] `}
                {filters.location && `[${filters.location}] `}
                {filters.priceRange !== 'Todos' && `[Faixa: ${filters.priceRange}]`}
              </span>
            </div>
            <button
              onClick={onResetFilters}
              className="tech-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#D4AF37] hover:text-[#FFF1D0] transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar Filtros</span>
            </button>
          </div>
        )}

        {/* Widescreen Interactive 4K Cinema Gallery Stage */}
        {properties.length > 0 && viewMode === 'hybrid' && (
          <CinemaPropertyGallery
            properties={properties}
            onSelectProperty={onSelectProperty}
          />
        )}

        {/* Properties Grid or Executive List with Staggered Fade-in Animation */}
        {properties.length > 0 ? (
          viewMode === 'list' ? (
            <motion.div
              key={`list-${filterKey}`}
              variants={listContainerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {properties.map((property) => {
                const waUrl = getPropertyWhatsAppLink(
                  property.code,
                  property.title,
                  property.priceFormatted
                );
                return (
                  <motion.div
                    key={property.id}
                    variants={listItemVariants}
                    className="rounded-2xl bg-[#070F26] border border-[#D4AF37]/30 hover:border-[#D4AF37] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-lg transform-gpu"
                  >
                    <div
                      onClick={() => onSelectProperty(property)}
                      className="flex items-center gap-4 cursor-pointer min-w-0 flex-1"
                    >
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        referrerPolicy="no-referrer"
                        className="w-24 sm:w-32 h-20 object-cover rounded-xl border border-[#D4AF37]/40 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                          <span className="text-[#D4AF37] font-bold">{property.code}</span>
                          <span>·</span>
                          <span>{property.purpose}</span>
                          <span>·</span>
                          <span>{property.type}</span>
                          <span>·</span>
                          <span className="text-[#ECC97E]">
                            {property.neighborhood}, {property.city} ({property.country})
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white hover:text-[#ECC97E] truncate mt-0.5">
                          {property.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono tabular-nums mt-1">
                          <span>{property.areaM2} m²</span>
                          {property.bedrooms !== undefined && (
                            <>
                              <span>·</span>
                              <span>{property.bedrooms} Dorm. ({property.suites || 0} suítes)</span>
                            </>
                          )}
                          {property.parkingSpots !== undefined && (
                            <>
                              <span>·</span>
                              <span>{property.parkingSpots} Vagas</span>
                            </>
                          )}
                          <span>·</span>
                          <span>{property.images.length} Fotos 4K</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-white/10 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">
                          {property.purpose === 'Locação' ? 'ALUGUEL' : 'INVESTIMENTO'}
                        </span>
                        <span className="text-lg font-extrabold font-mono tabular-nums text-[#ECC97E]">
                          {property.priceFormatted}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {onToggleCompare && (
                          <button
                            type="button"
                            onClick={() => onToggleCompare(property)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all ${
                              comparedPropertyIds.includes(property.id)
                                ? 'bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] font-bold shadow-[0_0_12px_rgba(212,175,55,0.5)]'
                                : 'tech-btn-secondary text-slate-300 hover:text-white'
                            }`}
                            title={
                              comparedPropertyIds.includes(property.id)
                                ? 'Remover do comparativo'
                                : 'Adicionar ao comparativo'
                            }
                          >
                            <Scale
                              className={`w-3.5 h-3.5 ${
                                comparedPropertyIds.includes(property.id)
                                  ? 'text-[#050B1A]'
                                  : 'text-[#ECC97E]'
                              }`}
                            />
                            <span>
                              {comparedPropertyIds.includes(property.id)
                                ? 'Comparando ✓'
                                : 'Comparar'}
                            </span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onSelectProperty(property)}
                          className="tech-btn-secondary px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <span>Galeria</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#ECC97E]" />
                        </button>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tech-btn-primary px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#050B1A] fill-[#050B1A]" />
                          <span>Consultar</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key={`grid-${filterKey}`}
              variants={gridContainerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {properties.map((property) => (
                <motion.div
                  key={property.id}
                  variants={cardItemVariants}
                  className="h-full transform-gpu"
                >
                  <PropertyCard
                    property={property}
                    onSelect={onSelectProperty}
                    isCompared={comparedPropertyIds.includes(property.id)}
                    onToggleCompare={onToggleCompare}
                  />
                </motion.div>
              ))}
            </motion.div>
          )
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="py-16 text-center bg-[#070F26] rounded-2xl border border-[#D4AF37]/30 p-8 max-w-lg mx-auto shadow-2xl"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0B163B] border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-4 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Nenhum imóvel encontrado
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Não encontramos imóveis disponíveis com os critérios selecionados no momento. Tente redefinir os filtros ou consulte nossa equipe diretamente no WhatsApp.
            </p>
            <button
              onClick={onResetFilters}
              className="tech-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#050B1A]" />
              <span>Ver Todos os Imóveis</span>
            </button>
          </motion.div>
        )}
      </div>
    </ParallaxSection>
  );
};
