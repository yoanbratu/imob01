import React from 'react';
import { motion } from 'framer-motion';
import { Globe2, ShieldCheck, Scale, Award, ArrowUpRight, Check, Landmark, DollarSign, Building } from 'lucide-react';
import { getWhatsAppLink } from '../utils/whatsapp';
import { TechBrandEmblem } from './TechBrandEmblem';

export const CrossBorderSection: React.FC = () => {
  const whatsappCrossBorderUrl = getWhatsAppLink(
    'Olá! Gostaria de agendar uma consultoria sobre oportunidades imobiliárias e investimentos no Brasil, Estados Unidos e Paraguai com a Bratu.'
  );

  return (
    <motion.section
      id="brasil-paraguai"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="py-24 bg-[#050B1A] text-white relative overflow-hidden scroll-mt-14 border-b border-[#D4AF37]/20"
    >
      {/* Decorative architectural grid background */}
      <div className="absolute inset-0 tech-grid-pattern opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Grid: Title & Holographic Seal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          <div className="lg:col-span-8">
            {/* Section Pill Kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-[#D4AF37] mb-3">
              <Globe2 className="w-4 h-4 text-[#D4AF37]" />
              <span>ATUAÇÃO ESTRATÉGICA INTERNACIONAL</span>
              <span className="text-white/20">·</span>
              <span>BRASIL · ESTADOS UNIDOS · PARAGUAI</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Conectando o melhor dos mercados imobiliários do Brasil, Estados Unidos e Paraguai.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed">
              Com presença consolidada e conhecimento profundo das legislações locais e cambiais, a Bratu oferece uma ponte segura para quem deseja morar com alto padrão ou diversificar seu patrimônio com rentabilidade superior e proteção em moeda forte.
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <TechBrandEmblem mode="seal" className="w-full max-w-xs" />
          </div>
        </div>

        {/* 3-Column Comparison: Brasil, Estados Unidos, Paraguai */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {/* Brazil Column */}
          <div className="rounded-3xl bg-[#070F26] border border-[#D4AF37]/30 p-7 sm:p-8 hover:border-[#D4AF37]/80 hover:shadow-[0_10px_35px_rgba(212,175,55,0.15)] transition-all duration-300 flex flex-col justify-between relative group">
            {/* Tech Corner Accents */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#E5C378] block">
                    MERCADO NACIONAL
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    Brasil: Tradição & Alto Luxo
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Landmark className="w-5 h-5" />
                </div>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                Centros urbanos consolidados e litorais de valorização recorde no Sul e Sudeste, com foco em condomínios horizontais, coberturas e lajes corporativas.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Curitiba & Região Metropolitana</strong>
                    <span className="text-slate-400">Batel, Graciosa, Ecoville, Centro Cívico e Alphaville.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Litoral Catarinense & São Paulo</strong>
                    <span className="text-slate-400">Balneário Camboriú frente mar e Jardins em São Paulo.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Foz do Iguaçu & Tríplice Fronteira</strong>
                    <span className="text-slate-400">Polo logístico e comercial de integração internacional.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-white/10 text-[11px] text-slate-400 font-mono">
              Intermediação e administração com CRECI-PR J-08240.
            </div>
          </div>

          {/* USA Column */}
          <div className="rounded-3xl bg-[#070F26] border-2 border-[#D4AF37]/60 p-7 sm:p-8 hover:border-[#D4AF37] hover:shadow-[0_10px_35px_rgba(212,175,55,0.25)] transition-all duration-300 flex flex-col justify-between relative group">
            {/* Featured Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] text-[#050B1A] font-bold text-[9px] font-mono px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
              ★ EXPANSÃO GLOBAL & DÓLAR (USD)
            </div>

            {/* Tech Corner Accents */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#E5C378] block">
                    MERCADO NORTE-AMERICANO
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    Estados Unidos: Dólar & Liquidez
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                Proteção cambial na maior economia do mundo. Oportunidades em condomínios de luxo na Flórida, residências de férias e lajes corporativas.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Miami & Sul da Flórida (Brickell)</strong>
                    <span className="text-slate-400">Apartamentos e coberturas na capital financeira da América Latina.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Orlando & Lake Nona (Vacation Homes)</strong>
                    <span className="text-slate-400">Mansões com piscina privativa e alta rentabilidade de aluguel por temporada.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Estruturação de LLC & Conta Americana</strong>
                    <span className="text-slate-400">Assessoria completa na abertura de empresas, fechamento via Title Company e remessas.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-white/10 text-[11px] text-slate-400 font-mono">
              Atendimento especializado via Desk Internacional Miami / Flórida.
            </div>
          </div>

          {/* Paraguay Column */}
          <div className="rounded-3xl bg-[#070F26] border border-[#D4AF37]/30 p-7 sm:p-8 hover:border-[#D4AF37]/80 hover:shadow-[0_10px_35px_rgba(212,175,55,0.15)] transition-all duration-300 flex flex-col justify-between relative group">
            {/* Tech Corner Accents */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#E5C378] block">
                    HUB SUL-AMERICANO
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    Paraguai: Rendimento & Fiscal
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Globe2 className="w-5 h-5" />
                </div>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                O país mais competitivo da América do Sul para investidores imobiliários. Inflação baixa, livre circulação de capitais e receita líquida em moeda forte.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Regime Tributário Atrativo (10-10-10)</strong>
                    <span className="text-slate-400">10% IVA, 10% imposto de renda e incentivos do regime Maquila.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Yield de Aluguel de 8% a 10% a.a.</strong>
                    <span className="text-slate-400">Asunción (Santa Teresa, Molas López) e Ciudad del Este.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Assessoria Jurídica Bilíngue Integral</strong>
                    <span className="text-slate-400">Auxílio com documentação de compra, residência legal e abertura de contas.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-white/10 text-[11px] text-slate-400 font-mono">
              Operações sob Matrícula Registro PY 45.290 e CRECI-PR.
            </div>
          </div>
        </div>

        {/* Institutional Pillars Strip */}
        <div className="bg-[#070F26] border border-[#D4AF37]/35 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Deseja diversificar seu capital com segurança entre Brasil, Estados Unidos e Paraguai?
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Nossos consultores sêniores realizam uma apresentação detalhada com laudos de mercado, assessoria cambial e estudos de viabilidade tributária.
              </p>
            </div>
          </div>

          <a
            href={whatsappCrossBorderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tech-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
          >
            <span>Agendar Consultoria Internacional</span>
            <ArrowUpRight className="w-4 h-4 text-[#050B1A]" />
          </a>
        </div>
      </div>
    </motion.section>
  );
};
