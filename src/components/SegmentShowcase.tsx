import React from 'react';
import { Building2, Home, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Briefcase } from 'lucide-react';
import { PropertyCategory } from '../types/property';
import { TechImage } from './TechImage';

interface SegmentShowcaseProps {
  onSelectCategory: (category: PropertyCategory) => void;
}

export const SegmentShowcase: React.FC<SegmentShowcaseProps> = ({ onSelectCategory }) => {
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
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-[#D4AF37] mb-2 px-3 py-1 rounded-full bg-[#070F26] border border-[#D4AF37]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>SEGMENTOS DE ATUAÇÃO ESPECIALIZADA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            Imóveis Comerciais & Residenciais
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Atendimento consultivo sob medida com equipes dedicadas para o mercado residencial de alto padrão e para o setor corporativo e comercial.
          </p>
        </div>

        {/* 2-Pillar Visual Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pillar 1: Imóveis Residenciais */}
          <div className="group rounded-3xl bg-[#070F26] border border-[#D4AF37]/30 hover:border-[#D4AF37]/80 hover:shadow-[0_15px_40px_rgba(212,175,55,0.18)] transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
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
                      SEGMENTO 01
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      Imóveis Residenciais
                    </h3>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold text-[#D4AF37] bg-[#050B1A] px-3 py-1 rounded-full border border-[#D4AF37]/30">
                  ALTO PADRÃO
                </span>
              </div>

              {/* Visual Tech Image Frame */}
              <div className="mb-6 rounded-2xl overflow-hidden border border-[#D4AF37]/25">
                <TechImage
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                  alt="Residência de Alto Padrão Bratu"
                  aspectClass="aspect-[16/9]"
                  badge="RESIDENCIAL · LUXO AUTORAL"
                  showTechHud={true}
                  onClick={() => handleNavigateToCategory('residencial')}
                />
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Curadoria refinada de casas e mansões em condomínios fechados, coberturas panorâmicas e apartamentos de luxo nos endereços mais nobres do Brasil e do Paraguai.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Mansões em Condomínios Fechados</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Coberturas & Penthouses Exclusivas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Apartamentos Decorados e Mobiliados</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Lançamentos na Planta Frente Mar</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleNavigateToCategory('residencial')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] text-[#050B1A] text-xs font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] cursor-pointer"
              >
                <span>Explorar Imóveis Residenciais</span>
                <ArrowRight className="w-4 h-4 text-[#050B1A]" />
              </button>
              <span className="text-xs text-slate-400 font-mono">Venda & Locação</span>
            </div>
          </div>

          {/* Pillar 2: Imóveis Comerciais */}
          <div className="group rounded-3xl bg-[#070F26] border border-[#D4AF37]/30 hover:border-[#D4AF37]/80 hover:shadow-[0_15px_40px_rgba(212,175,55,0.18)] transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
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
                      SEGMENTO 02
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      Imóveis Comerciais
                    </h3>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold text-[#D4AF37] bg-[#050B1A] px-3 py-1 rounded-full border border-[#D4AF37]/30">
                  CORPORATIVO
                </span>
              </div>

              {/* Visual Tech Image Frame */}
              <div className="mb-6 rounded-2xl overflow-hidden border border-[#D4AF37]/25">
                <TechImage
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
                  alt="Edifício Comercial e Corporativo Bratu"
                  aspectClass="aspect-[16/9]"
                  badge="COMERCIAL · CORPORATE TRIPLE A"
                  showTechHud={true}
                  onClick={() => handleNavigateToCategory('comercial')}
                />
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Soluções estratégicas para empresas, consultorias e investidores patrimoniais. Lajes corporativas, conjuntos executivos e prédios comerciais com alta taxa de ocupação e rentabilidade.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Lajes Corporativas Triple A</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Salas Comerciais em Centros Financeiros</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Ativos com Contratos de Renda Ativos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Imóveis no World Trade Center & Santa Teresa</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleNavigateToCategory('comercial')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37] text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer"
              >
                <span>Explorar Imóveis Comerciais</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
              <span className="text-xs text-slate-400 font-mono">Venda & Locação</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
