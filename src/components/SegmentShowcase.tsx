import React, { useState } from 'react';
import {
  Home,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Edit,
  PlusCircle,
  Building,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PropertyCategory, HomepageSegmentsConfig, HomepageSegment, INITIAL_HOMEPAGE_SEGMENTS } from '../types/property';
import { TechImage } from './TechImage';
import { ParallaxSection, RevealBlock } from './ParallaxReveal';

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
  const customSegments = currentConfig.customSegments || [];

  const [expandedSeg, setExpandedSeg] = useState<{ [key: string]: boolean }>({
    segment_01: true,
    segment_02: true,
  });

  const toggleExpand = (id: string) => {
    setExpandedSeg((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavigateToCategory = (cat: PropertyCategory) => {
    onSelectCategory(cat);
    const target = document.getElementById('imoveis');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderSegmentCard = (
    seg: HomepageSegment,
    defaultIcon: React.ReactNode,
    isPrimaryButton: boolean = false,
    delay: number = 0
  ) => {
    const hasItems = Array.isArray(seg.items) && seg.items.length > 0;
    const isExpanded = expandedSeg[seg.id] ?? true;

    return (
      <RevealBlock
        key={seg.id}
        delay={delay}
        distance={32}
        parallaxStrength={18}
        className="h-full"
      >
        <div className="h-full group rounded-3xl bg-[#070F26] border border-[#D4AF37]/30 hover:border-[#D4AF37]/80 hover:shadow-[0_15px_40px_rgba(212,175,55,0.2)] transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Tech Corner Accents */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none" />

          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                  {defaultIcon}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5C378] block">
                    {seg.segmentTag || 'SEGMENTO'}
                  </span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {seg.title}
                  </h3>
                </div>
              </div>

              {seg.badge && (
                <span className="text-xs font-mono font-semibold text-[#D4AF37] bg-[#050B1A] px-3 py-1 rounded-full border border-[#D4AF37]/30 shrink-0">
                  {seg.badge}
                </span>
              )}
            </div>

            {/* Main Visual High-Tech Image Frame with Cyber Effects */}
            <div className="mb-6 rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md">
              <TechImage
                src={seg.imageUrl}
                alt={seg.title}
                aspectClass="aspect-[16/9]"
                badge={seg.imageBadge || `${seg.title.toUpperCase()} · 4K`}
                techEffect={seg.techEffect || 'holo-gold'}
                allowEffectToggle={true}
                showTechHud={true}
                onClick={() => handleNavigateToCategory(seg.category || 'residencial')}
              />
            </div>

            {/* Description */}
            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-sans">
              {seg.description}
            </p>

            {/* Features Checklist */}
            {Array.isArray(seg.features) && seg.features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 text-xs text-slate-300 font-medium">
                {seg.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-Items / Extra Cards & Photos in Segment */}
            {hasItems && (
              <div className="mb-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Destaques & Imóveis do Segmento ({seg.items!.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleExpand(seg.id)}
                    className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Recolher' : 'Exibir'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                    {seg.items!.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-[#0B163B]/80 border border-white/10 hover:border-[#D4AF37]/50 p-3 transition-all flex flex-col justify-between group/item"
                      >
                        <div className="rounded-xl overflow-hidden mb-2 relative aspect-[16/10] bg-[#050B1A]">
                          <TechImage
                            src={item.imageUrl}
                            alt={item.title}
                            aspectClass="aspect-[16/10]"
                            badge={item.badge || 'DESTAQUE'}
                            techEffect={item.techEffect || seg.techEffect || 'holo-gold'}
                            allowEffectToggle={false}
                            showTechHud={false}
                          />
                        </div>
                        <div>
                          {item.badge && (
                            <span className="text-[9px] font-mono text-[#E5C378] bg-[#070F26] px-2 py-0.5 rounded border border-[#D4AF37]/30 inline-block mb-1">
                              {item.badge}
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-white group-hover/item:text-[#ECC97E] transition-colors">
                            {item.title}
                          </h4>
                          {item.subtitle && (
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer CTA & Label */}
          <div className="pt-5 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleNavigateToCategory(seg.category || 'residencial')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer ${
                isPrimaryButton
                  ? 'bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] text-[#050B1A] hover:brightness-110'
                  : 'bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37] text-white'
              }`}
            >
              <span>{seg.ctaText || 'Explorar Portfólio'}</span>
              <ArrowRight className={`w-4 h-4 ${isPrimaryButton ? 'text-[#050B1A]' : 'text-[#D4AF37]'}`} />
            </button>
            <span className="text-xs text-slate-400 font-mono">{seg.footerLabel || 'Venda & Locação'}</span>
          </div>
        </div>
      </RevealBlock>
    );
  };

  return (
    <ParallaxSection
      parallaxOffset={24}
      className="py-20 bg-[#050B1A] text-white border-b border-[#D4AF37]/20 relative overflow-hidden"
    >
      <div className="absolute inset-0 tech-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Admin Quick Edit Trigger */}
        <RevealBlock distance={24} parallaxStrength={12} className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-[#D4AF37] mb-2 px-3.5 py-1 rounded-full bg-[#070F26] border border-[#D4AF37]/35 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{currentConfig.headerTag || 'SEGMENTOS DE ATUAÇÃO ESPECIALIZADA'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            {currentConfig.headerTitle || 'Imóveis Comerciais & Residenciais'}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed font-sans">
            {currentConfig.headerDescription || 'Atendimento consultivo sob medida com equipes dedicadas para o mercado residencial de alto padrão e para o setor corporativo e comercial.'}
          </p>

          {/* Discreet Admin Direct Edit Button */}
          {isAdmin && onOpenAdminSegments && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={onOpenAdminSegments}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/60 text-[#E5C378] text-xs font-mono font-semibold transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Administrar Segmentos 01 & 02 (Fotos, Itens, Criar & Excluir)</span>
              </button>
            </div>
          )}
        </RevealBlock>

        {/* Pillars Visual Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Segmento 01: Residencial */}
          {renderSegmentCard(seg1, <Home className="w-6 h-6" />, true, 0.05)}

          {/* Segmento 02: Comercial */}
          {renderSegmentCard(seg2, <Briefcase className="w-6 h-6" />, false, 0.15)}

          {/* Custom Segments (created by admin) */}
          {customSegments.map((custSeg, idx) =>
            renderSegmentCard(
              custSeg,
              <Building className="w-6 h-6" />,
              custSeg.category === 'residencial',
              0.2 + idx * 0.08
            )
          )}
        </div>
      </div>
    </ParallaxSection>
  );
};
