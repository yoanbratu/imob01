import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWhatsAppLink, COMPANY_INFO } from '../utils/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Reveal button smoothly after page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    // Show contextual message with fluid slide-out from the button
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(true);
    }, 1200);

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
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 transition-opacity duration-500 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Tooltip with silky-smooth organic fade-in & right-to-left slide entry + hover expansion */}
      <AnimatePresence>
        {showTooltip && (
          <motion.a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 38, scale: 0.93, filter: 'blur(6px)' }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              filter: 'blur(0px)',
              transition: {
                // Ultra-soft and organic fade-in
                opacity: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                // Silky, organic right-to-left slide
                x: { type: 'spring', stiffness: 120, damping: 17, mass: 0.85 },
                scale: { type: 'spring', stiffness: 140, damping: 18, mass: 0.8 },
                filter: { duration: 0.65, ease: 'easeOut' },
              },
            }}
            exit={{
              opacity: 0,
              x: 24,
              scale: 0.92,
              filter: 'blur(4px)',
              transition: {
                duration: 0.28,
                ease: [0.4, 0, 0.2, 1],
              },
            }}
            whileHover={{
              scale: 1.045,
              x: -5,
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.75), 0 0 25px rgba(212, 175, 55, 0.38)',
              borderColor: 'rgba(212, 175, 55, 0.75)',
              transition: {
                type: 'spring',
                stiffness: 400,
                damping: 24,
              },
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative hidden sm:flex items-center gap-3 bg-gradient-to-r from-[#070F26]/95 via-[#0A163B]/95 to-[#050B1A]/95 backdrop-blur-md text-white text-xs font-mono py-2.5 px-4 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.65)] border border-[#D4AF37]/45 cursor-pointer select-none origin-right no-underline"
            aria-label={`Abrir WhatsApp no número ${COMPANY_INFO.phoneDisplay}`}
          >
            {/* Subtle connecting caret pointing towards the button */}
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#0A163B] border-t border-r border-[#D4AF37]/45 rotate-45 pointer-events-none group-hover:border-[#D4AF37]/70 transition-colors" />

            {/* Live pulsating status indicator */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </span>

            {/* Text content */}
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-sans uppercase tracking-wider text-slate-300 font-semibold group-hover:text-white transition-colors">
                Atendimento Exclusivo
              </span>
              <span className="text-[#E5C378] font-bold tracking-wide group-hover:text-[#F3D78A] transition-colors">
                WhatsApp: {COMPANY_INFO.phoneDisplay}
              </span>
            </div>

            {/* Subtle separator */}
            <div className="h-4 w-[1px] bg-white/15 mx-0.5" />

            {/* Close button with stopPropagation */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fechar aviso de WhatsApp"
              title="Fechar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.a>
        )}
      </AnimatePresence>

      {/* Floating Action Button with Glowing Gold Sheen & Pulse */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
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
      </motion.div>
    </div>
  );
};
