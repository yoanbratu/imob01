import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Star,
  ExternalLink,
  Copy,
  Check,
  X,
  QrCode,
  ShieldCheck,
  Sparkles,
  Smartphone,
  MessageCircle,
  Send,
  ThumbsUp,
  Building,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { GoogleReviewConfig, INITIAL_GOOGLE_REVIEW_CONFIG } from '../types/property';
import {
  cleanGoogleReviewUrl,
  fetchGoogleReviewConfig,
  subscribeToGoogleReviewConfig,
  saveGoogleReviewConfig,
} from '../services/propertyService';
import { getWhatsAppLink, COMPANY_INFO } from '../utils/whatsapp';

interface GoogleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: GoogleReviewConfig;
}

const PROPERTY_TYPES_OPTIONS = [
  'Casas & Mansões',
  'Apartamentos ou condomínios residenciais',
  'Coberturas & Penthouses',
  'Prédios comerciais',
  'Gestão Patrimonial & Locação',
  'Terrenos',
  'Assessoria Internacional (EUA / PY)',
  'Outros',
];

const QUICK_PRAISE_CHIPS = [
  'Atendimento impecável e cortês',
  'Segurança jurídica e transparência',
  'Agilidade na negociação',
  'Gestão patrimonial pontual e segura',
  'Corretores experientes e atenciosos',
  'Excelência em imóveis de alto padrão',
];

export const GoogleReviewModal: React.FC<GoogleReviewModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [internalConfig, setInternalConfig] = useState<GoogleReviewConfig>(
    config || INITIAL_GOOGLE_REVIEW_CONFIG
  );
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Apartamentos ou condomínios residenciais']);
  const [clientName, setClientName] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'direct' | 'qrcode'>('direct');

  // Administrador / Personalização do link direto de review
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isSavingUrl, setIsSavingUrl] = useState(false);

  useEffect(() => {
    if (config) {
      setInternalConfig(config);
    } else {
      fetchGoogleReviewConfig().then((cfg) => {
        setInternalConfig(cfg);
        setCustomUrlInput(cfg.reviewUrl || '');
      });
      const unsubscribe = subscribeToGoogleReviewConfig((cfg) => {
        setInternalConfig(cfg);
        setCustomUrlInput(cfg.reviewUrl || '');
      });
      return () => unsubscribe();
    }
  }, [config]);

  const activeConfig = config || internalConfig;
  const reviewUrl = cleanGoogleReviewUrl(
    activeConfig.reviewUrl || INITIAL_GOOGLE_REVIEW_CONFIG.reviewUrl
  );

  useEffect(() => {
    if (isOpen && reviewUrl) {
      QRCode.toDataURL(reviewUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#050B1A',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Erro ao gerar QR Code para Google Review:', err));
    }
  }, [isOpen, reviewUrl]);

  if (!isOpen) return null;

  const togglePropertyType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleAddQuickPraise = (phrase: string) => {
    setReviewComment((prev) => {
      if (!prev.trim()) return phrase;
      if (prev.includes(phrase)) return prev;
      return `${prev}. ${phrase}`;
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Salvar URL personalizada do Google direto no banco
  const handleSaveCustomUrl = async () => {
    if (!customUrlInput.trim()) return;
    setIsSavingUrl(true);
    try {
      const cleaned = cleanGoogleReviewUrl(customUrlInput.trim());
      const updated: GoogleReviewConfig = {
        ...activeConfig,
        reviewUrl: cleaned,
      };
      await saveGoogleReviewConfig(updated);
      setInternalConfig(updated);
      setIsEditingUrl(false);
      setCopyToast('Link oficial de avaliação atualizado e salvo no Firestore com sucesso!');
      setTimeout(() => setCopyToast(null), 5000);
    } catch (err: any) {
      alert('Erro ao salvar URL: ' + (err?.message || 'Falha na conexão'));
    } finally {
      setIsSavingUrl(false);
    }
  };

  // Formata o texto da avaliação completo para Google e WhatsApp
  const generateFormattedReview = () => {
    const stars = '⭐'.repeat(rating);
    const typesStr = selectedTypes.length > 0 ? ` [${selectedTypes.join(', ')}]` : '';
    const comment = reviewComment.trim() || 'Excelente experiência com a Bratu Imobiliária e Administradora. Equipe altamente profissional e atenciosa!';
    return `${stars}${typesStr}\n"${comment}"\n- ${clientName.trim() || 'Cliente Satisfeito'}`;
  };

  // Ação Principal: Abre o Google diretamente e copia o comentário para facilitar a postagem
  const handlePostToGoogle = () => {
    const textToCopy = reviewComment.trim()
      ? reviewComment.trim()
      : 'Excelente atendimento, transparência jurídica e alto padrão da equipe Bratu Imobiliária & Administradora!';

    try {
      navigator.clipboard.writeText(textToCopy);
    } catch {
      // ignore
    }

    setCopyToast('✨ Texto copiado! Abrindo o Google para você COMENTAR e confirmar sua nota de 5 estrelas!');
    setTimeout(() => setCopyToast(null), 8000);

    // Abre a página oficial de avaliação do Google em nova aba
    window.open(reviewUrl, '_blank', 'noopener,noreferrer');
  };

  // Ação Secundária: Envia o depoimento para o WhatsApp da Bratu
  const handleSendToWhatsApp = () => {
    const formatted = generateFormattedReview();
    const msg = `⭐ *Nova Avaliação de Cliente - Bratu Imobiliária & Administradora*\n\n${formatted}\n\nEnviado através do site oficial.`;
    window.open(getWhatsAppLink(msg), '_blank', 'noopener,noreferrer');
  };

  const ratingLabel = {
    5: '⭐⭐⭐⭐⭐ Excelente! Experiência de altíssimo nível',
    4: '⭐⭐⭐⭐ Muito bom atendimento',
    3: '⭐⭐⭐ Bom atendimento',
    2: '⭐⭐ Regular',
    1: '⭐ Precisa de melhorias',
  }[rating] || 'Excelente (5 estrelas)';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#09122C] via-[#050B1A] to-[#040814] border border-[#D4AF37]/50 rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.25)] overflow-hidden text-white my-6 flex flex-col max-h-[92vh]">
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Card */}
        <div className="p-5 sm:p-6 pb-3 border-b border-white/10 bg-[#070F26]/80 text-center relative">
          {/* Official Bratu Logo */}
          <div className="flex justify-center mb-2.5">
            <img
              src="/assets/aistudio/LOGOPNG_100042ea.png"
              alt="Bratu Imobiliária & Administradora"
              className="h-9 w-auto object-contain drop-shadow-[0_4px_12px_rgba(212,175,55,0.3)]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo-bratu.png';
              }}
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs mb-2 shadow-inner">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="font-semibold text-white text-[11px]">Avaliação Pública Verificada no Google</span>
            <span className="text-amber-400 font-bold text-[11px]">5.0 ★</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Avaliar a <span className="text-[#ECC97E]">Bratu Imobiliária & Administradora</span>
          </h3>
          <p className="text-[11px] text-slate-300 mt-0.5 max-w-md mx-auto">
            Sua opinião é rápida, gratuita e nos ajuda a manter a excelência em Curitiba, Miami, Asunción e Rio de Janeiro.
          </p>

          {/* Tab Selector */}
          <div className="flex items-center justify-center gap-2 mt-3 p-1 bg-[#050B1A] rounded-xl border border-white/10 max-w-xs mx-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-1 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'direct'
                  ? 'bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Avaliação Direta
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qrcode')}
              className={`flex-1 py-1 px-3 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'qrcode'
                  ? 'bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <QrCode className="w-3 h-3" />
              <span>QR Code Celular</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {copyToast && (
            <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-md animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{copyToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setCopyToast(null)}
                className="text-emerald-400 hover:text-white p-0.5 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {activeTab === 'direct' ? (
            <div className="space-y-4">
              {/* 1. Interactive 5 Stars Selection */}
              <div className="p-4 rounded-2xl bg-[#070F26] border border-[#D4AF37]/35 text-center shadow-inner">
                <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-2">
                  1. CLIQUE NAS ESTRELAS PARA ESCOLHER SUA NOTA:
                </span>
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFilled = (hoverRating || rating) >= starValue;
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(starValue)}
                        className="transition-transform duration-150 hover:scale-125 focus:outline-none cursor-pointer p-1"
                        aria-label={`${starValue} estrelas`}
                      >
                        <Star
                          className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]'
                              : 'text-slate-600 hover:text-amber-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="inline-block mt-2 text-xs font-mono font-bold text-amber-300 bg-[#0B163B] px-3 py-1 rounded-full border border-[#D4AF37]/30">
                  {ratingLabel}
                </span>
              </div>

              {/* 2. Textarea: "Conte como foi sua experiência neste lugar" */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1.5 font-bold">
                  2. CONTE COMO FOI SUA EXPERIÊNCIA COM A BRATU:
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ex: Excelente atendimento com agilidade e total segurança jurídica. Recomendo muito a equipe Bratu!"
                  className="w-full bg-[#070F26] border border-[#D4AF37]/40 text-white rounded-2xl p-3 text-xs focus:ring-1 focus:ring-[#D4AF37] focus:outline-none placeholder:text-slate-500 shadow-inner"
                />

                {/* Quick Praise Pills (Sugestões Rápidas de 1 Clique) */}
                <div className="mt-2">
                  <span className="block text-[10px] font-mono text-slate-400 mb-1">
                    Sugestões rápidas (clique para incluir no texto):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PRAISE_CHIPS.map((chip, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddQuickPraise(chip)}
                        className="text-[10px] px-2 py-1 rounded-lg bg-[#070F26] hover:bg-[#0B163B] border border-white/10 hover:border-[#D4AF37]/60 text-slate-300 hover:text-[#ECC97E] transition-all cursor-pointer"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Property Types Pills (Matching the Google Screen in Attachment) */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1.5 font-bold">
                  3. QUE TIPO DE PROPRIEDADES OU SERVIÇOS MOSTRARAM PARA VOCÊ?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PROPERTY_TYPES_OPTIONS.map((type) => {
                    const isSelected = selectedTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => togglePropertyType(type)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#0B163B] border-[#D4AF37] text-white font-semibold shadow-xs'
                            : 'bg-[#070F26] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-[#D4AF37]" />}
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Name / Client Info (Optional) */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  SEU NOME OU CARGO (OPCIONAL):
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo ou Dra. Fernanda"
                  className="w-full bg-[#070F26] border border-white/15 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                {/* Main Action: Post directly to Google */}
                <button
                  type="button"
                  onClick={handlePostToGoogle}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8860B] text-[#050B1A] font-extrabold text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all cursor-pointer active:scale-98"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#050B1A" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#050B1A" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#050B1A" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#050B1A" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Postar Avaliação no Google (1 Clique)</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </button>

                {/* Practical Guidance Card (Explica como postar em segundos) */}
                <div className="p-3 rounded-2xl bg-[#050B1A] border border-[#D4AF37]/35 text-slate-300 text-[11px] leading-relaxed flex items-start gap-2.5 shadow-inner">
                  <span className="text-amber-400 text-base leading-none shrink-0 mt-0.5">💡</span>
                  <div>
                    <strong className="text-white block font-sans text-xs mb-0.5">
                      Como avaliar em 5 segundos no Google:
                    </strong>
                    <span>
                      Ao clicar no botão, seu texto já é copiado automaticamente! Na janela da Bratu no Google, clique na opção de <strong>COMENTAR</strong> (campo <em>"Conte como foi sua experiência neste lugar"</em>), cole o texto copiado (<code>Ctrl+V</code> ou toque para colar) e confirme suas 5 estrelas!
                    </span>
                  </div>
                </div>

                {/* Secondary Action: Direct Maps Listing */}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Bratu+Imobili%C3%A1ria+e+Administradora+Downtown+Barra+da+Tijuca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/40 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="Abrir a ficha da Bratu Imobiliária no Google Maps com botão direto de avaliação"
                >
                  <ExternalLink className="w-4 h-4 text-[#ECC97E]" />
                  <span>Abrir Ficha no Google Maps (Barra da Tijuca)</span>
                </a>

                {/* Third Action: Send to WhatsApp */}
                <button
                  type="button"
                  onClick={handleSendToWhatsApp}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#070F26] hover:bg-[#0B173E] border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Enviar também para o WhatsApp da Bratu</span>
                </button>

                {/* Direct Link Copier & Customizer Bar */}
                <div className="pt-1 space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-[#050B1A] border border-white/10 text-xs">
                    <span className="text-slate-400 truncate flex-1 font-mono text-[10px] select-all px-1.5" title={reviewUrl}>
                      {reviewUrl}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1 transition-all cursor-pointer shrink-0 text-[11px]"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-300" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingUrl(!isEditingUrl)}
                      className="px-2 py-1 rounded-lg bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/40 text-[#ECC97E] text-[11px] font-semibold transition-all cursor-pointer shrink-0"
                      title="Editar ou colar o link oficial do Google da Bratu"
                    >
                      {isEditingUrl ? 'Fechar' : 'Configurar Link'}
                    </button>
                  </div>

                  {/* Inline Link Configurator for Ioan Bratu / Admin */}
                  {isEditingUrl && (
                    <div className="p-3 rounded-2xl bg-[#070F26] border border-[#D4AF37]/40 space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#ECC97E]">
                        <span>CONFIGURAR LINK OFICIAL DO GOOGLE:</span>
                      </div>
                      <input
                        type="text"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        placeholder="Cole o link do Google Meu Negócio (ex: https://g.page/r/... ou https://search.google.com/local/writereview?placeid=...)"
                        className="w-full bg-[#050B1A] border border-white/20 text-white rounded-xl px-3 py-2 text-xs font-mono select-all focus:ring-1 focus:ring-[#D4AF37]"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingUrl(false)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={isSavingUrl || !customUrlInput.trim()}
                          onClick={handleSaveCustomUrl}
                          className="tech-btn-primary px-4 py-1.5 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingUrl ? 'Salvando...' : 'Salvar Link no Banco'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* QR Code Tab for Mobile Phone Scan */
            <div className="text-center space-y-4 py-2">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.15)] border-4 border-[#D4AF37]/50">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code para Avaliação Google da Bratu"
                    className="w-52 h-52 sm:w-60 sm:h-60 mx-auto object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center text-slate-800 text-xs font-mono">
                    Gerando QR Code...
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
                <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                <span>Aponte a câmera do seu smartphone para o QR Code acima</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePostToGoogle}
                  className="tech-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir no Google pelo Computador</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
