import React, { useState } from 'react';
import { Calculator, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { getWhatsAppLink } from '../utils/whatsapp';

export const YieldCalculator: React.FC = () => {
  const [investmentValue, setInvestmentValue] = useState<number>(1500000);
  const [marketType, setMarketType] = useState<'brasil' | 'estados-unidos' | 'paraguai'>('brasil');

  const yieldRate = marketType === 'brasil' ? 0.062 : marketType === 'estados-unidos' ? 0.076 : 0.088;
  const annualGrossRent = investmentValue * yieldRate;
  const monthlyGrossRent = annualGrossRent / 12;

  const adminFeeRate = 0.08;
  const monthlyNetEstimate = monthlyGrossRent * (1 - adminFeeRate);
  const annualNetEstimate = monthlyNetEstimate * 12;

  const formattedInvestment = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(investmentValue);

  const formattedMonthlyNet = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(monthlyNetEstimate);

  const formattedAnnualNet = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(annualNetEstimate);

  const marketLabel =
    marketType === 'brasil'
      ? 'Brasil'
      : marketType === 'estados-unidos'
      ? 'Estados Unidos (Flórida / Miami)'
      : 'Paraguai (Asunción / CDE)';

  const handleConsultSimulator = () => {
    const link = getWhatsAppLink(
      `Olá! Utilizei o Simulador de Rentabilidade no site da Bratu com o valor de ${formattedInvestment} (${marketLabel}) e gostaria de receber uma consultoria sobre os melhores imóveis para esse perfil.`
    );
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="simulador" className="py-24 bg-[#070F26] text-white scroll-mt-14 border-b border-[#D4AF37]/20 relative">
      <div className="absolute inset-0 tech-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-[#D4AF37] mb-2">
            <Calculator className="w-4 h-4 text-[#D4AF37]" />
            <span>ALGORITMO DE VALUATION</span>
            <span className="text-white/20">·</span>
            <span>INTELIGÊNCIA DE RETORNO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Simulador de Rentabilidade & Gestão Patrimonial
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2">
            Projete o fluxo de renda passiva com a administração de imóveis da Bratu. Compare projeções de rendimento no Brasil, Estados Unidos e Paraguai.
          </p>
        </div>

        {/* Simulator Card */}
        <div className="bg-[#050B1A] rounded-3xl border border-[#D4AF37]/35 shadow-2xl p-6 sm:p-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls (Span 7) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Market Selector */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-2">
                  MERCADO DE DESTINO
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setMarketType('brasil')}
                    className={`py-3 px-3.5 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between cursor-pointer ${
                      marketType === 'brasil'
                        ? 'border-[#D4AF37] bg-[#0B163B] text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'border-white/10 bg-[#070F26] text-slate-400 hover:border-white/30'
                    }`}
                  >
                    <div>
                      <strong className="block text-sm text-white">Brasil</strong>
                      <span className="text-[10px] text-slate-400 font-mono">Yield residencial ~6.2% a.a.</span>
                    </div>
                    {marketType === 'brasil' && <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMarketType('estados-unidos')}
                    className={`py-3 px-3.5 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between cursor-pointer ${
                      marketType === 'estados-unidos'
                        ? 'border-[#D4AF37] bg-[#0B163B] text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'border-white/10 bg-[#070F26] text-slate-400 hover:border-white/30'
                    }`}
                  >
                    <div>
                      <strong className="block text-sm text-white">Estados Unidos</strong>
                      <span className="text-[10px] text-[#ECC97E] font-mono">Dólar (USD) ~7.6% a.a.</span>
                    </div>
                    {marketType === 'estados-unidos' && <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMarketType('paraguai')}
                    className={`py-3 px-3.5 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between cursor-pointer ${
                      marketType === 'paraguai'
                        ? 'border-[#D4AF37] bg-[#0B163B] text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'border-white/10 bg-[#070F26] text-slate-400 hover:border-white/30'
                    }`}
                  >
                    <div>
                      <strong className="block text-sm text-white">Paraguai</strong>
                      <span className="text-[10px] text-slate-400 font-mono">Yield nobre ~8.8% a.a.</span>
                    </div>
                    {marketType === 'paraguai' && <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />}
                  </button>
                </div>
              </div>

              {/* Investment Amount Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                    VOLUME DE INVESTIMENTO
                  </label>
                  <span className="text-xl font-bold text-[#ECC97E] font-mono tabular-nums">
                    {formattedInvestment}
                  </span>
                </div>
                <input
                  type="range"
                  min={300000}
                  max={10000000}
                  step={50000}
                  value={investmentValue}
                  onChange={(e) => setInvestmentValue(Number(e.target.value))}
                  className="w-full h-2 bg-[#0B163B] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                  <span>R$ 300 mil</span>
                  <span>R$ 5 milhões</span>
                  <span>R$ 10 milhões</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs text-slate-400 self-center mr-1 font-mono">Atalhos:</span>
                {[500000, 1000000, 2500000, 5000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setInvestmentValue(val)}
                    className={`px-3 py-1 text-xs rounded-lg font-mono transition-colors cursor-pointer border ${
                      investmentValue === val
                        ? 'bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] font-bold border-transparent'
                        : 'bg-[#0B163B] border-[#D4AF37]/20 text-slate-300 hover:border-[#D4AF37]/60'
                    }`}
                  >
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#070F26] border border-[#D4AF37]/20 text-xs text-slate-300 space-y-1.5">
                <p className="font-semibold text-[#E5C378]">
                  Vantagens inclusas na Administração Bratu:
                </p>
                <p className="text-slate-400">
                  · Vistorias fotográficas de alta precisão e análise cadastral automatizada.
                </p>
                <p className="text-slate-400">
                  · Repasse pontual garantido em contrato direto em sua conta corrente.
                </p>
                <p className="text-slate-400">
                  · Controle rigoroso de condomínio, IPTU e suporte jurídico completo.
                </p>
              </div>
            </div>

            {/* Right Result Card (Span 5) */}
            <div className="lg:col-span-5 bg-[#0B163B] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-[#D4AF37]/40 shadow-xl relative">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] block mb-1">
                  PROJEÇÃO LÍQUIDA ESTIMADA
                </span>
                <div className="mb-6">
                  <span className="text-xs text-slate-300 block mb-1">Rendimento Mensal Líquido</span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[#ECC97E] tracking-tight">
                    {formattedMonthlyNet}
                    <span className="text-xs font-normal text-slate-400 font-sans ml-1">/mês</span>
                  </div>
                </div>

                <div className="space-y-3 py-4 border-y border-white/10 text-xs mb-6 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Rendimento Anual Líquido:</span>
                    <strong className="text-white tabular-nums font-semibold">{formattedAnnualNet}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Taxa de Yield Anual Bruto:</span>
                    <strong className="text-[#D4AF37] tabular-nums font-semibold">{(yieldRate * 100).toFixed(1)}% a.a.</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Segurança Jurídica & Repasse:</span>
                    <strong className="text-white font-sans font-semibold">100% Garantido</strong>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleConsultSimulator}
                  className="tech-btn-primary w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <span>Receber Carteira de Imóveis para Este Perfil</span>
                  <ArrowRight className="w-4 h-4 text-[#050B1A]" />
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2.5 font-mono">
                  Projeção meramente ilustrativa com base em médias de mercado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
