import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { getWhatsAppLink, COMPANY_INFO } from '../utils/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Reveal button smoothly with fade-in and slide-up after page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 600);

    // Show contextual message slightly after button is in place
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(true);
    }, 1400);

    return () => {
      clearTimeout(timer);
      clearTimeout(tooltipTimer);
    };
  }, []);

  const whatsAppLink = getWhatsAppLink(
    'Olá! Estou navegando no site da Bratu Imobiliária e Administradora e gostaria de atendimento com um consultor.'
  );

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 transition-all duration-700 ease-out transform ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
    >
      {/* Discreet Tooltip with smooth entry */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-[#070F26] text-white text-xs font-mono py-2 px-3.5 rounded-xl shadow-2xl border border-[#D4AF37]/40 transition-all duration-500 ease-out animate-in fade-in slide-in-from-right-4">
          <span className="text-[#E5C378]">WhatsApp Oficial: {COMPANY_INFO.phoneDisplay}</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button with Glowing Gold Sheen & Pulse */}
      <div className="relative">
        <span className="absolute inset-0 rounded-full bg-[#D4AF37] opacity-35 animate-ping pointer-events-none" />
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="tech-btn-primary w-14 h-14 rounded-full text-[#050B1A] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.55)] cursor-pointer border-2 border-white/40 relative z-10"
          aria-label={`Abrir WhatsApp para atendimento com consultor Bratu no número ${COMPANY_INFO.phoneDisplay}`}
          title={`WhatsApp: ${COMPANY_INFO.phoneDisplay}`}
        >
          <MessageCircle className="w-7 h-7 fill-[#050B1A]" />
        </a>
      </div>
    </div>
  );
};
