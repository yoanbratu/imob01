import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, X, ArrowRight, Trash2, CheckCircle2 } from 'lucide-react';
import { Property } from '../types/property';

interface PropertyComparisonBarProps {
  comparedProperties: Property[];
  onRemoveProperty: (id: string) => void;
  onClearAll: () => void;
  onOpenModal: () => void;
}

export const PropertyComparisonBar: React.FC<PropertyComparisonBarProps> = ({
  comparedProperties,
  onRemoveProperty,
  onClearAll,
  onOpenModal,
}) => {
  const total = comparedProperties.length;

  if (total === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-3xl pointer-events-auto"
      >
        <div className="relative overflow-hidden rounded-2xl bg-[#070F26]/95 border border-[#D4AF37]/50 shadow-[0_15px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl p-3 sm:p-4 text-white">
          {/* Subtle Golden Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-75" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left Info & Slots */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#ECC97E] shadow-sm">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white tracking-wide">
                      Comparativo
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/20 text-[#ECC97E] border border-[#D4AF37]/35">
                      {total}/3
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 hidden sm:block">
                    {total === 1
                      ? 'Selecione mais 1 ou 2 imóveis'
                      : total === 2
                      ? 'Pode adicionar mais 1 ou comparar agora'
                      : 'Capacidade máxima atingida (3/3)'}
                  </span>
                </div>
              </div>

              {/* Thumbnails of compared properties */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                {comparedProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="relative group flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#050B1A] border border-[#D4AF37]/35 shrink-0 transition-all hover:border-[#D4AF37]"
                  >
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-9 h-9 object-cover rounded-lg border border-[#D4AF37]/30 shrink-0"
                    />
                    <div className="min-w-0 max-w-[100px] sm:max-w-[120px]">
                      <div className="text-[9px] font-mono font-bold text-[#E5C378] truncate">
                        {prop.code}
                      </div>
                      <div className="text-[10px] text-white truncate font-medium">
                        {prop.title}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 truncate">
                        {prop.priceFormatted}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveProperty(prop.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Remover do comparativo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Empty Slots */}
                {Array.from({ length: 3 - total }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="hidden md:flex items-center justify-center w-28 h-12 rounded-xl border border-dashed border-white/20 bg-white/[0.02] text-[10px] text-slate-400 font-mono text-center px-2"
                  >
                    + Espaço livre
                  </div>
                ))}
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
              <button
                type="button"
                onClick={onClearAll}
                className="px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Limpar todos os selecionados"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar</span>
              </button>

              <button
                type="button"
                onClick={onOpenModal}
                className="tech-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.4)] whitespace-nowrap"
              >
                <Scale className="w-3.5 h-3.5 text-[#050B1A]" />
                <span>{total >= 2 ? 'Comparar Lado a Lado' : 'Abrir Comparativo'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#050B1A]" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
