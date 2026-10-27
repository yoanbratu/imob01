import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Quote,
  CheckCircle2,
  Building2,
  Globe2,
  Search,
  X,
  QrCode,
  Sparkles,
  LayoutGrid,
  Film,
  MessageCircle,
} from 'lucide-react';
import { GoogleReviewModal } from './GoogleReviewModal';
import { GoogleReviewConfig, INITIAL_GOOGLE_REVIEW_CONFIG } from '../types/property';
import { fetchGoogleReviewConfig, subscribeToGoogleReviewConfig } from '../services/propertyService';
import { ParallaxSection, RevealBlock } from './ParallaxReveal';
import { TESTIMONIALS, Testimonial } from '../data/testimonialsData';

type FilterCountry = 'Todos' | 'Brasil' | 'Paraguai' | 'Estados Unidos' | 'Transfronteiriço';

export const TestimonialsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCountry>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleConfig, setGoogleConfig] = useState<GoogleReviewConfig>(INITIAL_GOOGLE_REVIEW_CONFIG);

  useEffect(() => {
    fetchGoogleReviewConfig().then(setGoogleConfig);
    const unsubscribe = subscribeToGoogleReviewConfig((cfg) => {
      setGoogleConfig(cfg);
    });
    return () => unsubscribe();
  }, []);

  // Responsive items count per view
  useEffect(() => {
    const handleResize = () => {
      if (viewMode === 'grid') {
        if (window.innerWidth < 768) {
          setCardsPerPage(3);
        } else if (window.innerWidth < 1024) {
          setCardsPerPage(4);
        } else {
          setCardsPerPage(6);
        }
      } else {
        if (window.innerWidth < 768) {
          setCardsPerPage(1);
        } else if (window.innerWidth < 1024) {
          setCardsPerPage(2);
        } else {
          setCardsPerPage(3);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Counts per country
  const counts = useMemo(() => {
    return {
      total: TESTIMONIALS.length,
      brasil: TESTIMONIALS.filter((t) => t.country === 'Brasil').length,
      paraguai: TESTIMONIALS.filter((t) => t.country === 'Paraguai').length,
      usa: TESTIMONIALS.filter((t) => t.country === 'Estados Unidos').length,
      cross: TESTIMONIALS.filter((t) => t.country === 'Transfronteiriço').length,
    };
  }, []);

  // Filter & Search Logic
  const filteredTestimonials = useMemo(() => {
    let list = TESTIMONIALS;

    if (activeFilter !== 'Todos') {
      list = list.filter((t) => t.country === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.role.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.propertyDetail.toLowerCase().includes(q) ||
          t.transactionType.toLowerCase().includes(q) ||
          t.quote.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTestimonials.length / cardsPerPage));

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeFilter, searchQuery, viewMode]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  }, [totalPages]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  }, [totalPages]);

  const visibleTestimonials = filteredTestimonials.slice(
    currentIndex * cardsPerPage,
    currentIndex * cardsPerPage + cardsPerPage
  );

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  // Generate numbered pages for pagination
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentIndex > 2) pages.push('...');
      const start = Math.max(1, currentIndex - 1);
      const end = Math.min(totalPages - 2, currentIndex + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentIndex < totalPages - 3) pages.push('...');
      if (!pages.includes(totalPages - 1)) pages.push(totalPages - 1);
    }
    return pages;
  }, [totalPages, currentIndex]);

  return (
    <ParallaxSection
      id="depoimentos"
      parallaxOffset={26}
      className="py-24 bg-[#050B1A] relative overflow-hidden border-t border-[#D4AF37]/20"
    >
      {/* Subtle architectural background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,31,82,0.4),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <RevealBlock distance={24} parallaxStrength={12} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#E5C378] text-xs font-mono tracking-wider uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Credibilidade & Satisfação Comprovada · +{counts.total} Avaliações</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              A Confiança de Quem Investe no{' '}
              <span className="bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#C59B27] bg-clip-text text-transparent">
                Brasil, Paraguai e EUA
              </span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl font-light">
              Catálogo completo de mais de 80 depoimentos reais de proprietários, investidores institucionais e famílias que
              realizaram operações imobiliárias com total assessoria jurídica e segurança patrimonial.
            </p>
          </div>

          {/* Minimalist Carousel Controls & Layout Switcher */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#070F26] border border-[#D4AF37]/35">
              <button
                type="button"
                onClick={() => setViewMode('carousel')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'carousel'
                    ? 'bg-[#D4AF37] text-[#050B1A] font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Modo Carrossel Executivo"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Carrossel</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#D4AF37] text-[#050B1A] font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Modo Grade com Mais Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grade Completa</span>
              </button>
            </div>

            {/* Page Count */}
            <div className="text-xs font-mono text-slate-400 bg-[#070F26] px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-white font-bold">{currentIndex + 1}</span>
              <span className="mx-1 text-slate-600">/</span>
              <span>{totalPages}</span>
            </div>

            {/* Navigation Buttons with Modern High-Tech Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={totalPages <= 1}
                aria-label="Depoimento anterior"
                className="tech-btn-secondary w-9 h-9 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              >
                <ChevronLeft className="w-5 h-5 text-[#ECC97E]" />
              </button>
              <button
                onClick={handleNext}
                disabled={totalPages <= 1}
                aria-label="Próximo depoimento"
                className="tech-btn-secondary w-9 h-9 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              >
                <ChevronRight className="w-5 h-5 text-[#ECC97E]" />
              </button>
            </div>
          </div>
        </RevealBlock>

        {/* Official Google Reviews Trust Card */}
        <RevealBlock delay={0.08} distance={28} parallaxStrength={16}>
          <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#070F26] via-[#0E1B45] to-[#070F26] border border-[#D4AF37]/40 shadow-[0_0_35px_rgba(212,175,55,0.15)] flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 p-2.5 flex items-center justify-center shrink-0 shadow-inner">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-white font-extrabold text-base tracking-tight">
                    {googleConfig.businessName} no Google
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{googleConfig.averageRating.toFixed(1)} / 5.0</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({counts.total}+ avaliações registradas de clientes)
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed">
                  Já é cliente, comprou, alugou ou tem imóvel administrado pela Bratu? Deixe sua avaliação pública no Google e conte como foi a sua experiência com nossa assessoria!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <button
                onClick={() => setIsGoogleModalOpen(true)}
                className="tech-btn-primary px-5 py-3 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.35)] cursor-pointer"
              >
                <Star className="w-4 h-4 fill-[#050B1A]" />
                <span>Avaliar no Google</span>
              </button>
              <button
                onClick={() => setIsGoogleModalOpen(true)}
                className="tech-btn-secondary px-4 py-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer text-slate-200"
              >
                <QrCode className="w-4 h-4 text-[#ECC97E]" />
                <span>QR Code</span>
              </button>
            </div>
          </div>
        </RevealBlock>

        {/* Search Bar & Country Filter Selection Tabs */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Country Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 text-xs scrollbar-none">
              <button
                onClick={() => setActiveFilter('Todos')}
                className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === 'Todos'
                    ? 'tech-btn-primary'
                    : 'tech-btn-secondary text-slate-300'
                }`}
              >
                Todos ({counts.total})
              </button>
              <button
                onClick={() => setActiveFilter('Brasil')}
                className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                  activeFilter === 'Brasil'
                    ? 'tech-btn-primary'
                    : 'tech-btn-secondary text-slate-300'
                }`}
              >
                <span>🇧🇷</span>
                <span>Brasil ({counts.brasil})</span>
              </button>
              <button
                onClick={() => setActiveFilter('Paraguai')}
                className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                  activeFilter === 'Paraguai'
                    ? 'tech-btn-primary'
                    : 'tech-btn-secondary text-slate-300'
                }`}
              >
                <span>🇵🇾</span>
                <span>Paraguai ({counts.paraguai})</span>
              </button>
              <button
                onClick={() => setActiveFilter('Estados Unidos')}
                className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                  activeFilter === 'Estados Unidos'
                    ? 'tech-btn-primary'
                    : 'tech-btn-secondary text-slate-300'
                }`}
              >
                <span>🇺🇸</span>
                <span>Estados Unidos ({counts.usa})</span>
              </button>
              <button
                onClick={() => setActiveFilter('Transfronteiriço')}
                className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                  activeFilter === 'Transfronteiriço'
                    ? 'tech-btn-primary'
                    : 'tech-btn-secondary text-slate-300'
                }`}
              >
                <span>🇧🇷 🇵🇾</span>
                <span>Transfronteiriço ({counts.cross})</span>
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="relative sm:w-72 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#D4AF37]">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente, cidade..."
                className="w-full pl-9 pr-8 py-2 bg-[#070F26] border border-[#D4AF37]/35 focus:border-[#D4AF37] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Testimonials Display Grid / Carousel */}
        {filteredTestimonials.length === 0 ? (
          <div className="py-16 text-center bg-[#070F26] rounded-2xl border border-white/10 p-8 max-w-md mx-auto">
            <Quote className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              Nenhum depoimento encontrado
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Nenhum relato coincide com a busca "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('Todos');
              }}
              className="tech-btn-primary px-4 py-2 rounded-xl text-xs font-bold"
            >
              Ver Todos os Depoimentos
            </button>
          </div>
        ) : (
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`grid gap-6 transition-all duration-300 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {visibleTestimonials.map((item, idx) => (
              <RevealBlock
                key={item.id}
                delay={Math.min(0.04 + idx * 0.05, 0.25)}
                distance={24}
                parallaxStrength={12}
                className="h-full"
              >
                <article className="h-full bg-[#F8F9FB] rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_35px_rgba(212,175,55,0.22)] hover:border-[#D4AF37] transition-all duration-300 flex flex-col justify-between group">
                  {/* Top: Large Executive Portrait and Client Credentials */}
                  <div>
                    <div className="flex items-start gap-4 mb-4 pb-4 border-b border-slate-200/80">
                      {/* Large Person Face Photo Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-[3px] border-[#D4AF37] shadow-[0_8px_25px_rgba(212,175,55,0.3)] ring-4 ring-[#D4AF37]/20 bg-[#050B1A] transition-transform duration-300 group-hover:scale-105">
                          <img
                            src={item.avatarUrl}
                            alt={item.name}
                            loading="lazy"
                            className="w-full h-full object-cover object-top filter contrast-[1.08] brightness-[0.98]"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const parent = (e.target as HTMLElement).parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="w-full h-full flex items-center justify-center text-base font-extrabold text-[#E5C378] bg-[#070F26]">${item.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')}</span>`;
                              }
                            }}
                          />
                        </div>
                        {/* Country Flag Badge Overlaid on Photo */}
                        <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-md shadow-md px-1 py-0.2 border border-slate-200 font-bold">
                          {item.flag.split(' ')[0]}
                        </span>
                      </div>

                      {/* Name, Role & Location */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-0.5 text-[#C59B27] mb-1">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#C59B27]" />
                          ))}
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-1">
                          {item.role}
                        </p>
                        <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-slate-700">{item.country}</span>
                          <span>·</span>
                          <span className="truncate">{item.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Property / Transaction Anchor & Verification Badge */}
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5 truncate max-w-[210px]">
                        <Building2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                        <span className="truncate">{item.transactionType}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300 shadow-xs shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verificado</span>
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-slate-900 mb-2 line-clamp-1">
                      {item.propertyDetail}
                    </div>

                    {/* Quote Content */}
                    <div className="relative my-2">
                      <Quote className="w-6 h-6 text-slate-300/50 absolute -top-1.5 -left-1 pointer-events-none" />
                      <p className="text-slate-700 text-xs sm:text-sm leading-relaxed pl-5 font-normal italic">
                        "{item.quote}"
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom: Date & Contact Reference */}
                  <div className="pt-3 border-t border-slate-200/80 mt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{item.date}</span>
                    <a
                      href={`https://wa.me/5521980984243?text=${encodeURIComponent(
                        `Olá! Gostaria de uma consultoria sobre o perfil de operação do cliente ${item.name} (${item.transactionType} em ${item.location}) que vi nos depoimentos da Bratu.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#B8860B] hover:text-[#050B1A] font-semibold flex items-center gap-1 transition-colors"
                      title="Saber mais sobre esta operação"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Consultar Caso</span>
                    </a>
                  </div>
                </article>
              </RevealBlock>
            ))}
          </div>
        )}

        {/* Numbered Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-[#070F26] border border-[#D4AF37]/35 text-[#ECC97E] hover:border-[#D4AF37] transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            {pageNumbers.map((page, i) =>
              page === '...' ? (
                <span key={`ellipsis-${i}`} className="text-slate-500 font-mono px-1">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentIndex(page as number)}
                  className={`w-9 h-9 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    currentIndex === page
                      ? 'bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                      : 'bg-[#070F26] text-slate-300 hover:text-white border border-white/10 hover:border-[#D4AF37]/50'
                  }`}
                >
                  {(page as number) + 1}
                </button>
              )
            )}

            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-[#070F26] border border-[#D4AF37]/35 text-[#ECC97E] hover:border-[#D4AF37] transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Próxima</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Institutional Trust Footer Banner with Tech Button */}
        <RevealBlock delay={0.18} distance={26} parallaxStrength={14}>
          <div className="mt-14 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#070F26] via-[#0B173E] to-[#070F26] border border-[#D4AF37]/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <Globe2 className="w-5 h-5 text-[#ECC97E]" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Assessoria Transfronteiriça Especializada
                </div>
                <div className="text-xs text-slate-300">
                  Acompanhamento jurídico, documental e cartorário de ponta a ponta em Curitiba, São Paulo, Asunción, Ciudad del Este e Miami.
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/5521980984243?text=Ol%C3%A1%2C+gostaria+de+conhecer+mais+sobre+as+oportunidades+e+depoimentos+de+investimento+no+Brasil%2C+Paraguai+e+Estados+Unidos."
              target="_blank"
              rel="noopener noreferrer"
              className="tech-btn-primary px-6 py-3 rounded-xl text-xs whitespace-nowrap cursor-pointer"
            >
              Falar com um Consultor Especialista
            </a>
          </div>
        </RevealBlock>
      </div>

      {/* Google Review Modal for Clients and Visitors */}
      <GoogleReviewModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        config={googleConfig}
      />
    </ParallaxSection>
  );
};
