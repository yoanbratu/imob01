import React, { useState } from 'react';
import { Property } from '../types/property';
import { Sparkles, Globe, MapPin, Building, ChevronDown, ChevronUp, Bot, Search } from 'lucide-react';
import { COMPANY_INFO } from '../utils/whatsapp';

interface SemanticCatalogIndexProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

/**
 * SemanticCatalogIndex:
 * Renders an accessible, highly structured semantic directory with Schema.org Microdata.
 * Engineered for Google Search indexing and AI Engine Discovery (ChatGPT, Perplexity, Gemini, Claude).
 */
export const SemanticCatalogIndex: React.FC<SemanticCatalogIndexProps> = ({
  properties,
  onSelectProperty,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Group properties by Country and City for clean semantic hierarchical indexing
  const grouped = React.useMemo(() => {
    const map: Record<string, Record<string, Property[]>> = {};

    properties.forEach((p) => {
      const country = p.country || 'Brasil';
      const city = p.city || 'Curitiba';
      if (!map[country]) map[country] = {};
      if (!map[country][city]) map[country][city] = [];
      map[country][city].push(p);
    });

    return map;
  }, [properties]);

  return (
    <section
      id="indice-imoveis-google-ai"
      aria-label="Diretório Completo de Imóveis para Motores de Busca e Inteligências Artificiais"
      className="bg-[#040814] text-slate-300 border-t border-[#D4AF37]/20 py-10 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Accordion / Directory Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#070F26] border border-[#D4AF37]/40 text-[#ECC97E] flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Índice Geral de Imóveis · Otimizado para Google & IAs (ChatGPT, Perplexity, Gemini)
                </h2>
                <span className="text-[10px] font-mono bg-[#0B163B] text-[#ECC97E] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full">
                  {properties.length} cadastrados
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Diretório semântico estruturado para indexação orgânica, rastreadores de busca e agentes de inteligência artificial.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B163B] hover:bg-[#101E4F] border border-[#D4AF37]/35 text-[#E5C378] text-xs font-mono font-bold transition-all cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <span>{isOpen ? 'Ocultar Diretório' : 'Expandir Catálogo Completo'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Directory Content (Always present in DOM with Schema.org Microdata for SEO/AI scrapers) */}
        <div className={`${isOpen ? 'block pt-6' : 'hidden sm:block pt-6 opacity-80 sm:max-h-56 sm:overflow-hidden'} transition-all`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(grouped).map(([country, cities]) => (
              <div key={country} className="bg-[#070F26] rounded-2xl p-4 border border-[#D4AF37]/25 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-xs font-mono font-bold uppercase tracking-wider text-[#ECC97E]">
                  <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Portfólio {country}</span>
                </div>

                <div className="space-y-4">
                  {Object.entries(cities).map(([city, items]) => (
                    <div key={city} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-white">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#D4AF37]" />
                          <span>{city}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {items.length} {items.length === 1 ? 'imóvel' : 'imóveis'}
                        </span>
                      </div>

                      <ul className="space-y-1.5 pl-2 border-l border-white/10">
                        {items.map((prop) => (
                          <li
                            key={prop.id}
                            itemScope
                            itemType="https://schema.org/RealEstateListing"
                            className="text-xs"
                          >
                            <button
                              type="button"
                              onClick={() => onSelectProperty(prop)}
                              className="text-left group hover:text-[#ECC97E] transition-colors flex items-start gap-1.5 cursor-pointer w-full"
                            >
                              <span
                                itemProp="identifier"
                                className="font-mono text-[10px] font-bold text-[#D4AF37] group-hover:text-white shrink-0 mt-0.5"
                              >
                                [{prop.code}]
                              </span>
                              <div className="min-w-0">
                                <span
                                  itemProp="name"
                                  className="font-medium text-slate-200 group-hover:text-[#ECC97E] block truncate"
                                >
                                  {prop.title}
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                                  <span>{prop.neighborhood}</span>
                                  <span>·</span>
                                  <span>{prop.areaM2}m²</span>
                                  <span>·</span>
                                  <span itemProp="price" className="text-[#E5C378]">
                                    {prop.priceFormatted}
                                  </span>
                                  {prop.virtualTour360Url && (
                                    <span className="text-cyan-400 font-bold">· Tour 360°</span>
                                  )}
                                  {prop.youtubeUrl && (
                                    <span className="text-red-400 font-bold">· Vídeo</span>
                                  )}
                                  {prop.featured && (
                                    <span className="text-[#ECC97E] font-bold">· Destaque</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!isOpen && (
            <div className="pt-3 text-center sm:block hidden">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="text-xs font-mono text-[#D4AF37] hover:underline cursor-pointer"
              >
                + Visualizar todos os {properties.length} imóveis cadastrados no índice aberto
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
