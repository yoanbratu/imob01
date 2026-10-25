import React from 'react';
import { Search, KeyRound, Building, ShieldCheck, Sparkles, Scan, Globe2 } from 'lucide-react';
import { PropertyFilters, PropertyPurpose } from '../types/property';
import { TechBrandEmblem } from './TechBrandEmblem';

interface HeroProps {
  filters: PropertyFilters;
  onFilterChange: (filters: Partial<PropertyFilters>) => void;
  onSearchSubmit: () => void;
  onOpenSellModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  filters,
  onFilterChange,
  onSearchSubmit,
  onOpenSellModal,
}) => {
  const handleQuickPurpose = (purpose: PropertyPurpose) => {
    onFilterChange({ purpose });
    const target = document.getElementById('imoveis');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[95vh] flex flex-col justify-between pt-28 pb-14 overflow-hidden bg-[#050B1A] text-white">
      {/* Background Photography with Modern Technological Treatment */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2200&q=85"
          alt="Residência de luxo contemporânea"
          className="w-full h-full object-cover object-center filter contrast-[1.1] brightness-[0.88] scale-105"
          referrerPolicy="no-referrer"
        />

        {/* High-tech Duotone Midnight Navy Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B1A] via-[#050B1A]/85 to-[#070F26]/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.18),_transparent_70%)]" />

        {/* Technological Grid Pattern */}
        <div className="absolute inset-0 tech-grid-pattern opacity-60 pointer-events-none" />

        {/* Tech Corner HUD Overlay on Hero Backdrop */}
        <div className="absolute top-28 left-6 w-8 h-8 border-t-2 border-l-2 border-[#D4AF37]/50 hidden md:block" />
        <div className="absolute top-28 right-6 w-8 h-8 border-t-2 border-r-2 border-[#D4AF37]/50 hidden md:block" />
        <div className="absolute bottom-10 left-6 w-8 h-8 border-b-2 border-l-2 border-[#D4AF37]/50 hidden md:block" />
        <div className="absolute bottom-10 right-6 w-8 h-8 border-b-2 border-r-2 border-[#D4AF37]/50 hidden md:block" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-8 md:mt-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-8">
          <div className="lg:col-span-7">
            {/* Technological Kicker Badge */}
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-[#070F26]/90 border border-[#D4AF37]/40 text-xs font-mono font-semibold tracking-wider text-[#E5C378] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span>IMÓVEIS COMERCIAIS & RESIDENCIAIS</span>
              <span className="text-white/30">·</span>
              <span className="text-white/90">BRASIL · ESTADOS UNIDOS · PARAGUAI</span>
            </div>

            {/* Primary Headline with Rich Gold Shimmer */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
              Seu imóvel, <br className="hidden sm:inline" />
              <span className="tech-gold-text">
                nosso compromisso.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mb-8">
              Especialistas em intermediação e administração de <strong>imóveis comerciais e residenciais</strong> de alto padrão. Seleção criteriosa de lajes corporativas, salas de negócios, mansões e coberturas no Brasil, Estados Unidos e Paraguai.
            </p>

            {/* Modern Creative Technological Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 lg:mb-0">
              <button
                onClick={() => handleQuickPurpose('Venda')}
                className="tech-btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm rounded-xl cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-[#050B1A]" />
                <span>Comprar Imóvel</span>
              </button>

              <button
                onClick={() => handleQuickPurpose('Locação')}
                className="tech-btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer"
              >
                <Building className="w-4 h-4 text-[#E5C378]" />
                <span>Alugar Imóvel</span>
              </button>

              <button
                onClick={onOpenSellModal}
                className="tech-btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-200 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Anunciar Meu Imóvel</span>
              </button>
            </div>
          </div>

          {/* Technological Brand Hologram Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <TechBrandEmblem mode="hero" className="w-full max-w-md" />
          </div>
        </div>

        {/* High-Tech Filter Console matching Midnight Navy & Gold */}
        <div className="w-full bg-[#070F26]/90 backdrop-blur-2xl rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#D4AF37]/35 text-white relative">
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
                className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors cursor-pointer"
              >
                <option value="Todos" className="bg-[#070F26] text-white">Comprar ou Alugar</option>
                <option value="Venda" className="bg-[#070F26] text-white">Comprar (Venda)</option>
                <option value="Locação" className="bg-[#070F26] text-white">Alugar (Locação)</option>
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
                className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors cursor-pointer"
              >
                <option value="Todos" className="bg-[#070F26] text-white">Todos os Tipos</option>
                <option value="Casa" className="bg-[#070F26] text-white">Casas & Mansões</option>
                <option value="Apartamento" className="bg-[#070F26] text-white">Apartamentos</option>
                <option value="Cobertura" className="bg-[#070F26] text-white">Coberturas / Penthouses</option>
                <option value="Comercial" className="bg-[#070F26] text-white">Salas & Lajes Corporativas</option>
              </select>
            </div>

            {/* Localização */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1.5">
                LOCALIZAÇÃO (BR / EUA / PY)
              </label>
              <select
                value={filters.location}
                onChange={(e) => onFilterChange({ location: e.target.value })}
                className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors cursor-pointer"
              >
                <option value="" className="bg-[#070F26] text-white">Todas as Regiões</option>
                <option value="Curitiba" className="bg-[#070F26] text-white">Curitiba / PR</option>
                <option value="Balneário Camboriú" className="bg-[#070F26] text-white">Balneário Camboriú / SC</option>
                <option value="São Paulo" className="bg-[#070F26] text-white">São Paulo / SP</option>
                <option value="Foz do Iguaçu" className="bg-[#070F26] text-white">Foz do Iguaçu / PR</option>
                <option value="Miami" className="bg-[#070F26] text-white">Miami (Estados Unidos)</option>
                <option value="Orlando" className="bg-[#070F26] text-white">Orlando (Estados Unidos)</option>
                <option value="Asunción" className="bg-[#070F26] text-white">Asunción (Paraguai)</option>
                <option value="Ciudad del Este" className="bg-[#070F26] text-white">Ciudad del Este (Paraguai)</option>
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
                className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors cursor-pointer"
              >
                <option value="Todos" className="bg-[#070F26] text-white">Qualquer Valor</option>
                <option value="ate-1m" className="bg-[#070F26] text-white">Até R$ 1 Milhão</option>
                <option value="1m-3m" className="bg-[#070F26] text-white">R$ 1 Milhão a R$ 3 Milhões</option>
                <option value="3m-5m" className="bg-[#070F26] text-white">R$ 3 Milhões a R$ 5 Milhões</option>
                <option value="acima-5m" className="bg-[#070F26] text-white">Acima de R$ 5 Milhões (Alto Luxo)</option>
              </select>
            </div>

            {/* Submit Button with Modern High-Tech Style */}
            <div>
              <button
                type="button"
                onClick={onSearchSubmit}
                className="tech-btn-primary w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-[#050B1A]" />
                <span>Buscar Imóveis</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Pillars Strip */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-[#D4AF37]/20 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] font-mono font-bold">01.</span>
            <span>Assessoria Consultiva Personalizada</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] font-mono font-bold">02.</span>
            <span>Atuação Internacional Brasil · EUA · Paraguai</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] font-mono font-bold">03.</span>
            <span>Administração com Repasse Pontual</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] font-mono font-bold">04.</span>
            <span>Segurança Jurídica & Documental</span>
          </div>
        </div>
      </div>
    </section>
  );
};
