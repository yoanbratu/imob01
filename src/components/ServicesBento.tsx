import React from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Shield, FileCheck, TrendingUp, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { getWhatsAppLink } from '../utils/whatsapp';

interface ServicesBentoProps {
  onOpenSellModal: () => void;
}

export const ServicesBento: React.FC<ServicesBentoProps> = ({ onOpenSellModal }) => {
  const handleServiceWhatsApp = (serviceName: string) => {
    const link = getWhatsAppLink(
      `Olá! Gostaria de entender mais sobre o serviço de ${serviceName} da Bratu Imobiliária e Administradora.`
    );
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.section
      id="servicos"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="py-24 bg-[#070F26] text-white border-y border-[#D4AF37]/20 scroll-mt-14 relative"
    >
      <div className="absolute inset-0 tech-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-[#D4AF37] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>SOLUÇÕES INTEGRADAS DE PATRIMÔNIO</span>
            <span className="text-white/20">·</span>
            <span>GESTÃO & INTERMEDIAÇÃO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Excelência operacional em cada etapa da sua jornada imobiliária.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Combinamos inteligência tecnológica de mercado, rigor jurídico e atendimento personalizado para proteger e rentabilizar o seu patrimônio.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Card 01: Venda Consultiva (Span 6) */}
          <div className="lg:col-span-6 bg-[#0B163B] border border-[#D4AF37]/25 hover:border-[#D4AF37]/70 rounded-3xl p-8 flex flex-col justify-between hover:shadow-[0_10px_35px_rgba(212,175,55,0.15)] transition-all duration-300 group relative">
            {/* Tech Corner Accents */}
            <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-[#D4AF37]" />
            <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-[#D4AF37]" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono font-bold text-[#E5C378] tracking-wider">
                  01. INTERMEDIAÇÃO CONSULTIVA
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#070F26] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-gradient-to-r group-hover:from-[#ECC97E] group-hover:to-[#D4AF37] group-hover:text-[#050B1A] transition-all">
                  <KeyRound className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                Venda Consultiva & Estratégica
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Precificação fundamentada em dados reais de mercado, fotografias com tratamento visual de alto padrão e conexão direta com compradores qualificados no Brasil e exterior.
              </p>
              <ul className="space-y-2.5 mb-8 text-xs font-medium text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Avaliação mercadológica fundamentada e laudo técnico</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Marketing digital segmentado com visibilidade em alta definição</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Segurança documental completa da proposta à escritura</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => handleServiceWhatsApp('Venda de Imóveis')}
                className="text-xs font-bold text-[#E5C378] hover:text-[#FFF1D0] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Consultar Venda de Imóvel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 02: Locação Ágil e Segura (Span 6) */}
          <div className="lg:col-span-6 bg-[#0B163B] border border-[#D4AF37]/25 hover:border-[#D4AF37]/70 rounded-3xl p-8 flex flex-col justify-between hover:shadow-[0_10px_35px_rgba(212,175,55,0.15)] transition-all duration-300 group relative">
            <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-[#D4AF37]" />
            <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-[#D4AF37]" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono font-bold text-[#E5C378] tracking-wider">
                  02. LOCAÇÃO DIGITAL
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#070F26] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-gradient-to-r group-hover:from-[#ECC97E] group-hover:to-[#D4AF37] group-hover:text-[#050B1A] transition-all">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                Locação Ágil & Sem Burocracia
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Processo digital simplificado para locatários e proteção patrimonial inegociável para proprietários. Análise de crédito minuciosa em tempo recorde.
              </p>
              <ul className="space-y-2.5 mb-8 text-xs font-medium text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Aprovação cadastral rápida com garantias modernas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Vistoria fotográfica digital de alta resolução com laudo minucioso</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Assinatura eletrônica com validade jurídica instantânea</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => handleServiceWhatsApp('Locação de Imóveis')}
                className="text-xs font-bold text-[#E5C378] hover:text-[#FFF1D0] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Consultar Opções de Locação</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 03: Administração Completa de Imóveis (Span 7) */}
          <div className="lg:col-span-7 bg-[#050B1A] border-2 border-[#D4AF37]/40 rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            {/* Ambient Gold Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono font-bold text-[#D4AF37] tracking-wider">
                  03. GESTÃO PATRIMONIAL AVANÇADA
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#0B163B] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
                  <FileCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
                Administração Completa de Imóveis
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-xl">
                Seu patrimônio gerido com rigor corporativo e inteligência digital. Cuidamos de todas as rotinas para que você receba seu rendimento com pontualidade, sem desgaste operacional.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs text-slate-200">
                <div className="p-3.5 rounded-xl bg-[#0B163B]/80 border border-[#D4AF37]/20">
                  <strong className="block text-[#E5C378] mb-1 text-sm font-bold">Repasse Pontual</strong>
                  <span>Garantia de recebimento em dia estipulado diretamente em sua conta.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B163B]/80 border border-[#D4AF37]/20">
                  <strong className="block text-[#E5C378] mb-1 text-sm font-bold">Gestão de Encargos</strong>
                  <span>Controle total de condomínio, IPTU e manutenções programadas.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B163B]/80 border border-[#D4AF37]/20">
                  <strong className="block text-[#E5C378] mb-1 text-sm font-bold">Assessoria Jurídica</strong>
                  <span>Suporte legal preventivo, notificações e contratos sob medida.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B163B]/80 border border-[#D4AF37]/20">
                  <strong className="block text-[#E5C378] mb-1 text-sm font-bold">Relatórios Mensais</strong>
                  <span>Extratos claros e demonstrativos prontos para seu imposto de renda.</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={onOpenSellModal}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] text-[#050B1A] hover:brightness-110 transition-all cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                <span>Administrar Meu Imóvel com a Bratu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-slate-400 font-mono">
                Atendimento sob medida para proprietários
              </span>
            </div>
          </div>

          {/* Card 04: Atendimento a Investidores (Span 5) */}
          <div className="lg:col-span-5 bg-[#0B163B] border border-[#D4AF37]/25 hover:border-[#D4AF37]/70 rounded-3xl p-8 flex flex-col justify-between hover:shadow-[0_10px_35px_rgba(212,175,55,0.15)] transition-all duration-300 group relative">
            <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-[#D4AF37]" />
            <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-[#D4AF37]" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono font-bold text-[#E5C378] tracking-wider">
                  04. INVESTIDORES PATRIMONIAIS
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#070F26] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-gradient-to-r group-hover:from-[#ECC97E] group-hover:to-[#D4AF37] group-hover:text-[#050B1A] transition-all">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                Consultoria para Investidores
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Alocação de capital em ativos de alto rendimento. Assessoria para diversificação patrimonial no Brasil e aquisição de imóveis no Paraguai com retorno em moeda forte.
              </p>
              <ul className="space-y-2.5 mb-8 text-xs font-medium text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Análise de Cap Rate, TIR e liquidez estimada</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Vantagens tributárias no Paraguai (regime 10-10-10)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Acesso a lançamentos pré-mercado exclusivos</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => handleServiceWhatsApp('Consultoria de Investimentos Imobiliários')}
                className="text-xs font-bold text-[#E5C378] hover:text-[#FFF1D0] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Falar com Especialista</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
