import React from 'react';
import { COMPANY_INFO, getWhatsAppLink } from '../utils/whatsapp';
import { MessageCircle, Mail, MapPin, Globe, Shield, ArrowUp, Star, ExternalLink } from 'lucide-react';
import { INITIAL_GOOGLE_REVIEW_CONFIG } from '../types/property';
import { TechBrandEmblem } from './TechBrandEmblem';

interface FooterProps {
  onOpenReviewModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenReviewModal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050B1A] text-slate-400 border-t border-[#D4AF37]/20 text-xs relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Mission (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <TechBrandEmblem mode="compact" />

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Assessoria imobiliária de alto padrão, gestão patrimonial e soluções transfronteiriças no <strong>Brasil, Estados Unidos e Paraguai</strong>. Tradição, discrição e segurança jurídica para o seu patrimônio.
            </p>

            <div className="pt-2 text-[11px] text-[#D4AF37] font-mono">
              {COMPANY_INFO.creci}
            </div>

            {/* Google Review Badge */}
            <div className="pt-2">
              {onOpenReviewModal ? (
                <button
                  type="button"
                  onClick={onOpenReviewModal}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#D4AF37]/30 text-white transition-all group cursor-pointer"
                  title="Avaliar a Bratu Imobiliária & Administradora no Google"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold text-slate-200 group-hover:text-white">
                      Avalie no Google
                    </span>
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span className="text-[11px] font-bold text-amber-300 ml-0.5">5.0</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#ECC97E]" />
                </button>
              ) : (
                <a
                  href={INITIAL_GOOGLE_REVIEW_CONFIG.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#D4AF37]/30 text-white transition-all group cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold text-slate-200 group-hover:text-white">
                      Avalie no Google
                    </span>
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span className="text-[11px] font-bold text-amber-300 ml-0.5">5.0</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#ECC97E]" />
                </a>
              )}
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
