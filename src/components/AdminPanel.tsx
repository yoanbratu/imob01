import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Building,
  Home,
  Briefcase,
  PlusCircle,
  FileText,
  User,
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
} from 'lucide-react';
import { Property, PropertyType, PropertyPurpose, LeadSubmission } from '../types/property';
import { saveProperty, deleteProperty } from '../services/propertyService';
import { COMPANY_INFO } from '../utils/whatsapp';
import { updateAdminPassword } from '../utils/security';

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
  const [activeTab, setActiveTab] = useState<'properties' | 'new' | 'leads' | 'security'>('properties');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'residencial' | 'comercial'>('all');

  // Inline notes editing state: propertyId -> string
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // File upload state for new property
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setNewProp((prev) => ({
            ...prev,
            images: [...(prev.images || []), dataUrl],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
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

  const handleExistingPropertyPhotoUpload = (prop: Property, files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          const updated = {
            ...prop,
            images: [...prop.images, dataUrl],
          };
          await saveProperty(updated);
          onRefreshData();
        }
      };
      reader.readAsDataURL(file);
    });
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
    if (!newProp.title || !newProp.priceFormatted) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    const propId = `brt-${Date.now()}`;
    const propertyToSave: Property = {
      ...(newProp as Property),
      id: propId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveProperty(propertyToSave);
      setCreateSuccess(true);
      onRefreshData();
      setTimeout(() => {
        setCreateSuccess(false);
        setActiveTab('properties');
      }, 1500);
    } catch (err) {
      console.error('Error creating property:', err);
      alert('Erro ao salvar no banco de dados.');
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

                      <div className="flex items-center gap-2">
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
                  <div className="flex items-center gap-2 mb-3 pb-1 border-b border-[#D4AF37]/30">
                    <Briefcase className="w-4 h-4 text-[#D4AF37]" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                      PARTE 3: CORRETOR RESPONSÁVEL (BRATU)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
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
                    className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] text-[#050B1A] text-xs font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Imóvel no Banco de Dados</span>
                  </button>
                </div>
              </form>
            </div>
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
      </div>
    </div>
  );
};
