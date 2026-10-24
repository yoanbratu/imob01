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
} from 'lucide-react';
import { Property, PropertyType, PropertyPurpose, Country, LeadSubmission, Realtor } from '../types/property';
import {
  saveProperty,
  updateProperty,
  deleteProperty,
  fetchRealtors,
  saveRealtor,
  deleteRealtor,
  subscribeToRealtors,
  INITIAL_REALTORS,
} from '../services/propertyService';
import { COMPANY_INFO } from '../utils/whatsapp';
import { updateAdminPassword } from '../utils/security';
import { isValidYouTubeUrl, getYouTubeEmbedUrl } from '../utils/youtube';
import { isValid360Url, get360EmbedUrl, detect360Provider, parse360Tour, is360ImageSource } from '../utils/virtualTour360';
import { Panorama360Viewer } from './Panorama360Viewer';
import { compressImage, compress360Panorama } from '../utils/imageCompression';

interface AdminPanelProps {
  properties: Property[];
  leads: LeadSubmission[];
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  properties,
  leads,
  isOpen,
  onClose,
  onLogout,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'new' | 'realtors' | 'leads' | 'security'>('properties');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'residencial' | 'comercial'>('all');

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

  useEffect(() => {
    const unsubscribe = subscribeToRealtors((data) => {
      setRealtors(data);
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
                      <label className="block text-[11px] font-mono text-[#E5C378] mb-1">VALOR DO CONDOMÍNIO</label>
                      <input
                        type="text"
                        value={newProp.condoFee || ''}
                        onChange={(e) => setNewProp({ ...newProp, condoFee: e.target.value })}
                        placeholder="Ex: R$ 1.650/mês"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>
                  </div>

                  {/* Condomínio: Nome do Condomínio / Edifício */}
                  <div className="mb-4 p-3.5 rounded-2xl bg-[#0B163B]/60 border border-[#D4AF37]/25">
                    <label className="block text-[11px] font-mono text-[#ECC97E] mb-1 font-bold">
                      NOME DO CONDOMÍNIO / EDIFÍCIO
                    </label>
                    <input
                      type="text"
                      value={newProp.condoName || ''}
                      onChange={(e) => setNewProp({ ...newProp, condoName: e.target.value })}
                      placeholder="Ex: Edifício Maison Batel Platinum, Residencial Villa Jardins, Torre Corporativa Santa Teresa"
                      className="w-full bg-[#050B1A] border border-[#D4AF37]/35 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Nome oficial do edifício ou condomínio residencial/empresarial exibido na ficha técnica do imóvel.
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
                  <div className="flex items-center gap-2 mb-3 pb-1 border-b border-[#D4AF37]/30">
                    <Lock className="w-4 h-4 text-[#D4AF37]" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                      PARTE 2: DADOS DO PROPRIETÁRIO (SOMENTE ADMINISTRADOR VERÁ)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">NOME DO PROPRIETÁRIO *</label>
                      <input
                        type="text"
                        value={newProp.ownerName || ''}
                        onChange={(e) => setNewProp({ ...newProp, ownerName: e.target.value })}
                        placeholder="Ex: Carlos Albuquerque"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">TELEFONE / WHATSAPP *</label>
                      <input
                        type="text"
                        value={newProp.ownerPhone || ''}
                        onChange={(e) => setNewProp({ ...newProp, ownerPhone: e.target.value })}
                        placeholder="Ex: +55 (41) 99999-8888"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
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

                  {/* Quick Select from Registered Realtors */}
                  <div className="bg-[#050B1A] p-3.5 rounded-2xl border border-[#D4AF37]/45 mb-4 shadow-sm">
                    <label className="block text-[11px] font-mono font-bold text-[#E5C378] mb-1.5 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#D4AF37]" />
                      SELECIONAR CORRETOR CADASTRADO NA EQUIPE (PREENCHIMENTO AUTOMÁTICO)
                    </label>
                    <select
                      onChange={(e) => {
                        const selected = realtors.find((r) => r.id === e.target.value);
                        if (selected) {
                          setNewProp((prev) => ({
                            ...prev,
                            realtorName: selected.name,
                            realtorCreci: selected.creci,
                            realtorPhone: selected.phone,
                            realtorEmail: selected.email,
                            realtorCommission: selected.defaultCommission || '6%',
                          }));
                        }
                      }}
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs font-mono focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                    >
                      <option value="">-- Escolha um corretor da equipe para preencher automaticamente --</option>
                      {realtors.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} · {r.creci} ({r.specialty || 'Corretor Associado'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">NOME DO CORRETOR</label>
                      <input
                        type="text"
                        value={newProp.realtorName || ''}
                        onChange={(e) => setNewProp({ ...newProp, realtorName: e.target.value })}
                        placeholder="Ex: Alexandre Bratu"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">CRECI / REGISTRO</label>
                      <input
                        type="text"
                        value={newProp.realtorCreci || ''}
                        onChange={(e) => setNewProp({ ...newProp, realtorCreci: e.target.value })}
                        placeholder="CRECI-PR 32.410"
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 mb-1">COMISSÃO ACORDADA</label>
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
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">NOME DO CONDOMÍNIO / EDIFÍCIO</label>
                        <input
                          type="text"
                          value={editingProperty.condoName || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, condoName: e.target.value })}
                          placeholder="Ex: Edifício Torre de Batel"
                          className="w-full bg-[#0B163B] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">TAXA DO CONDOMÍNIO</label>
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
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E5C378] block">
                        Dados do Proprietário
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">NOME DO PROPRIETÁRIO</label>
                          <input
                            type="text"
                            value={editingProperty.ownerName || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, ownerName: e.target.value })}
                            className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">TELEFONE / WHATSAPP</label>
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

                      {/* Selector from Registered Realtors */}
                      <div className="bg-[#050B1A] p-3 rounded-xl border border-[#D4AF37]/40 shadow-xs">
                        <label className="block text-[10px] font-mono font-bold text-[#E5C378] mb-1 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                          SELECIONAR DA EQUIPE DE CORRETORES (PREENCHIMENTO AUTOMÁTICO)
                        </label>
                        <select
                          onChange={(e) => {
                            const selected = realtors.find((r) => r.id === e.target.value);
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
                          className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                        >
                          <option value="">-- Escolha um corretor para atualizar os dados abaixo --</option>
                          {realtors.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} · {r.creci} ({r.specialty || 'Corretor Associado'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">CORRETOR</label>
                          <input
                            type="text"
                            value={editingProperty.realtorName || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, realtorName: e.target.value })}
                            className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">CRECI</label>
                          <input
                            type="text"
                            value={editingProperty.realtorCreci || ''}
                            onChange={(e) => setEditingProperty({ ...editingProperty, realtorCreci: e.target.value })}
                            className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-300 mb-1">COMISSÃO COMBINADA</label>
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
      </div>
    </div>
  );
};
