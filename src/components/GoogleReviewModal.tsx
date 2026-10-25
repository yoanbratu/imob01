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
} from 'lucide-react';
import { GoogleReviewConfig, INITIAL_GOOGLE_REVIEW_CONFIG } from '../types/property';
import { getWhatsAppLink } from '../utils/whatsapp';

interface GoogleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: GoogleReviewConfig;
}

export const GoogleReviewModal: React.FC<GoogleReviewModalProps> = ({
  isOpen,
  onClose,
  config = INITIAL_GOOGLE_REVIEW_CONFIG,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'link' | 'qrcode'>('link');

  const reviewUrl = config.reviewUrl || INITIAL_GOOGLE_REVIEW_CONFIG.reviewUrl;

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#0A122A] via-[#050B1A] to-[#040814] border border-[#D4AF37]/40 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.2)] overflow-hidden text-white my-8">
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 pb-4 text-center">
          {/* Official Bratu Logo */}
          <div className="flex justify-center mb-3">
            <img
              src="/assets/aistudio/LOGOPNG_100042ea.png"
              alt="Bratu Imobiliária & Administradora"
              className="h-10 w-auto object-contain drop-shadow-[0_4px_12px_rgba(212,175,55,0.3)]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo-bratu.png';
              }}
            />
          </div>

          {/* Google Official G Logo Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 shadow-inner mb-4">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span className="text-xs font-semibold text-slate-200">Google Avaliações Verificadas</span>
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-xs font-bold text-white">5.0</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            Avalie a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8860B]">Bratu Imobiliária & Administradora</span> no Google
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            Sua opinião nos ajuda a manter a excelência no atendimento no Brasil, Estados Unidos e Paraguai. Leva menos de 1 minuto!
          </p>

          {/* Tab Selector: Link Direto vs QR Code */}
          <div className="flex items-center justify-center gap-2 mt-6 p-1 bg-[#0B1533] rounded-xl border border-white/10 max-w-xs mx-auto">
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'link'
                  ? 'bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] font-bold shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Link Direto
            </button>
            <button
              onClick={() => setActiveTab('qrcode')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'qrcode'
                  ? 'bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] font-bold shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Escanear QR Code</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 pt-2">
          {activeTab === 'link' ? (
            <div className="space-y-4">
              {/* Star interactive visual */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#D4AF37]/15 to-amber-500/10 border border-[#D4AF37]/30 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-7 h-7 fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    />
                  ))}
                </div>
                <div className="text-xs font-bold text-amber-200">
                  Classificação Máxima de 5 Estrelas
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Selecione as 5 estrelas no Google e conte como foi sua experiência com nossos corretores e administradores.
                </p>
              </div>

              {/* Big CTA Button to Google */}
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8860B] text-[#050B1A] font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#050B1A"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#050B1A"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#050B1A"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#050B1A"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Abrir e Avaliar Agora no Google</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>

              {/* Copy Direct Link Box */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0B1533]/90 border border-white/10 text-xs">
                <span className="text-slate-400 truncate flex-1 font-mono text-[11px] select-all px-2">
                  {reviewUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-xs">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-xs">Copiar Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* QR Code Tab */
            <div className="text-center space-y-4">
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

              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href={reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tech-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ou abra pelo navegador</span>
                </a>

                {qrCodeDataUrl && (
                  <a
                    href={qrCodeDataUrl}
                    download="Bratu-Avaliacao-Google-QRCode.png"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Salvar Imagem</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 3 Steps Guide */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#ECC97E] text-[10px] font-bold flex items-center justify-center mx-auto mb-1">
                1
              </div>
              <div className="text-[11px] font-semibold text-slate-200">Acesse o Google</div>
              <div className="text-[10px] text-slate-400">Pelo link ou QR Code</div>
            </div>

            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#ECC97E] text-[10px] font-bold flex items-center justify-center mx-auto mb-1">
                2
              </div>
              <div className="text-[11px] font-semibold text-slate-200">Dê 5 Estrelas</div>
              <div className="text-[10px] text-slate-400">Classificação máxima</div>
            </div>

            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#ECC97E] text-[10px] font-bold flex items-center justify-center mx-auto mb-1">
                3
              </div>
              <div className="text-[11px] font-semibold text-slate-200">Deixe seu Comentário</div>
              <div className="text-[10px] text-slate-400">Sobre seu atendimento</div>
            </div>
          </div>

          {/* WhatsApp Direct Assistance */}
          <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Avaliação 100% segura e pública no Google</span>
            </div>
            <a
              href={getWhatsAppLink('Olá! Gostaria de falar com a diretoria da Bratu antes de enviar minha avaliação.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ECC97E] hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
