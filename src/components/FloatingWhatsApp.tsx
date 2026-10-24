import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
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

  // Framer Motion variants for refined staggered entrance
  const tooltipContainerVariants: Variants = {
    hidden: { opacity: 0, x: 42, scale: 0.82, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        opacity: { duration: 0.85, ease: 'easeOut' },
        x: { type: 'spring', stiffness: 110, damping: 16, mass: 0.85 },
        scale: { type: 'spring', stiffness: 120, damping: 15, mass: 0.8 },
        filter: { duration: 0.7, ease: 'easeOut' },
        delayChildren: 0.18,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      x: 24,
      scale: 0.92,
      filter: 'blur(4px)',
      transition: {
        duration: 0.28,
        ease: 'easeIn',
      },
    },
  };

  const tooltipItemVariants: Variants = {
    hidden: { opacity: 0, x: 12, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 280,
        damping: 22,
      },
    },
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 transition-opacity duration-500 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Tooltip with silky-smooth organic fade-in, scale growth, and staggered child entry */}
      <AnimatePresence>
        {showTooltip && (
          <motion.a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            variants={tooltipContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
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

            {/* Live pulsating status indicator with staggered entry */}
            <motion.span variants={tooltipItemVariants} className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </motion.span>

            {/* Text content with staggered entry */}
            <motion.div variants={tooltipItemVariants} className="flex flex-col leading-tight">
              <span className="text-[10px] font-sans uppercase tracking-wider text-slate-300 font-semibold group-hover:text-white transition-colors">
                Atendimento Exclusivo
              </span>
              <span className="text-[#E5C378] font-bold tracking-wide group-hover:text-[#F3D78A] transition-colors">
                WhatsApp: {COMPANY_INFO.phoneDisplay}
              </span>
            </motion.div>

            {/* Subtle separator */}
            <motion.div variants={tooltipItemVariants} className="h-4 w-[1px] bg-white/15 mx-0.5" />

            {/* Close button with stopPropagation */}
            <motion.button
              variants={tooltipItemVariants}
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
            </motion.button>
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
