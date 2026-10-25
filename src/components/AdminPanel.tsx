import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Building,
  Home,
  Briefcase,
  PlusCircle,
  FileText,
  User,
  Users,
  UserCheck,
  Award,
  BadgeCheck,
  Phone,
  Mail,
  CreditCard,
  Edit,
  Trash2,
  Save,
  CheckCircle,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
  Lock,
  LogOut,
  Sparkles,
  Inbox,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Star,
  MapPin,
  Receipt,
  DollarSign,
  Maximize2,
  KeyRound,
  ShieldAlert,
  Play,
  Video,
  Zap,
  CheckSquare,
  Square,
  Compass,
  Cpu,
  Layers,
  Sliders,
  Eye,
  QrCode,
  Share2,
  Send,
  Copy,
  Check,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  Property,
  PropertyType,
  PropertyPurpose,
  PropertyCategory,
  Country,
  LeadSubmission,
  Realtor,
  PropertyOwner,
  Condominium,
  HomepageSegment,
  HomepageSegmentsConfig,
  SegmentItem,
  INITIAL_HOMEPAGE_SEGMENTS,
  CURATED_TECH_PHOTOS,
  CURATED_TEAM_AVATARS,
  TechEffectType,
  TeamMember,
  INITIAL_TEAM_MEMBERS,
  GoogleReviewConfig,
  GoogleReviewTemplate,
  INITIAL_GOOGLE_REVIEW_CONFIG,
  INITIAL_GOOGLE_REVIEW_TEMPLATES,
} from '../types/property';
import {
  saveProperty,
  updateProperty,
  deleteProperty,
  fetchRealtors,
  saveRealtor,
  deleteRealtor,
  subscribeToRealtors,
  INITIAL_REALTORS,
  fetchOwners,
  saveOwner,
  deleteOwner,
  subscribeToOwners,
  INITIAL_OWNERS,
  fetchCondominiums,
  saveCondominium,
  deleteCondominium,
  subscribeToCondominiums,
  INITIAL_CONDOMINIUMS,
  fetchHomepageSegments,
  saveHomepageSegments,
  subscribeToHomepageSegments,
  fetchTeamMembers,
  saveTeamMember,
  deleteTeamMember,
  subscribeToTeamMembers,
  fetchGoogleReviewConfig,
  saveGoogleReviewConfig,
  subscribeToGoogleReviewConfig,
} from '../services/propertyService';
import { COMPANY_INFO, getWhatsAppLink } from '../utils/whatsapp';
import { updateAdminPassword } from '../utils/security';
import { isValidYouTubeUrl, getYouTubeEmbedUrl } from '../utils/youtube';
import { isValid360Url, get360EmbedUrl, detect360Provider, parse360Tour, is360ImageSource } from '../utils/virtualTour360';
import { Panorama360Viewer } from './Panorama360Viewer';
import { compressImage, compress360Panorama } from '../utils/imageCompression';
import { TechImage } from './TechImage';

interface AdminPanelProps {
  properties: Property[];
  leads: LeadSubmission[];
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onRefreshData: () => void;
  initialTab?: 'properties' | 'new' | 'owners' | 'condos' | 'realtors' | 'team' | 'leads' | 'segments' | 'security' | 'googleReviews';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  properties,
  leads,
  isOpen,
  onClose,
  onLogout,
  onRefreshData,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'new' | 'owners' | 'condos' | 'realtors' | 'team' | 'leads' | 'segments' | 'security' | 'googleReviews'>(initialTab || 'properties');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'residencial' | 'comercial'>('all');

  // Team (Equipe Bratu) State & Listener
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [teamFormData, setTeamFormData] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    department: 'Diretoria Executiva',
    photoUrl: '',
    creci: '',
    phone: '',
    email: '',
    bio: '',
    order: 1,
    active: true,
  });
  const [teamFeedback, setTeamFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSavingTeamMember, setIsSavingTeamMember] = useState(false);
  const [deleteConfirmTeamMember, setDeleteConfirmTeamMember] = useState<TeamMember | null>(null);
  const [isCompressingTeamPhoto, setIsCompressingTeamPhoto] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');
  const [teamDeptFilter, setTeamDeptFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = subscribeToTeamMembers((data) => {
      setTeamMembers(data);
    });
    return () => unsubscribe();
  }, []);

  // Google Reviews & Direct Client Dispatch State
  const [googleConfig, setGoogleConfig] = useState<GoogleReviewConfig>(INITIAL_GOOGLE_REVIEW_CONFIG);
  const [isSavingGoogleConfig, setIsSavingGoogleConfig] = useState(false);
  const [googleConfigFeedback, setGoogleConfigFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [clientDispatchName, setClientDispatchName] = useState('');
  const [clientDispatchPhone, setClientDispatchPhone] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tmpl_compra_venda');
  const [customDispatchMessage, setCustomDispatchMessage] = useState<string>('');
  const [isCopiedMsg, setIsCopiedMsg] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [adminQrCodeDataUrl, setAdminQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    fetchGoogleReviewConfig().then(setGoogleConfig);
    const unsubscribe = subscribeToGoogleReviewConfig((cfg) => {
      setGoogleConfig(cfg);
    });
    return () => unsubscribe();
  }, []);

  // Sync QR code when googleConfig.reviewUrl changes
  useEffect(() => {
    if (googleConfig.reviewUrl) {
      QRCode.toDataURL(googleConfig.reviewUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#050B1A',
          light: '#FFFFFF',
        },
      })
        .then(setAdminQrCodeDataUrl)
        .catch((err) => console.error('Erro ao gerar QR Code do Google Review:', err));
    }
  }, [googleConfig.reviewUrl]);

  // Update message preview when template, client name, or review URL changes
  useEffect(() => {
    const tmpl = googleConfig.templates?.find((t) => t.id === selectedTemplateId) || googleConfig.templates?.[0] || INITIAL_GOOGLE_REVIEW_CONFIG.templates[0];
    if (tmpl) {
      const name = clientDispatchName.trim() || 'Cliente';
      const formatted = tmpl.text
        .replace(/\{NOME\}/g, name)
        .replace(/\{LINK\}/g, googleConfig.reviewUrl);
      setCustomDispatchMessage(formatted);
    }
  }, [selectedTemplateId, clientDispatchName, googleConfig.reviewUrl, googleConfig.templates]);

  const handleSendWhatsAppReview = () => {
    const cleanPhone = clientDispatchPhone.replace(/\D/g, '');
    const encoded = encodeURIComponent(customDispatchMessage.trim());
    if (cleanPhone) {
      const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
      window.open(`https://wa.me/${fullPhone}?text=${encoded}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  const handleCopyReviewMessage = () => {
    navigator.clipboard.writeText(customDispatchMessage);
    setIsCopiedMsg(true);
    setTimeout(() => setIsCopiedMsg(false), 2500);
  };

  const handleCopyReviewLink = () => {
    navigator.clipboard.writeText(googleConfig.reviewUrl);
    setIsCopiedLink(true);
    setTimeout(() => setIsCopiedLink(false), 2500);
  };

  const handleSaveGoogleReviewConfig = async () => {
    setIsSavingGoogleConfig(true);
    setGoogleConfigFeedback(null);
    try {
      await saveGoogleReviewConfig(googleConfig);
      setGoogleConfigFeedback({
        type: 'success',
        message: 'Link de Avaliação do Google e parâmetros atualizados com sucesso no Firestore!',
      });
      setTimeout(() => setGoogleConfigFeedback(null), 4000);
    } catch (err: any) {
      setGoogleConfigFeedback({
        type: 'error',
        message: err.message || 'Falha ao salvar link de avaliação.',
      });
    } finally {
      setIsSavingGoogleConfig(false);
    }
  };

  const handleQuickDispatchFromLead = (lead: LeadSubmission) => {
    setClientDispatchName(lead.name || '');
    setClientDispatchPhone(lead.phone || '');
    setSelectedTemplateId('tmpl_pos_visita');
    setActiveTab('googleReviews');
  };

  // Homepage Segments 01 & 02 State & Listener
  const [segmentsConfig, setSegmentsConfig] = useState<HomepageSegmentsConfig>(INITIAL_HOMEPAGE_SEGMENTS);
  const [isSavingSegments, setIsSavingSegments] = useState(false);
  const [segmentsFeedback, setSegmentsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeSegmentTab, setActiveSegmentTab] = useState<'seg1' | 'seg2' | 'header' | 'custom'>('seg1');
  const [newFeature1, setNewFeature1] = useState('');
  const [newFeature2, setNewFeature2] = useState('');
  const [isCompressingSegmentPhoto, setIsCompressingSegmentPhoto] = useState(false);

  // Segment Items & Custom Segments Modals
  const [isSegmentItemModalOpen, setIsSegmentItemModalOpen] = useState(false);
  const [segmentItemTarget, setSegmentItemTarget] = useState<'segment1' | 'segment2' | string>('segment1');
  const [editingItemData, setEditingItemData] = useState<Partial<SegmentItem>>({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    badge: '',
    techEffect: 'holo-gold',
  });
  const [isCompressingItemPhoto, setIsCompressingItemPhoto] = useState(false);

  // Custom Segment Modal
  const [isCustomSegmentModalOpen, setIsCustomSegmentModalOpen] = useState(false);
  const [customSegmentFormData, setCustomSegmentFormData] = useState<Partial<HomepageSegment>>({
    id: '',
    segmentTag: 'SEGMENTO 03',
    title: '',
    badge: 'ESPECIAL',
    imageUrl: '',
    imageBadge: 'DESTAQUE EXCLUSIVO',
    description: '',
    features: [],
    ctaText: 'Explorar Imóveis',
    category: 'residencial',
    footerLabel: 'Venda & Locação',
    techEffect: 'holo-gold',
    items: [],
  });
  const [newCustomFeature, setNewCustomFeature] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const unsubscribe = subscribeToHomepageSegments((data) => {
      setSegmentsConfig(data);
    });
    return () => unsubscribe();
  }, []);

  // Realtors (Corretores) State & Listener
  const [realtors, setRealtors] = useState<Realtor[]>(INITIAL_REALTORS);
  const [isRealtorModalOpen, setIsRealtorModalOpen] = useState(false);
  const [editingRealtor, setEditingRealtor] = useState<Realtor | null>(null);
  const [realtorFormData, setRealtorFormData] = useState<Partial<Realtor>>({
    name: '',
    creci: '',
    phone: '',
    email: '',
    defaultCommission: '6%',
    specialty: '',
    active: true,
  });
  const [realtorFeedback, setRealtorFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSavingRealtor, setIsSavingRealtor] = useState(false);
  const [isCustomRealtorNew, setIsCustomRealtorNew] = useState(false);
  const [isCustomRealtorEdit, setIsCustomRealtorEdit] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToRealtors((data) => {
      setRealtors(data);
    });
    return () => unsubscribe();
  }, []);

  // Owners (Proprietários) State & Listener
  const [owners, setOwners] = useState<PropertyOwner[]>(INITIAL_OWNERS);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<PropertyOwner | null>(null);
  const [ownerFormData, setOwnerFormData] = useState<Partial<PropertyOwner>>({
    name: '',
    phone: '',
    email: '',
    document: '',
    bankDetails: '',
    minNegotiationValue: '',
    notes: '',
  });
  const [ownerFeedback, setOwnerFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSavingOwner, setIsSavingOwner] = useState(false);
  const [isCustomOwnerNew, setIsCustomOwnerNew] = useState(false);
  const [isCustomOwnerEdit, setIsCustomOwnerEdit] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToOwners((data) => {
      setOwners(data);
    });
    return () => unsubscribe();
  }, []);

  // Condominiums (Condomínios / Edifícios) State & Listener
  const [condos, setCondos] = useState<Condominium[]>(INITIAL_CONDOMINIUMS);
  const [isCondoModalOpen, setIsCondoModalOpen] = useState(false);
  const [editingCondo, setEditingCondo] = useState<Condominium | null>(null);
  const [condoFormData, setCondoFormData] = useState<Partial<Condominium>>({
    name: '',
    condoFee: '',
    address: '',
    neighborhood: '',
    city: 'Curitiba',
    stateOrDept: 'PR',
    country: 'Brasil',
    zipCode: '',
    amenities: [],
    notes: '',
  });
  const [condoAmenityInput, setCondoAmenityInput] = useState('');
  const [condoFeedback, setCondoFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSavingCondo, setIsSavingCondo] = useState(false);
  const [isCustomCondoNew, setIsCustomCondoNew] = useState(false);
  const [isCustomCondoEdit, setIsCustomCondoEdit] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCondominiums((data) => {
      setCondos(data);
    });
    return () => unsubscribe();
  }, []);

  // Inline notes editing state: propertyId -> string
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // File upload state for new property
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tour360FileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavingNew, setIsSavingNew] = useState(false);

  // Handlers for 360 panoramic photo upload (New Property)
  const handleTour360Upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    setIsCompressingPhotos(true);
    setSaveError(null);
    try {
      const compressedDataUrl = await compress360Panorama(file);
      setNewProp((prev) => ({
        ...prev,
        virtualTour360Image: compressedDataUrl,
      }));
    } catch (err: any) {
      console.error('Erro ao comprimir imagem 360°:', err);
      setSaveError(err.message || 'Falha ao processar foto panorâmica 360°.');
    } finally {
      setIsCompressingPhotos(false);
    }
  };

  // Password change management state
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdFeedback, setPwdFeedback] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

  // New Property Form State with M2, IPTU, Aluguel, Venda, Bairro, Endereço, CEP, Condomínio (Nome e Valor)
  const [newProp, setNewProp] = useState<Partial<Property>>({
    code: `BRT-${Math.floor(1000 + Math.random() * 9000)}`,
    title: '',
    subtitle: '',
    purpose: 'Venda',
    type: 'Apartamento',
    category: ['residencial'],
    country: 'Brasil',
    city: 'Curitiba',
    neighborhood: '',
    address: '',
    zipCode: '',
    priceFormatted: 'R$ ',
    salePrice: '',
    rentPrice: '',
    iptu: '',
    condoName: '',
    condoFee: '',
    priceNote: '',
    areaM2: 120,
    bedrooms: 3,
    suites: 2,
    bathrooms: 3,
    parkingSpots: 2,
    featured: true,
    featuredInQuickSuggestions: true,
    youtubeUrl: '',
    virtualTour360Url: '',
    virtualTour360Image: '',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ],
    description: '',
    highlights: ['Piso em porcelanato', 'Acabamentos nobres', 'Localização privilegiada'],
    amenities: ['Segurança 24h', 'Garagem'],
    // Confidential Owner & Realtor & Notes
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerDocument: '',
    ownerBankDetails: '',
    ownerMinNegotiationValue: '',
    realtorName: 'Alexandre Bratu',
    realtorCreci: 'CRECI-PR 32.410',
    realtorPhone: COMPANY_INFO.phoneDisplay,
    realtorEmail: COMPANY_INFO.email,
    realtorCommission: '6%',
    adminNotes: '',
  });

  const [createSuccess, setCreateSuccess] = useState(false);

  // Property editing state
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editActiveTab, setEditActiveTab] = useState<'info' | 'valores' | 'specs' | 'midia' | 'proprietario'>('info');
  const [editUrlInput, setEditUrlInput] = useState('');
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editTour360FileInputRef = useRef<HTMLInputElement>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(null);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  const handleEditTour360Upload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingProperty) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    setIsCompressingPhotos(true);
    setEditErrorMessage(null);
    try {
      const compressedDataUrl = await compress360Panorama(file);
      setEditingProperty((prev) =>
        prev ? { ...prev, virtualTour360Image: compressedDataUrl } : null
      );
    } catch (err: any) {
      console.error('Erro na foto 360 na edição:', err);
      setEditErrorMessage(err.message || 'Erro ao processar imagem 360°.');
    } finally {
      setIsCompressingPhotos(false);
    }
  };

  const handleEditFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingProperty) return;
    setIsCompressingPhotos(true);
    setEditErrorMessage(null);
    try {
      const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
      for (const file of validFiles) {
        const compressedDataUrl = await compressImage(file);
        setEditingProperty((prev) =>
          prev ? { ...prev, images: [...(prev.images || []), compressedDataUrl] } : null
        );
      }
    } catch (err: any) {
      console.error('Erro ao comprimir fotos na edição:', err);
      setEditErrorMessage(err.message || 'Erro ao comprimir fotos selecionadas.');
    } finally {
      setIsCompressingPhotos(false);
    }
  };

  const handleEditAddUrl = () => {
    if (!editUrlInput.trim() || !editingProperty) return;
    setEditingProperty((prev) =>
      prev ? { ...prev, images: [...(prev.images || []), editUrlInput.trim()] } : null
    );
    setEditUrlInput('');
  };

  const handleEditRemovePhoto = (index: number) => {
    if (!editingProperty) return;
    setEditingProperty((prev) =>
      prev ? { ...prev, images: (prev.images || []).filter((_, i) => i !== index) } : null
    );
  };

  const handleEditSetPrimaryPhoto = (index: number) => {
    if (!editingProperty) return;
    setEditingProperty((prev) => {
      if (!prev) return null;
      const currentImages = [...(prev.images || [])];
      if (index <= 0 || index >= currentImages.length) return prev;
      const [chosen] = currentImages.splice(index, 1);
      currentImages.unshift(chosen);
      return { ...prev, images: currentImages };
    });
  };

  const handleToggleFeatured = async (prop: Property) => {
    try {
      const next = !prop.featured;
      await updateProperty(prop.id, { featured: next });
      onRefreshData();
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
  };

  const handleToggleQuickSuggestions = async (prop: Property) => {
    try {
      const next = !prop.featuredInQuickSuggestions;
      await updateProperty(prop.id, { featuredInQuickSuggestions: next });
      onRefreshData();
    } catch (err) {
      console.error('Error toggling quick suggestion:', err);
    }
  };

  const handleSaveEditProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    setIsSavingEdit(true);
    setEditErrorMessage(null);
    try {
      await saveProperty(editingProperty);
      setEditSuccessMessage('Imóvel atualizado com sucesso no banco de dados e sincronizado para Google/IA!');
      onRefreshData();
      setTimeout(() => {
        setEditSuccessMessage(null);
        setEditingProperty(null);
      }, 1200);
    } catch (err: any) {
      console.error('Error saving property edit:', err);
      setEditErrorMessage(`Erro ao salvar alterações no banco: ${err.message || 'Verifique sua conexão.'}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsCompressingPhotos(true);
    setSaveError(null);
    try {
      const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
      for (const file of validFiles) {
        const compressedDataUrl = await compressImage(file);
        setNewProp((prev) => ({
          ...prev,
          images: [...(prev.images || []), compressedDataUrl],
        }));
      }
    } catch (err: any) {
      console.error('Erro ao comprimir fotos:', err);
      setSaveError(err.message || 'Erro ao otimizar fotos selecionadas.');
    } finally {
      setIsCompressingPhotos(false);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setNewProp((prev) => ({
      ...prev,
      images: [...(prev.images || []), urlInput.trim()],
    }));
    setUrlInput('');
  };

  const handleRemovePhoto = (index: number) => {
    setNewProp((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const handleSetPrimaryPhoto = (index: number) => {
    setNewProp((prev) => {
      const currentImages = [...(prev.images || [])];
      if (index <= 0 || index >= currentImages.length) return prev;
      const [chosen] = currentImages.splice(index, 1);
      currentImages.unshift(chosen);
      return { ...prev, images: currentImages };
    });
  };

  const handleExistingPropertyPhotoUpload = async (prop: Property, files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
      const newImages = [...(prop.images || [])];
      for (const file of validFiles) {
        const compressed = await compressImage(file);
        newImages.push(compressed);
      }
      await saveProperty({ ...prop, images: newImages });
      onRefreshData();
    } catch (err: any) {
      console.error('Erro ao adicionar foto no imóvel:', err);
      alert(`Erro ao adicionar foto: ${err.message || 'Arquivo muito grande ou formato inválido.'}`);
    }
  };

  if (!isOpen) return null;

  const handleSaveNotes = async (property: Property) => {
    const updatedNote = editingNotes[property.id] !== undefined
      ? editingNotes[property.id]
      : (property.adminNotes || '');

    setSavingNotesId(property.id);
    try {
      await saveProperty({
        ...property,
        adminNotes: updatedNote,
      });
      setSavedSuccessId(property.id);
      onRefreshData();
      setTimeout(() => setSavedSuccessId(null), 2500);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotesId(null);
    }
  };

  const handleDelete = async (propertyId: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir o imóvel "${title}" do banco de dados?`)) {
      try {
        await deleteProperty(propertyId);
        onRefreshData();
      } catch (err) {
        console.error('Error deleting property:', err);
      }
    }
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!newProp.title?.trim() || !newProp.priceFormatted?.trim()) {
      setSaveError('Por favor, preencha o Título e o Preço Principal do anúncio.');
      return;
    }

    setIsSavingNew(true);

    try {
      const propId = `brt-${Date.now()}`;
      const defaultState =
        newProp.country === 'Paraguai'
          ? 'Distrito Capital'
          : newProp.country === 'Estados Unidos'
          ? 'FL'
          : 'PR';

      const propertyToSave: Property = {
        id: propId,
        code: (newProp.code || `BRT-${Math.floor(1000 + Math.random() * 9000)}`).trim(),
        title: (newProp.title || 'Imóvel Exclusivo').trim(),
        subtitle: (newProp.subtitle || '').trim(),
        purpose: newProp.purpose || 'Venda',
        type: newProp.type || 'Apartamento',
        category: newProp.category && newProp.category.length > 0 ? newProp.category : ['residencial'],
        country: newProp.country || 'Brasil',
        city: (newProp.city || 'Curitiba').trim(),
        neighborhood: (newProp.neighborhood || '').trim(),
        stateOrDept: (newProp.stateOrDept || defaultState).trim(),
        address: (newProp.address || '').trim(),
        zipCode: (newProp.zipCode || '').trim(),
        priceFormatted: (newProp.priceFormatted || 'Sob Consulta').trim(),
        salePrice: (newProp.salePrice || '').trim(),
        rentPrice: (newProp.rentPrice || '').trim(),
        iptu: (newProp.iptu || '').trim(),
        condoName: (newProp.condoName || '').trim(),
        condoFee: (newProp.condoFee || '').trim(),
        priceNote: (newProp.priceNote || '').trim(),
        areaM2: Number(newProp.areaM2) || 0,
        bedrooms: newProp.bedrooms !== undefined ? Number(newProp.bedrooms) : 0,
        suites: newProp.suites !== undefined ? Number(newProp.suites) : 0,
        bathrooms: newProp.bathrooms !== undefined ? Number(newProp.bathrooms) : 0,
        parkingSpots: newProp.parkingSpots !== undefined ? Number(newProp.parkingSpots) : 0,
        featured: !!newProp.featured,
        featuredInQuickSuggestions: !!newProp.featuredInQuickSuggestions,
        youtubeUrl: (newProp.youtubeUrl || '').trim(),
        virtualTour360Url: (newProp.virtualTour360Url || '').trim(),
        virtualTour360Image: (newProp.virtualTour360Image || '').trim(),
        images: newProp.images && newProp.images.length > 0 ? newProp.images : [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        ],
        description: (newProp.description || '').trim(),
        highlights: newProp.highlights || ['Piso em porcelanato', 'Acabamentos nobres', 'Localização privilegiada'],
        amenities: newProp.amenities || ['Segurança 24h', 'Garagem'],
        ownerName: (newProp.ownerName || '').trim(),
        ownerPhone: (newProp.ownerPhone || '').trim(),
        ownerEmail: (newProp.ownerEmail || '').trim(),
        ownerDocument: (newProp.ownerDocument || '').trim(),
        ownerBankDetails: (newProp.ownerBankDetails || '').trim(),
        ownerMinNegotiationValue: (newProp.ownerMinNegotiationValue || '').trim(),
        realtorName: (newProp.realtorName || 'Alexandre Bratu').trim(),
        realtorCreci: (newProp.realtorCreci || 'CRECI-PR 32.410').trim(),
        realtorPhone: (newProp.realtorPhone || COMPANY_INFO.phoneDisplay).trim(),
        realtorEmail: (newProp.realtorEmail || COMPANY_INFO.email).trim(),
        realtorCommission: (newProp.realtorCommission || '6%').trim(),
        adminNotes: (newProp.adminNotes || '').trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveProperty(propertyToSave);
      setCreateSuccess(true);
      onRefreshData();
      setTimeout(() => {
        setCreateSuccess(false);
        setActiveTab('properties');
      }, 1500);
    } catch (err: any) {
      console.error('Error creating property:', err);
      setSaveError(`Erro ao salvar no banco de dados: ${err.message || 'Verifique seus dados ou fotos.'}`);
    } finally {
      setIsSavingNew(false);
    }
  };

  const handleOpenCreateRealtor = () => {
    setEditingRealtor(null);
    setRealtorFormData({
      name: '',
      creci: '',
      phone: COMPANY_INFO.phoneDisplay,
      email: COMPANY_INFO.email,
      defaultCommission: '6% Padrão Venda',
      specialty: 'Alto Padrão',
      active: true,
    });
    setIsRealtorModalOpen(true);
  };

  const handleOpenEditRealtor = (realtor: Realtor) => {
    setEditingRealtor(realtor);
    setRealtorFormData({ ...realtor });
    setIsRealtorModalOpen(true);
  };

  const handleSaveRealtorForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realtorFormData.name?.trim() || !realtorFormData.phone?.trim()) {
      setRealtorFeedback({ type: 'error', message: 'Preencha ao menos o Nome e o Telefone do corretor.' });
      return;
    }
    setIsSavingRealtor(true);
    try {
      const idToUse = editingRealtor?.id || `corretor-${Date.now()}`;
      const realtorToSave: Realtor = {
        id: idToUse,
        name: realtorFormData.name.trim(),
        creci: (realtorFormData.creci || '').trim(),
        phone: realtorFormData.phone.trim(),
        email: (realtorFormData.email || '').trim(),
        defaultCommission: (realtorFormData.defaultCommission || '6%').trim(),
        specialty: (realtorFormData.specialty || '').trim(),
        active: realtorFormData.active !== false,
        avatarUrl: (realtorFormData.avatarUrl || '').trim(),
        createdAt: editingRealtor?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveRealtor(realtorToSave);
      setRealtorFeedback({
        type: 'success',
        message: editingRealtor ? 'Corretor atualizado com sucesso no banco de dados!' : 'Novo corretor cadastrado com sucesso!',
      });
      setIsRealtorModalOpen(false);
      setTimeout(() => setRealtorFeedback(null), 3000);
    } catch (err: any) {
      setRealtorFeedback({ type: 'error', message: err?.message || 'Erro ao salvar corretor.' });
    } finally {
      setIsSavingRealtor(false);
    }
  };

  const handleDeleteRealtor = async (realtorId: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o corretor "${name}" do banco de dados?`)) {
      try {
        await deleteRealtor(realtorId);
        setRealtorFeedback({ type: 'success', message: `Corretor "${name}" excluído com sucesso.` });
        setTimeout(() => setRealtorFeedback(null), 3000);
      } catch (err: any) {
        setRealtorFeedback({ type: 'error', message: err?.message || 'Erro ao excluir corretor.' });
      }
    }
  };

  const handleOpenCreateOwner = () => {
    setEditingOwner(null);
    setOwnerFormData({
      name: '',
      phone: '',
      email: '',
      document: '',
      bankDetails: '',
      minNegotiationValue: '',
      notes: '',
    });
    setIsOwnerModalOpen(true);
  };

  const handleOpenEditOwner = (owner: PropertyOwner) => {
    setEditingOwner(owner);
    setOwnerFormData({ ...owner });
    setIsOwnerModalOpen(true);
  };

  const handleSaveOwnerForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerFormData.name?.trim() || !ownerFormData.phone?.trim()) {
      setOwnerFeedback({ type: 'error', message: 'Preencha ao menos o Nome e o Telefone/WhatsApp do proprietário.' });
      return;
    }
    setIsSavingOwner(true);
    try {
      const idToUse = editingOwner?.id || `proprietario-${Date.now()}`;
      const ownerToSave: PropertyOwner = {
        id: idToUse,
        name: ownerFormData.name.trim(),
        phone: ownerFormData.phone.trim(),
        email: (ownerFormData.email || '').trim(),
        document: (ownerFormData.document || '').trim(),
        bankDetails: (ownerFormData.bankDetails || '').trim(),
        minNegotiationValue: (ownerFormData.minNegotiationValue || '').trim(),
        notes: (ownerFormData.notes || '').trim(),
        createdAt: editingOwner?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveOwner(ownerToSave);
      setOwnerFeedback({
        type: 'success',
        message: editingOwner ? 'Proprietário atualizado com sucesso no banco de dados!' : 'Novo proprietário cadastrado com sucesso!',
      });
      setIsOwnerModalOpen(false);
      setTimeout(() => setOwnerFeedback(null), 3000);
    } catch (err: any) {
      setOwnerFeedback({ type: 'error', message: err?.message || 'Erro ao salvar proprietário.' });
    } finally {
      setIsSavingOwner(false);
    }
  };

  const handleDeleteOwner = async (ownerId: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o proprietário "${name}" do banco de dados?`)) {
      try {
        await deleteOwner(ownerId);
        setOwnerFeedback({ type: 'success', message: `Proprietário "${name}" excluído com sucesso.` });
        setTimeout(() => setOwnerFeedback(null), 3000);
      } catch (err: any) {
        setOwnerFeedback({ type: 'error', message: err?.message || 'Erro ao excluir proprietário.' });
      }
    }
  };

  const handleOpenCreateCondo = () => {
    setEditingCondo(null);
    setCondoFormData({
      name: '',
      condoFee: '',
      address: '',
      neighborhood: '',
      city: 'Curitiba',
      stateOrDept: 'PR',
      country: 'Brasil',
      zipCode: '',
      amenities: ['Portaria 24h', 'Piscina', 'Academia'],
      notes: '',
    });
    setCondoAmenityInput('');
    setIsCondoModalOpen(true);
  };

  const handleOpenEditCondo = (condo: Condominium) => {
    setEditingCondo(condo);
    setCondoFormData({ ...condo });
    setCondoAmenityInput('');
    setIsCondoModalOpen(true);
  };

  const handleAddCondoAmenity = () => {
    if (!condoAmenityInput.trim()) return;
    const current = condoFormData.amenities || [];
    if (!current.includes(condoAmenityInput.trim())) {
      setCondoFormData({ ...condoFormData, amenities: [...current, condoAmenityInput.trim()] });
    }
    setCondoAmenityInput('');
  };

  const handleRemoveCondoAmenity = (index: number) => {
    const current = condoFormData.amenities || [];
    setCondoFormData({ ...condoFormData, amenities: current.filter((_, i) => i !== index) });
  };

  const handleSaveCondoForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condoFormData.name?.trim()) {
      setCondoFeedback({ type: 'error', message: 'Preencha o Nome do Condomínio / Edifício.' });
      return;
    }
    setIsSavingCondo(true);
    try {
      const idToUse = editingCondo?.id || `condo-${Date.now()}`;
      const condoToSave: Condominium = {
        id: idToUse,
        name: condoFormData.name.trim(),
        condoFee: (condoFormData.condoFee || '').trim(),
        address: (condoFormData.address || '').trim(),
        neighborhood: (condoFormData.neighborhood || '').trim(),
        city: (condoFormData.city || 'Curitiba').trim(),
        stateOrDept: (condoFormData.stateOrDept || 'PR').trim(),
        country: condoFormData.country || 'Brasil',
        zipCode: (condoFormData.zipCode || '').trim(),
        amenities: Array.isArray(condoFormData.amenities) ? condoFormData.amenities : [],
        notes: (condoFormData.notes || '').trim(),
        createdAt: editingCondo?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveCondominium(condoToSave);
      setCondoFeedback({
        type: 'success',
        message: editingCondo ? 'Condomínio atualizado com sucesso no banco de dados!' : 'Novo condomínio cadastrado com sucesso!',
      });
      setIsCondoModalOpen(false);
      setTimeout(() => setCondoFeedback(null), 3000);
    } catch (err: any) {
      setCondoFeedback({ type: 'error', message: err?.message || 'Erro ao salvar condomínio.' });
    } finally {
      setIsSavingCondo(false);
    }
  };

  const handleDeleteCondo = async (condoId: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o condomínio "${name}" do banco de dados?`)) {
      try {
        await deleteCondominium(condoId);
        setCondoFeedback({ type: 'success', message: `Condomínio "${name}" excluído com sucesso.` });
        setTimeout(() => setCondoFeedback(null), 3000);
      } catch (err: any) {
        setCondoFeedback({ type: 'error', message: err?.message || 'Erro ao excluir condomínio.' });
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdFeedback({ type: 'error', message: 'A nova senha e a confirmação não coincidem.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwdFeedback({ type: 'error', message: 'A nova senha deve ter no mínimo 8 caracteres.' });
      return;
    }
    setIsUpdatingPwd(true);
    setPwdFeedback({ type: 'idle', message: '' });
    try {
      const res = await updateAdminPassword(currPassword, newPassword);
      if (res.success) {
        setPwdFeedback({ type: 'success', message: res.message });
        setCurrPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwdFeedback({ type: 'error', message: res.message });
      }
    } catch {
      setPwdFeedback({ type: 'error', message: 'Erro ao processar atualização de segurança.' });
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  // Segment Photo & Content Handlers
  const handleSegmentPhotoUpload = async (segKey: 'segment1' | 'segment2', files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    setIsCompressingSegmentPhoto(true);
    setSegmentsFeedback(null);
    try {
      const compressedDataUrl = await compressImage(file, 1280, 800, 0.82);
      setSegmentsConfig((prev) => ({
        ...prev,
        [segKey]: {
          ...prev[segKey],
          imageUrl: compressedDataUrl,
        },
      }));
      setSegmentsFeedback({
        type: 'success',
        message: `Foto do ${segKey === 'segment1' ? 'Segmento 01' : 'Segmento 02'} carregada e otimizada! Clique em "Salvar Alterações" para confirmar.`,
      });
    } catch (err: any) {
      console.error('Erro ao comprimir imagem do segmento:', err);
      setSegmentsFeedback({ type: 'error', message: err.message || 'Falha ao processar foto.' });
    } finally {
      setIsCompressingSegmentPhoto(false);
    }
  };

  const handleSelectCuratedPhoto = (segKey: 'segment1' | 'segment2', url: string) => {
    setSegmentsConfig((prev) => ({
      ...prev,
      [segKey]: {
        ...prev[segKey],
        imageUrl: url,
      },
    }));
    setSegmentsFeedback({
      type: 'success',
      message: `Preset de foto aplicado ao ${segKey === 'segment1' ? 'Segmento 01' : 'Segmento 02'}! Clique em "Salvar Alterações" para persistir.`,
    });
  };

  const handleAddFeatureToSegment = (segKey: 'segment1' | 'segment2', text: string) => {
    if (!text.trim()) return;
    setSegmentsConfig((prev) => ({
      ...prev,
      [segKey]: {
        ...prev[segKey],
        features: [...(prev[segKey].features || []), text.trim()],
      },
    }));
    if (segKey === 'segment1') setNewFeature1('');
    if (segKey === 'segment2') setNewFeature2('');
  };

  const handleRemoveFeatureFromSegment = (segKey: 'segment1' | 'segment2', index: number) => {
    setSegmentsConfig((prev) => ({
      ...prev,
      [segKey]: {
        ...prev[segKey],
        features: (prev[segKey].features || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleSaveSegments = async () => {
    setIsSavingSegments(true);
    setSegmentsFeedback(null);
    try {
      await saveHomepageSegments(segmentsConfig);
      setSegmentsFeedback({
        type: 'success',
        message: 'Segmentos 01 e 02 atualizados com sucesso no banco de dados Firestore!',
      });
      setTimeout(() => setSegmentsFeedback(null), 4000);
    } catch (err: any) {
      console.error('Erro ao salvar segmentos:', err);
      setSegmentsFeedback({
        type: 'error',
        message: err.message || 'Falha ao salvar segmentos.',
      });
    } finally {
      setIsSavingSegments(false);
    }
  };

  const handleResetSegmentsToDefault = () => {
    if (confirm('Tem certeza que deseja restaurar as fotos, textos e efeitos tecnológicos originais dos Segmentos 01 e 02?')) {
      setSegmentsConfig(INITIAL_HOMEPAGE_SEGMENTS);
      setSegmentsFeedback({
        type: 'success',
        message: 'Valores padrão restaurados! Clique em "Salvar Alterações" para gravar.',
      });
    }
  };

  // ==========================================
  // TEAM MEMBERS (EQUIPE BRATU) HANDLERS
  // ==========================================
  const handleOpenNewTeamModal = () => {
    setEditingTeamMember(null);
    setTeamFormData({
      name: '',
      role: '',
      department: 'Diretoria Executiva',
      photoUrl: '',
      creci: '',
      phone: '+55 (21) 98098-4243',
      email: 'Demy@Bratu.com.br',
      bio: '',
      order: (teamMembers.length || 0) + 1,
      active: true,
    });
    setTeamFeedback(null);
    setIsTeamModalOpen(true);
  };

  const handleOpenEditTeamModal = (member: TeamMember) => {
    setEditingTeamMember(member);
    setTeamFormData({
      name: member.name,
      role: member.role,
      department: member.department,
      photoUrl: member.photoUrl,
      creci: member.creci,
      phone: member.phone,
      email: member.email,
      bio: member.bio,
      order: member.order,
      active: member.active !== false,
    });
    setTeamFeedback(null);
    setIsTeamModalOpen(true);
  };

  const handleTeamPhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    setIsCompressingTeamPhoto(true);
    setTeamFeedback(null);
    try {
      const compressedDataUrl = await compressImage(file, 800, 800, 0.82);
      setTeamFormData((prev) => ({ ...prev, photoUrl: compressedDataUrl }));
      setTeamFeedback({ type: 'success', message: 'Foto do membro otimizada com sucesso!' });
    } catch (err: any) {
      console.error('Erro ao comprimir foto da equipe:', err);
      setTeamFeedback({ type: 'error', message: err.message || 'Falha ao processar foto.' });
    } finally {
      setIsCompressingTeamPhoto(false);
    }
  };

  const handleSelectCuratedTeamAvatar = (url: string) => {
    setTeamFormData((prev) => ({ ...prev, photoUrl: url }));
  };

  const handleSaveTeamForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamFormData.name || !teamFormData.role) {
      setTeamFeedback({ type: 'error', message: 'Preencha o Nome e o Cargo do membro.' });
      return;
    }
    setIsSavingTeamMember(true);
    setTeamFeedback(null);
    try {
      const memberToSave: TeamMember = {
        id: editingTeamMember ? editingTeamMember.id : `bratu_team_${Date.now()}`,
        name: teamFormData.name.trim(),
        role: teamFormData.role.trim(),
        department: (teamFormData.department || 'Diretoria Executiva').trim(),
        photoUrl: teamFormData.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
        creci: (teamFormData.creci || '').trim(),
        phone: (teamFormData.phone || '').trim(),
        email: (teamFormData.email || '').trim(),
        bio: (teamFormData.bio || '').trim(),
        order: typeof teamFormData.order === 'number' ? teamFormData.order : (teamMembers.length + 1),
        active: teamFormData.active !== false,
        createdAt: editingTeamMember?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveTeamMember(memberToSave);
      setTeamFeedback({
        type: 'success',
        message: editingTeamMember ? 'Membro da equipe atualizado com sucesso!' : 'Novo membro cadastrado na equipe com sucesso!',
      });
      setIsTeamModalOpen(false);
      setTimeout(() => setTeamFeedback(null), 3500);
    } catch (err: any) {
      setTeamFeedback({ type: 'error', message: err.message || 'Erro ao salvar membro da equipe.' });
    } finally {
      setIsSavingTeamMember(false);
    }
  };

  const handleDeleteTeamMemberAction = async (id: string, name: string) => {
    try {
      await deleteTeamMember(id);
      setTeamFeedback({ type: 'success', message: `Membro "${name}" excluído da equipe com sucesso.` });
      setDeleteConfirmTeamMember(null);
      setTimeout(() => setTeamFeedback(null), 3000);
    } catch (err: any) {
      setTeamFeedback({ type: 'error', message: err.message || 'Erro ao excluir membro da equipe.' });
    }
  };

  const handleToggleTeamActive = async (member: TeamMember) => {
    try {
      const updated: TeamMember = {
        ...member,
        active: !member.active,
        updatedAt: new Date().toISOString(),
      };
      await saveTeamMember(updated);
      setTeamFeedback({
        type: 'success',
        message: `Status de "${member.name}" alterado para ${!member.active ? 'Ativo' : 'Oculto'}.`,
      });
      setTimeout(() => setTeamFeedback(null), 2500);
    } catch (err: any) {
      setTeamFeedback({ type: 'error', message: err.message || 'Erro ao atualizar status.' });
    }
  };

  // ==========================================
  // SEGMENT ITEMS & CUSTOM SEGMENTS CRUD HANDLERS
  // ==========================================
  const handleOpenNewSegmentItem = (segKey: 'segment1' | 'segment2' | string) => {
    setSegmentItemTarget(segKey);
    setEditingItemData({
      id: `item_${Date.now()}`,
      title: '',
      subtitle: '',
      description: '',
      imageUrl: segKey === 'segment2'
        ? 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      badge: 'DESTAQUE',
      techEffect: 'holo-gold',
    });
    setIsSegmentItemModalOpen(true);
  };

  const handleOpenEditSegmentItem = (segKey: 'segment1' | 'segment2' | string, item: SegmentItem) => {
    setSegmentItemTarget(segKey);
    setEditingItemData({ ...item });
    setIsSegmentItemModalOpen(true);
  };

  const handleItemPhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    setIsCompressingItemPhoto(true);
    try {
      const compressedDataUrl = await compressImage(file, 900, 600, 0.82);
      setEditingItemData((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
    } catch (err: any) {
      console.error('Erro ao comprimir foto do item:', err);
    } finally {
      setIsCompressingItemPhoto(false);
    }
  };

  const handleSaveSegmentItemForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemData.title || !editingItemData.imageUrl) {
      alert('Preencha ao menos o título e selecione uma foto para o item.');
      return;
    }

    const itemToSave: SegmentItem = {
      id: editingItemData.id || `item_${Date.now()}`,
      title: (editingItemData.title || '').trim(),
      subtitle: (editingItemData.subtitle || '').trim(),
      description: (editingItemData.description || '').trim(),
      imageUrl: editingItemData.imageUrl || '',
      badge: (editingItemData.badge || '').trim(),
      techEffect: editingItemData.techEffect || 'holo-gold',
      createdAt: editingItemData.createdAt || new Date().toISOString(),
    };

    setSegmentsConfig((prev) => {
      if (segmentItemTarget === 'segment1' || segmentItemTarget === 'segment2') {
        const seg = prev[segmentItemTarget];
        const existingItems = seg.items || [];
        const exists = existingItems.some((it) => it.id === itemToSave.id);
        const newItems = exists
          ? existingItems.map((it) => (it.id === itemToSave.id ? itemToSave : it))
          : [...existingItems, itemToSave];
        return {
          ...prev,
          [segmentItemTarget]: {
            ...seg,
            items: newItems,
          },
        };
      } else {
        // Custom segment
        const customList = prev.customSegments || [];
        const updatedCustom = customList.map((cSeg) => {
          if (cSeg.id === segmentItemTarget) {
            const existingItems = cSeg.items || [];
            const exists = existingItems.some((it) => it.id === itemToSave.id);
            const newItems = exists
              ? existingItems.map((it) => (it.id === itemToSave.id ? itemToSave : it))
              : [...existingItems, itemToSave];
            return { ...cSeg, items: newItems };
          }
          return cSeg;
        });
        return { ...prev, customSegments: updatedCustom };
      }
    });

    setIsSegmentItemModalOpen(false);
    setSegmentsFeedback({
      type: 'success',
      message: 'Item / Foto adicionado ao segmento! Lembre-se de clicar em "Salvar Alterações" no topo.',
    });
  };

  const handleDeleteSegmentItem = (segKey: 'segment1' | 'segment2' | string, itemId: string) => {
    if (confirm('Tem certeza que deseja excluir este item/foto do segmento?')) {
      setSegmentsConfig((prev) => {
        if (segKey === 'segment1' || segKey === 'segment2') {
          const seg = prev[segKey];
          return {
            ...prev,
            [segKey]: {
              ...seg,
              items: (seg.items || []).filter((it) => it.id !== itemId),
            },
          };
        } else {
          const customList = prev.customSegments || [];
          return {
            ...prev,
            customSegments: customList.map((cSeg) => {
              if (cSeg.id === segKey) {
                return {
                  ...cSeg,
                  items: (cSeg.items || []).filter((it) => it.id !== itemId),
                };
              }
              return cSeg;
            }),
          };
        }
      });
      setSegmentsFeedback({
        type: 'success',
        message: 'Item excluído do segmento! Clique em "Salvar Alterações" para confirmar.',
      });
    }
  };

  // Custom Segments Handlers
  const handleOpenNewCustomSegment = () => {
    const nextNum = (segmentsConfig.customSegments?.length || 0) + 3;
    setCustomSegmentFormData({
      id: `custom_seg_${Date.now()}`,
      segmentTag: `SEGMENTO 0${nextNum}`,
      title: '',
      badge: 'ESPECIALIDADE',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      imageBadge: 'ATIVO SELECIONADO · 4K',
      description: '',
      features: [],
      ctaText: 'Explorar Oportunidades',
      category: 'residencial',
      footerLabel: 'Venda & Locação',
      techEffect: 'holo-gold',
      items: [],
    });
    setNewCustomFeature('');
    setIsCustomSegmentModalOpen(true);
  };

  const handleOpenEditCustomSegment = (cSeg: HomepageSegment) => {
    setCustomSegmentFormData({ ...cSeg });
    setNewCustomFeature('');
    setIsCustomSegmentModalOpen(true);
  };

  const handleSaveCustomSegmentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSegmentFormData.title || !customSegmentFormData.imageUrl) {
      alert('Preencha ao menos o título e foto do novo segmento.');
      return;
    }
    const newSeg: HomepageSegment = {
      id: customSegmentFormData.id || `custom_seg_${Date.now()}`,
      segmentTag: (customSegmentFormData.segmentTag || 'SEGMENTO').trim(),
      title: (customSegmentFormData.title || '').trim(),
      badge: (customSegmentFormData.badge || '').trim(),
      imageUrl: customSegmentFormData.imageUrl || '',
      imageBadge: (customSegmentFormData.imageBadge || '').trim(),
      description: (customSegmentFormData.description || '').trim(),
      features: Array.isArray(customSegmentFormData.features) ? customSegmentFormData.features : [],
      ctaText: (customSegmentFormData.ctaText || 'Explorar Portfólio').trim(),
      category: customSegmentFormData.category || 'residencial',
      footerLabel: (customSegmentFormData.footerLabel || 'Venda & Locação').trim(),
      techEffect: customSegmentFormData.techEffect || 'holo-gold',
      items: Array.isArray(customSegmentFormData.items) ? customSegmentFormData.items : [],
      updatedAt: new Date().toISOString(),
    };

    setSegmentsConfig((prev) => {
      const existing = prev.customSegments || [];
      const exists = existing.some((c) => c.id === newSeg.id);
      return {
        ...prev,
        customSegments: exists
          ? existing.map((c) => (c.id === newSeg.id ? newSeg : c))
          : [...existing, newSeg],
      };
    });

    setIsCustomSegmentModalOpen(false);
    setSegmentsFeedback({
      type: 'success',
      message: 'Segmento salvo com sucesso! Clique em "Salvar Alterações" no topo para persistir.',
    });
  };

  const handleDeleteCustomSegment = (segId: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir o segmento "${title}"?`)) {
      setSegmentsConfig((prev) => ({
        ...prev,
        customSegments: (prev.customSegments || []).filter((c) => c.id !== segId),
      }));
      setSegmentsFeedback({
        type: 'success',
        message: `Segmento "${title}" excluído! Clique em "Salvar Alterações" para confirmar.`,
      });
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.ownerName && p.ownerName.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (p.city && p.city.toLowerCase().includes(searchFilter.toLowerCase()));

    if (selectedCategory === 'residencial') {
      return matchesSearch && p.category.includes('residencial');
    }
    if (selectedCategory === 'comercial') {
      return matchesSearch && p.category.includes('comercial');
    }
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050B1A]/95 text-white backdrop-blur-xl animate-in fade-in duration-200">
      <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Top Bar of the Admin Panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <ShieldCheck className="w-6 h-6 fill-[#050B1A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Painel de Administração · BRATU
                </span>
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  Firestore Conectado
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Acesso Restrito: Visualização de Dados de Proprietários, Corretores e Observações
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0B163B] hover:bg-[#12235E] text-slate-200 border border-[#D4AF37]/30 transition-colors cursor-pointer"
            >
              Visualizar Site Público
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair do Modo Admin</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 py-6 border-b border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('properties')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'properties'
                ? 'tech-btn-primary'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Catálogo Completo & Proprietários ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('new')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'tech-btn-primary'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Novo Imóvel (Comercial / Residencial)</span>
          </button>

          <button
            onClick={() => setActiveTab('owners')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'owners'
                ? 'tech-btn-primary'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Proprietários Cadastrados ({owners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('condos')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'condos'
                ? 'tech-btn-primary'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Condomínios / Edifícios ({condos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('realtors')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'realtors'
                ? 'tech-btn-primary'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Corretores Cadastrados ({realtors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'tech-btn-primary'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Propostas & Contatos Recebidos ({leads.length})</span>
          </button>

          {/* Equipe Bratu Imobiliária & Administradora LTDA */}
          <button
            onClick={() => setActiveTab('team')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'team'
                ? 'tech-btn-primary'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <span>Equipe Bratu ({teamMembers.length})</span>
          </button>

          {/* New Tab: Segmentos 01 & 02 da Página Inicial */}
          <button
            onClick={() => setActiveTab('segments')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'segments'
                ? 'tech-btn-primary'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Segmentos 01 & 02 (Página Inicial)</span>
          </button>

          {/* New Tab: Avaliações Google & Disparo para Clientes */}
          <button
            onClick={() => setActiveTab('googleReviews')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'googleReviews'
                ? 'tech-btn-primary shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Avaliações Google & Disparo</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'tech-btn-primary'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Segurança & Senha Admin</span>
          </button>
        </div>

        {/* TAB 1: PROPERTIES LIST WITH OWNER, REALTOR, AND ADMIN NOTES */}
        {activeTab === 'properties' && (
          <div className="py-6 flex-1 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#070F26] p-4 rounded-2xl border border-[#D4AF37]/25">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Buscar por código, título, proprietário ou cidade..."
                  className="w-full bg-[#0B163B] border border-[#D4AF37]/25 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#0B163B] border border-[#D4AF37] text-[#E5C378]'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSelectedCategory('residencial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    selectedCategory === 'residencial'
                      ? 'bg-[#0B163B] border border-[#D4AF37] text-[#E5C378]'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Residenciais
                </button>
                <button
                  onClick={() => setSelectedCategory('comercial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    selectedCategory === 'comercial'
                      ? 'bg-[#0B163B] border border-[#D4AF37] text-[#E5C378]'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Comerciais
                </button>
              </div>
            </div>

            {/* Properties Cards for Admin */}
            <div className="space-y-6">
              {filteredProperties.map((prop) => {
                const currentNote =
                  editingNotes[prop.id] !== undefined
                    ? editingNotes[prop.id]
                    : prop.adminNotes || '';

                return (
                  <div
                    key={prop.id}
                    className="bg-[#070F26] rounded-3xl border border-[#D4AF37]/35 p-6 hover:border-[#D4AF37]/70 transition-all duration-300 shadow-xl"
                  >
                    {/* Header line */}
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10">
                      <div className="flex items-start gap-4">
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          className="w-20 h-16 sm:w-28 sm:h-20 object-cover rounded-xl border border-[#D4AF37]/30 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-[#E5C378] bg-[#0B163B] px-2 py-0.5 rounded border border-[#D4AF37]/40">
                              REF: {prop.code}
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 bg-[#050B1A] px-2 py-0.5 rounded">
                              {prop.purpose}
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] bg-[#050B1A] px-2 py-0.5 rounded">
                              {prop.country}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {prop.category.includes('comercial') ? '🏢 Comercial' : '🏡 Residencial'}
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-bold text-white">
                            {prop.title}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {prop.neighborhood}, {prop.city} · {prop.areaM2} m² · {prop.priceFormatted}
                          </span>

                          {/* Technical & Financial Badges */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="bg-[#0B163B] border border-white/10 px-2.5 py-1 rounded-lg text-[11px] text-white font-mono">
                              <strong className="text-slate-400">M²:</strong> {prop.areaM2} m²
                            </span>
                            <span className="bg-[#0B163B] border border-white/10 px-2.5 py-1 rounded-lg text-[11px] text-[#ECC97E] font-mono">
                              <strong className="text-slate-400">Venda:</strong> {prop.salePrice || (prop.purpose === 'Venda' ? prop.priceFormatted : '-')}
                            </span>
                            <span className="bg-[#0B163B] border border-white/10 px-2.5 py-1 rounded-lg text-[11px] text-white font-mono">
                              <strong className="text-slate-400">Aluguel:</strong> {prop.rentPrice || (prop.purpose === 'Locação' ? prop.priceFormatted : '-')}
                            </span>
                            <span className="bg-[#0B163B] border border-white/10 px-2.5 py-1 rounded-lg text-[11px] text-slate-300 font-mono">
                              <strong className="text-slate-400">IPTU:</strong> {prop.iptu || 'Não cadastrado'}
                            </span>
                            {prop.condoName && (
                              <span className="bg-[#0B163B] border border-white/10 px-2.5 py-1 rounded-lg text-[11px] text-[#ECC97E] font-mono">
                                <strong className="text-slate-400">Condomínio:</strong> {prop.condoName}
                              </span>
                            )}
                            {prop.condoFee && (
                              <span className="bg-[#0B163B] border border-white/10 px-2.5 py-1 rounded-lg text-[11px] text-slate-300 font-mono">
                                <strong className="text-slate-400">Taxa Cond.:</strong> {prop.condoFee}
                              </span>
                            )}
                            <span className="bg-[#0B163B] border border-white/10 px-2.5 py-1 rounded-lg text-[11px] text-slate-300 font-mono">
                              <strong className="text-slate-400">CEP:</strong> {prop.zipCode || 'Não inf.'}
                            </span>
                          </div>

                          {prop.address && (
                            <div className="mt-1.5 text-[11px] text-slate-300 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>{prop.address} · {prop.neighborhood}, {prop.city}</span>
                            </div>
                          )}

                          {/* Mini Gallery Strip with Upload More Button */}
                          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                            {prop.images.map((img, imgIdx) => (
                              <div key={imgIdx} className="relative group shrink-0">
                                <img
                                  src={img}
                                  alt={`Foto ${imgIdx + 1}`}
                                  className="w-14 h-11 object-cover rounded-lg border border-white/15"
                                />
                                {imgIdx === 0 && (
                                  <span className="absolute bottom-0 inset-x-0 bg-[#050B1A]/85 text-[#E5C378] text-[8px] text-center font-mono rounded-b">
                                    Capa
                                  </span>
                                )}
                              </div>
                            ))}

                            {/* Direct file upload to this property */}
                            <label className="w-14 h-11 flex flex-col items-center justify-center rounded-lg border border-dashed border-[#D4AF37]/50 hover:border-[#D4AF37] bg-[#050B1A] text-slate-400 hover:text-[#E5C378] transition-colors cursor-pointer shrink-0">
                              <Upload className="w-3.5 h-3.5" />
                              <span className="text-[8px] font-mono mt-0.5">+ Foto</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleExistingPropertyPhotoUpload(prop, e.target.files)}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1-Click Toggle: ⭐ Em Destaque */}
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(prop)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                            prop.featured
                              ? 'bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                              : 'bg-[#0B163B] text-slate-400 hover:text-white border border-white/15'
                          }`}
                          title="Clique para alternar Destaque no Catálogo Geral"
                        >
                          <Star className={`w-3.5 h-3.5 ${prop.featured ? 'fill-[#050B1A]' : 'text-slate-400'}`} />
                          <span>{prop.featured ? 'Destaque: ATIVO' : 'Destaque: Inativo'}</span>
                        </button>

                        {/* 1-Click Toggle: ⚡ Sugestões Rápidas */}
                        <button
                          type="button"
                          onClick={() => handleToggleQuickSuggestions(prop)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                            prop.featuredInQuickSuggestions
                              ? 'bg-amber-400/20 text-[#ECC97E] border border-amber-400/60 shadow-xs'
                              : 'bg-[#0B163B] text-slate-400 hover:text-white border border-white/15'
                          }`}
                          title="Clique para alternar presença nas Sugestões Rápidas de Pesquisa"
                        >
                          <Zap className={`w-3.5 h-3.5 ${prop.featuredInQuickSuggestions ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                          <span>{prop.featuredInQuickSuggestions ? 'Sugestão: ATIVA' : 'Sugestão: Inativa'}</span>
                        </button>

                        {/* YouTube Video Button */}
                        <button
                          type="button"
                          onClick={() => setEditingProperty({ ...prop })}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            prop.youtubeUrl
                              ? 'bg-red-600/20 text-red-300 border border-red-500/40'
                              : 'bg-[#0B163B] text-slate-400 hover:text-white border border-white/15'
                          }`}
                          title={prop.youtubeUrl ? 'Possui vídeo do YouTube vinculado. Clique para editar' : 'Adicionar vídeo do YouTube'}
                        >
                          <Play className={`w-3 h-3 ${prop.youtubeUrl ? 'fill-red-400 text-red-400' : 'text-slate-400'}`} />
                          <span>{prop.youtubeUrl ? 'Vídeo YouTube: OK' : '+ Vídeo YouTube'}</span>
                        </button>

                        {/* Tour 360 Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProperty({ ...prop });
                            setEditActiveTab('midia');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            prop.virtualTour360Url
                              ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                              : 'bg-[#0B163B] text-slate-400 hover:text-white border border-white/15'
                          }`}
                          title={prop.virtualTour360Url ? 'Possui Tour Virtual 360° cadastrado. Clique para editar' : 'Adicionar Tour Virtual 360°'}
                        >
                          <Compass className={`w-3.5 h-3.5 ${prop.virtualTour360Url ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '10s' }} />
                          <span>{prop.virtualTour360Url ? 'Tour 360°: OK' : '+ Tour 360°'}</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => setEditingProperty({ ...prop })}
                          className="px-3 py-1.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] text-[#E5C378] border border-[#D4AF37]/40 text-[11px] font-bold font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Editar todos os dados do imóvel"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(prop.id, prop.title)}
                          className="p-2 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white border border-red-500/30 transition-colors cursor-pointer"
                          title="Excluir Imóvel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* CONFIDENTIAL DETAILS ACCORDION / GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
                      {/* Owner Data (Span 4) */}
                      <div className="lg:col-span-4 bg-[#0B163B]/80 rounded-2xl p-4 border border-[#D4AF37]/25 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E5C378] pb-1 border-b border-white/10">
                          <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>DADOS DO PROPRIETÁRIO (CONFIDENCIAL)</span>
                        </div>
                        <div className="text-xs space-y-1.5">
                          <p>
                            <strong className="text-slate-400 block text-[10px] font-mono uppercase">Nome:</strong>
                            <span className="text-white font-medium">{prop.ownerName || 'Não informado'}</span>
                          </p>
                          <p>
                            <strong className="text-slate-400 block text-[10px] font-mono uppercase">Telefone / WhatsApp:</strong>
                            <span className="text-emerald-400 font-mono font-semibold">{prop.ownerPhone || 'Não informado'}</span>
                          </p>
                          <p>
                            <strong className="text-slate-400 block text-[10px] font-mono uppercase">E-mail:</strong>
                            <span className="text-slate-300">{prop.ownerEmail || 'Não informado'}</span>
                          </p>
                          {prop.ownerDocument && (
                            <p>
                              <strong className="text-slate-400 block text-[10px] font-mono uppercase">CPF / RUC:</strong>
                              <span className="text-slate-200 font-mono">{prop.ownerDocument}</span>
                            </p>
                          )}
                          {prop.ownerBankDetails && (
                            <p>
                              <strong className="text-slate-400 block text-[10px] font-mono uppercase">Dados para Repasse de Aluguel:</strong>
                              <span className="text-[#E5C378] font-mono text-[11px] block">{prop.ownerBankDetails}</span>
                            </p>
                          )}
                          {prop.ownerMinNegotiationValue && (
                            <p>
                              <strong className="text-slate-400 block text-[10px] font-mono uppercase">Margem Mínima de Negociação:</strong>
                              <span className="text-white font-mono font-bold">{prop.ownerMinNegotiationValue}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Realtor Responsible (Span 3) */}
                      <div className="lg:col-span-3 bg-[#0B163B]/80 rounded-2xl p-4 border border-[#D4AF37]/25 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E5C378] pb-1 border-b border-white/10">
                          <Briefcase className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>CORRETOR RESPONSÁVEL</span>
                        </div>
                        <div className="text-xs space-y-1.5">
                          <p>
                            <strong className="text-slate-400 block text-[10px] font-mono uppercase">Corretor:</strong>
                            <span className="text-white font-medium">{prop.realtorName || 'Alexandre Bratu'}</span>
                          </p>
                          <p>
                            <strong className="text-slate-400 block text-[10px] font-mono uppercase">CRECI / Registro:</strong>
                            <span className="text-slate-300 font-mono">{prop.realtorCreci || 'CRECI-PR J-08240'}</span>
                          </p>
                          <p>
                            <strong className="text-slate-400 block text-[10px] font-mono uppercase">Telefone:</strong>
                            <span className="text-emerald-400 font-mono font-semibold">{prop.realtorPhone || COMPANY_INFO.phoneDisplay}</span>
                          </p>
                          <p>
                            <strong className="text-slate-400 block text-[10px] font-mono uppercase">Comissão:</strong>
                            <span className="text-[#E5C378] font-mono font-bold">{prop.realtorCommission || '6%'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Administrator Notes (Span 5) */}
                      <div className="lg:col-span-5 bg-[#050B1A] rounded-2xl p-4 border border-[#D4AF37]/40 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-1 mb-2 border-b border-white/10">
                            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E5C378]">
                              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>OBSERVAÇÕES DO ADMINISTRADOR (EDITÁVEL)</span>
                            </div>
                            {savedSuccessId === prop.id && (
                              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Salvo!
                              </span>
                            )}
                          </div>
                          <textarea
                            rows={4}
                            value={currentNote}
                            onChange={(e) => {
                              setEditingNotes({
                                ...editingNotes,
                                [prop.id]: e.target.value,
                              });
                            }}
                            placeholder="Adicione observações internas sobre visitas, chaves, pendências de cartório, propostas em análise..."
                            className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                          />
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            disabled={savingNotesId === prop.id}
                            onClick={() => handleSaveNotes(prop)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] text-[#050B1A] text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-md disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5 text-[#050B1A]" />
                            <span>{savingNotesId === prop.id ? 'Salvando...' : 'Salvar Observações'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER NEW PROPERTY WITH OWNER, REALTOR, AND NOTES */}
        {activeTab === 'new' && (
          <div className="py-6 flex-1 max-w-4xl mx-auto w-full">
            <div className="bg-[#070F26] rounded-3xl border border-[#D4AF37]/35 p-6 sm:p-10 shadow-2xl">
              <div className="mb-8 pb-4 border-b border-[#D4AF37]/20">
                <span className="text-xs font-mono uppercase tracking-widest text-[#E5C378]">
                  CADASTRO DE IMÓVEIS BRATU
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  Novo Imóvel Comercial ou Residencial
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Preencha os dados públicos para o catálogo e os dados confidenciais do proprietário e corretor (visíveis apenas no painel administrativo).
                </p>
              </div>

              {createSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Imóvel cadastrado com sucesso no banco de dados Firestore! Redirecionando...</span>
                </div>
              )}

              {saveError && (
                <div className="mb-6 p-4 rounded-2xl bg-red-950/90 border border-red-500/50 text-red-200 text-xs flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSaveError(null)}
                    className="text-red-300 hover:text-white text-xs font-mono p-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {isCompressingPhotos && (
                <div className="mb-6 p-3.5 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-200 text-xs flex items-center gap-2.5 animate-pulse">
                  <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                  <span>Otimizando e comprimindo fotos selecionadas para gravação rápida no banco de dados...</span>
                </div>
              )}

              <form onSubmit={handleCreateProperty} className="space-y-6">
                {/* Section A: Dados Públicos */}
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#D4AF37] mb-3 pb-1 border-b border-white/10">
                    PARTE 1: DADOS PÚBLICOS DO IMÓVEL (EXIBIDOS NO SITE)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">CÓDIGO REFERÊNCIA *</label>
                      <input
                        type="text"
                        required
                        value={newProp.code}
                        onChange={(e) => setNewProp({ ...newProp, code: e.target.value })}
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">SEGMENTO *</label>
                      <select
                        value={newProp.category?.includes('comercial') ? 'comercial' : 'residencial'}
                        onChange={(e) => {
                          const cat = e.target.value as 'residencial' | 'comercial';
                          setNewProp({ ...newProp, category: [cat] });
                        }}
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs cursor-pointer"
                      >
                        <option value="residencial" className="bg-[#070F26]">Imóvel Residencial</option>
                        <option value="comercial" className="bg-[#070F26]">Imóvel Comercial / Corporativo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">FINALIDADE *</label>
                      <select
                        value={newProp.purpose}
                        onChange={(e) => setNewProp({ ...newProp, purpose: e.target.value as PropertyPurpose })}
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs cursor-pointer"
                      >
                        <option value="Venda" className="bg-[#070F26]">Venda</option>
                        <option value="Locação" className="bg-[#070F26]">Locação</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">TÍTULO DO ANÚNCIO *</label>
                      <input
                        type="text"
                        required
                        value={newProp.title}
                        onChange={(e) => setNewProp({ ...newProp, title: e.target.value })}
                        placeholder="Ex: Laje Corporativa Batel Diamond ou Mansão Graciosa"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">VALOR PRINCIPAL EXIBIDO *</label>
                      <input
                        type="text"
                        required
                        value={newProp.priceFormatted}
                        onChange={(e) => setNewProp({ ...newProp, priceFormatted: e.target.value })}
                        placeholder="Ex: R$ 4.500.000 ou US$ 650.000 ou R$ 18.000/mês"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>
                  </div>

                  {/* Financial Details: Valor Venda, Valor Aluguel, IPTU, Valor Condomínio */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] font-mono text-[#E5C378] mb-1">VALOR DE VENDA</label>
                      <input
                        type="text"
                        value={newProp.salePrice || ''}
                        onChange={(e) => setNewProp({ ...newProp, salePrice: e.target.value })}
                        placeholder="Ex: R$ 4.500.000"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#E5C378] mb-1">VALOR DE ALUGUEL</label>
                      <input
                        type="text"
                        value={newProp.rentPrice || ''}
                        onChange={(e) => setNewProp({ ...newProp, rentPrice: e.target.value })}
                        placeholder="Ex: R$ 18.000/mês"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">IPTU</label>
                      <input
                        type="text"
                        value={newProp.iptu || ''}
                        onChange={(e) => setNewProp({ ...newProp, iptu: e.target.value })}
                        placeholder="Ex: R$ 850/mês ou R$ 9.500/ano"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-mono text-[#E5C378]">VALOR DO CONDOMÍNIO</label>
                        {condos.some((c) => c.name === newProp.condoName) && (
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                            ✓ Padrão
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={newProp.condoFee || ''}
                        onChange={(e) => setNewProp({ ...newProp, condoFee: e.target.value })}
                        placeholder="Ex: R$ 1.650/mês"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>
                  </div>

                  {/* Condomínio: Nome do Condomínio / Edifício com Seletor dos Cadastrados */}
                  <div className="mb-4 p-4 rounded-2xl bg-[#0B163B]/70 border border-[#D4AF37]/30 space-y-3">
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#D4AF37]" />
                        <label className="text-[11px] font-mono text-[#ECC97E] font-bold uppercase tracking-wider">
                          CONDOMÍNIO / EDIFÍCIO DO IMÓVEL
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsCustomCondoNew(!isCustomCondoNew)}
                          className="text-[10px] font-mono text-[#ECC97E] hover:underline cursor-pointer"
                        >
                          {isCustomCondoNew ? '« Escolher da Lista' : '+ Digitar outro manualmente'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('condos')}
                          className="text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <span>Gerenciar Condomínios ({condos.length})</span>
                        </button>
                      </div>
                    </div>

                    {!isCustomCondoNew ? (
                      <div>
                        <select
                          value={
                            condos.some((c) => c.name === newProp.condoName)
                              ? condos.find((c) => c.name === newProp.condoName)?.id
                              : ''
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              setIsCustomCondoNew(true);
                              return;
                            }
                            const selected = condos.find((c) => c.id === val);
                            if (selected) {
                              setNewProp((prev) => ({
                                ...prev,
                                condoName: selected.name,
                                condoFee: selected.condoFee || prev.condoFee,
                                neighborhood: prev.neighborhood || selected.neighborhood,
                                city: prev.city || selected.city,
                                address: prev.address || selected.address,
                                zipCode: prev.zipCode || selected.zipCode,
                                country: prev.country || selected.country || 'Brasil',
                              }));
                            } else {
                              setNewProp((prev) => ({
                                ...prev,
                                condoName: '',
                              }));
                            }
                          }}
                          className="w-full bg-[#050B1A] border border-[#D4AF37]/50 text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                        >
                          <option value="">-- Selecione o Condomínio / Edifício Cadastrado --</option>
                          {condos.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} · {c.neighborhood}, {c.city} ({c.condoFee || 'Sob consulta'})
                            </option>
                          ))}
                          <option value="custom">&#x270E; Digitar outro condomínio manualmente...</option>
                        </select>

                        {/* Selected Condo Preview Pill */}
                        {condos.some((c) => c.name === newProp.condoName) && (() => {
                          const currentCondo = condos.find((c) => c.name === newProp.condoName);
                          return (
                            <div className="mt-2.5 p-3 rounded-xl bg-[#070F26] border border-[#D4AF37]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <div>
                                <span className="font-bold text-white">{currentCondo?.name}</span>
                                <span className="text-[11px] text-slate-400 block font-mono">
                                  {currentCondo?.address ? `${currentCondo.address} · ` : ''}{currentCondo?.neighborhood}, {currentCondo?.city}
                                </span>
                              </div>
                              {currentCondo?.amenities && currentCondo.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {currentCondo.amenities.slice(0, 3).map((a, i) => (
                                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B163B] text-[#ECC97E] border border-[#D4AF37]/30">
                                      {a}
                                    </span>
                                  ))}
                                  {currentCondo.amenities.length > 3 && (
                                    <span className="text-[10px] font-mono text-slate-400 self-center">
                                      +{currentCondo.amenities.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={newProp.condoName || ''}
                        onChange={(e) => setNewProp({ ...newProp, condoName: e.target.value })}
                        placeholder="Digite o nome oficial do condomínio ou edifício..."
                        className="w-full bg-[#050B1A] border border-[#D4AF37]/50 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                        autoFocus
                      />
                    )}
                    <span className="text-[10px] text-slate-400 block font-sans">
                      Nome oficial do edifício ou condomínio residencial/empresarial exibido na ficha técnica do anúncio.
                    </span>
                  </div>

                  {/* CONFIGURAÇÕES DE DESTAQUE & SUGESTÕES RÁPIDAS */}
                  <div className="mb-4 p-4 rounded-2xl bg-[#0B163B]/80 border border-[#D4AF37]/35 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                        Visibilidade Especial & Destaques
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Checkbox Destaque Geral */}
                      <label className="flex items-start gap-3 p-3 rounded-xl bg-[#050B1A] border border-[#D4AF37]/30 hover:border-[#D4AF37] cursor-pointer transition-colors group">
                        <input
                          type="checkbox"
                          checked={newProp.featured || false}
                          onChange={(e) => setNewProp({ ...newProp, featured: e.target.checked })}
                          className="mt-0.5 rounded text-[#D4AF37] focus:ring-[#D4AF37] bg-[#070F26] border-white/20 w-4 h-4"
                        />
                        <div>
                          <span className="text-xs font-bold text-white group-hover:text-[#ECC97E] flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                            <span>Imóvel em Destaque no Catálogo</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Recebe o selo dourado "EM DESTAQUE" e é priorizado nos filtros de busca.
                          </span>
                        </div>
                      </label>

                      {/* Checkbox Sugestões Rápidas */}
                      <label className="flex items-start gap-3 p-3 rounded-xl bg-[#050B1A] border border-[#D4AF37]/30 hover:border-[#D4AF37] cursor-pointer transition-colors group">
                        <input
                          type="checkbox"
                          checked={newProp.featuredInQuickSuggestions || false}
                          onChange={(e) => setNewProp({ ...newProp, featuredInQuickSuggestions: e.target.checked })}
                          className="mt-0.5 rounded text-[#D4AF37] focus:ring-[#D4AF37] bg-[#070F26] border-white/20 w-4 h-4"
                        />
                        <div>
                          <span className="text-xs font-bold text-white group-hover:text-[#ECC97E] flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span>Exibir em Destaque nas Sugestões Rápidas</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Aparece como atalho direto nas pílulas rápidas e no topo do auto-complete.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* VÍDEO DO YOUTUBE (TOUR VIRTUAL) */}
                  <div className="mb-4 p-4 rounded-2xl bg-[#0B163B]/80 border border-[#D4AF37]/35 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-red-600/25 text-red-500 border border-red-500/30 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 fill-red-500" />
                        </div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                          Vídeo Tour no YouTube (Tour Virtual do Imóvel)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        Opcional
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">
                        LINK OU URL DO VÍDEO DO YOUTUBE
                      </label>
                      <input
                        type="text"
                        value={newProp.youtubeUrl || ''}
                        onChange={(e) => setNewProp({ ...newProp, youtubeUrl: e.target.value })}
                        placeholder="Ex: https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                        className="w-full bg-[#050B1A] border border-[#D4AF37]/35 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Insira qualquer link do YouTube. O vídeo será incorporado interativamente na galeria e na página de detalhes do anúncio.
                      </span>
                    </div>

                    {/* Live Preview if valid URL */}
                    {newProp.youtubeUrl && isValidYouTubeUrl(newProp.youtubeUrl) && (
                      <div className="pt-2">
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mb-2">
                          <CheckCircle className="w-3 h-3" /> Vídeo do YouTube validado com sucesso:
                        </span>
                        <div className="relative aspect-[16/9] max-w-sm rounded-xl overflow-hidden border border-[#D4AF37]/40 shadow-lg bg-black">
                          <iframe
                            src={getYouTubeEmbedUrl(newProp.youtubeUrl) || ''}
                            title="Preview do Vídeo"
                            className="w-full h-full border-0"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TOUR VIRTUAL 360° (UPLOAD DE FOTO PANORÂMICA OU LINK MATTERPORT/KUULA/CLOUDPANO) */}
                  <div className="mb-4 p-4 sm:p-5 rounded-2xl bg-[#0B163B]/85 border border-cyan-500/40 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-300 border border-cyan-400/40 flex items-center justify-center">
                          <Compass className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '10s' }} />
                        </div>
                        <div>
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 block">
                            Tour Virtual 360° Imersivo (Foto Panorâmica ou Link Externo)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Envie o arquivo de imagem 360° do seu aparelho ou insira um link de plataforma 3D.
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                        {newProp.virtualTour360Image ? 'Foto 360° Carregada' : newProp.virtualTour360Url ? detect360Provider(newProp.virtualTour360Url) : 'Opcional'}
                      </span>
                    </div>

                    {/* OPÇÃO 1: Upload direto de Arquivo de Foto Panorâmica 360° */}
                    <div className="p-3.5 rounded-xl bg-[#070F26] border border-cyan-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-mono font-bold text-cyan-200 flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-cyan-400" />
                          <span>OPÇÃO 1: ENVIAR ARQUIVO DE IMAGEM 360° DO SEU DISPOSITIVO</span>
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">JPG, PNG, WEBP equirretangular</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => tour360FileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{newProp.virtualTour360Image ? 'Trocar Foto Panorâmica 360°' : 'Selecionar Arquivo de Imagem 360°'}</span>
                        </button>

                        <input
                          ref={tour360FileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleTour360Upload(e.target.files)}
                        />

                        {newProp.virtualTour360Image && (
                          <button
                            type="button"
                            onClick={() => setNewProp((prev) => ({ ...prev, virtualTour360Image: '' }))}
                            className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover Foto 360°</span>
                          </button>
                        )}
                      </div>

                      {/* Interactive Three.js Preview of Uploaded 360 Panorama */}
                      {newProp.virtualTour360Image && (
                        <div className="pt-2">
                          <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1 mb-1.5">
                            <CheckCircle className="w-3 h-3 text-cyan-400" /> Pré-visualização Interativa Three.js 360° (Arraste para testar a visão):
                          </span>
                          <div className="relative aspect-[16/9] max-w-md rounded-xl overflow-hidden border border-cyan-400/50 shadow-xl bg-black">
                            <Panorama360Viewer
                              imageSource={newProp.virtualTour360Image}
                              className="w-full h-full min-h-[200px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* OPÇÃO 2: Link de Tour Virtual 360° Externo */}
                    <div className="p-3.5 rounded-xl bg-[#070F26] border border-cyan-500/25 space-y-2">
                      <label className="block text-[11px] font-mono font-bold text-cyan-200">
                        OPÇÃO 2: OU INSERIR LINK DO TOUR VIRTUAL 360° (MATTERPORT, KUULA, CLOUDPANO, ETC.)
                      </label>
                      <input
                        type="text"
                        value={newProp.virtualTour360Url || ''}
                        onChange={(e) => setNewProp({ ...newProp, virtualTour360Url: e.target.value })}
                        placeholder="Ex: https://my.matterport.com/show/?m=... ou https://kuula.co/share/..."
                        className="w-full bg-[#050B1A] border border-cyan-500/40 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-cyan-400 font-mono"
                      />
                      <span className="text-[10px] text-slate-400 block">
                        Suporta Matterport 3D, Kuula 360°, CloudPano, Momento360, YouTube 360° ou link direto de foto panorâmica.
                      </span>

                      {/* Live Preview if valid URL and no uploaded image */}
                      {newProp.virtualTour360Url && isValid360Url(newProp.virtualTour360Url) && !newProp.virtualTour360Image && (
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-cyan-400" /> Tour 360° detectado ({detect360Provider(newProp.virtualTour360Url)}):
                            </span>
                            <a
                              href={newProp.virtualTour360Url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono text-[#ECC97E] hover:underline flex items-center gap-1"
                            >
                              <span>Testar em nova aba</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="relative aspect-[16/9] max-w-sm rounded-xl overflow-hidden border border-cyan-500/50 shadow-lg bg-black">
                            {is360ImageSource(newProp.virtualTour360Url) ? (
                              <Panorama360Viewer
                                imageSource={newProp.virtualTour360Url}
                                className="w-full h-full min-h-[200px]"
                              />
                            ) : (
                              <iframe
                                src={get360EmbedUrl(newProp.virtualTour360Url) || ''}
                                title="Preview Tour 360"
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; gyroscope; magnetometer; xr-spatial-tracking; fullscreen"
                                allowFullScreen
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location & Specs: País, Cidade, Bairro, M2, Endereço, CEP */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">PAÍS *</label>
                      <select
                        value={newProp.country}
                        onChange={(e) => setNewProp({ ...newProp, country: e.target.value as any })}
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs cursor-pointer"
                      >
                        <option value="Brasil" className="bg-[#070F26]">Brasil</option>
                        <option value="Estados Unidos" className="bg-[#070F26]">Estados Unidos</option>
                        <option value="Paraguai" className="bg-[#070F26]">Paraguai</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">CIDADE *</label>
                      <input
                        type="text"
                        required
                        value={newProp.city}
                        onChange={(e) => setNewProp({ ...newProp, city: e.target.value })}
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">BAIRRO *</label>
                      <input
                        type="text"
                        required
                        value={newProp.neighborhood}
                        onChange={(e) => setNewProp({ ...newProp, neighborhood: e.target.value })}
                        placeholder="Ex: Batel ou Santa Teresa"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">METRAGEM (M²) *</label>
                      <input
                        type="number"
                        required
                        value={newProp.areaM2}
                        onChange={(e) => setNewProp({ ...newProp, areaM2: Number(e.target.value) })}
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>
                  </div>

                  {/* Endereço Completo e CEP */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">ENDEREÇO COMPLETO *</label>
                      <input
                        type="text"
                        value={newProp.address || ''}
                        onChange={(e) => setNewProp({ ...newProp, address: e.target.value })}
                        placeholder="Ex: Av. Desembargador Motta, 1420 - Batel"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">CEP *</label>
                      <input
                        type="text"
                        value={newProp.zipCode || ''}
                        onChange={(e) => setNewProp({ ...newProp, zipCode: e.target.value })}
                        placeholder="Ex: 80420-190"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>
                  </div>

                  {/* UPLOAD DE FOTOS DO IMÓVEL (ARRASTAR & SOLTAR / SELECIONAR ARQUIVO / URL) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#050B1A] border border-[#D4AF37]/35 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                          Upload e Galeria de Fotos do Imóvel
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {(newProp.images || []).length} foto(s) selecionada(s)
                      </span>
                    </div>

                    {/* Drag and Drop / Click to Upload Box */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFileUpload(e.dataTransfer.files);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-[#D4AF37] bg-[#0B163B]'
                          : 'border-white/20 hover:border-[#D4AF37]/60 bg-[#070F26]'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                      <ImageIcon className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                      <p className="text-xs font-bold text-white">
                        Clique aqui para selecionar fotos do seu dispositivo ou arraste e solte
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        Suporta arquivos JPG, PNG, WEBP de alta resolução. Múltiplos arquivos permitidos.
                      </p>
                    </div>

                    {/* Ou adicionar via Link/URL */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Ou adicione por URL de foto: https://images.unsplash.com/..."
                        className="flex-1 bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrl}
                        className="px-4 py-2 bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/40 text-[#E5C378] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        + Adicionar URL
                      </button>
                    </div>

                    {/* Gallery Thumbnails with Cover Badge and Action Controls */}
                    {newProp.images && newProp.images.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-mono text-slate-400 block mb-2">
                          Fotos do Imóvel (A 1ª foto é a imagem de capa principal):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {newProp.images.map((img, idx) => (
                            <div
                              key={idx}
                              className={`relative rounded-xl overflow-hidden border-2 group bg-[#070F26] ${
                                idx === 0 ? 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'border-white/10'
                              }`}
                            >
                              <img
                                src={img}
                                alt={`Foto ${idx + 1}`}
                                className="w-full h-24 object-cover"
                              />

                              {idx === 0 ? (
                                <span className="absolute top-1.5 left-1.5 bg-[#D4AF37] text-[#050B1A] font-bold text-[9px] font-mono px-1.5 py-0.5 rounded shadow">
                                  ★ CAPA
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryPhoto(idx)}
                                  className="absolute top-1.5 left-1.5 bg-[#050B1A]/80 hover:bg-[#050B1A] text-[#ECC97E] text-[9px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-[#D4AF37]/40"
                                >
                                  Tornar Capa
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Remover Foto"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section B: DADOS DO PROPRIETÁRIO (EXCLUSIVO ADMINISTRADOR) */}
                <div className="pt-4">
                  <div className="flex items-center justify-between gap-2 mb-3 pb-1 border-b border-[#D4AF37]/30">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                        PARTE 2: DADOS DO PROPRIETÁRIO (SOMENTE ADMINISTRADOR VERÁ)
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('owners')}
                      className="text-[11px] font-mono text-[#ECC97E] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Gerenciar Proprietários ({owners.length})</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {/* 1. NOME DO PROPRIETÁRIO COM SELETOR DOS CADASTRADOS */}
                    <div className="sm:col-span-1">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-mono text-slate-300 font-bold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>NOME DO PROPRIETÁRIO *</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCustomOwnerNew(!isCustomOwnerNew)}
                          className="text-[10px] font-mono text-[#ECC97E] hover:underline cursor-pointer"
                        >
                          {isCustomOwnerNew ? '« Escolher da Lista' : '+ Digitar outro'}
                        </button>
                      </div>

                      {!isCustomOwnerNew ? (
                        <select
                          value={
                            owners.some((o) => o.name === newProp.ownerName)
                              ? owners.find((o) => o.name === newProp.ownerName)?.id
                              : ''
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              setIsCustomOwnerNew(true);
                              return;
                            }
                            const selected = owners.find((o) => o.id === val);
                            if (selected) {
                              setNewProp((prev) => ({
                                ...prev,
                                ownerName: selected.name,
                                ownerPhone: selected.phone || prev.ownerPhone,
                                ownerEmail: selected.email || prev.ownerEmail,
                                ownerDocument: selected.document || prev.ownerDocument,
                                ownerBankDetails: selected.bankDetails || prev.ownerBankDetails,
                                ownerMinNegotiationValue: selected.minNegotiationValue || prev.ownerMinNegotiationValue,
                              }));
                            } else {
                              setNewProp((prev) => ({
                                ...prev,
                                ownerName: '',
                              }));
                            }
                          }}
                          className="w-full bg-[#0B163B] border border-[#D4AF37]/50 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                        >
                          <option value="">-- Selecione o Proprietário Cadastrado --</option>
                          {owners.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name} {o.document ? `· ${o.document}` : ''}
                            </option>
                          ))}
                          <option value="custom">&#x270E; Digitar outro proprietário manualmente...</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={newProp.ownerName || ''}
                          onChange={(e) => setNewProp({ ...newProp, ownerName: e.target.value })}
                          placeholder="Digite o nome completo do proprietário..."
                          className="w-full bg-[#0B163B] border border-[#D4AF37]/50 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                          autoFocus
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-mono text-slate-300 font-bold">TELEFONE / WHATSAPP *</label>
                        {owners.some((o) => o.name === newProp.ownerName) && (
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                            ✓ Preenchido Automaticamente
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={newProp.ownerPhone || ''}
                        onChange={(e) => setNewProp({ ...newProp, ownerPhone: e.target.value })}
                        placeholder="Ex: +55 (41) 99999-8888"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">E-MAIL DO PROPRIETÁRIO</label>
                      <input
                        type="email"
                        value={newProp.ownerEmail || ''}
                        onChange={(e) => setNewProp({ ...newProp, ownerEmail: e.target.value })}
                        placeholder="proprietario@email.com"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">DOCUMENTO (CPF / CNPJ / RUC)</label>
                      <input
                        type="text"
                        value={newProp.ownerDocument || ''}
                        onChange={(e) => setNewProp({ ...newProp, ownerDocument: e.target.value })}
                        placeholder="Ex: 123.456.789-00 ou RUC 80012345-6"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">VALOR MÍNIMO DE NEGOCIAÇÃO</label>
                      <input
                        type="text"
                        value={newProp.ownerMinNegotiationValue || ''}
                        onChange={(e) => setNewProp({ ...newProp, ownerMinNegotiationValue: e.target.value })}
                        placeholder="Ex: Aceita até R$ 4.200.000 à vista"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">DADOS BANCÁRIOS / PIX PARA REPASSE</label>
                    <input
                      type="text"
                      value={newProp.ownerBankDetails || ''}
                      onChange={(e) => setNewProp({ ...newProp, ownerBankDetails: e.target.value })}
                      placeholder="Ex: Banco Itaú Ag 1234 CC 56789-0 | Chave PIX: celular..."
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>

                {/* Section C: CORRETOR RESPONSÁVEL */}
                <div className="pt-4">
                  <div className="flex items-center justify-between gap-2 mb-3 pb-1 border-b border-[#D4AF37]/30">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                        PARTE 3: CORRETOR RESPONSÁVEL (BRATU)
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('realtors')}
                      className="text-[11px] font-mono text-[#ECC97E] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Gerenciar Corretores ({realtors.length})</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                    {/* 1. NOME DO CORRETOR COM LISTA DE CORRETORES CADASTRADOS */}
                    <div className="sm:col-span-1">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-mono text-slate-300 font-bold flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>NOME DO CORRETOR *</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCustomRealtorNew(!isCustomRealtorNew)}
                          className="text-[10px] font-mono text-[#ECC97E] hover:underline"
                        >
                          {isCustomRealtorNew ? '« Escolher da Lista' : '+ Digitar outro'}
                        </button>
                      </div>

                      {!isCustomRealtorNew ? (
                        <select
                          value={
                            realtors.some((r) => r.name === newProp.realtorName)
                              ? realtors.find((r) => r.name === newProp.realtorName)?.id
                              : ''
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              setIsCustomRealtorNew(true);
                              return;
                            }
                            const selected = realtors.find((r) => r.id === val);
                            if (selected) {
                              setNewProp((prev) => ({
                                ...prev,
                                realtorName: selected.name,
                                realtorCreci: selected.creci,
                                realtorPhone: selected.phone,
                                realtorEmail: selected.email,
                                realtorCommission: selected.defaultCommission || '6%',
                              }));
                            } else {
                              setNewProp((prev) => ({
                                ...prev,
                                realtorName: '',
                                realtorCreci: '',
                              }));
                            }
                          }}
                          className="w-full bg-[#0B163B] border border-[#D4AF37]/50 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                        >
                          <option value="">-- Selecione o Corretor Cadastrado --</option>
                          {realtors.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} · {r.creci} ({r.specialty || 'Corretor Associado'})
                            </option>
                          ))}
                          <option value="custom">&#x270E; Digitar outro corretor manualmente...</option>
                        </select>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            value={newProp.realtorName || ''}
                            onChange={(e) => setNewProp({ ...newProp, realtorName: e.target.value })}
                            placeholder="Digite o nome completo do corretor..."
                            className="w-full bg-[#0B163B] border border-[#D4AF37]/50 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>

                    {/* 2. CRECI / REGISTRO PREENCHIDO AUTOMATICAMENTE */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-mono text-slate-300 font-bold">
                          CRECI / REGISTRO *
                        </label>
                        {newProp.realtorCreci && (
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                            ✓ Preenchido Automaticamente
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={newProp.realtorCreci || ''}
                        onChange={(e) => setNewProp({ ...newProp, realtorCreci: e.target.value })}
                        placeholder="CRECI preenchido automaticamente ao selecionar"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs font-mono"
                      />
                    </div>

                    {/* 3. COMISSÃO ACORDADA */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-mono text-slate-300 font-bold">COMISSÃO ACORDADA</label>
                        {newProp.realtorCommission && (
                          <span className="text-[10px] font-mono text-[#E5C378]">Padrão da equipe</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={newProp.realtorCommission || ''}
                        onChange={(e) => setNewProp({ ...newProp, realtorCommission: e.target.value })}
                        placeholder="Ex: 6% ou 1º aluguel + 8%"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">TELEFONE / WHATSAPP DO CORRETOR</label>
                      <input
                        type="text"
                        value={newProp.realtorPhone || ''}
                        onChange={(e) => setNewProp({ ...newProp, realtorPhone: e.target.value })}
                        placeholder="+55 (21) 98098-4243"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-emerald-400 rounded-xl px-3.5 py-2 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">E-MAIL DO CORRETOR</label>
                      <input
                        type="email"
                        value={newProp.realtorEmail || ''}
                        onChange={(e) => setNewProp({ ...newProp, realtorEmail: e.target.value })}
                        placeholder="Demy@Bratu.com.br"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Section D: OBSERVAÇÕES INTERNAS DO ADMINISTRADOR */}
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-3 pb-1 border-b border-[#D4AF37]/30">
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                      PARTE 4: OBSERVAÇÕES INTERNAS DO ADMINISTRADOR
                    </h4>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      NOTAS PRIVADAS (HISTÓRICO, CHAVES, DOCUMENTAÇÃO, PROPOSTAS)
                    </label>
                    <textarea
                      rows={4}
                      value={newProp.adminNotes || ''}
                      onChange={(e) => setNewProp({ ...newProp, adminNotes: e.target.value })}
                      placeholder="Ex: Chaves no cofre 2. Documentação no 1º Ofício. Proprietário exige fiador ou seguro fiança..."
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl p-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('properties')}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingNew || isCompressingPhotos}
                    className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] text-[#050B1A] text-xs font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingNew ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-[#050B1A] border-t-transparent animate-spin" />
                        <span>Salvando no Firestore...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Salvar Imóvel no Banco de Dados</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB: GESTÃO COMPLETA DE PROPRIETÁRIOS CADASTRADOS */}
        {activeTab === 'owners' && (
          <div className="py-6 flex-1 space-y-6">
            {/* Feedback Alert */}
            {ownerFeedback && (
              <div
                className={`p-4 rounded-2xl flex items-center justify-between text-xs font-mono border animate-fadeIn ${
                  ownerFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-red-950/80 border-red-500/50 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {ownerFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{ownerFeedback.message}</span>
                </div>
                <button
                  onClick={() => setOwnerFeedback(null)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Header with Title and Add Owner Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#070F26] p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    Proprietários Cadastrados ({owners.length})
                  </h3>
                  <span className="text-[10px] font-mono bg-[#0B163B] text-[#E5C378] border border-[#D4AF37]/35 px-2.5 py-0.5 rounded-full">
                    Confidencial · Restrito Admin
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
                  Cadastre e mantenha os dados confidenciais dos proprietários (contatos, documentos, dados bancários e margem mínima de negociação).
                  Ao cadastrar ou editar um imóvel, você poderá selecioná-los para preenchimento automático.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateOwner}
                className="tech-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#050B1A] shrink-0 shadow-lg cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#050B1A]" />
                <span>Cadastrar Novo Proprietário</span>
              </button>
            </div>

            {/* List of Owners */}
            {owners.length === 0 ? (
              <div className="text-center py-12 bg-[#070F26] rounded-3xl border border-white/10 p-6">
                <UserCheck className="w-12 h-12 text-[#D4AF37]/50 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">Nenhum proprietário cadastrado</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Clique no botão acima para registrar o primeiro proprietário com dados completos.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateOwner}
                  className="tech-btn-primary px-4 py-2 rounded-xl text-xs font-bold text-[#050B1A] cursor-pointer"
                >
                  Cadastrar Proprietário Agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {owners.map((owner) => {
                  const linkedPropsCount = properties.filter(
                    (p) => p.ownerName && p.ownerName.toLowerCase() === owner.name.toLowerCase()
                  ).length;
                  const initials = owner.name
                    .split(' ')
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={owner.id}
                      className="bg-[#070F26] rounded-3xl p-5 border border-[#D4AF37]/30 shadow-lg hover:border-[#D4AF37]/60 transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div>
                        {/* Top Profile Strip */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0B163B] to-[#12235E] border-2 border-[#D4AF37]/50 flex items-center justify-center text-sm font-extrabold text-[#ECC97E] shadow-md shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-bold text-white group-hover:text-[#ECC97E] transition-colors">
                                  {owner.name}
                                </h4>
                              </div>
                              {owner.document ? (
                                <span className="text-[11px] font-mono text-[#E5C378] block">
                                  Doc: {owner.document}
                                </span>
                              ) : (
                                <span className="text-[11px] font-mono text-slate-400 block">
                                  Proprietário Pessoa Física/Jurídica
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditOwner(owner)}
                              className="p-1.5 rounded-lg bg-[#0B163B] hover:bg-[#12235E] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="Editar Dados do Proprietário"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOwner(owner.id, owner.name)}
                              className="p-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-500/30 text-red-300 hover:text-white transition-colors cursor-pointer"
                              title="Excluir Proprietário"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Details Badges */}
                        <div className="mt-4 space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-emerald-400 font-mono">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <a
                              href={`https://wa.me/${owner.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline truncate"
                              title="Conversar no WhatsApp"
                            >
                              {owner.phone}
                            </a>
                          </div>

                          {owner.email && (
                            <div className="flex items-center gap-2 text-slate-300 font-mono">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <a
                                href={`mailto:${owner.email}`}
                                className="hover:underline truncate"
                                title="Enviar E-mail"
                              >
                                {owner.email}
                              </a>
                            </div>
                          )}

                          {owner.minNegotiationValue && (
                            <div className="flex items-start gap-2 text-[#E5C378] font-mono">
                              <DollarSign className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span className="text-[11px] leading-tight">Mínimo: {owner.minNegotiationValue}</span>
                            </div>
                          )}

                          {owner.bankDetails && (
                            <div className="p-2.5 rounded-xl bg-[#050B1A] border border-white/10 text-[11px] text-slate-300 font-mono leading-relaxed">
                              <div className="flex items-center gap-1.5 text-slate-400 mb-1 font-semibold uppercase text-[10px]">
                                <CreditCard className="w-3 h-3 text-[#D4AF37]" />
                                <span>Dados Bancários / PIX:</span>
                              </div>
                              <p className="line-clamp-2">{owner.bankDetails}</p>
                            </div>
                          )}

                          {owner.notes && (
                            <div className="p-2.5 rounded-xl bg-[#0B163B]/60 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
                              <div className="flex items-center gap-1.5 text-amber-400 mb-1 font-semibold uppercase text-[10px]">
                                <FileText className="w-3 h-3" />
                                <span>Notas Internas:</span>
                              </div>
                              <p className="line-clamp-2">{owner.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="text-slate-300">
                          {linkedPropsCount > 0 ? (
                            <strong className="text-[#ECC97E]">{linkedPropsCount} imóvel(is) cadastrado(s)</strong>
                          ) : (
                            'Nenhum imóvel vinculado'
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditOwner(owner)}
                          className="text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                        >
                          Editar &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: GESTÃO COMPLETA DE CONDOMÍNIOS / EDIFÍCIOS */}
        {activeTab === 'condos' && (
          <div className="py-6 flex-1 space-y-6">
            {/* Feedback Alert */}
            {condoFeedback && (
              <div
                className={`p-4 rounded-2xl flex items-center justify-between text-xs font-mono border animate-fadeIn ${
                  condoFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-red-950/80 border-red-500/50 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {condoFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{condoFeedback.message}</span>
                </div>
                <button
                  onClick={() => setCondoFeedback(null)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Header with Title and Add Condo Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#070F26] p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    Condomínios & Edifícios Cadastrados ({condos.length})
                  </h3>
                  <span className="text-[10px] font-mono bg-[#0B163B] text-[#E5C378] border border-[#D4AF37]/35 px-2.5 py-0.5 rounded-full">
                    Sincronizado no Firestore
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
                  Gerencie os condomínios residenciais e edifícios corporativos. Ao cadastrar ou editar um imóvel, você pode
                  selecionar o condomínio para preenchimento imediato de nome, taxa mensal, endereço e especificações de infraestrutura.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateCondo}
                className="tech-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#050B1A] shrink-0 shadow-lg cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#050B1A]" />
                <span>Cadastrar Novo Condomínio</span>
              </button>
            </div>

            {/* List of Condominiums */}
            {condos.length === 0 ? (
              <div className="text-center py-12 bg-[#070F26] rounded-3xl border border-white/10 p-6">
                <Building className="w-12 h-12 text-[#D4AF37]/50 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">Nenhum condomínio cadastrado</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Clique no botão acima para adicionar o primeiro condomínio ou edifício.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateCondo}
                  className="tech-btn-primary px-4 py-2 rounded-xl text-xs font-bold text-[#050B1A] cursor-pointer"
                >
                  Cadastrar Condomínio Agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {condos.map((condo) => {
                  const linkedPropsCount = properties.filter(
                    (p) => p.condoName && p.condoName.toLowerCase() === condo.name.toLowerCase()
                  ).length;

                  return (
                    <div
                      key={condo.id}
                      className="bg-[#070F26] rounded-3xl p-5 border border-[#D4AF37]/30 shadow-lg hover:border-[#D4AF37]/60 transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div>
                        {/* Top Profile Strip */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0B163B] to-[#12235E] border-2 border-[#D4AF37]/50 flex items-center justify-center text-[#ECC97E] shadow-md shrink-0">
                              <Building className="w-5 h-5 text-[#D4AF37]" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-[#ECC97E] transition-colors leading-snug">
                                {condo.name}
                              </h4>
                              <span className="text-[11px] font-mono text-[#E5C378] block">
                                {condo.neighborhood ? `${condo.neighborhood}, ` : ''}{condo.city} · {condo.country}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCondo(condo)}
                              className="p-1.5 rounded-lg bg-[#0B163B] hover:bg-[#12235E] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="Editar Condomínio"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCondo(condo.id, condo.name)}
                              className="p-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-500/30 text-red-300 hover:text-white transition-colors cursor-pointer"
                              title="Excluir Condomínio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Details Badges */}
                        <div className="mt-4 space-y-2 text-xs">
                          {condo.condoFee && (
                            <div className="flex items-center gap-2 text-[#E5C378] font-mono">
                              <DollarSign className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-semibold">Taxa Mensal: {condo.condoFee}</span>
                            </div>
                          )}

                          {condo.address && (
                            <div className="flex items-start gap-2 text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span className="text-[11px] leading-tight">
                                {condo.address} {condo.zipCode ? `· CEP ${condo.zipCode}` : ''}
                              </span>
                            </div>
                          )}

                          {/* Amenities Tags */}
                          {condo.amenities && condo.amenities.length > 0 && (
                            <div className="pt-1">
                              <div className="text-[10px] font-mono text-slate-400 mb-1 font-semibold uppercase">
                                Infraestrutura & Lazer:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {condo.amenities.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#0B163B] text-[#ECC97E] border border-[#D4AF37]/30"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {condo.notes && (
                            <div className="p-2.5 rounded-xl bg-[#050B1A] border border-white/10 text-[11px] text-slate-300 leading-relaxed mt-2">
                              <div className="flex items-center gap-1.5 text-slate-400 mb-1 font-semibold uppercase text-[10px]">
                                <FileText className="w-3 h-3 text-[#D4AF37]" />
                                <span>Portaria & Zeladoria:</span>
                              </div>
                              <p className="line-clamp-2">{condo.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="text-slate-300">
                          {linkedPropsCount > 0 ? (
                            <strong className="text-[#ECC97E]">{linkedPropsCount} imóvel(is) cadastrado(s)</strong>
                          ) : (
                            'Nenhum imóvel vinculado'
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditCondo(condo)}
                          className="text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                        >
                          Editar &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2.5: GESTÃO COMPLETA DE CORRETORES CADASTRADOS */}
        {activeTab === 'realtors' && (
          <div className="py-6 flex-1 space-y-6">
            {/* Feedback Alert */}
            {realtorFeedback && (
              <div
                className={`p-4 rounded-2xl flex items-center justify-between text-xs font-mono border animate-fadeIn ${
                  realtorFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-red-950/80 border-red-500/50 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {realtorFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{realtorFeedback.message}</span>
                </div>
                <button
                  onClick={() => setRealtorFeedback(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Header with Title and Add Realtor Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#070F26] p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    Equipe de Corretores Cadastrados ({realtors.length})
                  </h3>
                  <span className="text-[10px] font-mono bg-[#0B163B] text-[#E5C378] border border-[#D4AF37]/35 px-2.5 py-0.5 rounded-full">
                    Sincronizado no Firestore
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
                  Gerencie os corretores responsáveis pelos imóveis. Ao cadastrar ou editar qualquer imóvel,
                  você pode selecionar diretamente um corretor desta lista para preenchimento instantâneo.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateRealtor}
                className="tech-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#050B1A] shrink-0 shadow-lg cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#050B1A]" />
                <span>Cadastrar Novo Corretor</span>
              </button>
            </div>

            {/* List of Realtors */}
            {realtors.length === 0 ? (
              <div className="text-center py-12 bg-[#070F26] rounded-3xl border border-white/10 p-6">
                <Users className="w-12 h-12 text-[#D4AF37]/50 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">Nenhum corretor cadastrado</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Clique no botão acima para adicionar o primeiro corretor da equipe.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateRealtor}
                  className="tech-btn-primary px-4 py-2 rounded-xl text-xs font-bold text-[#050B1A] cursor-pointer"
                >
                  Cadastrar Corretor Agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {realtors.map((realtor) => {
                  const linkedPropsCount = properties.filter(
                    (p) => p.realtorName && p.realtorName.toLowerCase() === realtor.name.toLowerCase()
                  ).length;
                  const initials = realtor.name
                    .split(' ')
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={realtor.id}
                      className="bg-[#070F26] rounded-3xl p-5 border border-[#D4AF37]/30 shadow-lg hover:border-[#D4AF37]/60 transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div>
                        {/* Top Profile Strip */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0B163B] to-[#12235E] border-2 border-[#D4AF37]/50 flex items-center justify-center text-sm font-extrabold text-[#ECC97E] shadow-md shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-bold text-white group-hover:text-[#ECC97E] transition-colors">
                                  {realtor.name}
                                </h4>
                                {realtor.active !== false && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" title="Ativo" />
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-[#E5C378] block">
                                {realtor.creci || 'CRECI Sob Consulta'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditRealtor(realtor)}
                              className="p-1.5 rounded-lg bg-[#0B163B] hover:bg-[#12235E] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="Editar Dados do Corretor"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRealtor(realtor.id, realtor.name)}
                              className="p-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-500/30 text-red-300 hover:text-white transition-colors cursor-pointer"
                              title="Excluir Corretor"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Details Badges */}
                        <div className="mt-4 space-y-2 text-xs">
                          {realtor.specialty && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <Award className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                              <span className="truncate">{realtor.specialty}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-emerald-400 font-mono">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <a
                              href={`https://wa.me/${realtor.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline truncate"
                              title="Conversar no WhatsApp"
                            >
                              {realtor.phone}
                            </a>
                          </div>

                          {realtor.email && (
                            <div className="flex items-center gap-2 text-slate-300 font-mono">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <a
                                href={`mailto:${realtor.email}`}
                                className="hover:underline truncate"
                                title="Enviar E-mail"
                              >
                                {realtor.email}
                              </a>
                            </div>
                          )}

                          {realtor.defaultCommission && (
                            <div className="flex items-center gap-2 text-[#E5C378] font-mono">
                              <DollarSign className="w-3.5 h-3.5 shrink-0" />
                              <span>Comissão Padrão: {realtor.defaultCommission}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="text-slate-300">
                          {linkedPropsCount > 0 ? (
                            <strong className="text-[#ECC97E]">{linkedPropsCount} imóvel(is) sob gestão</strong>
                          ) : (
                            'Nenhum imóvel vinculado'
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditRealtor(realtor)}
                          className="text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                        >
                          Editar &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LEADS & PROPOSALS */}
        {activeTab === 'leads' && (
          <div className="py-6 flex-1 space-y-4">
            <h3 className="text-xl font-bold text-white mb-2">
              Propostas e Contatos Recebidos
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Mensagens de clientes interessados e solicitações de proprietários capturadas através da landing page.
            </p>

            {leads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-[#070F26] rounded-2xl p-5 border border-[#D4AF37]/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#E5C378]">{lead.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : 'Recente'}</span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <p><strong className="text-slate-400">Telefone:</strong> <span className="font-mono text-emerald-400">{lead.phone}</span></p>
                      {lead.email && <p><strong className="text-slate-400">E-mail:</strong> {lead.email}</p>}
                      {lead.purpose && <p><strong className="text-slate-400">Interesse:</strong> {lead.purpose}</p>}
                      {lead.propertyType && <p><strong className="text-slate-400">Tipo:</strong> {lead.propertyType}</p>}
                      {lead.city && <p><strong className="text-slate-400">Local:</strong> {lead.city}</p>}
                      {lead.message && (
                        <div className="p-3 bg-[#0B163B] rounded-xl text-slate-200 mt-2 border border-white/5">
                          {lead.message}
                        </div>
                      )}
                    </div>

                    {/* Quick WhatsApp Google Review Dispatch */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleQuickDispatchFromLead(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
                        title="Abrir gerador de mensagem para avaliação no Google"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Pedir Avaliação no Google via WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#070F26] rounded-2xl border border-white/10 p-8">
                <Inbox className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Nenhuma proposta ou lead registrado no momento.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: EQUIPE BRATU IMOBILIÁRIA & ADMINISTRADORA LTDA */}
        {activeTab === 'team' && (
          <div className="py-6 flex-1 space-y-6 animate-in fade-in duration-200">
            {/* Header & Main Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#D4AF37]/25">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-[#D4AF37] mb-1 px-3 py-0.5 rounded-full bg-[#070F26] border border-[#D4AF37]/35">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>BRATU IMOBILIÁRIA & ADMINISTRADORA LTDA</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  Gestão da Equipe de Especialistas & Colaboradores
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Gerencie nome, cargo, departamento, foto, CRECI, WhatsApp, e-mail e biografia dos profissionais que atuam na Bratu Imobiliária & Administradora LTDA.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenNewTeamModal}
                  className="tech-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#050B1A] shadow-lg cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-[#050B1A]" />
                  <span>+ Novo Membro da Equipe</span>
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {teamFeedback && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
                  teamFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : 'bg-red-950/80 border-red-500/50 text-red-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {teamFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span className="font-medium">{teamFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTeamFeedback(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Filters Bar: Search & Department Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#070F26] border border-[#D4AF37]/30">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  placeholder="Buscar por nome, cargo, setor ou CRECI..."
                  className="w-full bg-[#0B163B] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">Filtrar Setor:</span>
                <select
                  value={teamDeptFilter}
                  onChange={(e) => setTeamDeptFilter(e.target.value)}
                  className="bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-1.5 text-xs font-mono cursor-pointer"
                >
                  <option value="all">Todos os Setores</option>
                  <option value="Diretoria Executiva">Diretoria Executiva</option>
                  <option value="Administração Condominial">Administração Condominial</option>
                  <option value="Vendas Residencial">Vendas Residencial</option>
                  <option value="Ativos Internacionais & Comercial">Ativos Internacionais & Comercial</option>
                  <option value="Locação & Corporativo">Locação & Corporativo</option>
                  <option value="Jurídico & Contratos">Jurídico & Contratos</option>
                </select>
              </div>
            </div>

            {/* Team Members Grid */}
            {(() => {
              const filtered = teamMembers.filter((m) => {
                const matchSearch =
                  m.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
                  m.role.toLowerCase().includes(teamSearch.toLowerCase()) ||
                  (m.department && m.department.toLowerCase().includes(teamSearch.toLowerCase())) ||
                  (m.creci && m.creci.toLowerCase().includes(teamSearch.toLowerCase()));
                const matchDept = teamDeptFilter === 'all' || m.department === teamDeptFilter;
                return matchSearch && matchDept;
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-16 bg-[#070F26] rounded-3xl border border-white/10 p-8 space-y-3">
                    <Users className="w-12 h-12 text-[#D4AF37] mx-auto opacity-50" />
                    <h4 className="text-base font-bold text-white">Nenhum membro encontrado</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Nenhum profissional corresponde aos filtros atuais. Limpe a busca ou cadastre um novo membro.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenNewTeamModal}
                      className="tech-btn-primary inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-[#050B1A]"
                    >
                      <PlusCircle className="w-4 h-4 text-[#050B1A]" />
                      <span>Cadastrar Membro</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-3xl bg-[#070F26] border border-[#D4AF37]/35 hover:border-[#D4AF37] p-5 transition-all flex flex-col justify-between shadow-xl relative group"
                    >
                      <div>
                        {/* Top Meta & Status */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5C378] bg-[#0B163B] px-2.5 py-0.5 rounded border border-[#D4AF37]/30">
                            {member.department || 'Geral'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleTeamActive(member)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                              member.active !== false
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50'
                                : 'bg-slate-800 text-slate-400 border border-white/10'
                            }`}
                            title="Clique para alternar visibilidade no site público"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${member.active !== false ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                            <span>{member.active !== false ? 'Ativo no Site' : 'Oculto'}</span>
                          </button>
                        </div>

                        {/* Photo & Profile Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <img
                            src={member.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80'}
                            alt={member.name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37]/40 shadow-md shrink-0 bg-[#0B163B]"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-base font-bold text-white truncate group-hover:text-[#ECC97E] transition-colors">
                              {member.name}
                            </h4>
                            <p className="text-xs font-mono font-semibold text-[#D4AF37] truncate mt-0.5">
                              {member.role}
                            </p>
                            {member.creci && (
                              <span className="text-[10px] font-mono text-slate-400 block mt-1">
                                {member.creci}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Contact details */}
                        <div className="space-y-1.5 py-3 border-t border-white/10 text-xs">
                          {member.phone && (
                            <div className="flex items-center gap-2 text-slate-300 font-mono">
                              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="text-emerald-400 font-bold">{member.phone}</span>
                            </div>
                          )}
                          {member.email && (
                            <div className="flex items-center gap-2 text-slate-300 font-mono truncate">
                              <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Bio snippet */}
                        {member.bio && (
                          <p className="text-[11px] text-slate-300 line-clamp-3 mt-2 leading-relaxed font-sans bg-[#0B163B]/50 p-2.5 rounded-xl border border-white/5">
                            {member.bio}
                          </p>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-slate-500">
                          Ordem: #{member.order ?? 99}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTeamModal(member)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/50 text-[#E5C378] text-xs font-mono font-bold transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmTeamMember(member)}
                            className="p-1.5 rounded-xl bg-red-950/50 hover:bg-red-900 border border-red-500/40 text-red-300 transition-all cursor-pointer"
                            title="Excluir membro da equipe"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB: HOMEPAGE SPECIALIZED SEGMENTS (01 & 02) */}
        {activeTab === 'segments' && (
          <div className="py-6 flex-1 max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-200">
            {/* Top Action Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#D4AF37]/25">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-[#D4AF37] mb-1 px-3 py-0.5 rounded-full bg-[#070F26] border border-[#D4AF37]/35">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>CUSTOMIZAÇÃO VISUAL & FOTOS TECNOLÓGICAS</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  Edição dos Segmentos 01 & 02 (Página Inicial)
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Troque fotos, configure efeitos modernos (Holo-Gold, Cyber-Lidar, Blueprint, Matrix), títulos, badges, descrições e tópicos exibidos na vitrine de abertura do site.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleResetSegmentsToDefault}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0B163B] border border-white/10 hover:border-white/25 transition-all cursor-pointer"
                >
                  Restaurar Padrões
                </button>
                <button
                  type="button"
                  onClick={handleSaveSegments}
                  disabled={isSavingSegments || isCompressingSegmentPhoto}
                  className="tech-btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-[#050B1A] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-[#050B1A]" />
                  <span>{isSavingSegments ? 'Salvando no Firestore...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {segmentsFeedback && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
                  segmentsFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : 'bg-red-950/80 border-red-500/50 text-red-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {segmentsFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span className="font-medium">{segmentsFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSegmentsFeedback(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Sub-Tabs: Segmento 01 | Segmento 02 | Segmentos Adicionais | Cabeçalho Geral */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#081233] border border-white/10 max-w-2xl">
              <button
                type="button"
                onClick={() => setActiveSegmentTab('seg1')}
                className={`flex-1 min-w-[140px] py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeSegmentTab === 'seg1'
                    ? 'bg-[#D4AF37] text-[#050B1A] shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Segmento 01 (Residencial)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSegmentTab('seg2')}
                className={`flex-1 min-w-[140px] py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeSegmentTab === 'seg2'
                    ? 'bg-[#D4AF37] text-[#050B1A] shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Segmento 02 (Comercial)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSegmentTab('custom')}
                className={`py-2 px-3 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeSegmentTab === 'custom'
                    ? 'bg-[#D4AF37] text-[#050B1A] shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>+ Segmentos Criados ({(segmentsConfig.customSegments || []).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSegmentTab('header')}
                className={`px-3 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeSegmentTab === 'header'
                    ? 'bg-[#D4AF37] text-[#050B1A] shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Configurar introdução da seção"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Cabeçalho</span>
              </button>
            </div>

            {/* TAB: CABEÇALHO GERAL */}
            {activeSegmentTab === 'header' && (
              <div className="bg-[#070F26] p-6 rounded-3xl border border-[#D4AF37]/35 space-y-4 shadow-xl">
                <h4 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
                  <Sliders className="w-4 h-4 text-[#D4AF37]" />
                  <span>Textos do Cabeçalho da Seção de Segmentos</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    TAG SUPERIOR / RÓTULO (BOX)
                  </label>
                  <input
                    type="text"
                    value={segmentsConfig.headerTag || ''}
                    onChange={(e) => setSegmentsConfig({ ...segmentsConfig, headerTag: e.target.value })}
                    placeholder="Ex: SEGMENTOS DE ATUAÇÃO ESPECIALIZADA"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-[#E5C378] font-mono rounded-xl px-3.5 py-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    TÍTULO PRINCIPAL DA SEÇÃO
                  </label>
                  <input
                    type="text"
                    value={segmentsConfig.headerTitle || ''}
                    onChange={(e) => setSegmentsConfig({ ...segmentsConfig, headerTitle: e.target.value })}
                    placeholder="Ex: Imóveis Comerciais & Residenciais"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white font-bold rounded-xl px-3.5 py-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    DESCRIÇÃO INTRODUTÓRIA
                  </label>
                  <textarea
                    rows={3}
                    value={segmentsConfig.headerDescription || ''}
                    onChange={(e) => setSegmentsConfig({ ...segmentsConfig, headerDescription: e.target.value })}
                    placeholder="Atendimento consultivo sob medida com equipes dedicadas..."
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>
            )}

            {/* TAB: SEGMENTO 01 (RESIDENCIAL) */}
            {activeSegmentTab === 'seg1' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Visual Preview & Photo Management (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Live Visual Preview Card */}
                  <div className="bg-[#070F26] p-5 rounded-3xl border border-[#D4AF37]/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#E5C378] font-bold flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Pré-Visualização em Tempo Real</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Efeito: {(segmentsConfig.segment1.techEffect || 'holo-gold').toUpperCase()}
                      </span>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-lg">
                      <TechImage
                        src={segmentsConfig.segment1.imageUrl}
                        alt={segmentsConfig.segment1.title}
                        aspectClass="aspect-[16/10]"
                        badge={segmentsConfig.segment1.imageBadge || 'RESIDENCIAL · LUXO AUTORAL'}
                        techEffect={segmentsConfig.segment1.techEffect || 'holo-gold'}
                        allowEffectToggle={true}
                        showTechHud={true}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 italic text-center">
                      Hover sobre a imagem para ver o feixe laser 3D e retículas HUD em ação!
                    </p>
                  </div>

                  {/* Photo Upload & URL Configuration */}
                  <div className="bg-[#070F26] p-5 rounded-3xl border border-[#D4AF37]/30 space-y-4">
                    <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Trocar Foto do Segmento 01</span>
                    </h5>

                    {/* Direct Image URL */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">
                        URL DA IMAGEM (WEB / CDN / UNSPLASH)
                      </label>
                      <input
                        type="url"
                        value={segmentsConfig.segment1.imageUrl}
                        onChange={(e) =>
                          setSegmentsConfig({
                            ...segmentsConfig,
                            segment1: { ...segmentsConfig.segment1, imageUrl: e.target.value },
                          })
                        }
                        placeholder="https://..."
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>

                    {/* File Upload Button */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">
                        OU ENVIE UMA FOTO DO SEU APARELHO
                      </label>
                      <label className="flex items-center justify-center gap-2 w-full p-3 bg-[#0B163B] hover:bg-[#12235E] border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-xl text-xs font-mono text-[#E5C378] cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-[#D4AF37]" />
                        <span>
                          {isCompressingSegmentPhoto ? 'Comprimindo foto...' : 'Escolher Foto do Computador / Celular'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleSegmentPhotoUpload('segment1', e.target.files)}
                        />
                      </label>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Otimização automática com compressão de alta qualidade compatível com banco de dados.
                      </span>
                    </div>

                    {/* Curated Presets High-Tech Gallery */}
                    <div className="pt-2 border-t border-white/10">
                      <span className="block text-[10px] font-mono uppercase tracking-wider text-[#E5C378] font-bold mb-2">
                        Galeria de Presets Tecnológicos 4K
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {CURATED_TECH_PHOTOS.filter((p) => p.category === 'residencial').map((photo, i) => (
                          <div
                            key={i}
                            onClick={() => handleSelectCuratedPhoto('segment1', photo.url)}
                            className={`p-2 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border transition-all cursor-pointer group ${
                              segmentsConfig.segment1.imageUrl === photo.url
                                ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]'
                                : 'border-white/10 hover:border-[#D4AF37]/60'
                            }`}
                          >
                            <img
                              src={photo.url}
                              alt={photo.name}
                              className="w-full h-14 object-cover rounded-lg mb-1"
                            />
                            <span className="text-[10px] font-bold text-white block truncate group-hover:text-[#E5C378]">
                              {photo.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Badge da Foto */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">
                        BADGE TECNOLÓGICO SOBRE A FOTO
                      </label>
                      <input
                        type="text"
                        value={segmentsConfig.segment1.imageBadge || ''}
                        onChange={(e) =>
                          setSegmentsConfig({
                            ...segmentsConfig,
                            segment1: { ...segmentsConfig.segment1, imageBadge: e.target.value },
                          })
                        }
                        placeholder="Ex: RESIDENCIAL · LUXO AUTORAL 4K"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white font-mono rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    {/* Efeito Visual Tecnológico */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1.5">
                        EFEITO VISUAL TECNOLÓGICO DA FOTO
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'holo-gold', name: 'Holo-Gold', desc: 'Varredura Ouro & Luxo' },
                          { id: 'cyber-lidar', name: 'Cyber-LIDAR', desc: 'Neon Cyan & Matriz 3D' },
                          { id: 'blueprint', name: 'Blueprint 3D', desc: 'Grid Engenharia BIM' },
                          { id: 'matrix', name: 'Neo-Matrix', desc: 'Fósforo Digital Verde' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() =>
                              setSegmentsConfig({
                                ...segmentsConfig,
                                segment1: {
                                  ...segmentsConfig.segment1,
                                  techEffect: m.id as TechEffectType,
                                },
                              })
                            }
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                              segmentsConfig.segment1.techEffect === m.id
                                ? 'bg-[#0B163B] border-[#D4AF37] ring-1 ring-[#D4AF37]'
                                : 'bg-[#050B1A] border-white/10 hover:border-white/30'
                            }`}
                          >
                            <span className="text-[11px] font-bold text-white block">{m.name}</span>
                            <span className="text-[9px] text-slate-400 block">{m.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Titles, Descriptions, Features and Links (7 cols) */}
                <div className="lg:col-span-7 bg-[#070F26] p-6 rounded-3xl border border-[#D4AF37]/35 space-y-4 shadow-xl">
                  <h4 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
                    <Edit className="w-4 h-4 text-[#D4AF37]" />
                    <span>Conteúdo & Textos do Segmento 01 (Residencial)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">
                        TAG DO SEGMENTO
                      </label>
                      <input
                        type="text"
                        value={segmentsConfig.segment1.segmentTag || ''}
                        onChange={(e) =>
                          setSegmentsConfig({
                            ...segmentsConfig,
                            segment1: { ...segmentsConfig.segment1, segmentTag: e.target.value },
                          })
                        }
                        placeholder="SEGMENTO 01"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-[#E5C378] font-mono rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">
                        BADGE DE CATEGORIA
                      </label>
                      <input
                        type="text"
                        value={segmentsConfig.segment1.badge || ''}
                        onChange={(e) =>
                          setSegmentsConfig({
                            ...segmentsConfig,
                            segment1: { ...segmentsConfig.segment1, badge: e.target.value },
                          })
                        }
                        placeholder="ALTO PADRÃO"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white font-mono rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      TÍTULO DO SEGMENTO *
                    </label>
                    <input
                      type="text"
                      value={segmentsConfig.segment1.title || ''}
                      onChange={(e) =>
                        setSegmentsConfig({
                          ...segmentsConfig,
                          segment1: { ...segmentsConfig.segment1, title: e.target.value },
                        })
                      }
                      placeholder="Imóveis Residenciais"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white font-bold rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      DESCRIÇÃO COMPLETA
                    </label>
                    <textarea
                      rows={3}
                      value={segmentsConfig.segment1.description || ''}
                      onChange={(e) =>
                        setSegmentsConfig({
                          ...segmentsConfig,
                          segment1: { ...segmentsConfig.segment1, description: e.target.value },
                        })
                      }
                      placeholder="Curadoria refinada de casas e mansões em condomínios fechados..."
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>

                  {/* Features / Destaques Checkmark List */}
                  <div>
                    <label className="block text-[11px] font-mono text-[#E5C378] mb-1.5 font-bold">
                      DESTAQUES & BENEFÍCIOS (ITENS COM CHECK)
                    </label>
                    <div className="space-y-2 mb-3">
                      {(segmentsConfig.segment1.features || []).map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#0B163B] border border-white/10 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span className="text-white">{feat}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeatureFromSegment('segment1', idx)}
                            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-white/5 cursor-pointer"
                            title="Remover este item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeature1}
                        onChange={(e) => setNewFeature1(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFeatureToSegment('segment1', newFeature1);
                          }
                        }}
                        placeholder="Ex: Penthouses com Piscina Aquecida Privativa..."
                        className="flex-1 bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddFeatureToSegment('segment1', newFeature1)}
                        className="px-4 py-2 bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/40 text-[#ECC97E] text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        + Adicionar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">
                        TEXTO DO BOTÃO (CTA)
                      </label>
                      <input
                        type="text"
                        value={segmentsConfig.segment1.ctaText || ''}
                        onChange={(e) =>
                          setSegmentsConfig({
                            ...segmentsConfig,
                            segment1: { ...segmentsConfig.segment1, ctaText: e.target.value },
                          })
                        }
                        placeholder="Explorar Imóveis Residenciais"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">
                        ETIQUETA INFERIOR (FOOTER LABEL)
                      </label>
                      <input
                        type="text"
                        value={segmentsConfig.segment1.footerLabel || ''}
                        onChange={(e) =>
                          setSegmentsConfig({
                            ...segmentsConfig,
                            segment1: { ...segmentsConfig.segment1, footerLabel: e.target.value },
                          })
                        }
                        placeholder="Venda & Locação"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Sub-Items / Galeria de Fotos e Ofertas do Segmento 01 */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-mono font-bold uppercase text-[#E5C378] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Itens, Ofertas & Fotos Adicionais ({(segmentsConfig.segment1.items || []).length})</span>
                        </h5>
                        <p className="text-[10px] text-slate-400">
                          Inclua cards com fotos próprias, títulos e descrições dentro do Segmento 01.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenNewSegmentItem('segment1')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/50 text-[#E5C378] text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>+ Incluir Item / Foto</span>
                      </button>
                    </div>

                    {/* Items Grid */}
                    {(segmentsConfig.segment1.items || []).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(segmentsConfig.segment1.items || []).map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl bg-[#0B163B] border border-white/10 flex items-start gap-2.5 relative group/sub"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-14 h-14 rounded-lg object-cover border border-[#D4AF37]/40 shrink-0 bg-[#050B1A]"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-mono text-[#E5C378] block truncate">
                                {item.badge || 'DESTAQUE'}
                              </span>
                              <h6 className="text-xs font-bold text-white truncate">
                                {item.title}
                              </h6>
                              {item.subtitle && (
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {item.subtitle}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditSegmentItem('segment1', item)}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                                title="Editar Item"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSegmentItem('segment1', item.id)}
                                className="p-1 rounded bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-white cursor-pointer"
                                title="Excluir Item"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic bg-[#050B1A] p-3 rounded-xl border border-dashed border-white/10 text-center">
                        Nenhum item adicional cadastrado neste segmento. Clique no botão acima para incluir fotos e dados adicionais.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SEGMENTO 02 (COMERCIAL) */}
            {activeSegmentTab === 'seg2' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Visual Preview & Photo Management (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Live Visual Preview Card */}
                  <div className="bg-[#070F26] p-5 rounded-3xl border border-[#D4AF37]/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#E5C378] font-bold flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Pré-Visualização em Tempo Real</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Efeito: {(segmentsConfig.segment2.techEffect || 'cyber-lidar').toUpperCase()}
                      </span>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-lg">
                      <TechImage
                        src={segmentsConfig.segment2.imageUrl}
                        alt={segmentsConfig.segment2.title}
                        aspectClass="aspect-[16/10]"
                        badge={segmentsConfig.segment2.imageBadge || 'COMERCIAL · CORPORATE TRIPLE A'}
                        techEffect={segmentsConfig.segment2.techEffect || 'cyber-lidar'}
                        allowEffectToggle={true}
                        showTechHud={true}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 italic text-center">
                      Hover sobre a imagem para ver o feixe laser 3D e retículas HUD em ação!
                    </p>
                  </div>

                  {/* Photo Upload & URL Configuration */}
                  <div className="bg-[#070F26] p-5 rounded-3xl border border-[#D4AF37]/30 space-y-4">
                    <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Trocar Foto do Segmento 02</span>
                    </h5>

                    {/* Direct Image URL */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">
                        URL DA IMAGEM (WEB / CDN / UNSPLASH)
                      </label>
                      <input
                        type="url"
                        value={segmentsConfig.segment2.imageUrl}
                        onChange={(e) =>
                          setSegmentsConfig({
                            ...segmentsConfig,
                            segment2: { ...segmentsConfig.segment2, imageUrl: e.target.value },
                          })
                        }
                        placeholder="https://..."
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>

                    {/* File Upload Button */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">
                        OU ENVIE UMA FOTO DO SEU APARELHO
                      </label>
                      <label className="flex items-center justify-center gap-2 w-full p-3 bg-[#0B163B] hover:bg-[#12235E] border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-xl text-xs font-mono text-[#E5C378] cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-[#D4AF37]" />
                        <span>
                          {isCompressingSegmentPhoto ? 'Comprimindo foto...' : 'Escolher Foto do Computador / Celular'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleSegmentPhotoUpload('segment2', e.target.files)}
                        />
                      </label>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Otimização automática com compressão de alta qualidade compatível com banco de dados.
                      </span>
                    </div>

                    {/* Curated Presets High-Tech Gallery */}
                    <div className="pt-2 border-t border-white/10">
                      <span className="block text-[10px] font-mono uppercase tracking-wider text-[#E5C378] font-bold mb-2">
                        Galeria de Presets Tecnológicos 4K
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {CURATED_TECH_PHOTOS.filter((p) => p.category === 'comercial').map((photo, i) => (
                          <div
                            key={i}
                            onClick={() => handleSelectCuratedPhoto('segment2', photo.url)}
                            className={`p-2 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border transition-all cursor-pointer group ${
                              segmentsConfig.segment2.imageUrl === photo.url
                                ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]'
                                : 'border-white/10 hover:border-[#D4AF37]/60'
                            }`}
                          >
                            <img
                              src={photo.url}
                              alt={photo.name}
                              className="w-full h-14 object-cover rounded-lg mb-1"
                            />
                            <span className="text-[10px] font-bold text-white block truncate group-hover:text-[#E5C378]">
                              {photo.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Badge da Foto */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">
                        BADGE TECNOLÓGICO SOBRE A FOTO
                      </label>
                      <input
                        type="text"
                        value={segmentsConfig.segment2.imageBadge || ''}
                        onChange={(e) =>
                          setSegmentsConfig({
                            ...segmentsConfig,
                            segment2: { ...segmentsConfig.segment2, imageBadge: e.target.value },
                          })
                        }
                        placeholder="Ex: COMERCIAL · CORPORATE TRIPLE A"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white font-mono rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    {/* Efeito Visual Tecnológico */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1.5">
                        EFEITO VISUAL TECNOLÓGICO DA FOTO
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'cyber-lidar', name: 'Cyber-LIDAR', desc: 'Neon Cyan & Matriz 3D' },
                          { id: 'holo-gold', name: 'Holo-Gold', desc: 'Varredura Ouro & Luxo' },
                          { id: 'blueprint', name: 'Blueprint 3D', desc: 'Grid Engenharia BIM' },
                          { id: 'matrix', name: 'Neo-Matrix', desc: 'Fósforo Digital Verde' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() =>
                              setSegmentsConfig({
                                ...segmentsConfig,
                                segment2: {
                                  ...segmentsConfig.segment2,
                                  techEffect: m.id as TechEffectType,
                                },
                              })
                            }
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                              segmentsConfig.segment2.techEffect === m.id
                                ? 'bg-[#0B163B] border-[#D4AF37] ring-1 ring-[#D4AF37]'
                                : 'bg-[#050B1A] border-white/10 hover:border-white/30'
                            }`}
                          >
                            <span className="text-[11px] font-bold text-white block">{m.name}</span>
                            <span className="text-[9px] text-slate-400 block">{m.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Titles, Descriptions, Features and Links (7 cols) */}
                <div className="lg:col-span-7 bg-[#070F26] p-6 rounded-3xl border border-[#D4AF37]/35 space-y-4 shadow-xl">
                  <h4 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
                    <Edit className="w-4 h-4 text-[#D4AF37]" />
                    <span>Conteúdo & Textos do Segmento 02 (Comercial)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">
                        TAG DO SEGMENTO
                      </label>
                      <input
                        type="text"
                        value={segmentsConfig.segment2.segmentTag || ''}
                        onChange={(e) =>
                          setSegmentsConfig({
                            ...segmentsConfig,
                            segment2: { ...segmentsConfig.segment2, segmentTag: e.target.value },
                          })
                        }
                        placeholder="SEGMENTO 02"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-[#E5C378] font-mono rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">
                        BADGE DE CATEGORIA
                      </label>
                      <input
                        type="text"
                        value={segmentsConfig.segment2.badge || ''}
                        onChange={(e) =>
                          setSegmentsConfig({
                            ...segmentsConfig,
                            segment2: { ...segmentsConfig.segment2, badge: e.target.value },
                          })
                        }
                        placeholder="CORPORATIVO"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white font-mono rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      TÍTULO DO SEGMENTO *
                    </label>
                    <input
                      type="text"
                      value={segmentsConfig.segment2.title || ''}
                      onChange={(e) =>
                        setSegmentsConfig({
                          ...segmentsConfig,
                          segment2: { ...segmentsConfig.segment2, title: e.target.value },
                        })
                      }
                      placeholder="Imóveis Comerciais"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white font-bold rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      DESCRIÇÃO COMPLETA
                    </label>
                    <textarea
                      rows={3}
                      value={segmentsConfig.segment2.description || ''}
                      onChange={(e) =>
                        setSegmentsConfig({
                          ...segmentsConfig,
                          segment2: { ...segmentsConfig.segment2, description: e.target.value },
                        })
                      }
                      placeholder="Soluções estratégicas para empresas, consultorias e investidores..."
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>

                  {/* Features / Destaques Checkmark List */}
                  <div>
                    <label className="block text-[11px] font-mono text-[#E5C378] mb-1.5 font-bold">
                      DESTAQUES & BENEFÍCIOS (ITENS COM CHECK)
                    </label>
                    <div className="space-y-2 mb-3">
                      {(segmentsConfig.segment2.features || []).map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#0B163B] border border-white/10 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span className="text-white">{feat}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeatureFromSegment('segment2', idx)}
                            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-white/5 cursor-pointer"
                            title="Remover este item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeature2}
                        onChange={(e) => setNewFeature2(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFeatureToSegment('segment2', newFeature2);
                          }
                        }}
                        placeholder="Ex: Prédios Comerciais com Certificação LEED..."
                        className="flex-1 bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddFeatureToSegment('segment2', newFeature2)}
                        className="px-4 py-2 bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/40 text-[#ECC97E] text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        + Adicionar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">
                        TEXTO DO BOTÃO (CTA)
                      </label>
                      <input
                        type="text"
                        value={segmentsConfig.segment2.ctaText || ''}
                        onChange={(e) =>
                          setSegmentsConfig({
                            ...segmentsConfig,
                            segment2: { ...segmentsConfig.segment2, ctaText: e.target.value },
                          })
                        }
                        placeholder="Explorar Imóveis Comerciais"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">
                        ETIQUETA INFERIOR (FOOTER LABEL)
                      </label>
                      <input
                        type="text"
                        value={segmentsConfig.segment2.footerLabel || ''}
                        onChange={(e) =>
                          setSegmentsConfig({
                            ...segmentsConfig,
                            segment2: { ...segmentsConfig.segment2, footerLabel: e.target.value },
                          })
                        }
                        placeholder="Venda & Locação"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Sub-Items / Galeria de Fotos e Ofertas do Segmento 02 */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-mono font-bold uppercase text-[#E5C378] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Itens, Ofertas & Fotos Adicionais ({(segmentsConfig.segment2.items || []).length})</span>
                        </h5>
                        <p className="text-[10px] text-slate-400">
                          Inclua cards com fotos próprias, títulos e descrições dentro do Segmento 02.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenNewSegmentItem('segment2')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/50 text-[#E5C378] text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>+ Incluir Item / Foto</span>
                      </button>
                    </div>

                    {/* Items Grid */}
                    {(segmentsConfig.segment2.items || []).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(segmentsConfig.segment2.items || []).map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl bg-[#0B163B] border border-white/10 flex items-start gap-2.5 relative group/sub"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-14 h-14 rounded-lg object-cover border border-[#D4AF37]/40 shrink-0 bg-[#050B1A]"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-mono text-[#E5C378] block truncate">
                                {item.badge || 'CORPORATIVO'}
                              </span>
                              <h6 className="text-xs font-bold text-white truncate">
                                {item.title}
                              </h6>
                              {item.subtitle && (
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {item.subtitle}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditSegmentItem('segment2', item)}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                                title="Editar Item"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSegmentItem('segment2', item.id)}
                                className="p-1 rounded bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-white cursor-pointer"
                                title="Excluir Item"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic bg-[#050B1A] p-3 rounded-xl border border-dashed border-white/10 text-center">
                        Nenhum item adicional cadastrado neste segmento. Clique no botão acima para incluir fotos e dados adicionais.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SEGMENTOS ADICIONAIS / CUSTOMIZADOS */}
            {activeSegmentTab === 'custom' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-3 p-5 rounded-3xl bg-[#070F26] border border-[#D4AF37]/35 shadow-xl">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#D4AF37]" />
                      <span>Segmentos Personalizados Criados pelo Administrador</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Crie novos segmentos (ex: Segmento 03 - Áreas Rurais & Fazendas, Segmento 04 - Ativos Internacionais) com fotos tecnológicas, tags, títulos e sub-itens completos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenNewCustomSegment}
                    className="tech-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#050B1A] shadow-md cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-[#050B1A]" />
                    <span>+ Criar Novo Segmento</span>
                  </button>
                </div>

                {(segmentsConfig.customSegments || []).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(segmentsConfig.customSegments || []).map((cSeg) => (
                      <div
                        key={cSeg.id}
                        className="rounded-3xl bg-[#070F26] border border-[#D4AF37]/30 hover:border-[#D4AF37]/70 p-5 space-y-4 shadow-xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-mono font-bold text-[#E5C378] bg-[#0B163B] px-2.5 py-0.5 rounded border border-[#D4AF37]/30">
                              {cSeg.segmentTag}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-[#050B1A] px-2 py-0.5 rounded">
                              {cSeg.category === 'residencial' ? 'Residencial' : 'Comercial'}
                            </span>
                          </div>

                          <div className="aspect-[16/10] rounded-xl overflow-hidden mb-3 border border-[#D4AF37]/30">
                            <TechImage
                              src={cSeg.imageUrl}
                              alt={cSeg.title}
                              aspectClass="aspect-[16/10]"
                              badge={cSeg.badge}
                              techEffect={cSeg.techEffect || 'holo-gold'}
                              allowEffectToggle={false}
                              showTechHud={false}
                            />
                          </div>

                          <h4 className="text-base font-bold text-white">
                            {cSeg.title}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                            {cSeg.description}
                          </p>

                          {/* Sub items info */}
                          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                            <span className="font-mono">
                              Itens / Fotos anexadas: <strong className="text-white">{(cSeg.items || []).length}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenNewSegmentItem(cSeg.id)}
                              className="text-[#D4AF37] hover:underline font-semibold cursor-pointer text-xs"
                            >
                              + Incluir Foto/Item
                            </button>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCustomSegment(cSeg)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/40 text-[#E5C378] text-xs font-mono font-semibold transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Editar Segmento</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCustomSegment(cSeg.id, cSeg.title)}
                            className="p-1.5 rounded-xl bg-red-950/50 hover:bg-red-900 border border-red-500/40 text-red-300 transition-all cursor-pointer"
                            title="Excluir Segmento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-[#070F26] rounded-3xl border border-white/10 p-8 space-y-3">
                    <Layers className="w-10 h-10 text-slate-500 mx-auto" />
                    <h5 className="text-sm font-bold text-white">Nenhum segmento personalizado criado ainda</h5>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Os Segmentos 01 e 02 estão ativos na página inicial. Se você desejar criar um Segmento 03 ou novo pilar de atuação, clique abaixo.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenNewCustomSegment}
                      className="tech-btn-primary inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-[#050B1A] cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-[#050B1A]" />
                      <span>Criar Primeiro Segmento Personalizado</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SECURITY & CREDENTIAL MANAGEMENT */}
        {activeTab === 'security' && (
          <div className="py-6 flex-1 max-w-4xl mx-auto w-full space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#E5C378]">
                DIRETRIZES DE SEGURANÇA · BRATU ADMIN
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                Segurança Criptográfica & Gestão de Credenciais
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Esta aplicação segue as melhores práticas de cibersegurança: zero senhas em texto puro, autenticação com hash salted SHA-256, blindagem de banco de dados e proteção rigorosa de dados pessoais.
              </p>
            </div>

            {/* Security Pillars Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#070F26] p-4 rounded-2xl border border-[#D4AF37]/30 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Lock className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-white font-mono uppercase">Hash Criptográfico SHA-256</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  A senha do administrador não fica salva em texto puro nem visível no código-fonte. O sistema calcula a validação em tempo real com salt criptográfico.
                </p>
              </div>

              <div className="bg-[#070F26] p-4 rounded-2xl border border-[#D4AF37]/30 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-white font-mono uppercase">Proteção Anti-Força Bruta</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Limite rígido de 5 tentativas de login consecutivas. Em caso de repetição de erros, o sistema aciona bloqueio temporário automático.
                </p>
              </div>

              <div className="bg-[#070F26] p-4 rounded-2xl border border-[#D4AF37]/30 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-white font-mono uppercase">Blindagem de Documentos</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  CPF, RG, RUC, contas bancárias e PIX de proprietários são exibidos exclusivamente sob autenticação de administrador com sessão efêmera.
                </p>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-[#070F26] rounded-3xl border border-[#D4AF37]/35 p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#D4AF37]/25">
                <KeyRound className="w-5 h-5 text-[#D4AF37]" />
                <h4 className="text-base font-bold text-white">
                  Alterar Senha de Administrador
                </h4>
              </div>

              {pwdFeedback.type !== 'idle' && (
                <div
                  className={`mb-5 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                    pwdFeedback.type === 'success'
                      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                      : 'bg-red-950/70 border-red-500/50 text-red-200'
                  }`}
                >
                  {pwdFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  )}
                  <span>{pwdFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    SENHA ATUAL *
                  </label>
                  <input
                    type="password"
                    required
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    placeholder="Digite a senha atual..."
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    NOVA SENHA (MÍNIMO 8 CARACTERES) *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha segura..."
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    CONFIRMAR NOVA SENHA *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha..."
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPwd}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] text-[#050B1A] text-xs font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-[#050B1A]" />
                    <span>{isUpdatingPwd ? 'Criptografando e Atualizando...' : 'Salvar Nova Senha'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB: GOOGLE REVIEWS & DIRECT CLIENT DISPATCH */}
        {activeTab === 'googleReviews' && (
          <div className="py-6 flex-1 max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
            {/* Header with Title and Live Google Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#D4AF37]/25">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-[#D4AF37] mb-1 px-3 py-0.5 rounded-full bg-[#070F26] border border-[#D4AF37]/35">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>GOOGLE MEU NEGÓCIO · REPUTAÇÃO E AVALIAÇÕES</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  Disparo de Avaliações no Google para Clientes
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Envie solicitações personalizadas via WhatsApp para que compradores, proprietários, inquilinos e condôminos avaliem a <strong>Bratu Imobiliária & Administradora LTDA</strong> direto no Google. Configure também o link oficial e baixe o QR Code de balcão.
                </p>
              </div>

              {/* Google Verified Score Badge */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#070F26] border border-[#D4AF37]/40 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 p-2 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-white font-bold text-xs">{googleConfig.averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {googleConfig.totalReviewsCount}+ avaliações registradas
                  </span>
                </div>
              </div>
            </div>

            {/* Notification Banner */}
            {googleConfigFeedback && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
                  googleConfigFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : 'bg-red-950/80 border-red-500/50 text-red-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {googleConfigFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span className="font-medium">{googleConfigFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGoogleConfigFeedback(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Main Content Layout: Left = WhatsApp Dispatcher, Right = QR Code & Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: DISPATCHER (SPAN 7) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#070F26] rounded-3xl border border-[#D4AF37]/35 p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Disparador Direto para o Cliente via WhatsApp
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Preencha os dados e dispare a mensagem formatada em 1 clique
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Client Info Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                        NOME DO CLIENTE
                      </label>
                      <input
                        type="text"
                        value={clientDispatchName}
                        onChange={(e) => setClientDispatchName(e.target.value)}
                        placeholder="Ex: Dr. Carlos Eduardo ou Mariana"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                        WHATSAPP / TELEFONE DO CLIENTE
                      </label>
                      <input
                        type="text"
                        value={clientDispatchPhone}
                        onChange={(e) => setClientDispatchPhone(e.target.value)}
                        placeholder="Ex: (41) 99123-4567 ou 5541991234567"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                      />
                    </div>
                  </div>

                  {/* Template Selector Pills */}
                  <div>
                    <label className="block text-[11px] font-mono text-[#E5C378] mb-2 font-bold">
                      SELECIONE O MOMENTO / MODELO DE MENSAGEM:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(googleConfig.templates || INITIAL_GOOGLE_REVIEW_TEMPLATES).map((tmpl) => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(tmpl.id)}
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                            selectedTemplateId === tmpl.id
                              ? 'bg-gradient-to-r from-[#0B163B] to-[#12235E] border-[#D4AF37] text-white shadow-md'
                              : 'bg-[#050B1A] border-white/10 hover:border-white/20 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold truncate">{tmpl.title}</span>
                            {selectedTemplateId === tmpl.id && (
                              <Check className="w-3.5 h-3.5 text-[#ECC97E] shrink-0 ml-1" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {tmpl.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Preview (Editable Textarea) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-mono text-slate-300 font-semibold">
                        MENSAGEM QUE SERÁ ENVIADA (EDITÁVEL):
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {customDispatchMessage.length} caracteres
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={customDispatchMessage}
                      onChange={(e) => setCustomDispatchMessage(e.target.value)}
                      className="w-full bg-[#050B1A] border border-white/15 text-slate-200 rounded-xl p-3 text-xs font-sans leading-relaxed focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>

                  {/* Dispatch Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSendWhatsAppReview}
                      className="flex-1 min-w-[200px] py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Disparar via WhatsApp para o Cliente</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyReviewMessage}
                      className="px-4 py-3 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-white/15 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isCopiedMsg ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-300" />
                          <span>Copiar Mensagem</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyReviewLink}
                      className="px-4 py-3 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-white/15 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isCopiedLink ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Link Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-300" />
                          <span>Copiar Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Strategy & Best Practices for 5-Star Reviews */}
                <div className="bg-[#070F26] rounded-3xl border border-white/10 p-5 space-y-3">
                  <h5 className="text-xs font-mono font-bold uppercase text-[#E5C378] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Dicas para Conquistar 100% de Avaliações 5 Estrelas no Google</span>
                  </h5>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-300">
                    <li className="p-3 rounded-xl bg-[#0B163B]/60 border border-white/5 space-y-1">
                      <strong className="text-white block font-sans">1. Momento de Êxtase</strong>
                      <span>Envie o link minutos após a entrega de chaves, assinatura de escritura ou fechamento da locação.</span>
                    </li>
                    <li className="p-3 rounded-xl bg-[#0B163B]/60 border border-white/5 space-y-1">
                      <strong className="text-white block font-sans">2. Facilidade no Link</strong>
                      <span>O link direto leva o cliente diretamente à tela de dar as 5 estrelas sem precisar pesquisar no Google.</span>
                    </li>
                    <li className="p-3 rounded-xl bg-[#0B163B]/60 border border-white/5 space-y-1">
                      <strong className="text-white block font-sans">3. Responda em 24h</strong>
                      <span>Sempre responda publicamente a cada review no Google agradecendo o nome do cliente e a parceria.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* RIGHT COLUMN: QR CODE & SETTINGS (SPAN 5) */}
              <div className="lg:col-span-5 space-y-6">
                {/* QR Code Card */}
                <div className="bg-[#070F26] rounded-3xl border border-[#D4AF37]/35 p-6 shadow-xl text-center space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 text-left">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        QR Code Oficial de Avaliação
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-[#E5C378] bg-[#0B163B] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                      Alta Definição
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 text-left leading-relaxed">
                    Exiba este QR Code no balcão da imobiliária, pastas de entrega de chaves, envelopes contratuais ou cartões de visita.
                  </p>

                  <div className="inline-block p-4 bg-white rounded-2xl border-4 border-[#D4AF37]/50 shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                    {adminQrCodeDataUrl ? (
                      <img
                        src={adminQrCodeDataUrl}
                        alt="QR Code Google Review Bratu"
                        className="w-48 h-48 mx-auto object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-slate-800 text-xs font-mono">
                        Gerando QR Code...
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    {adminQrCodeDataUrl && (
                      <a
                        href={adminQrCodeDataUrl}
                        download="Bratu-Imobiliaria-Google-Avaliacao-QRCode.png"
                        className="tech-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Upload className="w-3.5 h-3.5 rotate-180 text-[#050B1A]" />
                        <span>Baixar QR Code (PNG)</span>
                      </a>
                    )}

                    <a
                      href={googleConfig.reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-white/15 text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#ECC97E]" />
                      <span>Testar Link</span>
                    </a>
                  </div>
                </div>

                {/* Google Configuration Settings Form */}
                <div className="bg-[#070F26] rounded-3xl border border-[#D4AF37]/35 p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        Configurações do Link Google
                      </h4>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      LINK DE AVALIAÇÃO DO GOOGLE (URL) *
                    </label>
                    <input
                      type="text"
                      value={googleConfig.reviewUrl}
                      onChange={(e) => setGoogleConfig({ ...googleConfig, reviewUrl: e.target.value })}
                      placeholder="https://search.google.com/local/writereview?placeid=... ou https://g.page/r/..."
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs font-mono select-all"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Cole aqui a URL de avaliação do Google Meu Negócio / Maps da Bratu.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      NOME COMERCIAL REGISTRADO NO GOOGLE
                    </label>
                    <input
                      type="text"
                      value={googleConfig.businessName}
                      onChange={(e) => setGoogleConfig({ ...googleConfig, businessName: e.target.value })}
                      placeholder="Bratu Imobiliária & Administradora LTDA"
                      className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">
                        NOTA MÉDIA (ESTRELAS)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={googleConfig.averageRating}
                        onChange={(e) => setGoogleConfig({ ...googleConfig, averageRating: Number(e.target.value) })}
                        className="w-full bg-[#0B163B] border border-white/15 text-[#ECC97E] font-bold rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">
                        TOTAL DE AVALIAÇÕES
                      </label>
                      <input
                        type="number"
                        value={googleConfig.totalReviewsCount}
                        onChange={(e) => setGoogleConfig({ ...googleConfig, totalReviewsCount: Number(e.target.value) })}
                        className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveGoogleReviewConfig}
                      disabled={isSavingGoogleConfig}
                      className="w-full tech-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold text-[#050B1A] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-[#050B1A]" />
                      <span>{isSavingGoogleConfig ? 'Salvando no Firestore...' : 'Salvar Configurações no Banco de Dados'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* MODAL DE EDIÇÃO COMPLETA DE QUALQUER IMÓVEL REGISTRADO */}
        {editingProperty && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#050B1A]/90 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setEditingProperty(null)}
          >
            <div
              className="relative w-full max-w-4xl max-h-[92vh] bg-[#070F26] text-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col border border-[#D4AF37]/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#D4AF37]/30 bg-[#050B1A]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-white">
                        Editar Imóvel · {editingProperty.code}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B163B] text-[#E5C378] border border-[#D4AF37]/30">
                        {editingProperty.purpose}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Edite todos os dados do anúncio, valores, fotos, vídeos, destaques e dados sigilosos do proprietário.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="w-8 h-8 rounded-full bg-[#070F26] hover:bg-[#0B163B] border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>

              {/* Sub-Tabs Navigation */}
              <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 bg-[#081233] border-b border-white/10 overflow-x-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setEditActiveTab('info')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    editActiveTab === 'info'
                      ? 'bg-[#D4AF37] text-[#050B1A] font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>1. Dados & Local</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditActiveTab('valores')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    editActiveTab === 'valores'
                      ? 'bg-[#D4AF37] text-[#050B1A] font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>2. Valores & Condomínio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditActiveTab('specs')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    editActiveTab === 'specs'
                      ? 'bg-[#D4AF37] text-[#050B1A] font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>3. M² & Cômodos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditActiveTab('midia')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    editActiveTab === 'midia'
                      ? 'bg-[#D4AF37] text-[#050B1A] font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>4. Vídeo, Fotos & Destaques</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditActiveTab('proprietario')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    editActiveTab === 'proprietario'
                      ? 'bg-amber-400 text-[#050B1A] font-bold shadow-sm'
                      : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-400/10 border border-amber-400/20'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>5. Dados Sigilosos</span>
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveEditProperty} className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
                {editSuccessMessage && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{editSuccessMessage}</span>
                  </div>
                )}

                {editErrorMessage && (
                  <div className="p-3.5 rounded-2xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs font-mono flex items-center justify-between gap-2.5 shadow-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <span>{editErrorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditErrorMessage(null)}
                      className="text-red-300 hover:text-white p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {isCompressingPhotos && (
                  <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-200 text-xs flex items-center gap-2.5 animate-pulse">
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                    <span>Otimizando fotos...</span>
                  </div>
                )}

                {/* TAB 1: DADOS BÁSICOS & LOCALIZAÇÃO */}
                {editActiveTab === 'info' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">CÓDIGO REF *</label>
                        <input
                          type="text"
                          required
                          value={editingProperty.code}
                          onChange={(e) => setEditingProperty({ ...editingProperty, code: e.target.value })}
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">FINALIDADE *</label>
                        <select
                          value={editingProperty.purpose}
                          onChange={(e) => setEditingProperty({ ...editingProperty, purpose: e.target.value as PropertyPurpose })}
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                        >
                          <option value="Venda">Venda</option>
                          <option value="Locação">Locação</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">TIPO DE IMÓVEL *</label>
                        <select
                          value={editingProperty.type}
                          onChange={(e) => setEditingProperty({ ...editingProperty, type: e.target.value as PropertyType })}
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                        >
                          <option value="Apartamento">Apartamento</option>
                          <option value="Casa">Casa</option>
                          <option value="Cobertura">Cobertura</option>
                          <option value="Comercial">Comercial</option>
                          <option value="Terreno">Terreno</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">TÍTULO DO ANÚNCIO *</label>
                        <input
                          type="text"
                          required
                          value={editingProperty.title}
                          onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">SUBTÍTULO</label>
                        <input
                          type="text"
                          value={editingProperty.subtitle || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, subtitle: e.target.value })}
                          placeholder="Ex: Mansão suspensa com vista panorâmica"
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    {/* Categorias */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1.5">CATEGORIAS DE PESQUISA</label>
                      <div className="flex flex-wrap gap-2">
                        {(['residencial', 'comercial', 'lancamento', 'alto-padrao'] as const).map((cat) => {
                          const isChecked = editingProperty.category?.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                const current = editingProperty.category || [];
                                const next = isChecked ? current.filter((c) => c !== cat) : [...current, cat];
                                setEditingProperty({ ...editingProperty, category: next });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                                isChecked
                                  ? 'bg-[#0B163B] text-[#E5C378] border border-[#D4AF37]/50 font-bold'
                                  : 'bg-[#050B1A] text-slate-400 border border-white/10 hover:text-white'
                              }`}
                            >
                              {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Square className="w-3.5 h-3.5" />}
                              <span className="capitalize">{cat.replace('-', ' ')}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Localização */}
                    <div className="p-4 rounded-2xl bg-[#0B163B]/60 border border-[#D4AF37]/25 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#E5C378]">
                        <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>LOCALIZAÇÃO COMPLETA</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">PAÍS *</label>
                          <select
                            value={editingProperty.country}
                            onChange={(e) => setEditingProperty({ ...editingProperty, country: e.target.value as Country })}
                            className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                          >
                            <option value="Brasil">Brasil</option>
                            <option value="Paraguai">Paraguai</option>
                            <option value="Estados Unidos">Estados Unidos</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">CIDADE *</label>
                          <input
                            type="text"
                            required
                            value={editingProperty.city}
                            onChange={(e) => setEditingProperty({ ...editingProperty, city: e.target.value })}
                            className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">BAIRRO *</label>
                          <input
                            type="text"
                            required
                            value={editingProperty.neighborhood}
                            onChange={(e) => setEditingProperty({ ...editingProperty, neighborhood: e.target.value })}
                            className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">ENDEREÇO / LOGRADOURO</label>
                          <input
                            type="text"
                            value={editingProperty.address || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, address: e.target.value })}
                            placeholder="Ex: Av. Batel, 1550"
                            className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">CEP</label>
                          <input
                            type="text"
                            value={editingProperty.zipCode || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, zipCode: e.target.value })}
                            placeholder="Ex: 80420-090"
                            className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">DESCRIÇÃO DO ANÚNCIO (INDEXADA NO GOOGLE & IA)</label>
                      <textarea
                        rows={5}
                        value={editingProperty.description}
                        onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                        className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: VALORES & CONDOMÍNIO */}
                {editActiveTab === 'valores' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-[#E5C378] mb-1">PREÇO PRINCIPAL EXIBIDO *</label>
                        <input
                          type="text"
                          required
                          value={editingProperty.priceFormatted}
                          onChange={(e) => setEditingProperty({ ...editingProperty, priceFormatted: e.target.value })}
                          placeholder="Ex: R$ 3.850.000 ou US$ 680.000"
                          className="w-full bg-[#0B163B] border border-[#D4AF37]/40 text-white rounded-xl px-3 py-2 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">VALOR DE VENDA</label>
                        <input
                          type="text"
                          value={editingProperty.salePrice || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, salePrice: e.target.value })}
                          placeholder="Ex: R$ 3.850.000"
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">VALOR DE LOCAÇÃO</label>
                        <input
                          type="text"
                          value={editingProperty.rentPrice || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, rentPrice: e.target.value })}
                          placeholder="Ex: R$ 12.000 / mês"
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">IPTU</label>
                        <input
                          type="text"
                          value={editingProperty.iptu || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, iptu: e.target.value })}
                          placeholder="Ex: R$ 5.200 / ano ou R$ 450/mês"
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-mono text-slate-300 flex items-center gap-1 font-bold">
                            <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>CONDOMÍNIO / EDIFÍCIO</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsCustomCondoEdit(!isCustomCondoEdit)}
                            className="text-[10px] font-mono text-[#ECC97E] hover:underline cursor-pointer"
                          >
                            {isCustomCondoEdit ? '« Escolher da Lista' : '+ Digitar outro'}
                          </button>
                        </div>

                        {!isCustomCondoEdit ? (
                          <select
                            value={
                              condos.some((c) => c.name === editingProperty.condoName)
                                ? condos.find((c) => c.name === editingProperty.condoName)?.id
                                : ''
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'custom') {
                                setIsCustomCondoEdit(true);
                                return;
                              }
                              const selected = condos.find((c) => c.id === val);
                              if (selected && editingProperty) {
                                setEditingProperty({
                                  ...editingProperty,
                                  condoName: selected.name,
                                  condoFee: selected.condoFee || editingProperty.condoFee,
                                });
                              }
                            }}
                            className="w-full bg-[#050B1A] border border-[#D4AF37]/50 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                          >
                            <option value="">-- Selecione o Condomínio Cadastrado --</option>
                            {condos.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} · {c.neighborhood}, {c.city} ({c.condoFee || 'Sob consulta'})
                              </option>
                            ))}
                            <option value="custom">&#x270E; Digitar outro condomínio manualmente...</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={editingProperty.condoName || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, condoName: e.target.value })}
                            placeholder="Ex: Edifício Torre de Batel"
                            className="w-full bg-[#050B1A] border border-[#D4AF37]/50 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                            autoFocus
                          />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-mono text-slate-300">TAXA DO CONDOMÍNIO</label>
                          {condos.some((c) => c.name === editingProperty.condoName) && (
                            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                              ✓ Vinculado
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={editingProperty.condoFee || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, condoFee: e.target.value })}
                          placeholder="Ex: R$ 1.850 / mês"
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">NOTA DE PREÇO / CONDIÇÕES DE PAGAMENTO</label>
                      <input
                        type="text"
                        value={editingProperty.priceNote || ''}
                        onChange={(e) => setEditingProperty({ ...editingProperty, priceNote: e.target.value })}
                        placeholder="Ex: Estuda permuta por imóvel de menor valor em Curitiba ou parcelamento direto"
                        className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: METRAGEM & CÔMODOS */}
                {editActiveTab === 'specs' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">METRAGEM (M²)</label>
                        <input
                          type="number"
                          value={editingProperty.areaM2}
                          onChange={(e) => setEditingProperty({ ...editingProperty, areaM2: Number(e.target.value) })}
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">DORMITÓRIOS</label>
                        <input
                          type="number"
                          value={editingProperty.bedrooms}
                          onChange={(e) => setEditingProperty({ ...editingProperty, bedrooms: Number(e.target.value) })}
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">SUÍTES</label>
                        <input
                          type="number"
                          value={editingProperty.suites}
                          onChange={(e) => setEditingProperty({ ...editingProperty, suites: Number(e.target.value) })}
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">BANHEIROS</label>
                        <input
                          type="number"
                          value={editingProperty.bathrooms}
                          onChange={(e) => setEditingProperty({ ...editingProperty, bathrooms: Number(e.target.value) })}
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">VAGAS GARAGEM</label>
                        <input
                          type="number"
                          value={editingProperty.parkingSpots}
                          onChange={(e) => setEditingProperty({ ...editingProperty, parkingSpots: Number(e.target.value) })}
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Destaques */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">
                        DESTAQUES & ACABAMENTOS (separados por vírgula)
                      </label>
                      <input
                        type="text"
                        value={(editingProperty.highlights || []).join(', ')}
                        onChange={(e) => {
                          const items = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          setEditingProperty({ ...editingProperty, highlights: items });
                        }}
                        placeholder="Ex: Piso aquecido, Varanda gourmet, Elevador privativo"
                        className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    {/* Comodidades */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">
                        INFRAESTRUTURA & COMODIDADES (separadas por vírgula)
                      </label>
                      <input
                        type="text"
                        value={(editingProperty.amenities || []).join(', ')}
                        onChange={(e) => {
                          const items = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          setEditingProperty({ ...editingProperty, amenities: items });
                        }}
                        placeholder="Ex: Portaria 24h, Piscina aquecida, Academia, Gerador"
                        className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: MÍDIAS, DESTAQUES & GALERIA DE FOTOS */}
                {editActiveTab === 'midia' && (
                  <div className="space-y-5">
                    {/* Destaques Toggles */}
                    <div className="p-4 rounded-2xl bg-[#0B163B]/70 border border-[#D4AF37]/35 space-y-3">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E5C378] block">
                        Destaques e Visibilidade Especial
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#050B1A] border border-[#D4AF37]/30 cursor-pointer hover:border-[#D4AF37]">
                          <input
                            type="checkbox"
                            checked={editingProperty.featured || false}
                            onChange={(e) => setEditingProperty({ ...editingProperty, featured: e.target.checked })}
                            className="mt-0.5 rounded text-[#D4AF37] focus:ring-[#D4AF37] bg-[#070F26] border-white/20 w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-white flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                              <span>Imóvel em Destaque Geral</span>
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Exibe o selo dourado "EM DESTAQUE" no topo do catálogo e nos resultados prioritários.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#050B1A] border border-[#D4AF37]/30 cursor-pointer hover:border-[#D4AF37]">
                          <input
                            type="checkbox"
                            checked={editingProperty.featuredInQuickSuggestions || false}
                            onChange={(e) => setEditingProperty({ ...editingProperty, featuredInQuickSuggestions: e.target.checked })}
                            className="mt-0.5 rounded text-[#D4AF37] focus:ring-[#D4AF37] bg-[#070F26] border-white/20 w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-white flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span>Em Destaque nas Sugestões Rápidas</span>
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Aparece como atalho clicável diretamente no filtro de sugestões rápidas.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Vídeo do YouTube */}
                    <div className="p-4 rounded-2xl bg-[#0B163B]/70 border border-[#D4AF37]/30 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-red-600/30 text-red-500 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 fill-red-500" />
                        </div>
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                          Vídeo Tour no YouTube
                        </span>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={editingProperty.youtubeUrl || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, youtubeUrl: e.target.value })}
                          placeholder="Ex: https://www.youtube.com/watch?v=sU149-6T2fQ ou https://youtu.be/..."
                          className="w-full bg-[#050B1A] border border-[#D4AF37]/35 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Ao salvar com a URL, o anúncio ganha a aba "Vídeo Tour" e o selo vermelho de tour virtual.
                        </span>
                      </div>

                      {editingProperty.youtubeUrl && isValidYouTubeUrl(editingProperty.youtubeUrl) && (
                        <div className="pt-2">
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mb-1.5">
                            <CheckCircle className="w-3 h-3" /> Vídeo verificado com sucesso:
                          </span>
                          <div className="relative aspect-[16/9] max-w-sm rounded-xl overflow-hidden border border-[#D4AF37]/40 shadow-lg bg-black">
                            <iframe
                              src={getYouTubeEmbedUrl(editingProperty.youtubeUrl) || ''}
                              title="Preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tour Virtual 360° (Upload de Foto Panorâmica ou Link Externo) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0B163B]/80 border border-cyan-500/40 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-300 border border-cyan-400/40 flex items-center justify-center">
                            <Compass className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '10s' }} />
                          </div>
                          <div>
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300 block">
                              Tour Virtual 360° Imersivo (Foto Panorâmica ou Link Externo)
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Faça upload do arquivo da foto 360° do imóvel ou cole a URL de uma plataforma 3D.
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                          {editingProperty.virtualTour360Image ? 'Foto 360° Carregada' : editingProperty.virtualTour360Url ? detect360Provider(editingProperty.virtualTour360Url) : 'Opcional'}
                        </span>
                      </div>

                      {/* OPÇÃO 1: Upload direto de Arquivo de Foto Panorâmica 360° */}
                      <div className="p-3.5 rounded-xl bg-[#070F26] border border-cyan-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono font-bold text-cyan-200 flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-cyan-400" />
                            <span>OPÇÃO 1: ENVIAR ARQUIVO DE IMAGEM 360° DO SEU DISPOSITIVO</span>
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">JPG, PNG, WEBP equirretangular</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => editTour360FileInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center gap-2"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{editingProperty.virtualTour360Image ? 'Trocar Foto Panorâmica 360°' : 'Selecionar Arquivo de Imagem 360°'}</span>
                          </button>

                          <input
                            ref={editTour360FileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleEditTour360Upload(e.target.files)}
                          />

                          {editingProperty.virtualTour360Image && (
                            <button
                              type="button"
                              onClick={() => setEditingProperty((prev) => (prev ? { ...prev, virtualTour360Image: '' } : null))}
                              className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remover Foto 360°</span>
                            </button>
                          )}
                        </div>

                        {/* Interactive Three.js Preview of Uploaded 360 Panorama */}
                        {editingProperty.virtualTour360Image && (
                          <div className="pt-2">
                            <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1 mb-1.5">
                              <CheckCircle className="w-3 h-3 text-cyan-400" /> Pré-visualização Interativa Three.js 360° (Arraste para testar a visão):
                            </span>
                            <div className="relative aspect-[16/9] max-w-md rounded-xl overflow-hidden border border-cyan-400/50 shadow-xl bg-black">
                              <Panorama360Viewer
                                imageSource={editingProperty.virtualTour360Image}
                                className="w-full h-full min-h-[200px]"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* OPÇÃO 2: Link de Tour Virtual 360° Externo */}
                      <div className="p-3.5 rounded-xl bg-[#070F26] border border-cyan-500/25 space-y-2">
                        <label className="block text-[11px] font-mono font-bold text-cyan-200">
                          OPÇÃO 2: OU INSERIR LINK DO TOUR VIRTUAL 360° (MATTERPORT, KUULA, CLOUDPANO, ETC.)
                        </label>
                        <input
                          type="text"
                          value={editingProperty.virtualTour360Url || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, virtualTour360Url: e.target.value })}
                          placeholder="Ex: https://my.matterport.com/show/?m=... ou https://kuula.co/share/..."
                          className="w-full bg-[#050B1A] border border-cyan-500/40 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-cyan-400 font-mono"
                        />
                        <span className="text-[10px] text-slate-400 block">
                          Compatível com Matterport 3D, Kuula 360°, CloudPano, Momento360, YouTube 360° ou link de imagem 360°.
                        </span>

                        {/* Live Preview if valid URL and no uploaded image */}
                        {editingProperty.virtualTour360Url && isValid360Url(editingProperty.virtualTour360Url) && !editingProperty.virtualTour360Image && (
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-cyan-400" /> Tour 360° detectado ({detect360Provider(editingProperty.virtualTour360Url)}):
                              </span>
                              <a
                                href={editingProperty.virtualTour360Url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-mono text-[#ECC97E] hover:underline flex items-center gap-1"
                              >
                                <span>Testar em nova aba</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="relative aspect-[16/9] max-w-sm rounded-xl overflow-hidden border border-cyan-500/50 shadow-lg bg-black">
                              {is360ImageSource(editingProperty.virtualTour360Url) ? (
                                <Panorama360Viewer
                                  imageSource={editingProperty.virtualTour360Url}
                                  className="w-full h-full min-h-[200px]"
                                />
                              ) : (
                                <iframe
                                  src={get360EmbedUrl(editingProperty.virtualTour360Url) || ''}
                                  title="Preview 360"
                                  className="w-full h-full border-0"
                                  allow="accelerometer; autoplay; gyroscope; magnetometer; xr-spatial-tracking; fullscreen"
                                  allowFullScreen
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Galeria de Fotos */}
                    <div className="p-4 rounded-2xl bg-[#0B163B]/70 border border-[#D4AF37]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                            Galeria de Fotos do Imóvel ({editingProperty.images?.length || 0} fotos)
                          </span>
                        </div>
                      </div>

                      {/* Add Photo by URL or Upload */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-8 flex gap-2">
                          <input
                            type="text"
                            value={editUrlInput}
                            onChange={(e) => setEditUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleEditAddUrl();
                              }
                            }}
                            placeholder="Adicionar foto por URL (https://...)"
                            className="w-full bg-[#050B1A] border border-white/20 text-white rounded-xl px-3 py-2 text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleEditAddUrl}
                            className="px-3 py-2 rounded-xl bg-[#0B163B] text-[#E5C378] border border-[#D4AF37]/40 text-xs font-mono font-bold hover:bg-[#12235E] transition-colors shrink-0 cursor-pointer"
                          >
                            + URL
                          </button>
                        </div>

                        <div className="sm:col-span-4">
                          <button
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37]/20 to-[#ECC97E]/20 text-[#ECC97E] border border-[#D4AF37]/50 text-xs font-mono font-semibold flex items-center justify-center gap-2 hover:bg-[#D4AF37]/30 transition-all cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Arquivo</span>
                          </button>
                          <input
                            ref={editFileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleEditFileUpload(e.target.files)}
                          />
                        </div>
                      </div>

                      {/* Photo Grid Preview */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {(editingProperty.images || []).map((img, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-xl overflow-hidden border border-white/15 bg-black/40 aspect-[4/3]"
                          >
                            <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <span className="absolute top-1.5 left-1.5 bg-[#D4AF37] text-[#050B1A] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                                CAPA PRINCIPAL
                              </span>
                            )}
                            <div className="absolute inset-0 bg-[#050B1A]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleEditSetPrimaryPhoto(idx)}
                                  className="px-2 py-1 bg-[#D4AF37] text-[#050B1A] text-[10px] font-mono font-bold rounded cursor-pointer"
                                  title="Definir esta foto como a capa principal"
                                >
                                  Capa
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleEditRemovePhoto(idx)}
                                className="p-1.5 bg-red-600/80 text-white hover:bg-red-600 rounded cursor-pointer"
                                title="Remover foto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: DADOS SIGILOSOS DO PROPRIETÁRIO & CORRETOR */}
                {editActiveTab === 'proprietario' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-mono text-amber-300 uppercase tracking-wider text-[11px]">
                          Área Exclusiva de Acesso Administrativo
                        </strong>
                        <span>
                          Estes dados nunca são exibidos no site público nem expostos para visitantes. Apenas o administrador autenticado com a senha restrita tem visualização e permissão de alteração.
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0B163B]/70 border border-[#D4AF37]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                          Dados do Proprietário
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {owners.length} proprietários cadastrados
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-mono text-slate-300 font-bold flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>PROPRIETÁRIO *</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setIsCustomOwnerEdit(!isCustomOwnerEdit)}
                              className="text-[10px] font-mono text-[#ECC97E] hover:underline cursor-pointer"
                            >
                              {isCustomOwnerEdit ? '« Escolher da Lista' : '+ Digitar outro'}
                            </button>
                          </div>

                          {!isCustomOwnerEdit ? (
                            <select
                              value={
                                owners.some((o) => o.name === editingProperty.ownerName)
                                  ? owners.find((o) => o.name === editingProperty.ownerName)?.id
                                  : ''
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'custom') {
                                  setIsCustomOwnerEdit(true);
                                  return;
                                }
                                const selected = owners.find((o) => o.id === val);
                                if (selected && editingProperty) {
                                  setEditingProperty({
                                    ...editingProperty,
                                    ownerName: selected.name,
                                    ownerPhone: selected.phone || editingProperty.ownerPhone,
                                    ownerEmail: selected.email || editingProperty.ownerEmail,
                                    ownerDocument: selected.document || editingProperty.ownerDocument,
                                    ownerBankDetails: selected.bankDetails || editingProperty.ownerBankDetails,
                                    ownerMinNegotiationValue: selected.minNegotiationValue || editingProperty.ownerMinNegotiationValue,
                                  });
                                }
                              }}
                              className="w-full bg-[#050B1A] border border-[#D4AF37]/50 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                            >
                              <option value="">-- Selecione o Proprietário Cadastrado --</option>
                              {owners.map((o) => (
                                <option key={o.id} value={o.id}>
                                  {o.name} {o.document ? `· ${o.document}` : ''}
                                </option>
                              ))}
                              <option value="custom">&#x270E; Digitar outro proprietário manualmente...</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={editingProperty.ownerName || ''}
                              onChange={(e) => setEditingProperty({ ...editingProperty, ownerName: e.target.value })}
                              placeholder="Digite o nome do proprietário..."
                              className="w-full bg-[#050B1A] border border-[#D4AF37]/50 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                              autoFocus
                            />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-mono text-slate-300 mb-1">TELEFONE / WHATSAPP</label>
                            {owners.some((o) => o.name === editingProperty.ownerName) && (
                              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                                ✓ Vinculado
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={editingProperty.ownerPhone || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, ownerPhone: e.target.value })}
                            className="w-full bg-[#050B1A] border border-white/15 text-emerald-400 font-mono rounded-xl px-3 py-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">E-MAIL</label>
                          <input
                            type="email"
                            value={editingProperty.ownerEmail || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, ownerEmail: e.target.value })}
                            className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">CPF / RUC / DOCUMENTO</label>
                          <input
                            type="text"
                            value={editingProperty.ownerDocument || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, ownerDocument: e.target.value })}
                            className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">VALOR MÍNIMO DE NEGOCIAÇÃO</label>
                          <input
                            type="text"
                            value={editingProperty.ownerMinNegotiationValue || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, ownerMinNegotiationValue: e.target.value })}
                            placeholder="Ex: Não aceita proposta abaixo de R$ 3.500.000"
                            className="w-full bg-[#050B1A] border border-white/15 text-[#E5C378] rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">DADOS BANCÁRIOS / CHAVE PIX</label>
                        <input
                          type="text"
                          value={editingProperty.ownerBankDetails || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, ownerBankDetails: e.target.value })}
                          placeholder="Ex: Chave PIX: 4199999999 ou Banco Itaú, Ag 1234, C/C 56789-0"
                          className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Corretor & Notas Internas */}
                    <div className="p-4 rounded-2xl bg-[#0B163B]/70 border border-[#D4AF37]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                          Corretor Responsável & Comissão
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {realtors.length} corretores cadastrados
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. NOME DO CORRETOR COM SELECT DOS CADASTRADOS */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-mono text-slate-300 font-bold flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>CORRETOR *</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setIsCustomRealtorEdit(!isCustomRealtorEdit)}
                              className="text-[10px] font-mono text-[#ECC97E] hover:underline"
                            >
                              {isCustomRealtorEdit ? '« Escolher da Lista' : '+ Digitar outro'}
                            </button>
                          </div>

                          {!isCustomRealtorEdit ? (
                            <select
                              value={
                                realtors.some((r) => r.name === editingProperty.realtorName)
                                  ? realtors.find((r) => r.name === editingProperty.realtorName)?.id
                                  : ''
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'custom') {
                                  setIsCustomRealtorEdit(true);
                                  return;
                                }
                                const selected = realtors.find((r) => r.id === val);
                                if (selected && editingProperty) {
                                  setEditingProperty({
                                    ...editingProperty,
                                    realtorName: selected.name,
                                    realtorCreci: selected.creci,
                                    realtorPhone: selected.phone,
                                    realtorEmail: selected.email,
                                    realtorCommission: selected.defaultCommission || '6%',
                                  });
                                }
                              }}
                              className="w-full bg-[#050B1A] border border-[#D4AF37]/50 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                            >
                              <option value="">-- Selecione o Corretor Cadastrado --</option>
                              {realtors.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name} · {r.creci} ({r.specialty || 'Corretor Associado'})
                                </option>
                              ))}
                              <option value="custom">&#x270E; Digitar outro corretor manualmente...</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={editingProperty.realtorName || ''}
                              onChange={(e) => setEditingProperty({ ...editingProperty, realtorName: e.target.value })}
                              placeholder="Digite o nome do corretor..."
                              className="w-full bg-[#050B1A] border border-[#D4AF37]/50 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                              autoFocus
                            />
                          )}
                        </div>

                        {/* 2. CRECI / REGISTRO PREENCHIDO AUTOMATICAMENTE */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-mono text-slate-300 font-bold">CRECI / REGISTRO</label>
                            {editingProperty.realtorCreci && (
                              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                                ✓ Preenchido Automaticamente
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={editingProperty.realtorCreci || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, realtorCreci: e.target.value })}
                            placeholder="Preenchido ao selecionar corretor"
                            className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>

                        {/* 3. COMISSÃO */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-mono text-slate-300 font-bold">COMISSÃO COMBINADA</label>
                            {editingProperty.realtorCommission && (
                              <span className="text-[10px] font-mono text-[#E5C378]">Padrão da equipe</span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={editingProperty.realtorCommission || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, realtorCommission: e.target.value })}
                            placeholder="Ex: 6% integral"
                            className="w-full bg-[#050B1A] border border-white/15 text-[#E5C378] rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">TELEFONE / WHATSAPP</label>
                          <input
                            type="text"
                            value={editingProperty.realtorPhone || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, realtorPhone: e.target.value })}
                            placeholder="+55 (21) 98098-4243"
                            className="w-full bg-[#050B1A] border border-white/15 text-emerald-400 rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">E-MAIL</label>
                          <input
                            type="email"
                            value={editingProperty.realtorEmail || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, realtorEmail: e.target.value })}
                            placeholder="Demy@Bratu.com.br"
                            className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">
                          ANOTAÇÕES INTERNAS ADMINISTRATIVAS / HISTÓRICO
                        </label>
                        <textarea
                          rows={3}
                          value={editingProperty.adminNotes || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, adminNotes: e.target.value })}
                          placeholder="Observações confidenciais sobre chaves na portaria, visitas agendadas, negociações em andamento..."
                          className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Sincronizado automaticamente com Google Search, ChatGPT, Perplexity & Gemini</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingProperty(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="tech-btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-[#050B1A]" />
                      <span>{isSavingEdit ? 'Salvando...' : 'Salvar Todas as Alterações'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL PARA CADASTRAR OU EDITAR CORRETOR */}
        {isRealtorModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B1A]/90 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsRealtorModalOpen(false)}
          >
            <div
              className="relative w-full max-w-lg bg-[#070F26] text-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden border border-[#D4AF37]/50 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-[#050B1A]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {editingRealtor ? `Editar Corretor · ${editingRealtor.name}` : 'Cadastrar Novo Corretor na Equipe'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Fica disponível imediatamente para seleção em qualquer imóvel.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRealtorModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#070F26] hover:bg-[#0B163B] border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveRealtorForm} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    NOME COMPLETO DO CORRETOR *
                  </label>
                  <input
                    type="text"
                    required
                    value={realtorFormData.name || ''}
                    onChange={(e) => setRealtorFormData({ ...realtorFormData, name: e.target.value })}
                    placeholder="Ex: Alexandre Bratu ou Maria Fernandes"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      CRECI / REGISTRO PROFISSIONAL
                    </label>
                    <input
                      type="text"
                      value={realtorFormData.creci || ''}
                      onChange={(e) => setRealtorFormData({ ...realtorFormData, creci: e.target.value })}
                      placeholder="Ex: CRECI-PR 32.410 ou Matrícula PY 45.290"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      COMISSÃO PADRÃO
                    </label>
                    <input
                      type="text"
                      value={realtorFormData.defaultCommission || ''}
                      onChange={(e) => setRealtorFormData({ ...realtorFormData, defaultCommission: e.target.value })}
                      placeholder="Ex: 6% Padrão Venda ou 5% USD"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-[#E5C378] rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      TELEFONE / WHATSAPP *
                    </label>
                    <input
                      type="text"
                      required
                      value={realtorFormData.phone || ''}
                      onChange={(e) => setRealtorFormData({ ...realtorFormData, phone: e.target.value })}
                      placeholder="+55 (21) 98098-4243"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-emerald-400 rounded-xl px-3.5 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      E-MAIL CORPORATIVO
                    </label>
                    <input
                      type="email"
                      value={realtorFormData.email || ''}
                      onChange={(e) => setRealtorFormData({ ...realtorFormData, email: e.target.value })}
                      placeholder="corretor@bratu.com.br"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    ESPECIALIDADE / REGIÃO DE ATUAÇÃO
                  </label>
                  <input
                    type="text"
                    value={realtorFormData.specialty || ''}
                    onChange={(e) => setRealtorFormData({ ...realtorFormData, specialty: e.target.value })}
                    placeholder="Ex: Curitiba Batel & Ecoville / Litoral SC / Miami"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="realtorActive"
                    checked={realtorFormData.active !== false}
                    onChange={(e) => setRealtorFormData({ ...realtorFormData, active: e.target.checked })}
                    className="w-4 h-4 text-[#D4AF37] rounded border-white/20 bg-[#0B163B] cursor-pointer"
                  />
                  <label htmlFor="realtorActive" className="text-xs text-slate-300 font-mono cursor-pointer">
                    Corretor ativo na equipe (visível para seleção em novos imóveis)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsRealtorModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingRealtor}
                    className="tech-btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-[#050B1A] cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-[#050B1A]" />
                    <span>{isSavingRealtor ? 'Salvando...' : editingRealtor ? 'Salvar Alterações' : 'Cadastrar Corretor'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CADASTRO / EDIÇÃO DE PROPRIETÁRIO */}
        {isOwnerModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050B1A]/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsOwnerModalOpen(false)}
          >
            <div
              className="relative w-full max-w-xl bg-[#070F26] text-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col border border-[#D4AF37]/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-[#050B1A]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {editingOwner ? `Editar Proprietário · ${editingOwner.name}` : 'Cadastrar Novo Proprietário'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Fica disponível imediatamente para seleção e preenchimento automático em qualquer imóvel.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOwnerModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#070F26] hover:bg-[#0B163B] border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveOwnerForm} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    NOME COMPLETO DO PROPRIETÁRIO (OU RAZÃO SOCIAL) *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerFormData.name || ''}
                    onChange={(e) => setOwnerFormData({ ...ownerFormData, name: e.target.value })}
                    placeholder="Ex: Carlos Eduardo Albuquerque ou Inversiones Santa Teresa"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      TELEFONE / WHATSAPP *
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerFormData.phone || ''}
                      onChange={(e) => setOwnerFormData({ ...ownerFormData, phone: e.target.value })}
                      placeholder="+55 (41) 99999-8888"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-emerald-400 rounded-xl px-3.5 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      E-MAIL
                    </label>
                    <input
                      type="email"
                      value={ownerFormData.email || ''}
                      onChange={(e) => setOwnerFormData({ ...ownerFormData, email: e.target.value })}
                      placeholder="proprietario@email.com"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      DOCUMENTO (CPF / CNPJ / RUC / EIN)
                    </label>
                    <input
                      type="text"
                      value={ownerFormData.document || ''}
                      onChange={(e) => setOwnerFormData({ ...ownerFormData, document: e.target.value })}
                      placeholder="Ex: CPF 123.456.789-00 ou CNPJ..."
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      VALOR MÍNIMO DE NEGOCIAÇÃO
                    </label>
                    <input
                      type="text"
                      value={ownerFormData.minNegotiationValue || ''}
                      onChange={(e) => setOwnerFormData({ ...ownerFormData, minNegotiationValue: e.target.value })}
                      placeholder="Ex: Não aceita menos que R$ 4.500.000 à vista"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-[#E5C378] rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    DADOS BANCÁRIOS / CHAVE PIX PARA REPASSE
                  </label>
                  <input
                    type="text"
                    value={ownerFormData.bankDetails || ''}
                    onChange={(e) => setOwnerFormData({ ...ownerFormData, bankDetails: e.target.value })}
                    placeholder="Ex: Banco Itaú Ag 1234 CC 56789-0 | Chave PIX: 41999998888"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    OBSERVAÇÕES CONFIDENCIAIS / PREFERÊNCIAS DE NEGOCIAÇÃO
                  </label>
                  <textarea
                    rows={3}
                    value={ownerFormData.notes || ''}
                    onChange={(e) => setOwnerFormData({ ...ownerFormData, notes: e.target.value })}
                    placeholder="Notas confidenciais sobre autorização de venda, histórico de propostas, horários para visita..."
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsOwnerModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingOwner}
                    className="tech-btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-[#050B1A] cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-[#050B1A]" />
                    <span>{isSavingOwner ? 'Salvando...' : editingOwner ? 'Salvar Alterações' : 'Cadastrar Proprietário'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CADASTRO / EDIÇÃO DE CONDOMÍNIO OU EDIFÍCIO */}
        {isCondoModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050B1A]/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsCondoModalOpen(false)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[90vh] bg-[#070F26] text-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col border border-[#D4AF37]/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-[#050B1A] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {editingCondo ? `Editar Condomínio · ${editingCondo.name}` : 'Cadastrar Novo Condomínio / Edifício'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Fica disponível imediatamente para seleção de taxa e especificações em qualquer imóvel.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCondoModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#070F26] hover:bg-[#0B163B] border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveCondoForm} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    NOME DO CONDOMÍNIO OU EDIFÍCIO *
                  </label>
                  <input
                    type="text"
                    required
                    value={condoFormData.name || ''}
                    onChange={(e) => setCondoFormData({ ...condoFormData, name: e.target.value })}
                    placeholder="Ex: Edifício Maison Batel Platinum ou Residencial Villa Jardins"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-[#E5C378] mb-1">
                      TAXA DE CONDOMÍNIO ESTIMADA (MENSAL)
                    </label>
                    <input
                      type="text"
                      value={condoFormData.condoFee || ''}
                      onChange={(e) => setCondoFormData({ ...condoFormData, condoFee: e.target.value })}
                      placeholder="Ex: R$ 1.850 / mês ou US$ 450 / mês"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-[#E5C378] font-bold rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      CEP / CÓDIGO POSTAL
                    </label>
                    <input
                      type="text"
                      value={condoFormData.zipCode || ''}
                      onChange={(e) => setCondoFormData({ ...condoFormData, zipCode: e.target.value })}
                      placeholder="Ex: 80420-190"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">PAÍS</label>
                    <select
                      value={condoFormData.country || 'Brasil'}
                      onChange={(e) => setCondoFormData({ ...condoFormData, country: e.target.value as Country })}
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs cursor-pointer"
                    >
                      <option value="Brasil" className="bg-[#070F26]">Brasil</option>
                      <option value="Estados Unidos" className="bg-[#070F26]">Estados Unidos</option>
                      <option value="Paraguai" className="bg-[#070F26]">Paraguai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">CIDADE *</label>
                    <input
                      type="text"
                      required
                      value={condoFormData.city || ''}
                      onChange={(e) => setCondoFormData({ ...condoFormData, city: e.target.value })}
                      placeholder="Curitiba"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">BAIRRO *</label>
                    <input
                      type="text"
                      required
                      value={condoFormData.neighborhood || ''}
                      onChange={(e) => setCondoFormData({ ...condoFormData, neighborhood: e.target.value })}
                      placeholder="Batel"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">ESTADO / UF</label>
                    <input
                      type="text"
                      value={condoFormData.stateOrDept || ''}
                      onChange={(e) => setCondoFormData({ ...condoFormData, stateOrDept: e.target.value })}
                      placeholder="PR"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    ENDEREÇO COMPLETO / LOGRADOURO
                  </label>
                  <input
                    type="text"
                    value={condoFormData.address || ''}
                    onChange={(e) => setCondoFormData({ ...condoFormData, address: e.target.value })}
                    placeholder="Ex: Av. Desembargador Motta, 1420"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>

                {/* Comodidades e Lazer do Condomínio */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    INFRAESTRUTURA & COMODIDADES DO CONDOMÍNIO
                  </label>

                  {/* Amenities Tags */}
                  {condoFormData.amenities && condoFormData.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5 p-2 rounded-xl bg-[#050B1A] border border-white/10">
                      {condoFormData.amenities.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-[#0B163B] text-[#ECC97E] border border-[#D4AF37]/40"
                        >
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCondoAmenity(idx)}
                            className="text-red-400 hover:text-red-200 cursor-pointer text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add Amenity Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={condoAmenityInput}
                      onChange={(e) => setCondoAmenityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCondoAmenity();
                        }
                      }}
                      placeholder="Ex: Piscina Aquecida, Academia, Espaço Gourmet..."
                      className="flex-1 bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCondoAmenity}
                      className="px-4 py-2 bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/40 text-[#ECC97E] text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      + Incluir
                    </button>
                  </div>

                  {/* Quick Suggestions Chips */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {['Portaria 24h', 'Piscina Aquecida', 'Academia', 'Salão de Festas Gourmet', 'Quadra de Tênis', 'Heliponto', 'Elevador Privativo', 'Pet Place', 'Gerador Full'].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => {
                          const current = condoFormData.amenities || [];
                          if (!current.includes(quick)) {
                            setCondoFormData({ ...condoFormData, amenities: [...current, quick] });
                          }
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#070F26] text-slate-300 border border-white/10 hover:border-[#D4AF37]/50 hover:text-white cursor-pointer"
                      >
                        + {quick}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    OBSERVAÇÕES DA PORTARIA, REGRAS DE MUDANÇA & CONTATO DE ZELADORIA
                  </label>
                  <textarea
                    rows={3}
                    value={condoFormData.notes || ''}
                    onChange={(e) => setCondoFormData({ ...condoFormData, notes: e.target.value })}
                    placeholder="Ex: Zelador Sr. Carlos (41 99999-0000). Horário de visitas até as 18h. Chaves na portaria com autorização prévia..."
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCondoModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCondo}
                    className="tech-btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-[#050B1A] cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-[#050B1A]" />
                    <span>{isSavingCondo ? 'Salvando...' : editingCondo ? 'Salvar Alterações' : 'Cadastrar Condomínio'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* MODAL DE CADASTRO / EDIÇÃO DE MEMBRO DA EQUIPE BRATU */}
        {isTeamModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050B1A]/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsTeamModalOpen(false)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[92vh] bg-[#070F26] text-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col border border-[#D4AF37]/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-[#050B1A] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {editingTeamMember ? `Editar Membro · ${editingTeamMember.name}` : 'Cadastrar Novo Membro na Equipe'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Bratu Imobiliária & Administradora LTDA · Exibição no site público e contatos diretos.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#070F26] hover:bg-[#0B163B] border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveTeamForm} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Photo Section with Live Preview & Upload */}
                <div className="p-4 rounded-2xl bg-[#0B163B]/60 border border-[#D4AF37]/30 space-y-3">
                  <span className="block text-[11px] font-mono text-[#E5C378] font-bold uppercase">
                    Foto do Profissional
                  </span>
                  <div className="flex items-start gap-4">
                    <img
                      src={teamFormData.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80'}
                      alt="Prévia do Membro"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4AF37]/60 shadow-md shrink-0 bg-[#050B1A]"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={teamFormData.photoUrl || ''}
                        onChange={(e) => setTeamFormData({ ...teamFormData, photoUrl: e.target.value })}
                        placeholder="Cole o link da foto (URL) ou envie arquivo abaixo..."
                        className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-1.5 text-xs font-mono"
                      />

                      <div className="flex items-center gap-2">
                        <label className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#070F26] hover:bg-[#0B163B] border border-[#D4AF37]/40 rounded-xl text-xs font-mono text-[#ECC97E] cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{isCompressingTeamPhoto ? 'Comprimindo...' : 'Enviar Foto do Aparelho'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleTeamPhotoUpload(e.target.files)}
                          />
                        </label>
                        <span className="text-[10px] text-slate-400">
                          (Compressão automática)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preset Avatars */}
                  <div className="pt-2 border-t border-white/10">
                    <span className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase">
                      Ou escolha um retrato corporativo pré-selecionado:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {CURATED_TEAM_AVATARS.map((avatar, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectCuratedTeamAvatar(avatar.url)}
                          className={`p-1 rounded-xl border transition-all cursor-pointer ${
                            teamFormData.photoUrl === avatar.url
                              ? 'border-[#D4AF37] ring-1 ring-[#D4AF37] bg-[#050B1A]'
                              : 'border-white/10 hover:border-[#D4AF37]/60 bg-[#070F26]'
                          }`}
                          title={avatar.name}
                        >
                          <img
                            src={avatar.url}
                            alt={avatar.name}
                            className="w-9 h-9 rounded-lg object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Name & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      NOME COMPLETO *
                    </label>
                    <input
                      type="text"
                      required
                      value={teamFormData.name || ''}
                      onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                      placeholder="Ex: Alexandre Bratu"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs font-bold focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#E5C378] mb-1">
                      CARGO / FUNÇÃO OFICIAL *
                    </label>
                    <input
                      type="text"
                      required
                      value={teamFormData.role || ''}
                      onChange={(e) => setTeamFormData({ ...teamFormData, role: e.target.value })}
                      placeholder="Ex: Diretor Geral / Administrador ou Consultor de Vendas"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-[#ECC97E] rounded-xl px-3.5 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Department & CRECI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      DEPARTAMENTO / SETOR
                    </label>
                    <select
                      value={teamFormData.department || 'Diretoria Executiva'}
                      onChange={(e) => setTeamFormData({ ...teamFormData, department: e.target.value })}
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs cursor-pointer"
                    >
                      <option value="Diretoria Executiva" className="bg-[#070F26]">Diretoria Executiva</option>
                      <option value="Administração Condominial" className="bg-[#070F26]">Administração Condominial</option>
                      <option value="Vendas Residencial" className="bg-[#070F26]">Vendas Residencial</option>
                      <option value="Ativos Internacionais & Comercial" className="bg-[#070F26]">Ativos Internacionais & Comercial</option>
                      <option value="Locação & Corporativo" className="bg-[#070F26]">Locação & Corporativo</option>
                      <option value="Jurídico & Contratos" className="bg-[#070F26]">Jurídico & Contratos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      CRECI / REGISTRO PROFISSIONAL
                    </label>
                    <input
                      type="text"
                      value={teamFormData.creci || ''}
                      onChange={(e) => setTeamFormData({ ...teamFormData, creci: e.target.value })}
                      placeholder="Ex: CRECI-PR 32.410 ou OAB-PR 78.432"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      TELEFONE / WHATSAPP PARA CONTATO DIRETO
                    </label>
                    <input
                      type="text"
                      value={teamFormData.phone || ''}
                      onChange={(e) => setTeamFormData({ ...teamFormData, phone: e.target.value })}
                      placeholder="+55 (21) 98098-4243"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-emerald-400 font-mono rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      E-MAIL CORPORATIVO
                    </label>
                    <input
                      type="email"
                      value={teamFormData.email || ''}
                      onChange={(e) => setTeamFormData({ ...teamFormData, email: e.target.value })}
                      placeholder="Demy@Bratu.com.br"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    MINI-BIOGRAFIA / HISTÓRICO PROFISSIONAL
                  </label>
                  <textarea
                    rows={3}
                    value={teamFormData.bio || ''}
                    onChange={(e) => setTeamFormData({ ...teamFormData, bio: e.target.value })}
                    placeholder="Descreva a formação, áreas de atuação e trajetória do profissional..."
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                {/* Order & Active */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      ORDEM DE EXIBIÇÃO (NÚMERO)
                    </label>
                    <input
                      type="number"
                      value={teamFormData.order ?? 1}
                      onChange={(e) => setTeamFormData({ ...teamFormData, order: Number(e.target.value) })}
                      className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3.5 py-2 text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="teamMemberActive"
                      checked={teamFormData.active !== false}
                      onChange={(e) => setTeamFormData({ ...teamFormData, active: e.target.checked })}
                      className="w-4 h-4 text-[#D4AF37] rounded border-white/20 bg-[#0B163B] cursor-pointer"
                    />
                    <label htmlFor="teamMemberActive" className="text-xs text-slate-300 font-mono cursor-pointer">
                      Exibir no site público na seção "Nossa Equipe"
                    </label>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsTeamModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingTeamMember || isCompressingTeamPhoto}
                    className="tech-btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-[#050B1A] cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-[#050B1A]" />
                    <span>{isSavingTeamMember ? 'Salvando...' : editingTeamMember ? 'Salvar Alterações' : 'Cadastrar Membro'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE MEMBRO DA EQUIPE */}
        {deleteConfirmTeamMember && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B1A]/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setDeleteConfirmTeamMember(null)}
          >
            <div
              className="relative w-full max-w-md bg-[#070F26] text-white rounded-3xl p-6 border border-red-500/50 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-red-950/70 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold text-white">
                  Excluir Membro da Equipe?
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Tem certeza que deseja remover <strong className="text-white">{deleteConfirmTeamMember.name}</strong> ({deleteConfirmTeamMember.role}) do banco de dados?
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTeamMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTeamMemberAction(deleteConfirmTeamMember.id, deleteConfirmTeamMember.name)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-red-900 hover:bg-red-800 text-white border border-red-500/50 cursor-pointer"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE CADASTRO / EDIÇÃO DE SUB-ITEM / FOTO DO SEGMENTO */}
        {isSegmentItemModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050B1A]/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsSegmentItemModalOpen(false)}
          >
            <div
              className="relative w-full max-w-xl max-h-[90vh] bg-[#070F26] text-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col border border-[#D4AF37]/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-[#050B1A] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Item / Foto Adicional do Segmento
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Vincule fotos próprias e destaques que aparecem no card do segmento.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSegmentItemModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#070F26] hover:bg-[#0B163B] border border-white/10 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveSegmentItemForm} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Photo Upload & Preview */}
                <div className="p-4 rounded-2xl bg-[#0B163B]/60 border border-[#D4AF37]/30 space-y-3">
                  <span className="block text-[11px] font-mono text-[#E5C378] font-bold uppercase">
                    Foto do Item / Empreendimento
                  </span>
                  {editingItemData.imageUrl && (
                    <div className="aspect-[16/9] rounded-xl overflow-hidden border border-[#D4AF37]/40 relative bg-[#050B1A]">
                      <img
                        src={editingItemData.imageUrl}
                        alt="Prévia do Item"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <input
                    type="url"
                    value={editingItemData.imageUrl || ''}
                    onChange={(e) => setEditingItemData({ ...editingItemData, imageUrl: e.target.value })}
                    placeholder="URL da foto (ex: https://...)"
                    className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-1.5 text-xs font-mono"
                  />

                  <label className="flex items-center justify-center gap-2 w-full p-2.5 bg-[#070F26] hover:bg-[#0B163B] border border-dashed border-[#D4AF37]/40 rounded-xl text-xs font-mono text-[#ECC97E] cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{isCompressingItemPhoto ? 'Comprimindo foto...' : 'Enviar Foto do Dispositivo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleItemPhotoUpload(e.target.files)}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    TÍTULO DO ITEM *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItemData.title || ''}
                    onChange={(e) => setEditingItemData({ ...editingItemData, title: e.target.value })}
                    placeholder="Ex: Mansão Suspensa Ecoville ou Laje Corporativa Centro Cívico"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      SUBTÍTULO / ESPECIFICAÇÃO
                    </label>
                    <input
                      type="text"
                      value={editingItemData.subtitle || ''}
                      onChange={(e) => setEditingItemData({ ...editingItemData, subtitle: e.target.value })}
                      placeholder="Ex: Curitiba · 4 Suítes · 650m²"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      BADGE / SELO
                    </label>
                    <input
                      type="text"
                      value={editingItemData.badge || ''}
                      onChange={(e) => setEditingItemData({ ...editingItemData, badge: e.target.value })}
                      placeholder="Ex: EXCLUSIVIDADE BRATU"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-[#E5C378] font-mono rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    DESCRIÇÃO DO ITEM
                  </label>
                  <textarea
                    rows={2}
                    value={editingItemData.description || ''}
                    onChange={(e) => setEditingItemData({ ...editingItemData, description: e.target.value })}
                    placeholder="Conceito arquitetônico autoral, acabamentos de altíssimo padrão..."
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl p-3 text-xs"
                  />
                </div>

                {/* Tech Effect */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    EFEITO VISUAL DA FOTO
                  </label>
                  <select
                    value={editingItemData.techEffect || 'holo-gold'}
                    onChange={(e) => setEditingItemData({ ...editingItemData, techEffect: e.target.value as TechEffectType })}
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs font-mono cursor-pointer"
                  >
                    <option value="holo-gold">Holo-Gold (Varredura Ouro)</option>
                    <option value="cyber-lidar">Cyber-LIDAR (Laser Neon Cyan 3D)</option>
                    <option value="blueprint">Blueprint 3D (Engenharia BIM)</option>
                    <option value="matrix">Neo-Matrix (Fósforo Digital)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsSegmentItemModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCompressingItemPhoto}
                    className="tech-btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-[#050B1A] cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#050B1A]" />
                    <span>Salvar Item no Segmento</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CADASTRO / EDIÇÃO DE NOVO SEGMENTO PERSONALIZADO */}
        {isCustomSegmentModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050B1A]/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsCustomSegmentModalOpen(false)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[92vh] bg-[#070F26] text-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col border border-[#D4AF37]/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-[#050B1A] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {customSegmentFormData.id ? `Editar Segmento · ${customSegmentFormData.title}` : 'Criar Novo Segmento Especializado'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Aparecerá automaticamente na grade da página inicial junto aos Segmentos 01 e 02.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCustomSegmentModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#070F26] hover:bg-[#0B163B] border border-white/10 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveCustomSegmentForm} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      TAG DO SEGMENTO
                    </label>
                    <input
                      type="text"
                      value={customSegmentFormData.segmentTag || 'SEGMENTO 03'}
                      onChange={(e) => setCustomSegmentFormData({ ...customSegmentFormData, segmentTag: e.target.value })}
                      placeholder="SEGMENTO 03"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-[#E5C378] font-mono rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      CATEGORIA
                    </label>
                    <select
                      value={customSegmentFormData.category || 'residencial'}
                      onChange={(e) => setCustomSegmentFormData({ ...customSegmentFormData, category: e.target.value as PropertyCategory })}
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs cursor-pointer"
                    >
                      <option value="residencial" className="bg-[#070F26]">Residencial</option>
                      <option value="comercial" className="bg-[#070F26]">Comercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      BADGE / SELO
                    </label>
                    <input
                      type="text"
                      value={customSegmentFormData.badge || ''}
                      onChange={(e) => setCustomSegmentFormData({ ...customSegmentFormData, badge: e.target.value })}
                      placeholder="RURAL / INTERNACIONAL"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white font-mono rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    TÍTULO PRINCIPAL DO SEGMENTO *
                  </label>
                  <input
                    type="text"
                    required
                    value={customSegmentFormData.title || ''}
                    onChange={(e) => setCustomSegmentFormData({ ...customSegmentFormData, title: e.target.value })}
                    placeholder="Ex: Áreas Rurais & Haras de Luxo"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white font-bold rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                {/* Photo & Badge */}
                <div className="p-4 rounded-2xl bg-[#0B163B]/60 border border-[#D4AF37]/30 space-y-3">
                  <span className="block text-[11px] font-mono text-[#E5C378] font-bold uppercase">
                    Foto do Segmento & Efeito Tecnológico
                  </span>
                  {customSegmentFormData.imageUrl && (
                    <div className="aspect-[16/9] rounded-xl overflow-hidden border border-[#D4AF37]/40 bg-[#050B1A]">
                      <img
                        src={customSegmentFormData.imageUrl}
                        alt="Prévia"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <input
                    type="url"
                    value={customSegmentFormData.imageUrl || ''}
                    onChange={(e) => setCustomSegmentFormData({ ...customSegmentFormData, imageUrl: e.target.value })}
                    placeholder="URL da foto (ex: https://...)"
                    className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-1.5 text-xs font-mono"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">
                        BADGE SOBRE A FOTO
                      </label>
                      <input
                        type="text"
                        value={customSegmentFormData.imageBadge || ''}
                        onChange={(e) => setCustomSegmentFormData({ ...customSegmentFormData, imageBadge: e.target.value })}
                        placeholder="RURAL · ALTO PADRÃO"
                        className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-1.5 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">
                        EFEITO TECNOLÓGICO
                      </label>
                      <select
                        value={customSegmentFormData.techEffect || 'holo-gold'}
                        onChange={(e) => setCustomSegmentFormData({ ...customSegmentFormData, techEffect: e.target.value as TechEffectType })}
                        className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-1.5 text-xs font-mono cursor-pointer"
                      >
                        <option value="holo-gold">Holo-Gold (Varredura Ouro)</option>
                        <option value="cyber-lidar">Cyber-LIDAR (Neon Cyan 3D)</option>
                        <option value="blueprint">Blueprint 3D (Engenharia BIM)</option>
                        <option value="matrix">Neo-Matrix (Fósforo Digital)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    DESCRIÇÃO DO SEGMENTO
                  </label>
                  <textarea
                    rows={3}
                    value={customSegmentFormData.description || ''}
                    onChange={(e) => setCustomSegmentFormData({ ...customSegmentFormData, description: e.target.value })}
                    placeholder="Apresente as características e diferenciais deste segmento..."
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl p-3 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      TEXTO DO BOTÃO (CTA)
                    </label>
                    <input
                      type="text"
                      value={customSegmentFormData.ctaText || 'Explorar Oportunidades'}
                      onChange={(e) => setCustomSegmentFormData({ ...customSegmentFormData, ctaText: e.target.value })}
                      placeholder="Explorar Oportunidades"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      ETIQUETA INFERIOR (FOOTER LABEL)
                    </label>
                    <input
                      type="text"
                      value={customSegmentFormData.footerLabel || 'Venda & Consultoria'}
                      onChange={(e) => setCustomSegmentFormData({ ...customSegmentFormData, footerLabel: e.target.value })}
                      placeholder="Venda & Consultoria"
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCustomSegmentModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="tech-btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-[#050B1A] cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#050B1A]" />
                    <span>Salvar Segmento</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
