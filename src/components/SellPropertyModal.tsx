import React, { useState } from 'react';
import { X, Send, MessageCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { getListingWhatsAppLink, COMPANY_INFO } from '../utils/whatsapp';
import { saveLead } from '../services/propertyService';

interface SellPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SellPropertyModal: React.FC<SellPropertyModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    propertyType: 'Apartamento',
    purpose: 'Venda',
    estimatedValue: '',
    details: '',
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    try {
      await saveLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        propertyType: formData.propertyType,
        purpose: formData.purpose,
        estimatedValue: formData.estimatedValue,
        details: formData.details,
        message: `Solicitação de anúncio para ${formData.purpose}: ${formData.propertyType} em ${formData.city}. Valor estimado: ${formData.estimatedValue}. Detalhes: ${formData.details}`,
      });
    } catch (err) {
      console.error('Error saving owner submission to Firestore:', err);
    }
    setSubmitted(true);
  };

  const handleSendToWhatsApp = async () => {
    if (!formData.name || !formData.phone) {
      alert('Por favor, preencha pelo menos seu nome e telefone/WhatsApp.');
      return;
    }
    try {
      await saveLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        propertyType: formData.propertyType,
        purpose: formData.purpose,
        estimatedValue: formData.estimatedValue,
        details: formData.details,
        message: `Enviado via WhatsApp para ${formData.purpose}: ${formData.propertyType} em ${formData.city}.`,
      });
    } catch (err) {
      console.error('Error saving lead to Firestore:', err);
    }
    const link = getListingWhatsAppLink({
      ownerName: formData.name,
      propertyType: formData.propertyType,
      city: formData.city || 'Não especificada',
      purpose: formData.purpose,
      details: `${formData.estimatedValue ? `Valor estimado: ${formData.estimatedValue}. ` : ''}${formData.details}`,
    });
    window.open(link, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B1A]/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#070F26] text-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden border border-[#D4AF37]/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#050B1A] border-b border-[#D4AF37]/30 p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-[#D4AF37] transition-colors cursor-pointer z-10"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>CANAL EXCLUSIVO PARA PROPRIETÁRIOS</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                Anuncie ou Administre seu Imóvel
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm leading-relaxed">
                Avaliação técnica de mercado, divulgação em alta resolução e gestão com repasse garantido no Brasil, Estados Unidos e Paraguai.
              </p>
            </div>
            <div className="hidden sm:block p-2 rounded-xl bg-[#070F26] border border-[#D4AF37]/40 shrink-0 shadow-md">
              <img
                src="/assets/aistudio/LOGOPNG_100042ea.png"
                alt="Bratu Imobiliária & Administradora"
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo-bratu.png';
                }}
              />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 bg-[#070F26]">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-[#0B163B] text-[#D4AF37] border border-[#D4AF37]/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Solicitação Recebida com Sucesso!
              </h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
                Obrigado, {formData.name}. Nossa equipe entrará em contato pelo WhatsApp {formData.phone} em até 2 horas úteis para os próximos passos.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] text-xs font-bold rounded-xl hover:brightness-110 transition-colors cursor-pointer shadow-lg"
              >
                Concluir
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                    SEU NOME COMPLETO *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                    WHATSAPP / TELEFONE *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ex: (21) 98098-4243"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                  E-MAIL (OPCIONAL)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seuemail@exemplo.com (se desejar retorno por e-mail)"
                  className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                    FINALIDADE
                  </label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                  >
                    <option value="Venda" className="bg-[#070F26]">Quero Vender</option>
                    <option value="Locação e Administração" className="bg-[#070F26]">Locação & Gestão</option>
                    <option value="Apenas Administração" className="bg-[#070F26]">Apenas Gestão</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                    TIPO DO IMÓVEL
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                  >
                    <option value="Apartamento" className="bg-[#070F26]">Apartamento</option>
                    <option value="Casa / Sobrado" className="bg-[#070F26]">Casa / Sobrado</option>
                    <option value="Cobertura" className="bg-[#070F26]">Cobertura</option>
                    <option value="Comercial" className="bg-[#070F26]">Sala / Prédio Comercial</option>
                    <option value="Terreno" className="bg-[#070F26]">Terreno / Lote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                    CIDADE / REGIÃO
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ex: Curitiba, Miami ou Asunción"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                  VALOR ESTIMADO OU PRETENDIDO (OPCIONAL)
                </label>
                <input
                  type="text"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  placeholder="Ex: R$ 1.800.000 ou US$ 350.000"
                  className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                  DETALHES DO IMÓVEL (BAIRRO, CONDOMÍNIO, METRAGEM)
                </label>
                <textarea
                  rows={2}
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Ex: Apartamento com 3 suítes, face norte, 2 vagas, condomínio clube..."
                  className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleSendToWhatsApp}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] text-[#050B1A] text-xs font-bold rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  <MessageCircle className="w-4 h-4 fill-[#050B1A]" />
                  <span>Enviar Direto no WhatsApp ({COMPANY_INFO.phoneDisplay})</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 py-3 px-5 bg-[#0B163B] hover:bg-[#12235E] text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer border border-[#D4AF37]/30"
                >
                  <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Enviar Formulário</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
