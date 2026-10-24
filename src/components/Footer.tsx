import React from 'react';
import { COMPANY_INFO, getWhatsAppLink } from '../utils/whatsapp';
import { MessageCircle, Mail, MapPin, Globe, Shield, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050B1A] text-slate-400 border-t border-[#D4AF37]/20 text-xs relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Mission (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/LOGOPNG_100042ea.png"
                alt="Bratu Imobiliária e Administradora"
                className="h-11 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <span className="text-base font-extrabold text-white tracking-tight block">
                  BRATU
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold block">
                  Imobiliária & Administradora
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Assessoria imobiliária de alto padrão, gestão patrimonial e soluções transfronteiriças no <strong>Brasil, Estados Unidos e Paraguai</strong>. Tradição, discrição e segurança jurídica para o seu patrimônio.
            </p>

            <div className="pt-2 text-[11px] text-[#D4AF37] font-mono">
              {COMPANY_INFO.creci}
            </div>
          </div>

          {/* Quick Links (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white block">
              Navegação
            </span>
            <ul className="space-y-2">
              <li>
                <a href="#imoveis" className="hover:text-[#E5C378] transition-colors">
                  Imóveis em Destaque
                </a>
              </li>
              <li>
                <a href="#categorias" className="hover:text-[#E5C378] transition-colors">
                  Categorias
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#E5C378] transition-colors">
                  Venda & Locação
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#E5C378] transition-colors">
                  Administração de Imóveis
                </a>
              </li>
              <li>
                <a href="#depoimentos" className="hover:text-[#E5C378] transition-colors">
                  Depoimentos de Clientes
                </a>
              </li>
              <li>
                <a href="#simulador" className="hover:text-[#E5C378] transition-colors">
                  Simulador de Rendimento
                </a>
              </li>
              <li>
                <a href="#contato" className="hover:text-[#E5C378] transition-colors">
                  Fale Conosco
                </a>
              </li>
            </ul>
          </div>

          {/* Categorias (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white block">
              Segmentos & Mercados
            </span>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-200">Residencial de Alto Padrão</span>
                <span className="text-slate-500 block text-[11px]">Curitiba, São Paulo & Balneário</span>
              </li>
              <li>
                <span className="text-slate-200">Investimentos nos EUA (Flórida)</span>
                <span className="text-slate-500 block text-[11px]">Miami Brickell & Orlando Lake Nona</span>
              </li>
              <li>
                <span className="text-slate-200">Internacionalização no Paraguai</span>
                <span className="text-slate-500 block text-[11px]">Asunción & Ciudad del Este</span>
              </li>
              <li>
                <span className="text-slate-200">Comercial & Corporativo</span>
                <span className="text-slate-500 block text-[11px]">Salas, Lajes e WTC Corporativo</span>
              </li>
            </ul>
          </div>

          {/* Direct Channels (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white block">
              Canais Diretos
            </span>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="text-slate-300 text-[11px] leading-tight">
                  {COMPANY_INFO.addressBrazil}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Globe className="w-3.5 h-3.5 text-[#ECC97E] shrink-0 mt-0.5" />
                <span className="text-slate-300 text-[11px] leading-tight">
                  {COMPANY_INFO.addressUSA}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Globe className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="text-slate-300 text-[11px] leading-tight">
                  {COMPANY_INFO.addressParaguay}
                </span>
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {COMPANY_INFO.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <a
                  href={getWhatsAppLink('Olá! Gostaria de falar com um consultor da Bratu.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E5C378] hover:text-[#FFF1D0] font-mono font-bold"
                >
                  {COMPANY_INFO.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Bratu Imobiliária e Administradora. Todos os direitos reservados.
          </div>

          <div className="flex items-center gap-6">
            <span>Privacidade & LGPD</span>
            <span>·</span>
            <span>Termos de Uso</span>
            <span>·</span>
            <button
              onClick={scrollToTop}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Voltar ao topo</span>
              <ArrowUp className="w-3 h-3 text-[#D4AF37]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
