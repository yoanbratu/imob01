import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Scale,
  MessageCircle,
  ArrowUpRight,
  MapPin,
  Building,
  Check,
  Minus,
  Sparkles,
  Compass,
  Play,
  Printer,
  Trash2,
  Maximize2,
  ShieldCheck,
  Star,
  ExternalLink,
} from 'lucide-react';
import { Property } from '../types/property';
import { getPropertyWhatsAppLink, getComparisonWhatsAppLink } from '../utils/whatsapp';

interface PropertyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProperties: Property[];
  onRemoveProperty: (id: string) => void;
  onClearAll: () => void;
  onSelectProperty: (property: Property) => void;
}

export const PropertyComparisonModal: React.FC<PropertyComparisonModalProps> = ({
  isOpen,
  onClose,
  comparedProperties,
  onRemoveProperty,
  onClearAll,
  onSelectProperty,
}) => {
  // Compute common and unique amenities across compared properties
  const allAmenities = useMemo(() => {
    const set = new Set<string>();
    comparedProperties.forEach((p) => {
      if (Array.isArray(p.amenities)) {
        p.amenities.forEach((a) => set.add(a));
      }
    });
    return Array.from(set).sort();
  }, [comparedProperties]);

  // WhatsApp consultation link comparing all properties
  const comparisonWhatsAppUrl = useMemo(() => {
    if (comparedProperties.length === 0) return '#';
    return getComparisonWhatsAppLink(
      comparedProperties.map((p) => ({
        code: p.code,
        title: p.title,
        priceFormatted: p.priceFormatted,
        city: `${p.neighborhood}, ${p.city} (${p.country})`,
      }))
    );
  }, [comparedProperties]);

  // Helper to compute price per m2
  const getPricePerM2 = (property: Property): string => {
    if (!property.areaM2 || property.areaM2 <= 0) return '—';
    const rawNumeric = parseFloat(property.priceFormatted.replace(/[^0-9]/g, '')) || 0;
    if (!rawNumeric) return '—';
    const perM2 = Math.round(rawNumeric / property.areaM2);
    const isUSD = property.priceFormatted.includes('US$');
    return `${isUSD ? 'US$' : 'R$'} ${perM2.toLocaleString('pt-BR')}/m²`;
  };

  // Find max area among compared properties to highlight leader
  const maxArea = useMemo(() => {
    if (comparedProperties.length < 2) return null;
    const areas = comparedProperties.map((p) => p.areaM2 || 0);
    const max = Math.max(...areas);
    return max > 0 ? max : null;
  }, [comparedProperties]);

  // Find max suites among compared properties
  const maxSuites = useMemo(() => {
    if (comparedProperties.length < 2) return null;
    const suites = comparedProperties.map((p) => p.suites || 0);
    const max = Math.max(...suites);
    return max > 0 ? max : null;
  }, [comparedProperties]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#070F26] border border-[#D4AF37]/50 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden text-white"
        >
          {/* Top Tech Accent Bar */}
          <div className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-full" />

          {/* Modal Header */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#050B1A]/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#ECC97E] shadow-inner shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    Comparativo de Imóveis Lado a Lado
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#D4AF37]/20 text-[#ECC97E] border border-[#D4AF37]/35">
                    {comparedProperties.length} de 3
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Análise técnica detalhada de valor, área, localização e diferenciais exclusivos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {comparedProperties.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-[#0B163B] border border-[#D4AF37]/30 text-slate-300 hover:text-white hover:border-[#D4AF37] transition-all cursor-pointer flex items-center gap-1.5"
                    title="Imprimir ou Salvar em PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#ECC97E]" />
                    <span className="hidden sm:inline">Imprimir</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClearAll}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Limpar seleção de comparativo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Limpar Tudo</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
                aria-label="Fechar comparativo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
            {comparedProperties.length === 0 ? (
              <div className="py-16 text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-4 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                  <Scale className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Nenhum imóvel selecionado
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mb-6">
                  Navegue pelos cards de imóveis no site e clique no botão <strong>"Comparar"</strong> para incluir até 3 opções e avaliar as especificações lado a lado.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="tech-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Explorar Catálogo de Imóveis
                </button>
              </div>
            ) : (
              <div>
                {/* Mobile scroll hint */}
                <div className="lg:hidden text-center text-[11px] font-mono text-[#ECC97E] mb-3 flex items-center justify-center gap-1.5">
                  <span>← Deslize horizontalmente para comparar todos os imóveis →</span>
                </div>

                {/* Comparison Matrix Table */}
                <div className="overflow-x-auto pb-4">
                  <table className="w-full text-left border-collapse min-w-[620px]">
                    <thead>
                      <tr>
                        {/* Header Column: Attributes label placeholder */}
                        <th className="p-3 w-44 sm:w-52 align-top text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider bg-[#050B1A]/80 border-b border-white/10 rounded-tl-2xl">
                          Especificação
                        </th>

                        {/* Property Column Headers */}
                        {comparedProperties.map((property) => (
                          <th
                            key={property.id}
                            className="p-3 align-top min-w-[220px] max-w-[280px] bg-[#050B1A]/60 border-b border-white/10"
                          >
                            <div className="relative rounded-2xl bg-[#0B163B] border border-[#D4AF37]/40 p-3 shadow-md group">
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => onRemoveProperty(property.id)}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-500 text-white transition-colors cursor-pointer z-10"
                                title="Remover do comparativo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>

                              {/* Photo */}
                              <div
                                onClick={() => {
                                  onClose();
                                  onSelectProperty(property);
                                }}
                                className="relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer mb-2.5 border border-[#D4AF37]/30"
                              >
                                <img
                                  src={property.images[0]}
                                  alt={property.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/75 text-[#ECC97E] backdrop-blur-xs border border-white/10">
                                  {property.code}
                                </span>
                                {property.featured && (
                                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#D4AF37] text-[#050B1A] flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-current" /> Destaque
                                  </span>
                                )}
                              </div>

                              {/* Title & City */}
                              <h4
                                onClick={() => {
                                  onClose();
                                  onSelectProperty(property);
                                }}
                                className="text-xs sm:text-sm font-bold text-white hover:text-[#ECC97E] cursor-pointer line-clamp-1 mb-0.5"
                                title={property.title}
                              >
                                {property.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 truncate mb-2">
                                {property.neighborhood}, {property.city} ({property.country})
                              </p>

                              {/* Price */}
                              <div className="text-base font-extrabold font-mono text-[#ECC97E] tabular-nums mb-3">
                                {property.priceFormatted}
                              </div>

                              {/* Action buttons on header */}
                              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/10">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onSelectProperty(property);
                                  }}
                                  className="tech-btn-secondary px-2 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer truncate"
                                >
                                  <span>Ficha</span>
                                  <ArrowUpRight className="w-3 h-3 text-[#ECC97E]" />
                                </button>
                                <a
                                  href={getPropertyWhatsAppLink(
                                    property.code,
                                    property.title,
                                    property.priceFormatted
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="tech-btn-primary px-2 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer truncate"
                                >
                                  <MessageCircle className="w-3 h-3 text-[#050B1A] fill-[#050B1A]" />
                                  <span>Consultar</span>
                                </a>
                              </div>
                            </div>
                          </th>
                        ))}

                        {/* If less than 3, render invitation placeholder header */}
                        {comparedProperties.length < 3 && (
                          <th className="p-3 align-top min-w-[200px] border-b border-white/10">
                            <div className="h-full min-h-[220px] rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-4 flex flex-col items-center justify-center text-center">
                              <Scale className="w-6 h-6 text-slate-400 mb-2 opacity-50" />
                              <span className="text-xs font-semibold text-slate-300">
                                Espaço para mais {3 - comparedProperties.length}{' '}
                                {3 - comparedProperties.length === 1 ? 'imóvel' : 'imóveis'}
                              </span>
                              <span className="text-[10px] text-slate-500 mt-1 mb-3">
                                Selecione "Comparar" nos cards da página
                              </span>
                              <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-[#0B163B] border border-[#D4AF37]/35 text-[#ECC97E] hover:border-[#D4AF37] cursor-pointer"
                              >
                                Selecionar Imóvel
                              </button>
                            </div>
                          </th>
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10 text-xs">
                      {/* Section: Valores & Custos */}
                      <tr className="bg-[#050B1A]">
                        <td
                          colSpan={comparedProperties.length + (comparedProperties.length < 3 ? 2 : 1)}
                          className="p-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] bg-gradient-to-r from-[#0B163B] to-transparent"
                        >
                          1. Valores Financeiros & Estimativas
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">Valor de Investimento / Aluguel</td>
                        {comparedProperties.map((p) => (
                          <td key={`price-${p.id}`} className="p-3 font-mono font-extrabold text-[#ECC97E] text-sm tabular-nums">
                            {p.priceFormatted}
                            <span className="block text-[10px] font-sans font-normal text-slate-400">
                              {p.purpose === 'Locação' ? 'Locação Mensal' : 'Venda / Aquisição'}
                            </span>
                          </td>
                        ))}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">Valor Estimado por m²</td>
                        {comparedProperties.map((p) => (
                          <td key={`m2price-${p.id}`} className="p-3 font-mono text-slate-200 tabular-nums">
                            {getPricePerM2(p)}
                          </td>
                        ))}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">Condomínio / Taxa Mensal</td>
                        {comparedProperties.map((p) => (
                          <td key={`condo-${p.id}`} className="p-3 font-mono text-slate-300">
                            {p.condoFee || 'Consulte corretor'}
                          </td>
                        ))}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">IPTU / Imposto Territorial</td>
                        {comparedProperties.map((p) => (
                          <td key={`iptu-${p.id}`} className="p-3 font-mono text-slate-300">
                            {p.iptu || 'Consulte corretor'}
                          </td>
                        ))}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>

                      {/* Section: Dimensões & Espaços */}
                      <tr className="bg-[#050B1A]">
                        <td
                          colSpan={comparedProperties.length + (comparedProperties.length < 3 ? 2 : 1)}
                          className="p-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] bg-gradient-to-r from-[#0B163B] to-transparent"
                        >
                          2. Metragem & Estrutura Física
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">Área Privativa / Total</td>
                        {comparedProperties.map((p) => {
                          const isLeader = maxArea && p.areaM2 === maxArea;
                          return (
                            <td key={`area-${p.id}`} className="p-3 font-mono text-slate-100">
                              <span className={`tabular-nums ${isLeader ? 'text-[#ECC97E] font-bold' : ''}`}>
                                {p.areaM2} m²
                              </span>
                              {isLeader && (
                                <span className="ml-1.5 text-[9px] font-mono text-[#D4AF37] bg-[#D4AF37]/15 px-1.5 py-0.2 rounded border border-[#D4AF37]/30">
                                  Maior área
                                </span>
                              )}
                            </td>
                          );
                        })}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">Dormitórios / Quartos</td>
                        {comparedProperties.map((p) => (
                          <td key={`bed-${p.id}`} className="p-3 font-mono text-slate-200">
                            {p.bedrooms !== undefined ? `${p.bedrooms} dormitórios` : '—'}
                          </td>
                        ))}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">Suítes Privativas</td>
                        {comparedProperties.map((p) => {
                          const isLeader = maxSuites && (p.suites || 0) === maxSuites && maxSuites > 0;
                          return (
                            <td key={`suites-${p.id}`} className="p-3 font-mono text-slate-200">
                              <span className={isLeader ? 'text-[#ECC97E] font-bold' : ''}>
                                {p.suites !== undefined ? `${p.suites} suítes` : '0 suítes'}
                              </span>
                            </td>
                          );
                        })}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">Banheiros Totais</td>
                        {comparedProperties.map((p) => (
                          <td key={`bath-${p.id}`} className="p-3 font-mono text-slate-200">
                            {p.bathrooms} banheiros
                          </td>
                        ))}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">Vagas de Garagem</td>
                        {comparedProperties.map((p) => (
                          <td key={`park-${p.id}`} className="p-3 font-mono text-slate-200">
                            {p.parkingSpots !== undefined ? `${p.parkingSpots} vagas` : '—'}
                          </td>
                        ))}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>

                      {/* Section: Localização & Edifício */}
                      <tr className="bg-[#050B1A]">
                        <td
                          colSpan={comparedProperties.length + (comparedProperties.length < 3 ? 2 : 1)}
                          className="p-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] bg-gradient-to-r from-[#0B163B] to-transparent"
                        >
                          3. Localização & Condomínio
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">Bairro & Região</td>
                        {comparedProperties.map((p) => (
                          <td key={`neigh-${p.id}`} className="p-3 text-white font-medium">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                              <span>{p.neighborhood}</span>
                            </div>
                          </td>
                        ))}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">Cidade & País</td>
                        {comparedProperties.map((p) => (
                          <td key={`city-${p.id}`} className="p-3 text-slate-200">
                            {p.city} · <strong className="text-[#ECC97E]">{p.country}</strong>
                          </td>
                        ))}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">Edifício / Empreendimento</td>
                        {comparedProperties.map((p) => (
                          <td key={`condoname-${p.id}`} className="p-3 text-slate-300">
                            {p.condoName ? (
                              <div className="flex items-center gap-1">
                                <Building className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                                <span>{p.condoName}</span>
                              </div>
                            ) : (
                              'Imóvel individual / Não informado'
                            )}
                          </td>
                        ))}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>

                      {/* Section: Tecnologias & Tours */}
                      <tr className="bg-[#050B1A]">
                        <td
                          colSpan={comparedProperties.length + (comparedProperties.length < 3 ? 2 : 1)}
                          className="p-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] bg-gradient-to-r from-[#0B163B] to-transparent"
                        >
                          4. Recursos Digitais & Imersão
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">Tour Virtual 360°</td>
                        {comparedProperties.map((p) => (
                          <td key={`tour-${p.id}`} className="p-3">
                            {p.virtualTour360Url || p.virtualTour360Image ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onSelectProperty(p);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-900 transition-colors cursor-pointer"
                              >
                                <Compass className="w-3 h-3 text-cyan-400" />
                                <span>Disponível (Abrir)</span>
                              </button>
                            ) : (
                              <span className="text-slate-500 font-mono text-[11px]">Sob solicitação</span>
                            )}
                          </td>
                        ))}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300">Vídeo 4K YouTube</td>
                        {comparedProperties.map((p) => (
                          <td key={`video-${p.id}`} className="p-3">
                            {p.youtubeUrl ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onSelectProperty(p);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-red-950/80 text-red-300 border border-red-500/50 hover:bg-red-900 transition-colors cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Vídeo Disponível</span>
                              </button>
                            ) : (
                              <span className="text-slate-500 font-mono text-[11px]">Não cadastrado</span>
                            )}
                          </td>
                        ))}
                        {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                      </tr>

                      {/* Section: Matriz de Comodidades */}
                      {allAmenities.length > 0 && (
                        <>
                          <tr className="bg-[#050B1A]">
                            <td
                              colSpan={comparedProperties.length + (comparedProperties.length < 3 ? 2 : 1)}
                              className="p-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] bg-gradient-to-r from-[#0B163B] to-transparent"
                            >
                              5. Comodidades & Lazer
                            </td>
                          </tr>
                          {allAmenities.map((amenity) => (
                            <tr key={`amenity-${amenity}`}>
                              <td className="p-3 text-slate-300 text-[11px] font-medium">
                                {amenity}
                              </td>
                              {comparedProperties.map((p) => {
                                const hasIt = Array.isArray(p.amenities) && p.amenities.includes(amenity);
                                return (
                                  <td key={`has-${amenity}-${p.id}`} className="p-3">
                                    {hasIt ? (
                                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Incluso</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-600 font-mono text-sm">
                                        <Minus className="w-3.5 h-3.5 text-slate-600" />
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                              {comparedProperties.length < 3 && <td className="p-3 text-slate-600">—</td>}
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer with Collective WhatsApp Action */}
          {comparedProperties.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#050B1A] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>
                  Consultoria sem compromisso com corretores credenciados no Brasil, EUA e Paraguai.
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={comparisonWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tech-btn-primary w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.4)] whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 text-[#050B1A] fill-[#050B1A]" />
                  <span>Enviar Comparativo para Consultor no WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
