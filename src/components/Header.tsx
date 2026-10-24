import React, { useState, useEffect } from 'react';
import { MessageCircle, Menu, X, PlusCircle, Globe2, Lock, ShieldCheck } from 'lucide-react';
import { COMPANY_INFO, getWhatsAppLink } from '../utils/whatsapp';

interface HeaderProps {
  onOpenSellModal: () => void;
  isAdmin?: boolean;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSellModal,
  isAdmin = false,
  onOpenAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const defaultWhatsAppUrl = getWhatsAppLink(
    'Olá! Acessei o site da Bratu Imobiliária e Administradora e gostaria de falar com um consultor.'
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050B1A]/95 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-3'
          : 'bg-[#050B1A]/85 backdrop-blur-md text-white border-b border-[#D4AF37]/15 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          {/* Brand Zone */}
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg"
            aria-label="Bratu Imobiliária e Administradora"
          >
            <div className="relative h-10 w-auto flex items-center overflow-hidden rounded">
              <img
                src="/assets/aistudio/LOGOPNG_100042ea.png"
                alt="Logo Bratu Imobiliária"
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white group-hover:text-[#E5C378] transition-colors">
                BRATU
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] -mt-1 font-semibold text-[#D4AF37]">
                Imobiliária & Administradora
              </span>
            </div>
          </a>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium">
            <a
              href="#imoveis"
              className="text-slate-300 hover:text-[#E5C378] transition-colors whitespace-nowrap"
            >
              Imóveis
            </a>
            <a
              href="#categorias"
              className="text-slate-300 hover:text-[#E5C378] transition-colors whitespace-nowrap"
            >
              Comerciais & Residenciais
            </a>
            <a
              href="#servicos"
              className="text-slate-300 hover:text-[#E5C378] transition-colors whitespace-nowrap"
            >
              Serviços & Gestão
            </a>
            <a
              href="#brasil-paraguai"
              className="flex items-center gap-1.5 text-slate-300 hover:text-[#E5C378] transition-colors whitespace-nowrap"
            >
              <Globe2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Brasil · EUA · Paraguai</span>
            </a>
            <a
              href="#depoimentos"
              className="text-slate-300 hover:text-[#E5C378] transition-colors whitespace-nowrap"
            >
              Depoimentos
            </a>
            <a
              href="#simulador"
              className="text-slate-300 hover:text-[#E5C378] transition-colors whitespace-nowrap"
            >
              Simulador Yield
            </a>
            <a
              href="#contato"
              className="text-slate-300 hover:text-[#E5C378] transition-colors whitespace-nowrap"
            >
              Contato
            </a>
          </nav>

          {/* Primary Actions Zone */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Admin Panel Button with Modern Tech Style */}
            <button
              onClick={onOpenAdmin}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                isAdmin
                  ? 'tech-btn-primary'
                  : 'tech-btn-secondary text-slate-200'
              }`}
              title={isAdmin ? 'Painel de Administração Ativo' : 'Acesso Restrito do Administrador com Senha'}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#050B1A]" />
                  <span className="whitespace-nowrap hidden sm:inline">Painel Admin</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="whitespace-nowrap hidden sm:inline">Admin</span>
                </>
              )}
            </button>

            {/* Anunciar Imóvel Button with Modern Tech Secondary */}
            <button
              onClick={onOpenSellModal}
              className="tech-btn-secondary hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="whitespace-nowrap">Anunciar</span>
            </button>

            {/* Direct WhatsApp CTA with Modern Tech Primary */}
            <a
              href={defaultWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tech-btn-primary inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs rounded-xl cursor-pointer"
              title={`Falar no WhatsApp: ${COMPANY_INFO.phoneDisplay}`}
            >
              <MessageCircle className="w-4 h-4 text-[#050B1A] fill-[#050B1A]" />
              <span className="whitespace-nowrap hidden xl:inline">WhatsApp {COMPANY_INFO.phoneDisplay}</span>
              <span className="whitespace-nowrap xl:hidden">WhatsApp</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#D4AF37]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#070F26] text-white border-b border-[#D4AF37]/30 px-6 py-6 shadow-2xl animate-in fade-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-4 text-sm font-medium">
            <a
              href="#imoveis"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10 hover:text-[#E5C378] transition-colors"
            >
              Imóveis em Destaque
            </a>
            <a
              href="#categorias"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10 hover:text-[#E5C378] transition-colors"
            >
              Comerciais & Residenciais
            </a>
            <a
              href="#servicos"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10 hover:text-[#E5C378] transition-colors"
            >
              Serviços & Gestão Patrimonial
            </a>
            <a
              href="#brasil-paraguai"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10 flex items-center justify-between text-white font-semibold"
            >
              <span>Atuação Brasil · EUA · Paraguai</span>
              <Globe2 className="w-4 h-4 text-[#D4AF37]" />
            </a>
            <a
              href="#depoimentos"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10 hover:text-[#E5C378] transition-colors"
            >
              Depoimentos de Clientes
            </a>
            <a
              href="#simulador"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10 hover:text-[#E5C378] transition-colors"
            >
              Simulador de Rendimento & Yield
            </a>
            <a
              href="#contato"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#E5C378] transition-colors"
            >
              Fale Conosco
            </a>

            <div className="pt-3 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#0B163B] text-[#E5C378] border border-[#D4AF37]/50"
              >
                <Lock className="w-4 h-4 text-[#D4AF37]" />
                {isAdmin ? 'Acessar Painel de Administração' : 'Área do Administrador com Senha'}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSellModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#0B163B] text-white border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                Anunciar Meu Imóvel
              </button>
              <a
                href={defaultWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] hover:brightness-110 transition-colors shadow-lg"
              >
                <MessageCircle className="w-4 h-4 text-[#050B1A] fill-[#050B1A]" />
                WhatsApp: {COMPANY_INFO.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
