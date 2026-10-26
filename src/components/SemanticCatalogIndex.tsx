import React, { useState, useMemo } from 'react';
import { Property } from '../types/property';
import {
  Globe,
  MapPin,
  Building,
  ChevronDown,
  ChevronUp,
  Bot,
  Search,
  ShieldCheck,
  FileCode,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { COMPANY_INFO } from '../utils/whatsapp';

interface SemanticCatalogIndexProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

/**
 * SemanticCatalogIndex:
 * Renders an accessible, highly structured semantic directory with Schema.org Microdata.
 * Engineered for Google Search indexing and AI Engine Discovery (ChatGPT, Perplexity, Gemini, Claude).
 * Includes quick semantic search, direct links to llms.txt, sitemap.xml, and LGPD safety status.
 */
export const SemanticCatalogIndex: React.FC<SemanticCatalogIndexProps> = ({
  properties,
  onSelectProperty,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState('');

  // Filter properties if search query entered
  const filteredProperties = useMemo(() => {
    if (!catalogFilter.trim()) return properties;
    const term = catalogFilter.toLowerCase().trim();
    return properties.filter(
      (p) =>
        p.code.toLowerCase().includes(term) ||
        p.title.toLowerCase().includes(term) ||
        p.city.toLowerCase().includes(term) ||
        p.neighborhood.toLowerCase().includes(term) ||
        (p.country && p.country.toLowerCase().includes(term)) ||
        (p.type && p.type.toLowerCase().includes(term))
    );
  }, [properties, catalogFilter]);

  // Group properties by Country and City for clean semantic hierarchical indexing
  const grouped = useMemo(() => {
    const map: Record<string, Record<string, Property[]>> = {};

    filteredProperties.forEach((p) => {
      const country = p.country || 'Brasil';
      const city = p.city || 'Curitiba';
      if (!map[country]) map[country] = {};
      if (!map[country][city]) map[country][city] = [];
      map[country][city].push(p);
    });

    return map;
  }, [filteredProperties]);

  return (
    <section
      id="indice-imoveis-google-ai"
      aria-label="Diretório Completo de Imóveis para Motores de Busca e Inteligências Artificiais"
      className="bg-[#030712] text-slate-300 border-t border-[#D4AF37]/30 py-10 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Accordion / Directory Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#070F26] border border-[#D4AF37]/50 text-[#ECC97E] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Bot className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Diretório Semântico de Imóveis · Indexação Google & IAs (ChatGPT, Perplexity, Claude)
                </h2>
                <span className="text-[10px] font-mono bg-[#0B163B] text-[#ECC97E] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full font-bold">
                  {properties.length} imóveis no ar
                </span>
                <span className="text-[10px] font-mono bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  LGPD Seguro
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Catálogo aberto estruturado em Schema.org Microdata e protocolo llms.txt para rastreadores orgânicos e assistentes de IA.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Direct Link to llms.txt standard */}
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-white/15 text-slate-300 hover:text-[#ECC97E] text-[11px] font-mono font-bold transition-all shadow-xs"
              title="Acessar base de conhecimento oficial no formato padrão llms.txt para Inteligências Artificiais"
            >
              <FileCode className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>llms.txt</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>

            {/* Direct Link to Sitemap */}
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-white/15 text-slate-300 hover:text-[#ECC97E] text-[11px] font-mono font-bold transition-all shadow-xs"
              title="Acessar sitemap XML completo com URLs de fotos e vídeos"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>sitemap.xml</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0B163B] to-[#142666] hover:brightness-110 border border-[#D4AF37]/50 text-[#ECC97E] text-xs font-mono font-bold transition-all cursor-pointer shadow-xs"
            >
              <span>{isOpen ? 'Ocultar Diretório' : 'Expandir Catálogo Completo'}</span>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#D4AF37]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37]" />}
            </button>
          </div>
        </div>

        {/* Quick Search Filter inside the Directory */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={catalogFilter}
              onChange={(e) => {
                setCatalogFilter(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              placeholder="Pesquisar por código (ex: BRT-0101), cidade ou bairro no diretório..."
              className="w-full bg-[#070F26] border border-white/15 focus:border-[#D4AF37] text-white text-xs font-mono rounded-xl pl-9 pr-3 py-2 outline-none transition-colors placeholder:text-slate-500"
            />
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
            <span>
              Mostrando <strong className="text-white">{filteredProperties.length}</strong> de{' '}
              <strong className="text-white">{properties.length}</strong> imóveis
            </span>
            {catalogFilter && (
              <button
                type="button"
                onClick={() => setCatalogFilter('')}
                className="text-[#D4AF37] hover:underline cursor-pointer"
              >
                Limpar busca
              </button>
            )}
          </div>
        </div>

        {/* Directory Content (Always present in DOM with Schema.org Microdata for SEO/AI scrapers) */}
        <div className={`${isOpen ? 'block pt-6' : 'hidden sm:block pt-6 opacity-85 sm:max-h-56 sm:overflow-hidden'} transition-all`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(grouped).map(([country, cities]) => (
              <div key={country} className="bg-[#070F26] rounded-2xl p-4 border border-[#D4AF37]/30 space-y-4">
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

                      <ul className="space-y-2 pl-2 border-l border-white/10">
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
                                <div className="text-[10px] text-slate-400 font-mono flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <span>{prop.neighborhood}</span>
                                  <span>·</span>
                                  <span itemProp="floorSize">{prop.areaM2}m²</span>
                                  <span>·</span>
                                  <span itemProp="price" className="text-[#E5C378] font-bold">
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
                + Visualizar todos os {properties.length} imóveis cadastrados no diretório completo
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
