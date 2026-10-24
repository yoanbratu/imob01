import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { COMPANY_INFO, getWhatsAppLink } from '../utils/whatsapp';
import { saveLead } from '../services/propertyService';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Comprar um imóvel',
    message: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;
    try {
      await saveLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        purpose: formData.interest,
        message: formData.message,
      });
    } catch (err) {
      console.error('Error saving lead:', err);
    }
    setIsSuccess(true);
  };

  const directWhatsAppUrl = getWhatsAppLink(
    `Olá! Gostaria de falar com um consultor da Bratu Imobiliária sobre ${formData.interest}. Meu nome é ${formData.name || 'Cliente'}.`
  );

  return (
    <section id="contato" className="py-24 bg-[#050B1A] text-white border-t border-[#D4AF37]/20 scroll-mt-14 relative">
      <div className="absolute inset-0 tech-grid-pattern opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Institutional Info & Direct Channels (Span 5) */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-[#D4AF37] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>ATENDIMENTO PERSONALIZADO</span>
                <span className="text-white/20">·</span>
                <span>FALE COM A BRATU</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Inicie uma conversa confidencial.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
                Nossos consultores sêniores estão à disposição para orientar sua próxima aquisição, locação ou estruturação de portfólio no Brasil e no Paraguai.
              </p>
            </div>

            {/* Quick Contact Cards */}
            <div className="space-y-4">
              {/* WhatsApp Card Highlighted */}
              <a
                href={COMPANY_INFO ? getWhatsAppLink('Olá! Gostaria de atendimento com a Bratu Imobiliária.') : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#070F26] border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.2)] transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] flex items-center justify-center shrink-0 shadow-md">
                  <MessageCircle className="w-6 h-6 fill-[#050B1A]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5C378] block">
                    WHATSAPP OFICIAL IMEDIATO
                  </span>
                  <span className="text-base font-extrabold text-white group-hover:text-[#FFF1D0] transition-colors font-mono">
                    {COMPANY_INFO.phoneDisplay}
                  </span>
                </div>
              </a>

              {/* Email Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#070F26] border border-white/10">
                <div className="w-11 h-11 rounded-xl bg-[#0B163B] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    E-MAIL CORPORATIVO
                  </span>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="text-sm font-semibold text-white hover:text-[#E5C378] transition-colors"
                  >
                    {COMPANY_INFO.email}
                  </a>
                </div>
              </div>

              {/* Addresses Box */}
              <div className="p-5 rounded-2xl bg-[#0B163B] text-white border border-[#D4AF37]/25 space-y-3.5">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#E5C378] block">
                      BRASIL · SEDE CORPORATIVA
                    </span>
                    <span className="text-xs text-slate-300">
                      {COMPANY_INFO.addressBrazil}
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/10 flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#E5C378] block">
                      PARAGUAI · ATENDIMENTO INTERNACIONAL
                    </span>
                    <span className="text-xs text-slate-300">
                      {COMPANY_INFO.addressParaguay}
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{COMPANY_INFO.hours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Contact Form in Dark Theme (Span 7) */}
          <div className="lg:col-span-7 bg-[#070F26] border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
            {/* Tech Corner Accents */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]" />

            {isSuccess ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-[#0B163B] text-[#D4AF37] border border-[#D4AF37]/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Mensagem Enviada com Sucesso
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
                  Agradecemos seu contato, {formData.name}. Nossa equipe retornará em breve pelo WhatsApp ou e-mail.
                </p>
                <div className="flex justify-center gap-3">
                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] text-xs font-bold rounded-xl hover:brightness-110 transition-colors shadow-lg"
                  >
                    <MessageCircle className="w-4 h-4 fill-[#050B1A]" />
                    <span>Continuar no WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        interest: 'Comprar um imóvel',
                        message: '',
                      });
                    }}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-300 bg-[#0B163B] hover:bg-[#101F52] border border-white/10 rounded-xl transition-colors cursor-pointer"
                  >
                    Nova Mensagem
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1.5">
                      NOME COMPLETO *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Carlos Albuquerque"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1.5">
                      TELEFONE / WHATSAPP *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ex: (21) 98098-4243"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1.5">
                      E-MAIL *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seuemail@exemplo.com"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1.5">
                      INTERESSE PRINCIPAL
                    </label>
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                    >
                      <option value="Comprar um imóvel" className="bg-[#070F26]">Comprar um imóvel (Venda)</option>
                      <option value="Alugar um imóvel" className="bg-[#070F26]">Alugar um imóvel (Locação)</option>
                      <option value="Administração de imóvel" className="bg-[#070F26]">Administração do meu patrimônio</option>
                      <option value="Investimentos no Paraguai" className="bg-[#070F26]">Investimentos no Paraguai (Asunción / CDE)</option>
                      <option value="Lançamentos exclusivos" className="bg-[#070F26]">Lançamentos exclusivos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1.5">
                    COMO PODEMOS AJUDAR?
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Descreva o imóvel pretendido, região de preferência ou detalhes sobre sua propriedade..."
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/25 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>Seus dados são confidenciais e protegidos pela LGPD.</span>
                  </div>

                  <button
                    type="submit"
                    className="tech-btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#050B1A]" />
                    <span>Enviar Mensagem</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
