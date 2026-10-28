import React, { useState, useEffect } from 'react';
import {
  Search,
  KeyRound,
  Building,
  ShieldCheck,
  Scan,
  Globe2,
  Compass,
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Eye,
  FileCheck,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Property, PropertyFilters, PropertyPurpose } from '../types/property';
import { TechBrandEmblem } from './TechBrandEmblem';

interface HeroProps {
  filters: PropertyFilters;
  onFilterChange: (filters: Partial<PropertyFilters>) => void;
  onSearchSubmit: () => void;
  onOpenSellModal: () => void;
  properties?: Property[];
  onSelectProperty?: (property: Property) => void;
  onOpenCinemaGallery?: () => void;
}

interface HeroScene {
  id: string;
  index: string;
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  metrics: { label: string; value: string }[];
  fallbackImage: string;
  purposeFilter?: PropertyPurpose | 'Todos';
  targetSection: string;
}

const HERO_SCENES: HeroScene[] = [
  {
    id: 'intermediacao',
    index: '01',
    badge: 'INTERMEDIAÇÃO GLOBAL · BRASIL · EUA · PARAGUAI',
    title: 'Seu imóvel, ',
    highlight: 'nosso compromisso.',
    subtitle:
      'Imobiliária e Administradora de alta performance. Seleção criteriosa de coberturas, mansões, lajes corporativas e ativos internacionais em Curitiba, Miami e Asunción com segurança jurídica integral.',
    metrics: [
      { label: 'Mercados Ativos', value: 'BR · EUA · PY' },
      { label: 'Vistoria & Mídia', value: '4K HDR & 360°' },
      { label: 'Due Diligence', value: '100% Auditada' },
    ],
    fallbackImage:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2200&q=85',
    purposeFilter: 'Venda',
    targetSection: 'imoveis',
  },
  {
    id: 'administracao',
    index: '02',
    badge: 'ADMINISTRAÇÃO PATRIMONIAL & LOCAÇÃO GARANTIDA',
    title: 'Gestão inteligente ',
    highlight: 'para o seu patrimônio.',
    subtitle:
      'Administração completa de imóveis residenciais e comerciais: repasse pontual garantido, controle rigoroso de encargos (IPTU, condomínio e seguro), vistoria digital de alta precisão e relatórios mensais.',
    metrics: [
      { label: 'Repasse ao Proprietário', value: 'Pontualidade 100%' },
      { label: 'Contratos & Laudos', value: 'Assinatura Digital' },
      { label: 'Gestão de Encargos', value: 'IPTU & Condomínio' },
    ],
    fallbackImage:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85',
    purposeFilter: 'Locação',
    targetSection: 'servicos',
  },
  {
    id: 'corporativo',
    index: '03',
    badge: 'GOVERNANÇA CORPORATIVA & CONDOMINIAL',
    title: 'Alta tecnologia em ',
    highlight: 'ativos corporativos.',
    subtitle:
      'Lajes corporativas Triple-A, centros logísticos, salas executivas e administração condominial moderna com transparência contábil e valorização contínua do metro quadrado.',
    metrics: [
      { label: 'Ativos Comerciais', value: 'Triple-A & Lajes' },
      { label: 'Governança', value: 'Gestão Transparente' },
      { label: 'Rentabilidade', value: 'Análise de Yield' },
    ],
    fallbackImage:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=85',
    purposeFilter: 'Todos',
    targetSection: 'categorias',
  },
  {
    id: 'galeria360',
    index: '04',
    badge: 'GALERIA IMERSIVA 4K & TOUR VIRTUAL 360°',
    title: 'Experiência visual ',
    highlight: 'à frente do mercado.',
    subtitle:
      'Explore cada detalhe arquitetônico de qualquer dispositivo: galeria interativa em alta definição, lentes de inspeção luminosa e passeio virtual 360° para visitas remotas em tempo real.',
    metrics: [
      { label: 'Galeria Interativa', value: 'Modo Cinema 4K' },
      { label: 'Imersão Remota', value: 'Tour Virtual 360°' },
      { label: 'Multi-Dispositivo', value: 'Mobile · Tablet · PC' },
    ],
    fallbackImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=85',
    purposeFilter: 'Todos',
    targetSection: 'imoveis',
  },
];

export const Hero: React.FC<HeroProps> = ({
  filters,
  onFilterChange,
  onSearchSubmit,
  onOpenSellModal,
  properties = [],
  onSelectProperty,
  onOpenCinemaGallery,
}) => {
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [visualLens, setVisualLens] = useState<'hdr' | 'lidar' | 'blueprint'>('hdr');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

  const featuredList = React.useMemo(() => {
    const feat = properties.filter((p) => p.featured);
    return feat.length > 0 ? feat : properties.slice(0, 6);
  }, [properties]);

  // Compute available locations dynamically and strictly from registered available properties
  const locationGroups = React.useMemo(() => {
    type CityInfo = {
      value: string;
      label: string;
      city: string;
      stateOrDept: string;
      count: number;
    };

    const countryMap = new Map<
      string,
      {
        country: string;
        countryTitle: string;
        countryCode: string;
        flag: string;
        totalCount: number;
        citiesMap: Map<string, CityInfo>;
      }
    >();

    properties.forEach((p) => {
      const city = (p.city || '').trim();
      if (!city) return;
      const rawCountry = (p.country || 'Brasil').trim();
      const stateOrDept = (p.stateOrDept || '').trim();

      let countryNorm = 'Brasil';
      let countryTitle = 'Brasil';
      let countryCode = 'BR';
      let flag = '🇧🇷';

      const lowerCountry = rawCountry.toLowerCase();
      if (
        lowerCountry.includes('estados unidos') ||
        lowerCountry === 'eua' ||
        lowerCountry === 'usa' ||
        lowerCountry === 'us'
      ) {
        countryNorm = 'Estados Unidos';
        countryTitle = 'Estados Unidos';
        countryCode = 'EUA';
        flag = '🇺🇸';
      } else if (
        lowerCountry.includes('paraguai') ||
        lowerCountry.includes('paraguay') ||
        lowerCountry === 'py'
      ) {
        countryNorm = 'Paraguai';
        countryTitle = 'Paraguai';
        countryCode = 'PY';
        flag = '🇵🇾';
      }

      if (!countryMap.has(countryNorm)) {
        countryMap.set(countryNorm, {
          country: countryNorm,
          countryTitle,
          countryCode,
          flag,
          totalCount: 0,
          citiesMap: new Map<string, CityInfo>(),
        });
      }

      const group = countryMap.get(countryNorm)!;
      group.totalCount += 1;

      const cityKey = city.toLowerCase();
      const existingCity = group.citiesMap.get(cityKey);
      if (existingCity) {
        existingCity.count += 1;
      } else {
        const statePart = stateOrDept ? ` / ${stateOrDept}` : '';
        group.citiesMap.set(cityKey, {
          value: city,
          label: `${city}${statePart}`,
          city,
          stateOrDept,
          count: 1,
        });
      }
    });

    const countryOrder: Record<string, number> = {
      'Brasil': 1,
      'Estados Unidos': 2,
      'Paraguai': 3,
    };

    return Array.from(countryMap.values())
      .sort((a, b) => {
        const orderA = countryOrder[a.country] || 99;
        const orderB = countryOrder[b.country] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return a.countryTitle.localeCompare(b.countryTitle);
      })
      .map((g) => ({
        ...g,
        cities: Array.from(g.citiesMap.values()).sort((a, b) => a.city.localeCompare(b.city)),
      }));
  }, [properties]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveSceneIdx((prev) => (prev + 1) % HERO_SCENES.length);
    }, 8500);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const currentScene = HERO_SCENES[activeSceneIdx];
  const activeFeaturedProperty =
    featuredList.length > 0 ? featuredList[featuredIdx % featuredList.length] : null;

  // Use real portfolio image if available for the backdrop, with fallback to scene image
  const heroBackdropUrl =
    activeFeaturedProperty?.images?.[0] && !imgErrorMap[activeFeaturedProperty.images[0]]
      ? activeFeaturedProperty.images[0]
      : currentScene.fallbackImage;

  const handleQuickPurpose = (purpose: PropertyPurpose) => {
    onFilterChange({ purpose });
    const target = document.getElementById('imoveis');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const lensFilterClasses = {
    hdr: 'contrast-[1.12] brightness-[0.82] saturate-[1.15]',
    lidar: 'contrast-[1.22] brightness-[0.78] saturate-[1.25] hue-rotate-[-8deg]',
    blueprint: 'contrast-[1.28] brightness-[0.75] saturate-[0.65] sepia-[0.25] hue-rotate-[175deg]',
  }[visualLens];

  return (
    <section
      id="top"
      className="relative min-h-[94vh] flex flex-col justify-between pt-24 sm:pt-28 pb-12 overflow-hidden bg-[#050B1A] text-white"
    >
      {/* ================================================================= */}
      {/* DYNAMIC ARCHITECTURAL STAGE BACKDROP WITH LENS & LIDAR OVERLAYS    */}
      {/* ================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentScene.id}-${heroBackdropUrl}`}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {!imgErrorMap[heroBackdropUrl] ? (
              <img
                src={heroBackdropUrl}
                alt={currentScene.title}
                referrerPolicy="no-referrer"
                onError={() =>
                  setImgErrorMap((prev) => ({ ...prev, [heroBackdropUrl]: true }))
                }
                className={`w-full h-full object-cover object-center transition-all duration-700 ${lensFilterClasses}`}
              />
            ) : (
              /* Resilient Architectural Vector Fallback Stage */
              <div className="w-full h-full bg-gradient-to-br from-[#07112B] via-[#050B1A] to-[#0A193D]" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Measured Contrast Scrims for Impeccable Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B1A] via-[#050B1A]/85 to-[#050B1A]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B1A]/95 via-[#050B1A]/70 to-[#050B1A]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.22),_transparent_65%)]" />

        {/* Architectural Blueprint / LiDAR Grid Overlay */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
            visualLens === 'blueprint'
              ? 'opacity-85 bg-[linear-gradient(rgba(56,189,248,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.12)_1px,transparent_1px)] bg-[size:32px_32px]'
              : visualLens === 'lidar'
              ? 'opacity-75 bg-[linear-gradient(rgba(212,175,55,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.1)_1px,transparent_1px)] bg-[size:28px_28px]'
              : 'tech-grid-pattern opacity-50'
          }`}
        />

        {/* Continuous Horizontal LiDAR Laser Beam when in LiDAR or Blueprint mode */}
        {(visualLens === 'lidar' || visualLens === 'blueprint') && (
          <div className="pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#ECC97E] to-transparent shadow-[0_0_20px_#D4AF37] opacity-80 animate-laser-scan" />
        )}

        {/* Precision Architectural Framing Reticles */}
        <div className="absolute top-24 left-6 w-8 h-8 border-t-2 border-l-2 border-[#D4AF37]/45 hidden xl:block pointer-events-none" />
        <div className="absolute top-24 right-6 w-8 h-8 border-t-2 border-r-2 border-[#D4AF37]/45 hidden xl:block pointer-events-none" />
        <div className="absolute bottom-8 left-6 w-8 h-8 border-b-2 border-l-2 border-[#D4AF37]/45 hidden xl:block pointer-events-none" />
        <div className="absolute bottom-8 right-6 w-8 h-8 border-b-2 border-r-2 border-[#D4AF37]/45 hidden xl:block pointer-events-none" />
      </div>

      {/* ================================================================= */}
      {/* TOP INTERACTIVE SCENE SWITCHER & OPTICAL LENS BAR                 */}
      {/* ================================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#D4AF37]/20">
          {/* 4 Interactive Pillars of Bratu Imobiliária & Administradora */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {HERO_SCENES.map((scene, idx) => {
              const isActive = idx === activeSceneIdx;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => {
                    setActiveSceneIdx(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] text-[#050B1A] font-extrabold shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                      : 'bg-[#070F26]/85 text-slate-300 hover:text-white border border-[#D4AF37]/25 hover:border-[#D4AF37]/60'
                  }`}
                >
                  <span className={isActive ? 'text-[#050B1A] font-black' : 'text-[#D4AF37]'}>
                    {scene.index}.
                  </span>
                  <span>
                    {scene.id === 'intermediacao' && 'Imobiliária Alto Padrão'}
                    {scene.id === 'administracao' && 'Administradora de Imóveis'}
                    {scene.id === 'corporativo' && 'Comerciais & Condomínios'}
                    {scene.id === 'galeria360' && 'Galeria 4K & Tour 360°'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Optical Architectural Lens Selector */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Lente Visual:
            </span>
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#070F26]/90 border border-[#D4AF37]/30">
              <button
                type="button"
                onClick={() => setVisualLens('hdr')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  visualLens === 'hdr'
                    ? 'bg-[#D4AF37] text-[#050B1A] font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                HDR 4K
              </button>
              <button
                type="button"
                onClick={() => setVisualLens('lidar')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  visualLens === 'lidar'
                    ? 'bg-[#D4AF37] text-[#050B1A] font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Scan className="w-3 h-3" />
                <span>Scanner 3D</span>
              </button>
              <button
                type="button"
                onClick={() => setVisualLens('blueprint')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  visualLens === 'blueprint'
                    ? 'bg-sky-400 text-[#050B1A] font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Planta CAD</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MAIN HERO 2-COLUMN COMMAND STAGE                                  */}
      {/* ================================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-6 sm:my-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Dynamic Proposition, Service Metrics & Fast Actions */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Unboxed Clean Editorial Kicker */}
                <div className="flex flex-wrap items-center gap-2 mb-3 text-xs font-mono font-semibold tracking-wider text-[#E5C378]">
                  <span>{currentScene.badge}</span>
                </div>

                {/* Primary Headline with Rich Gold Shimmer & Balanced Wrap */}
                <h1
                  className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-5"
                  style={{ textWrap: 'balance' }}
                >
                  {currentScene.title}
                  <span className="tech-gold-text">{currentScene.highlight}</span>
                </h1>

                {/* Concrete Value Proposition */}
                <p className="text-sm sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl mb-6">
                  {currentScene.subtitle}
                </p>

                {/* Live Service & Performance Metrics Row */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-7 max-w-2xl">
                  {currentScene.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#070F26]/90 border border-[#D4AF37]/30 backdrop-blur-md"
                    >
                      <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block truncate">
                        {m.label}
                      </span>
                      <span className="text-xs sm:text-base font-extrabold font-mono tabular-nums text-[#ECC97E] mt-0.5 block truncate">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Primary & Secondary Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
              <button
                type="button"
                onClick={() => handleQuickPurpose('Venda')}
                className="tech-btn-primary inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 text-xs sm:text-sm rounded-xl cursor-pointer whitespace-nowrap shrink-0"
              >
                <KeyRound className="w-4 h-4 text-[#050B1A]" />
                <span>Comprar Imóvel</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPurpose('Locação')}
                className="tech-btn-secondary inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap shrink-0"
              >
                <Building className="w-4 h-4 text-[#E5C378]" />
                <span>Alugar Imóvel</span>
              </button>

              {onOpenCinemaGallery && (
                <button
                  type="button"
                  onClick={onOpenCinemaGallery}
                  className="tech-btn-secondary inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-semibold rounded-xl text-[#ECC97E] border-[#D4AF37]/60 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Abrir Galeria Cinema 4K</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenSellModal}
                className="tech-btn-secondary inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <FileCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Administrar / Anunciar Imóvel</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive 3D TechBrandEmblem + Live Portfolio Spotlight */}
          <div className="lg:col-span-5 flex flex-col items-center gap-4">
            <TechBrandEmblem mode="hero" className="w-full max-w-md" />

            {/* Live Portfolio Interactive Mini-Deck */}
            {activeFeaturedProperty && (
              <div className="w-full max-w-md rounded-2xl bg-[#070F26]/95 border border-[#D4AF37]/40 p-3.5 shadow-[0_15px_35px_rgba(0,0,0,0.65)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#ECC97E] font-bold">
                    <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>VITRINE EM TEMPO REAL ({featuredIdx + 1}/{featuredList.length})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setFeaturedIdx(
                          (prev) => (prev - 1 + featuredList.length) % featuredList.length
                        )
                      }
                      aria-label="Imóvel anterior"
                      className="p-1 rounded-lg bg-[#0B163B] hover:bg-[#13255c] text-[#ECC97E] border border-[#D4AF37]/30 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFeaturedIdx((prev) => (prev + 1) % featuredList.length)
                      }
                      aria-label="Próximo imóvel"
                      className="p-1 rounded-lg bg-[#0B163B] hover:bg-[#13255c] text-[#ECC97E] border border-[#D4AF37]/30 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div
                  onClick={() => onSelectProperty && onSelectProperty(activeFeaturedProperty)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-[#050B1A] border border-[#D4AF37]/40 shrink-0">
                    {!imgErrorMap[activeFeaturedProperty.images[0]] ? (
                      <img
                        src={activeFeaturedProperty.images[0]}
                        alt={activeFeaturedProperty.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setImgErrorMap((prev) => ({
                            ...prev,
                            [activeFeaturedProperty.images[0]]: true,
                          }))
                        }
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#0B163B] text-[#D4AF37] text-[10px] font-mono">
                        {activeFeaturedProperty.code}
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 bg-[#050B1A]/90 px-1.5 py-0.2 rounded text-[9px] font-mono text-[#ECC97E] border border-[#D4AF37]/30">
                      {activeFeaturedProperty.images.length} fotos
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <span className="text-[#D4AF37] font-bold">
                        {activeFeaturedProperty.code}
                      </span>
                      <span>·</span>
                      <span className="truncate">
                        {activeFeaturedProperty.neighborhood}, {activeFeaturedProperty.city}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#ECC97E] transition-colors truncate mt-0.5">
                      {activeFeaturedProperty.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs sm:text-sm font-extrabold font-mono tabular-nums text-[#ECC97E]">
                        {activeFeaturedProperty.priceFormatted}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D4AF37] group-hover:translate-x-0.5 transition-transform">
                        <span>Ver Fotos</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* SMART MULTI-DEVICE SEARCH & FILTER CONSOLE                        */}
        {/* ================================================================= */}
        <div className="w-full mt-8 bg-[#070F26]/95 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.65)] border border-[#D4AF37]/40 text-white relative">
          {/* Console Tech Corner Accents */}
          <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-[#D4AF37]" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-[#D4AF37]" />
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-[#D4AF37]" />
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-[#D4AF37]" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
            {/* Finalidade */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1.5">
                FINALIDADE
              </label>
              <select
                value={filters.purpose}
                onChange={(e) => onFilterChange({ purpose: e.target.value as any })}
                className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white text-xs font-medium rounded-xl px-3 py-3 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors cursor-pointer"
              >
                <option value="Todos" className="bg-[#070F26] text-white">
                  Comprar ou Alugar
                </option>
                <option value="Venda" className="bg-[#070F26] text-white">
                  Comprar (Venda)
                </option>
                <option value="Locação" className="bg-[#070F26] text-white">
                  Alugar (Locação)
                </option>
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1.5">
                TIPO DE IMÓVEL
              </label>
              <select
                value={filters.type}
                onChange={(e) => onFilterChange({ type: e.target.value as any })}
                className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white text-xs font-medium rounded-xl px-3 py-3 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors cursor-pointer"
              >
                <option value="Todos" className="bg-[#070F26] text-white">
                  Todos os Tipos
                </option>
                <option value="Casa" className="bg-[#070F26] text-white">
                  Casas & Mansões
                </option>
                <option value="Apartamento" className="bg-[#070F26] text-white">
                  Apartamentos
                </option>
                <option value="Cobertura" className="bg-[#070F26] text-white">
                  Coberturas / Penthouses
                </option>
                <option value="Comercial" className="bg-[#070F26] text-white">
                  Salas & Lajes Corporativas
                </option>
              </select>
            </div>

            {/* Localização */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1.5 flex items-center justify-between">
                <span>LOCALIZAÇÃO (BR / EUA / PY)</span>
                {properties.length > 0 && (
                  <span className="text-[9px] text-[#D4AF37]/80 font-normal">
                    {locationGroups.reduce((acc, g) => acc + g.cities.length, 0)} polos ativos
                  </span>
                )}
              </label>
              <select
                value={filters.location}
                onChange={(e) => onFilterChange({ location: e.target.value })}
                className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white text-xs font-medium rounded-xl px-3 py-3 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors cursor-pointer"
              >
                <option value="" className="bg-[#070F26] text-white">
                  Todas as Regiões ({properties.length} {properties.length === 1 ? 'imóvel disponível' : 'imóveis disponíveis'})
                </option>

                {locationGroups.map((group) => (
                  <optgroup
                    key={group.country}
                    label={`${group.flag} ${group.countryTitle} (${group.totalCount} ${
                      group.totalCount === 1 ? 'imóvel' : 'imóveis'
                    })`}
                    className="bg-[#070F26] text-[#E5C378] font-bold"
                  >
                    <option value={group.country} className="bg-[#070F26] text-white font-medium">
                      {group.flag} {group.countryTitle} — Todos os Imóveis ({group.totalCount})
                    </option>
                    {group.cities.map((loc) => (
                      <option key={loc.value} value={loc.value} className="bg-[#070F26] text-slate-200">
                        &nbsp;&nbsp;• {loc.label} ({loc.count} {loc.count === 1 ? 'disponível' : 'disponíveis'})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Faixa de Valor */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1.5">
                FAIXA DE INVESTIMENTO
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => onFilterChange({ priceRange: e.target.value as any })}
                className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white text-xs font-medium rounded-xl px-3 py-3 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors cursor-pointer"
              >
                <option value="Todos" className="bg-[#070F26] text-white">
                  Qualquer Valor
                </option>
                <option value="ate-1m" className="bg-[#070F26] text-white">
                  Até R$ 1 Milhão
                </option>
                <option value="1m-3m" className="bg-[#070F26] text-white">
                  R$ 1 Milhão a R$ 3 Milhões
                </option>
                <option value="3m-5m" className="bg-[#070F26] text-white">
                  R$ 3 Milhões a R$ 5 Milhões
                </option>
                <option value="acima-5m" className="bg-[#070F26] text-white">
                  Acima de R$ 5 Milhões (Alto Luxo)
                </option>
              </select>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="button"
                onClick={onSearchSubmit}
                className="tech-btn-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4 text-[#050B1A]" />
                <span>Explorar Imóveis ({properties.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* FULL-WIDTH 4-PILLAR INSTITUTIONAL NAVIGATION STRIP                */}
      {/* ================================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[#D4AF37]/25 text-xs text-slate-300">
          <button
            type="button"
            onClick={() => handleScrollToSection('imoveis')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#070F26]/75 hover:bg-[#0B163B] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[#D4AF37] font-mono font-bold">01.</span>
              <span className="truncate font-medium group-hover:text-white">
                Catálogo & Galeria Cinema 4K
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleScrollToSection('servicos')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#070F26]/75 hover:bg-[#0B163B] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[#D4AF37] font-mono font-bold">02.</span>
              <span className="truncate font-medium group-hover:text-white">
                Administração com Repasse Garantido
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleScrollToSection('brasil-paraguai')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#070F26]/75 hover:bg-[#0B163B] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[#D4AF37] font-mono font-bold">03.</span>
              <span className="truncate font-medium group-hover:text-white">
                Ponte Brasil · EUA · Paraguai
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleScrollToSection('simulador')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#070F26]/75 hover:bg-[#0B163B] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[#D4AF37] font-mono font-bold">04.</span>
              <span className="truncate font-medium group-hover:text-white">
                Simulador de Rentabilidade (Yield)
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          </button>
        </div>
      </div>
    </section>
  );
};
