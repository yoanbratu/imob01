import React from 'react';
import { Home, Building2, Sparkles, ShieldCheck, PlusCircle } from 'lucide-react';

interface MobileBottomNavProps {
  activeSection: string;
  onOpenCinemaGallery: () => void;
  onOpenSellModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  onOpenCinemaGallery,
  onOpenSellModal,
}) => {
  const scrollToSection = (id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Navegação rápida móvel"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050B1A]/95 backdrop-blur-xl border-t border-[#D4AF37]/35 shadow-[0_-8px_30px_rgba(0,0,0,0.75)] px-2 py-1.5"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1 items-center">
        <button
          type="button"
          onClick={() => scrollToSection('top')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors cursor-pointer ${
            activeSection === 'top'
              ? 'text-[#ECC97E] bg-[#0B163B]/90 border border-[#D4AF37]/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium whitespace-nowrap leading-none">Início</span>
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('imoveis')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors cursor-pointer ${
            activeSection === 'imoveis'
              ? 'text-[#ECC97E] bg-[#0B163B]/90 border border-[#D4AF37]/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium whitespace-nowrap leading-none">Imóveis</span>
        </button>

        <button
          type="button"
          onClick={onOpenCinemaGallery}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] text-[#050B1A] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] cursor-pointer"
        >
          <Sparkles className="w-4 h-4 mb-0.5 text-[#050B1A]" />
          <span className="text-[10px] font-extrabold whitespace-nowrap leading-none">Galeria 4K</span>
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('servicos')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors cursor-pointer ${
            activeSection === 'servicos'
              ? 'text-[#ECC97E] bg-[#0B163B]/90 border border-[#D4AF37]/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium whitespace-nowrap leading-none">Gestão</span>
        </button>

        <button
          type="button"
          onClick={onOpenSellModal}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-300 hover:text-[#ECC97E] transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 mb-0.5 text-[#D4AF37]" />
          <span className="text-[10px] font-medium whitespace-nowrap leading-none">Anunciar</span>
        </button>
      </div>
    </nav>
  );
};
