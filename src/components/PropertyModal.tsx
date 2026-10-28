import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  MapPin,
  Maximize2,
  BedDouble,
  Bath,
  Car,
  Check,
  Copy,
  Lock,
  User,
  Phone,
  Mail,
  Briefcase,
  FileText,
  Save,
  CheckCircle,
  Receipt,
  DollarSign,
  Building,
  KeyRound,
  Compass,
  ShieldCheck,
  Play,
  Star,
  ExternalLink,
  Video,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Scale,
  Share2,
  Globe,
} from 'lucide-react';
import { Property } from '../types/property';
import { getPropertyWhatsAppLink, COMPANY_INFO } from '../utils/whatsapp';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import { parse360Tour } from '../utils/virtualTour360';
import { PropertyMap } from './PropertyMap';
import { Panorama360Viewer } from './Panorama360Viewer';
import { getPropertyCanonicalURL } from '../utils/propertySEO';

interface PropertyModalProps {
  property: Property | null;
  isAdmin?: boolean;
  onClose: () => void;
  onSaveAdminNotes?: (property: Property, notes: string) => Promise<void>;
  isCompared?: boolean;
  onToggleCompare?: (property: Property) => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  isAdmin = false,
  onClose,
  onSaveAdminNotes,
  isCompared = false,
  onToggleCompare,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video' | 'tour360'>('photos');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const parsed360 = parse360Tour(property?.virtualTour360Url, property?.virtualTour360Image);

  useEffect(() => {
    setActiveImageIndex(0);
    setActiveMediaTab('photos');
    setIsLightboxOpen(false);
    if (property) {
      setAdminNotes(property.adminNotes || '');
    }
  }, [property]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      } else if (property && activeMediaTab === 'photos' && property.images.length > 1) {
        if (e.key === 'ArrowRight') {
          setActiveImageIndex((prev) => (prev + 1) % property.images.length);
        } else if (e.key === 'ArrowLeft') {
          setActiveImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isLightboxOpen, property, activeMediaTab]);

  if (!property) return null;

  const whatsAppUrl = getPropertyWhatsAppLink(
    property.code,
    property.title,
    property.priceFormatted
  );

  const handleCopyLink = () => {
    const link = getPropertyCanonicalURL(property);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveNotes = async () => {
    if (!onSaveAdminNotes) return;
    setIsSavingNote(true);
    try {
      await onSaveAdminNotes(property, adminNotes);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const embedUrl = property.youtubeUrl ? getYouTubeEmbedUrl(property.youtubeUrl) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#050B1A]/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#070F26] text-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col border border-[#D4AF37]/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar: Compare & Close */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(property)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md shadow-md ${
                isCompared
                  ? 'bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] border border-[#ECC97E] shadow-[0_0_15px_rgba(212,175,55,0.5)]'
                  : 'bg-[#050B1A]/85 text-slate-200 hover:text-white border border-[#D4AF37]/50 hover:bg-[#0B163B]'
              }`}
              title={isCompared ? 'Remover do comparativo' : 'Adicionar ao comparativo'}
            >
              <Scale className={`w-3.5 h-3.5 ${isCompared ? 'text-[#050B1A]' : 'text-[#ECC97E]'}`} />
              <span>{isCompared ? 'Comparando ✓' : 'Comparar'}</span>
            </button>
          )}

          {/* Floating Close Button */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#050B1A]/80 hover:bg-[#0B163B] border border-[#D4AF37]/50 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5 text-[#D4AF37]" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-0">
          {/* Media Switcher Tabs (Fotos x Tour Virtual 360° x Vídeo YouTube) */}
          {(property.youtubeUrl || (property.virtualTour360Url && parsed360.isValid)) && (
            <div className="px-4 sm:px-6 pt-4 pb-2 bg-[#050B1A] flex flex-wrap items-center gap-2 border-b border-[#D4AF37]/20">
              <button
                type="button"
                onClick={() => setActiveMediaTab('photos')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMediaTab === 'photos'
                    ? 'tech-btn-primary text-[#050B1A]'
                    : 'bg-[#070F26] text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <span>📷 Fotos do Imóvel ({property.images.length})</span>
              </button>

              {(property.virtualTour360Url || property.virtualTour360Image) && parsed360.isValid && (
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('tour360')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMediaTab === 'tour360'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.45)]'
                      : 'bg-[#070F26] text-cyan-300 hover:text-white border border-cyan-500/35 hover:border-cyan-400'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>🌐 Tour Virtual 360° ({parsed360.provider})</span>
                </button>
              )}

              {property.youtubeUrl && embedUrl && (
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('video')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMediaTab === 'video'
                      ? 'bg-red-600 text-white border border-red-400 shadow-md'
                      : 'bg-[#070F26] text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>▶ Vídeo Tour no YouTube</span>
                </button>
              )}
            </div>
          )}

          {/* Main Media Display: 360 Virtual Tour, Video Player or Photo Gallery */}
          {activeMediaTab === 'tour360' && parsed360.isValid ? (
            parsed360.mode === 'panorama' && parsed360.imageSource ? (
              <div className="relative aspect-[16/10] sm:aspect-[16/9] min-h-[440px] w-full bg-black overflow-hidden flex flex-col items-center justify-center border-b border-[#D4AF37]/20">
                <Panorama360Viewer
                  imageSource={parsed360.imageSource}
                  title={property.title}
                  className="w-full h-full min-h-[440px]"
                />
              </div>
            ) : parsed360.embedUrl ? (
              <div className="relative aspect-[16/10] sm:aspect-[16/9] min-h-[420px] w-full bg-black overflow-hidden flex flex-col items-center justify-center border-b border-[#D4AF37]/20">
                <iframe
                  src={parsed360.embedUrl}
                  title={`Tour Virtual 360° - ${property.title}`}
                  className="w-full h-full min-h-[420px] border-0"
                  allow="accelerometer; autoplay; gyroscope; magnetometer; xr-spatial-tracking; fullscreen"
                  allowFullScreen
                />

                {/* Floating 360 Provider HUD Tag */}
                <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-auto">
                  <span className="bg-[#050B1A]/90 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-mono text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-lg">
                    <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
                    <span>{parsed360.provider} · 360° Interativo</span>
                  </span>
                </div>

                {/* Floating Fullscreen / External Trigger */}
                <div className="absolute top-3 right-16 flex items-center gap-2 pointer-events-auto">
                  <a
                    href={parsed360.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#050B1A]/90 hover:bg-[#0B163B] backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-mono text-white border border-white/20 hover:border-cyan-400 transition-colors flex items-center gap-1.5 shadow-lg"
                    title="Abrir em tela cheia na plataforma original"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Tela Cheia</span>
                  </a>
                </div>

                {/* Navigation Hint */}
                <div className="absolute bottom-2 inset-x-2 flex justify-center pointer-events-none">
                  <span className="bg-[#050B1A]/85 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-mono text-cyan-200 border border-cyan-500/30 shadow">
                    Arraste com o mouse ou toque para girar 360° e explore os ambientes
                  </span>
                </div>
              </div>
            ) : null
          ) : activeMediaTab === 'video' && embedUrl ? (
            <div className="relative aspect-[16/9] w-full bg-black overflow-hidden flex items-center justify-center">
              <iframe
                src={embedUrl}
                title={`Vídeo do Imóvel ${property.title}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative aspect-[16/9] w-full bg-[#050B1A] overflow-hidden group">
              <img
                src={property.images[activeImageIndex] || property.images[0]}
                alt={property.title}
                onClick={() => setIsLightboxOpen(true)}
                className="w-full h-full object-cover filter contrast-[1.05] brightness-[0.95] cursor-zoom-in transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              {/* Scrims */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070F26] via-transparent to-[#050B1A]/60 pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-50" />

              {/* Left / Right Photo Navigation Controls */}
              {property.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex(
                        (prev) => (prev - 1 + property.images.length) % property.images.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#050B1A]/85 hover:bg-[#0B163B] border border-[#D4AF37]/60 text-[#ECC97E] flex items-center justify-center shadow-lg transition-all cursor-pointer"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev + 1) % property.images.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#050B1A]/85 hover:bg-[#0B163B] border border-[#D4AF37]/60 text-[#ECC97E] flex items-center justify-center shadow-lg transition-all cursor-pointer"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Tech Corner HUD Reticles */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]" />

              {/* Badges & Code */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 text-xs font-mono font-semibold text-white drop-shadow">
                {property.featured && (
                  <span className="bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] font-extrabold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-[#050B1A]" /> EM DESTAQUE
                  </span>
                )}
                {(property.virtualTour360Url || property.virtualTour360Image) && parsed360.isValid && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('tour360')}
                    className="bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 font-bold px-2.5 py-0.5 rounded text-[10px] flex items-center gap-1 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.35)] transition-all cursor-pointer pointer-events-auto"
                    title="Clique para abrir o Tour Virtual 360°"
                  >
                    <Compass className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>TOUR 360° DISPONÍVEL</span>
                  </button>
                )}
                <span className="bg-[#050B1A]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#D4AF37]/40 text-[#E5C378]">
                  {property.purpose.toUpperCase()}
                </span>
                <span>·</span>
                <span className="bg-[#050B1A]/80 backdrop-blur-md px-2 py-0.5 rounded border border-white/20">
                  {property.country.toUpperCase()}
                </span>
                <span>·</span>
                <span className="bg-[#0B163B] border border-[#D4AF37]/50 px-2 py-0.5 rounded text-[#D4AF37]">
                  REF: {property.code}
                </span>
                {isAdmin && (
                  <span className="bg-[#D4AF37] text-[#050B1A] font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                    <Lock className="w-3 h-3" /> ADMIN VISUALIZAÇÃO
                  </span>
                )}
              </div>

              {/* Price on Image Bottom Left */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white z-10">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-mono block">
                    VALOR DE AVALIAÇÃO · FOTO {activeImageIndex + 1}/{property.images.length}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#ECC97E]">
                    {property.priceFormatted}
                  </span>
                  {property.priceNote && (
                    <p className="text-xs text-[#E5C378] mt-0.5 font-mono">{property.priceNote}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#050B1A]/80 hover:bg-[#0B163B] border border-[#D4AF37]/40 text-[#ECC97E] text-xs font-mono font-bold backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="hidden sm:inline">Tela Cheia 4K</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    title="Copiar link indexável deste imóvel para Google, WhatsApp e redes"
                    className="px-3 py-1.5 rounded-xl bg-[#050B1A]/80 hover:bg-[#0B163B] border border-[#D4AF37]/40 text-white text-xs font-medium backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Link Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Compartilhar Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Thumbnails Strip */}
          {activeMediaTab === 'photos' && property.images.length > 1 && (
            <div className="flex items-center gap-2 p-3 bg-[#050B1A] border-y border-[#D4AF37]/20 overflow-x-auto scrollbar-none">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#D4AF37] scale-105 shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                      : 'border-white/10 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Details Section */}
          <div className="p-6 sm:p-8 space-y-8 bg-[#070F26]">
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#E5C378] font-mono font-semibold uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {property.neighborhood}, {property.city} - {property.stateOrDept} ({property.country})
                </span>
                {property.condoName && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span className="inline-flex items-center gap-1 text-white bg-[#0B163B] px-2.5 py-0.5 rounded-lg border border-[#D4AF37]/40 text-[11px]">
                      <Building className="w-3 h-3 text-[#D4AF37]" />
                      <span>{property.condoName}</span>
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {property.title}
              </h2>
              <p className="text-sm text-slate-300 mt-1">{property.subtitle}</p>

              {/* Dynamic Google SEO & AI Indexing Status Badge */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SEO Google Ativo</span>
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Globe className="w-3 h-3 text-[#D4AF37]" />
                  <span className="text-slate-300">Metatags Individuais & Schema.org JSON-LD</span>
                </span>
                <span className="text-slate-500 hidden sm:inline">·</span>
                <span className="text-slate-400 hidden sm:inline font-mono">Ref: {property.code}</span>
              </div>
            </div>

            {/* Key Specs Bar in Midnight Navy */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/30">
              <div className="flex items-center gap-3">
                <Maximize2 className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Área M²</span>
                  <span className="text-sm font-bold text-white font-mono tabular-nums">{property.areaM2} m²</span>
                </div>
              </div>

              {property.bedrooms !== undefined && (
                <div className="flex items-center gap-3">
                  <BedDouble className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Dormitórios</span>
                    <span className="text-sm font-bold text-white font-mono tabular-nums">
                      {property.bedrooms} {property.suites ? `(${property.suites} suítes)` : ''}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Bath className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Banheiros</span>
                  <span className="text-sm font-bold text-white font-mono tabular-nums">{property.bathrooms}</span>
                </div>
              </div>

              {property.parkingSpots !== undefined && (
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Vagas</span>
                    <span className="text-sm font-bold text-white font-mono tabular-nums">{property.parkingSpots} cobertas</span>
                  </div>
                </div>
              )}
            </div>

            {/* TOUR VIRTUAL 360° BANNER IMERSIVO SE DISPONÍVEL */}
            {(property.virtualTour360Url || property.virtualTour360Image) && parsed360.isValid && (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#041d33] via-[#081f42] to-[#071330] border border-cyan-400/40 shadow-[0_8px_30px_rgba(6,182,212,0.18)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-md shrink-0">
                    <Compass className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                        Experiência Imersiva · {parsed360.provider}
                      </span>
                      <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-cyan-400/30">
                        {parsed360.mode === 'panorama' ? 'FOTO 360° ESFÉRICA' : '360° INTERATIVO'}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                      Tour Virtual 360° Disponível
                    </h4>
                    <p className="text-xs text-slate-300 font-sans mt-0.5">
                      Caminhe pelos ambientes em 3D, analise a vista e navegue com total imersão e giro livre.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMediaTab('tour360');
                      // Scroll modal top smoothly
                      const modalScroll = document.querySelector('.overflow-y-auto');
                      if (modalScroll) modalScroll.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Navegar no Tour 360°</span>
                  </button>

                  {parsed360.originalUrl && parsed360.originalUrl.startsWith('http') && (
                    <a
                      href={parsed360.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-[#050B1A] hover:bg-[#0B163B] border border-cyan-500/40 text-cyan-300 hover:text-white transition-colors cursor-pointer"
                      title="Abrir em nova aba"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* FICHA TÉCNICA, LOCALIZAÇÃO & FINANCEIRO: M², IPTU, VALOR VENDA, VALOR ALUGUEL, BAIRRO, ENDEREÇO, CEP */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#050B1A] border border-[#D4AF37]/35 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/25">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                    Ficha Cadastral, Localização & Custos Mensais
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  REF: {property.code}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. M² Metragem */}
                <div className="bg-[#0B163B] rounded-2xl p-3.5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Metragem / M²</span>
                  <span className="text-base font-bold text-white font-mono">{property.areaM2} m²</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Área total privativa</span>
                </div>

                {/* 2. Valor Venda */}
                <div className="bg-[#0B163B] rounded-2xl p-3.5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-[#E5C378] block">Valor de Venda</span>
                  <span className="text-base font-bold text-[#ECC97E] font-mono">
                    {property.salePrice || (property.purpose === 'Venda' ? property.priceFormatted : 'Consulte disponibilidade')}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Aquisição definitiva</span>
                </div>

                {/* 3. Valor Aluguel */}
                <div className="bg-[#0B163B] rounded-2xl p-3.5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-[#E5C378] block">Valor de Aluguel</span>
                  <span className="text-base font-bold text-white font-mono">
                    {property.rentPrice || (property.purpose === 'Locação' ? property.priceFormatted : 'Consulte locação')}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Locação mensal</span>
                </div>

                {/* 4. IPTU */}
                <div className="bg-[#0B163B] rounded-2xl p-3.5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">IPTU</span>
                  <span className="text-base font-bold text-slate-200 font-mono">
                    {property.iptu || 'Sob consulta municipal'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {property.condoFee ? `Condomínio: ${property.condoFee}` : 'Imposto Predial'}
                  </span>
                </div>
              </div>

              {/* Condomínio & Edifício: Nome e Valor */}
              {(property.condoName || property.condoFee) && (
                <div className="bg-[#0B163B] rounded-2xl p-4 border border-[#D4AF37]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#050B1A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Nome do Condomínio / Edifício
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white">
                        {property.condoName || 'Edifício / Condomínio Residencial'}
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                    <span className="text-[10px] font-mono uppercase text-[#E5C378] block">
                      Valor do Condomínio Mensal
                    </span>
                    <span className="text-sm sm:text-base font-bold font-mono text-[#ECC97E]">
                      {property.condoFee || 'Consulte valor da cota'}
                    </span>
                  </div>
                </div>
              )}

              {/* Localização Detalhada: Bairro, Endereço e CEP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                <div className="bg-[#070F26] p-3.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Bairro</span>
                  <span className="text-xs font-bold text-white">{property.neighborhood}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{property.city} - {property.stateOrDept}</span>
                </div>

                <div className="bg-[#070F26] p-3.5 rounded-2xl border border-white/10 md:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Endereço & Logradouro</span>
                      <span className="text-[10px] font-mono text-[#E5C378] bg-[#0B163B] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                        CEP: {property.zipCode || 'Consulte'}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-white mt-1 block">
                      {property.address || `${property.neighborhood}, ${property.city} - ${property.stateOrDept}, ${property.country}`}
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                    <MapPin className="w-3 h-3 text-[#D4AF37]" />
                    <span>Visitas presenciais com agendamento prévio com a equipe Bratu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* YOUTUBE VIDEO TOUR EMBED SECTION */}
            {property.youtubeUrl && embedUrl && (
              <div className="p-5 sm:p-6 rounded-3xl bg-[#050B1A] border border-[#D4AF37]/35 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/25">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-red-500" />
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                      Vídeo Tour do Imóvel no YouTube
                    </span>
                  </div>
                  <a
                    href={property.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-[#ECC97E] hover:text-white transition-colors flex items-center gap-1.5 bg-[#0B163B] px-3 py-1 rounded-xl border border-[#D4AF37]/30"
                  >
                    <span>Abrir no YouTube</span>
                    <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
                  </a>
                </div>
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#D4AF37]/40 shadow-2xl bg-black">
                  <iframe
                    src={embedUrl}
                    title={`Vídeo do Imóvel ${property.title}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* GOOGLE MAPS INTERACTIVE LOCATION SECTION */}
            <PropertyMap property={property} />

            {/* CONFIDENTIAL ADMIN-ONLY SECTION (Visível Somente para Administrador com Senha) */}
            {isAdmin ? (
              <div className="p-6 rounded-3xl bg-[#050B1A] border-2 border-[#D4AF37] space-y-6 shadow-2xl relative">
                <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/40">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E5C378]">
                    <Lock className="w-4 h-4 text-[#D4AF37]" />
                    <span>DADOS CONFIDENCIAIS DO PROPRIETÁRIO & CORRETOR (EXCLUSIVO ADMINISTRADOR)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40 font-bold shadow-xs">
                    Modo Administrador Ativo
                  </span>
                </div>

                {/* Owner & Realtor 2-Column Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Owner Data with Protected Personal Documents */}
                  <div className="bg-[#0B163B] rounded-2xl p-4 border border-[#D4AF37]/30 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                      <span className="text-xs font-mono font-bold text-[#E5C378]">
                        PROPRIETÁRIO DO IMÓVEL (DADOS PROTEGIDOS)
                      </span>
                      <span className="text-[10px] font-mono text-[#D4AF37] bg-[#050B1A] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                        Sigilo Ativo
                      </span>
                    </div>
                    <div className="text-xs space-y-2">
                      <p><strong className="text-slate-400 text-[10px] font-mono uppercase block">Nome do Titular:</strong> <span className="text-white font-semibold">{property.ownerName || 'Não cadastrado'}</span></p>
                      
                      {/* Documento Pessoal (CPF, RG, RUC) - Somente Admin */}
                      <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#D4AF37]/30">
                        <span className="text-[10px] font-mono uppercase text-[#E5C378] font-bold block">
                          Documento Pessoal / Identificação (CPF / RUC / RG):
                        </span>
                        <span className="text-emerald-400 font-mono font-bold text-xs">
                          {property.ownerDocument || 'Não informado no cadastro'}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          * Visível exclusivamente nesta sessão de administrador autenticado
                        </span>
                      </div>

                      <p><strong className="text-slate-400 text-[10px] font-mono uppercase block">WhatsApp / Telefone Direto do Proprietário:</strong> <span className="text-emerald-400 font-mono font-bold">{property.ownerPhone || 'Não cadastrado'}</span></p>
                      <p><strong className="text-slate-400 text-[10px] font-mono uppercase block">E-mail de Contato do Proprietário:</strong> <span className="text-slate-200">{property.ownerEmail || 'Não cadastrado'}</span></p>
                      {property.ownerBankDetails && (
                        <p><strong className="text-slate-400 text-[10px] font-mono uppercase block">Dados Bancários / PIX Repasse:</strong> <span className="text-[#E5C378] font-mono text-[11px] block">{property.ownerBankDetails}</span></p>
                      )}
                      {property.ownerMinNegotiationValue && (
                        <p><strong className="text-slate-400 text-[10px] font-mono uppercase block">Margem Mínima Autorizada:</strong> <span className="text-white font-mono font-bold">{property.ownerMinNegotiationValue}</span></p>
                      )}
                    </div>
                  </div>

                  {/* Realtor Data */}
                  <div className="bg-[#0B163B] rounded-2xl p-4 border border-[#D4AF37]/30 space-y-2">
                    <span className="text-xs font-mono font-bold text-[#E5C378] block pb-1 border-b border-white/10">
                      CORRETOR RESPONSÁVEL
                    </span>
                    <div className="text-xs space-y-1.5">
                      <p><strong className="text-slate-400 text-[10px] font-mono uppercase block">Corretor:</strong> <span className="text-white font-semibold">{property.realtorName || 'Alexandre Bratu'}</span></p>
                      <p><strong className="text-slate-400 text-[10px] font-mono uppercase block">CRECI / Registro:</strong> <span className="text-slate-300 font-mono">{property.realtorCreci || 'CRECI-PR J-08240'}</span></p>
                      <p><strong className="text-slate-400 text-[10px] font-mono uppercase block">Contato Direto do Corretor:</strong> <span className="text-emerald-400 font-mono font-bold">{property.realtorPhone || COMPANY_INFO.phoneDisplay}</span></p>
                      <p><strong className="text-slate-400 text-[10px] font-mono uppercase block">E-mail Direto do Corretor:</strong> <span className="text-slate-200 font-mono">{property.realtorEmail || 'Não informado'}</span></p>
                      <p><strong className="text-slate-400 text-[10px] font-mono uppercase block">Comissão Acordada:</strong> <span className="text-[#E5C378] font-mono font-bold">{property.realtorCommission || '6%'}</span></p>
                    </div>
                  </div>
                </div>

                {/* Editable Admin Notes */}
                <div className="bg-[#0B163B] rounded-2xl p-4 border border-[#D4AF37]/30">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <span className="text-xs font-mono font-bold text-[#E5C378]">
                      OBSERVAÇÕES DO ADMINISTRADOR (EDITÁVEL)
                    </span>
                    {noteSaved && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Observações salvas com sucesso!
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Adicione ou atualize notas internas sobre este imóvel..."
                    className="w-full bg-[#050B1A] border border-[#D4AF37]/30 text-white rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={isSavingNote}
                      onClick={handleSaveNotes}
                      className="tech-btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5 text-[#050B1A]" />
                      <span>{isSavingNote ? 'Salvando...' : 'Salvar Observações'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Public Security & Contact Isolation Notice for Non-Admins */
              <div className="p-4 sm:p-5 rounded-2xl bg-[#050B1A] border border-[#D4AF37]/30 shadow-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ECC97E]">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>CUSTÓDIA E SIGILO DE CONTATOS (ACESSO RESTRITO AO ADMINISTRADOR)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-[#070F26] px-2 py-0.5 rounded border border-white/10">
                    LGPD & Compliance
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Por diretriz de segurança e privacidade, <strong>todos os contatos dos proprietários (telefones, e-mail e WhatsApp diretos)</strong> são mantidos sob estrito sigilo institucional e acessíveis exclusivamente por administradores credenciados via painel com autenticação.
                </p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#E5C378] font-mono">
                  <span>Intermediação oficial e propostas: Diretoria Bratu Imóveis</span>
                  <span className="text-slate-400">{COMPANY_INFO.phoneDisplay}</span>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-2">
                DETALHES DO IMÓVEL
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Highlights */}
            {property.highlights && property.highlights.length > 0 && (
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-3">
                  DIFERENCIAIS & ESPECIFICAÇÕES
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-3">
                  COMODIDADES & LAZER
                </h4>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-[#0B163B] rounded-lg text-xs font-medium text-slate-200 border border-[#D4AF37]/20"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="p-4 sm:p-5 bg-[#050B1A] border-t border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-mono text-slate-400">REF: {property.code}</span>
            <span className="text-base font-bold font-mono text-[#ECC97E]">{property.priceFormatted}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Voltar
            </button>
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tech-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-[#050B1A]" />
              <span>Agendar no WhatsApp {COMPANY_INFO.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Fullscreen 4K Lightbox Overlay */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#050B1A]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(false);
          }}
        >
          <div className="w-full max-w-6xl flex items-center justify-between mb-3 px-2">
            <div className="text-xs font-mono text-[#ECC97E]">
              <span className="font-bold text-white">{property.title}</span> · Foto {activeImageIndex + 1} de {property.images.length}
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="px-3.5 py-1.5 rounded-xl bg-[#070F26] border border-[#D4AF37]/50 text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4 text-[#D4AF37]" />
              <span>Fechar Tela Cheia</span>
            </button>
          </div>
          <div
            className="relative w-full max-w-6xl max-h-[82vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={property.images[activeImageIndex] || property.images[0]}
              alt={property.title}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-[#D4AF37]/40 shadow-2xl"
            />
            {property.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#050B1A]/90 border border-[#D4AF37] text-[#ECC97E] flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev + 1) % property.images.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#050B1A]/90 border border-[#D4AF37] text-[#ECC97E] flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
