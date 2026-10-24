import React from 'react';
import { Home, ArrowRight, CheckCircle2, Sparkles, Briefcase, Edit, Settings } from 'lucide-react';
import { PropertyCategory, HomepageSegmentsConfig, INITIAL_HOMEPAGE_SEGMENTS } from '../types/property';
import { TechImage } from './TechImage';

interface SegmentShowcaseProps {
  onSelectCategory: (category: PropertyCategory) => void;
  config?: HomepageSegmentsConfig;
  isAdmin?: boolean;
  onOpenAdminSegments?: () => void;
}

export const SegmentShowcase: React.FC<SegmentShowcaseProps> = ({
  onSelectCategory,
  config = INITIAL_HOMEPAGE_SEGMENTS,
  isAdmin = false,
  onOpenAdminSegments,
}) => {
  const currentConfig = config || INITIAL_HOMEPAGE_SEGMENTS;
  const seg1 = currentConfig.segment1 || INITIAL_HOMEPAGE_SEGMENTS.segment1;
  const seg2 = currentConfig.segment2 || INITIAL_HOMEPAGE_SEGMENTS.segment2;

  const handleNavigateToCategory = (cat: PropertyCategory) => {
    onSelectCategory(cat);
    const target = document.getElementById('imoveis');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-[#050B1A] text-white border-b border-[#D4AF37]/20 relative">
      <div className="absolute inset-0 tech-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Admin Quick Edit Trigger */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-[#D4AF37] mb-2 px-3.5 py-1 rounded-full bg-[#070F26] border border-[#D4AF37]/35 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{currentConfig.headerTag || 'SEGMENTOS DE ATUAÇÃO ESPECIALIZADA'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            {currentConfig.headerTitle || 'Imóveis Comerciais & Residenciais'}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            {currentConfig.headerDescription || 'Atendimento consultivo sob medida com equipes dedicadas para o mercado residencial de alto padrão e para o setor corporativo e comercial.'}
          </p>

          {/* Discreet Admin Direct Edit Button */}
          {isAdmin && onOpenAdminSegments && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={onOpenAdminSegments}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/60 text-[#E5C378] text-xs font-mono font-semibold transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Editar Fotos & Textos dos Segmentos (Painel)</span>
              </button>
            </div>
          )}
        </div>

        {/* 2-Pillar Visual Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pillar 1: Imóveis Residenciais (Segmento 01) */}
          <div className="group rounded-3xl bg-[#070F26] border border-[#D4AF37]/30 hover:border-[#D4AF37]/80 hover:shadow-[0_15px_40px_rgba(212,175,55,0.2)] transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Tech Corner Accents */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5C378] block">
                      {seg1.segmentTag || 'SEGMENTO 01'}
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      {seg1.title || 'Imóveis Residenciais'}
                    </h3>
                  </div>
                </div>

                {seg1.badge && (
                  <span className="text-xs font-mono font-semibold text-[#D4AF37] bg-[#050B1A] px-3 py-1 rounded-full border border-[#D4AF37]/30">
                    {seg1.badge}
                  </span>
                )}
              </div>

              {/* Visual High-Tech Image Frame with Cyber Effects */}
              <div className="mb-6 rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md">
                <TechImage
                  src={seg1.imageUrl}
                  alt={seg1.title}
                  aspectClass="aspect-[16/9]"
                  badge={seg1.imageBadge || 'RESIDENCIAL · LUXO AUTORAL'}
                  techEffect={seg1.techEffect || 'holo-gold'}
                  allowEffectToggle={true}
                  showTechHud={true}
                  onClick={() => handleNavigateToCategory(seg1.category || 'residencial')}
                />
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {seg1.description}
              </p>

              {/* Features List */}
              {Array.isArray(seg1.features) && seg1.features.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8 text-xs text-slate-300 font-medium">
                  {seg1.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-5 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleNavigateToCategory(seg1.category || 'residencial')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] text-[#050B1A] text-xs font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] cursor-pointer"
              >
                <span>{seg1.ctaText || 'Explorar Imóveis Residenciais'}</span>
                <ArrowRight className="w-4 h-4 text-[#050B1A]" />
              </button>
              <span className="text-xs text-slate-400 font-mono">{seg1.footerLabel || 'Venda & Locação'}</span>
            </div>
          </div>

          {/* Pillar 2: Imóveis Comerciais (Segmento 02) */}
          <div className="group rounded-3xl bg-[#070F26] border border-[#D4AF37]/30 hover:border-[#D4AF37]/80 hover:shadow-[0_15px_40px_rgba(212,175,55,0.2)] transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5C378] block">
                      {seg2.segmentTag || 'SEGMENTO 02'}
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      {seg2.title || 'Imóveis Comerciais'}
                    </h3>
                  </div>
                </div>

                {seg2.badge && (
                  <span className="text-xs font-mono font-semibold text-[#D4AF37] bg-[#050B1A] px-3 py-1 rounded-full border border-[#D4AF37]/30">
                    {seg2.badge}
                  </span>
                )}
              </div>

              {/* Visual High-Tech Image Frame with Cyber Effects */}
              <div className="mb-6 rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md">
                <TechImage
                  src={seg2.imageUrl}
                  alt={seg2.title}
                  aspectClass="aspect-[16/9]"
                  badge={seg2.imageBadge || 'COMERCIAL · CORPORATE TRIPLE A'}
                  techEffect={seg2.techEffect || 'cyber-lidar'}
                  allowEffectToggle={true}
                  showTechHud={true}
                  onClick={() => handleNavigateToCategory(seg2.category || 'comercial')}
                />
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {seg2.description}
              </p>

              {/* Features List */}
              {Array.isArray(seg2.features) && seg2.features.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8 text-xs text-slate-300 font-medium">
                  {seg2.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-5 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleNavigateToCategory(seg2.category || 'comercial')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37] text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer"
              >
                <span>{seg2.ctaText || 'Explorar Imóveis Comerciais'}</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
              <span className="text-xs text-slate-400 font-mono">{seg2.footerLabel || 'Venda & Locação'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

