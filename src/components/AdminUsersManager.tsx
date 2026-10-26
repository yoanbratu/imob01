import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Users,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  Sparkles,
  Check,
  X,
  Save,
  ShieldAlert,
  Copy,
  RefreshCw,
  UserCheck,
  Building,
} from 'lucide-react';
import {
  AdminUser,
  AdminRole,
  AdminPermission,
  ALL_ADMIN_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  CURATED_TEAM_AVATARS,
} from '../types/property';
import {
  fetchAdminUsers,
  saveAdminUser,
  deleteAdminUser,
  subscribeToAdminUsers,
} from '../services/propertyService';
import {
  computeSaltedHash,
  updateAdminPassword,
  getCurrentAdminProfile,
  setCurrentAdminProfile,
} from '../utils/security';

interface AdminUsersManagerProps {
  onAdminProfileUpdated?: (profile: AdminUser) => void;
}

export const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({
  onAdminProfileUpdated,
}) => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser>(() => getCurrentAdminProfile());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all');

  // Modal state for creating / editing an Administrator
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('Gestor Imobiliário');
  const [formDepartment, setFormDepartment] = useState('Gestão Executiva & Imobiliária');
  const [formAvatarUrl, setFormAvatarUrl] = useState(CURATED_TEAM_AVATARS[0].url);
  const [formPassword, setFormPassword] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formPermissions, setFormPermissions] = useState<AdminPermission[]>(
    ROLE_DEFAULT_PERMISSIONS['Gestor Imobiliário']
  );
  const [formActive, setFormActive] = useState(true);
  const [formNotes, setFormNotes] = useState('');
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);

  // Feedback & Invite state
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [inviteModalAdmin, setInviteModalAdmin] = useState<{
    admin: AdminUser;
    plainPassword?: string;
  } | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [deleteConfirmAdmin, setDeleteConfirmAdmin] = useState<AdminUser | null>(null);

  // Master password change form state
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingMasterPwd, setIsUpdatingMasterPwd] = useState(false);
  const [masterPwdFeedback, setMasterPwdFeedback] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  useEffect(() => {
    fetchAdminUsers().then(setAdmins);
    const unsub = subscribeToAdminUsers((list) => {
      setAdmins(list);
    });
    return () => unsub();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingAdmin(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('Gestor Imobiliário');
    setFormDepartment('Gestão Executiva & Imobiliária');
    setFormAvatarUrl(CURATED_TEAM_AVATARS[0].url);
    setFormPassword('');
    setFormPermissions(ROLE_DEFAULT_PERMISSIONS['Gestor Imobiliário']);
    setFormActive(true);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (adm: AdminUser) => {
    setEditingAdmin(adm);
    setFormName(adm.name);
    setFormEmail(adm.email);
    setFormPhone(adm.phone || '');
    setFormRole(adm.role);
    setFormDepartment(adm.department || 'Diretoria Executiva');
    setFormAvatarUrl(adm.avatarUrl || CURATED_TEAM_AVATARS[0].url);
    setFormPassword(''); // Leave blank to keep current password
    setFormPermissions(adm.permissions || ROLE_DEFAULT_PERMISSIONS[adm.role]);
    setFormActive(adm.active !== false);
    setFormNotes(adm.notes || '');
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: AdminRole) => {
    setFormRole(newRole);
    setFormPermissions(ROLE_DEFAULT_PERMISSIONS[newRole]);
  };

  const handleTogglePermission = (perm: AdminPermission) => {
    setFormPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleGenerateSmartPassword = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generated = `bratu${randomNum}`;
    setFormPassword(generated);
    setShowFormPassword(true);
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setFeedback({
        type: 'error',
        message: 'Preencha o Nome Completo e o E-mail / Login do Administrador.',
      });
      return;
    }

    if (!editingAdmin && (!formPassword || formPassword.trim().length < 4)) {
      setFeedback({
        type: 'error',
        message: 'Defina uma senha inicial (mínimo 4 caracteres) para o novo administrador.',
      });
      return;
    }

    setIsSavingAdmin(true);
    setFeedback(null);

    try {
      let passwordHash = editingAdmin?.passwordHash || '';
      const plainUsed = formPassword.trim();
      if (plainUsed) {
        passwordHash = await computeSaltedHash(plainUsed);
      }

      const adminToSave: AdminUser = {
        id: editingAdmin ? editingAdmin.id : `bratu_adm_${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: formRole,
        department: formDepartment.trim(),
        avatarUrl: formAvatarUrl,
        passwordHash,
        permissions: formPermissions.length > 0 ? formPermissions : ['properties', 'leads'],
        active: formActive,
        notes: formNotes.trim(),
        createdAt: editingAdmin?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveAdminUser(adminToSave);

      // Update active session profile if editing self
      if (currentAdmin.id === adminToSave.id) {
        setCurrentAdmin(adminToSave);
        setCurrentAdminProfile(adminToSave);
        onAdminProfileUpdated?.(adminToSave);
      }

      setIsModalOpen(false);
      setFeedback({
        type: 'success',
        message: editingAdmin
          ? `Administrador "${adminToSave.name}" atualizado com sucesso!`
          : `Novo Administrador "${adminToSave.name}" cadastrado e liberado para acesso!`,
      });

      if (!editingAdmin || plainUsed) {
        setInviteModalAdmin({
          admin: adminToSave,
          plainPassword: plainUsed || undefined,
        });
      }

      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao salvar administrador.',
      });
    } finally {
      setIsSavingAdmin(false);
    }
  };

  const handleToggleActiveStatus = async (adm: AdminUser) => {
    const activeCount = admins.filter((a) => a.active !== false).length;
    if (adm.active !== false && activeCount <= 1) {
      setFeedback({
        type: 'error',
        message: 'O sistema deve manter pelo menos 1 Administrador Ativo.',
      });
      return;
    }

    const updated: AdminUser = {
      ...adm,
      active: adm.active === false ? true : false,
      updatedAt: new Date().toISOString(),
    };
    await saveAdminUser(updated);
    setFeedback({
      type: 'success',
      message: `Acesso de "${adm.name}" foi ${updated.active ? 'ATIVADO' : 'PAUSADO'}.`,
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmAdmin) return;
    if (admins.length <= 1) {
      setFeedback({
        type: 'error',
        message: 'Não é possível remover o único administrador do sistema.',
      });
      setDeleteConfirmAdmin(null);
      return;
    }
    await deleteAdminUser(deleteConfirmAdmin.id);
    setFeedback({
      type: 'success',
      message: `Administrador "${deleteConfirmAdmin.name}" removido com sucesso.`,
    });
    setDeleteConfirmAdmin(null);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSwitchActiveProfile = (adm: AdminUser) => {
    setCurrentAdmin(adm);
    setCurrentAdminProfile(adm);
    onAdminProfileUpdated?.(adm);
    setFeedback({
      type: 'success',
      message: `Sessão ativa alternada para: ${adm.name} (${adm.role})`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const buildInviteText = (adm: AdminUser, plainPwd?: string) => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bratuimoveis.com.br';
    return `Olá *${adm.name}*! Bem-vindo(a) à Central de Comando da *Bratu Imobiliária & Administradora LTDA*.

Seu perfil de Administrador foi configurado com sucesso:
👤 *Perfil / Nível:* ${adm.role}
📧 *E-mail / Login:* ${adm.email}
🔑 *Senha de Acesso:* ${plainPwd ? plainPwd : '(Sua senha cadastrada)'}

🌐 *Como acessar:*
1. Acesse o portal: ${siteUrl}
2. Clique no botão *"Área Admin"* no topo da página
3. Selecione seu nome ou digite sua senha para gerenciar o sistema.`;
  };

  const handleSendWhatsAppInvite = (adm: AdminUser, plainPwd?: string) => {
    const text = encodeURIComponent(buildInviteText(adm, plainPwd));
    const cleanPhone = (adm.phone || '').replace(/\D/g, '');
    if (cleanPhone) {
      const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
      window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const handleCopyInviteText = (adm: AdminUser, plainPwd?: string) => {
    navigator.clipboard.writeText(buildInviteText(adm, plainPwd));
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleChangeMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMasterPwdFeedback({ type: 'idle', message: '' });

    if (newPassword !== confirmPassword) {
      setMasterPwdFeedback({
        type: 'error',
        message: 'A confirmação da nova senha não confere.',
      });
      return;
    }

    setIsUpdatingMasterPwd(true);
    const res = await updateAdminPassword(currPassword, newPassword);
    setIsUpdatingMasterPwd(false);

    if (res.success) {
      setMasterPwdFeedback({ type: 'success', message: res.message });
      setCurrPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setMasterPwdFeedback({ type: 'error', message: res.message });
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.department && a.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: AdminRole) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] border-[#D4AF37] font-extrabold';
      case 'Gestor Imobiliário':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-400/50 font-bold';
      case 'Gestor de Condomínios':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-400/50 font-bold';
      default:
        return 'bg-[#0B163B] text-slate-200 border-white/20 font-semibold';
    }
  };

  return (
    <div className="py-6 flex-1 space-y-8 animate-in fade-in duration-200">
      {/* Top Hero Banner of Multi-Admin Management */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#070F26] via-[#0B163B] to-[#070F26] border border-[#D4AF37]/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#050B1A] border border-[#D4AF37]/40 text-[#ECC97E] text-[11px] font-mono uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>GOVERNANÇA DIGITAL · MULTI-ADMINISTRADORES</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gestão de Administradores & Credenciais de Acesso
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Cadastre novos administradores para a equipe da <strong>Bratu Imobiliária & Administradora</strong>, defina o cargo e as permissões de cada membro, crie senhas individuais criptografadas (SHA-256) e envie o convite de acesso direto pelo WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="tech-btn-primary inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-[#050B1A] shadow-[0_0_30px_rgba(212,175,55,0.4)] cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#050B1A]" />
              <span>+ Adicionar Novo Administrador</span>
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-[#050B1A]/80 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Total de Administradores
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-white">{admins.length}</span>
              <span className="text-[11px] text-emerald-400 font-mono">
                ({admins.filter((a) => a.active !== false).length} ativos)
              </span>
            </div>
          </div>

          <div className="bg-[#050B1A]/80 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Super Admins / Diretoria
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#ECC97E]">
                {admins.filter((a) => a.role === 'Super Admin').length}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Acesso Total</span>
            </div>
          </div>

          <div className="bg-[#050B1A]/80 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Gestores Especializados
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-cyan-400">
                {admins.filter((a) => a.role !== 'Super Admin').length}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Imóveis & Condomínios</span>
            </div>
          </div>

          <div className="bg-[#050B1A]/80 rounded-2xl p-3.5 border border-[#D4AF37]/30">
            <span className="text-[10px] font-mono uppercase text-[#E5C378] block">
              Administrador Logado Agora
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs font-bold text-white truncate">{currentAdmin.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/85 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/85 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Role Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#070F26] p-4 rounded-2xl border border-[#D4AF37]/25">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar administrador por nome, e-mail ou setor..."
            className="w-full bg-[#0B163B] border border-[#D4AF37]/25 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'Super Admin', 'Gestor Imobiliário', 'Gestor de Condomínios', 'Consultor'] as const).map(
            (role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                  roleFilter === role
                    ? 'bg-[#0B163B] border border-[#D4AF37] text-[#ECC97E]'
                    : 'bg-transparent text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {role === 'all' ? 'Todos os Perfis' : role}
              </button>
            )
          )}
        </div>
      </div>

      {/* Administrators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdmins.map((adm) => {
          const isCurrentSession = currentAdmin.id === adm.id;
          return (
            <div
              key={adm.id}
              className={`rounded-3xl bg-[#070F26] border transition-all duration-300 p-6 flex flex-col justify-between shadow-xl ${
                adm.active === false
                  ? 'border-white/10 opacity-65'
                  : isCurrentSession
                  ? 'border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.2)]'
                  : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/70'
              }`}
            >
              <div>
                {/* Top Row: Avatar + Name + Role Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={
                          adm.avatarUrl ||
                          'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={adm.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D4AF37]/50 bg-[#050B1A]"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#070F26] ${
                          adm.active !== false ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}
                        title={adm.active !== false ? 'Acesso Ativo' : 'Acesso Pausado'}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-base font-extrabold text-white">{adm.name}</h4>
                        {isCurrentSession && (
                          <span className="text-[9px] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                            Você
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 block">
                        {adm.department || 'Gestão Executiva'}
                      </span>
                      <span
                        className={`inline-block mt-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-lg border ${getRoleBadgeColor(
                          adm.role
                        )}`}
                      >
                        {adm.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact & Login Info */}
                <div className="p-3.5 rounded-2xl bg-[#0B163B]/70 border border-white/10 space-y-2 text-xs mb-4">
                  <div className="flex items-center gap-2 text-slate-200">
                    <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span className="font-mono truncate">{adm.email}</span>
                  </div>
                  {adm.phone && (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-mono">{adm.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span className="font-mono">Senha Criptografada (SHA-256 Ativo)</span>
                  </div>
                </div>

                {/* Enabled Permissions Pills */}
                <div className="mb-4">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                    Módulos Liberados ({(adm.permissions || []).length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(adm.permissions || []).map((permId) => {
                      const found = ALL_ADMIN_PERMISSIONS.find((p) => p.id === permId);
                      return (
                        <span
                          key={permId}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#050B1A] border border-[#D4AF37]/25 text-[#E5C378]"
                        >
                          {found ? found.label.split('&')[0].trim() : permId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(adm)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/40 text-[#ECC97E] text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Editar / Senha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInviteModalAdmin({ admin: adm })}
                    className="py-2 px-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Enviar instruções de acesso por WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Credenciais</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmAdmin(adm)}
                    className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900 border border-red-500/30 text-red-400 hover:text-white transition-colors cursor-pointer"
                    title="Remover Administrador"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleToggleActiveStatus(adm)}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      adm.active !== false
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950'
                        : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-950'
                    }`}
                  >
                    {adm.active !== false ? '● Acesso Ativo (Pausar)' : '○ Acesso Pausado (Ativar)'}
                  </button>

                  {!isCurrentSession && adm.active !== false && (
                    <button
                      type="button"
                      onClick={() => handleSwitchActiveProfile(adm)}
                      className="text-[11px] font-mono text-[#D4AF37] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Assumir Perfil</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Master Password & Cryptographic Security Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-white/10">
        <div className="lg:col-span-7 bg-[#070F26] rounded-3xl border border-[#D4AF37]/35 p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#D4AF37]/25">
            <KeyRound className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h4 className="text-base font-extrabold text-white">
                Alterar Senha Master Geral do Sistema
              </h4>
              <p className="text-[11px] text-slate-400">
                A senha master permite o acesso rápido da diretoria a qualquer momento.
              </p>
            </div>
          </div>

          {masterPwdFeedback.type !== 'idle' && (
            <div
              className={`mb-5 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                masterPwdFeedback.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : 'bg-red-950/70 border-red-500/50 text-red-200'
              }`}
            >
              {masterPwdFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{masterPwdFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleChangeMasterPassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  SENHA ATUAL *
                </label>
                <input
                  type="password"
                  required
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  placeholder="Senha atual..."
                  className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  NOVA SENHA MASTER *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres..."
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
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isUpdatingMasterPwd}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] text-[#050B1A] text-xs font-extrabold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#050B1A]" />
                <span>
                  {isUpdatingMasterPwd
                    ? 'Criptografando e Atualizando...'
                    : 'Atualizar Senha Master'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Architecture Pillars */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-[#070F26] p-4 rounded-2xl border border-[#D4AF37]/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white font-mono uppercase">
                Criptografia Individual SHA-256
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                Cada administrador possui sua própria senha protegida com Salt Criptográfico. Nenhuma senha fica exposta em texto aberto.
              </p>
            </div>
          </div>

          <div className="bg-[#070F26] p-4 rounded-2xl border border-[#D4AF37]/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white font-mono uppercase">
                Bloqueio Automático Anti-Invasão
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                Proteção ativa contra tentativas repetidas de adivinhação de senha, bloqueando temporariamente o terminal após 5 erros.
              </p>
            </div>
          </div>

          <div className="bg-[#070F26] p-4 rounded-2xl border border-[#D4AF37]/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white font-mono uppercase">
                Sigilo Bancário e Patrimonial
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                Dados de proprietários (CPF, RUC, PIX e margem mínima de negociação) ficam 100% ocultos do público e restritos aos administradores.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: CREATE OR EDIT ADMINISTRATOR */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050B1A]/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[92vh] bg-[#070F26] text-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] border border-[#D4AF37]/50 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-[#050B1A] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    {editingAdmin
                      ? `Editar Administrador · ${editingAdmin.name}`
                      : 'Cadastrar Novo Administrador'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configure os dados de acesso, cargo e permissões de gerenciamento no painel.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#070F26] hover:bg-[#0B163B] border border-white/10 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAdmin} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Avatar Selector */}
              <div className="p-4 rounded-2xl bg-[#0B163B]/60 border border-[#D4AF37]/25 space-y-3">
                <div className="flex items-center gap-4">
                  <img
                    src={formAvatarUrl}
                    alt="Avatar"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D4AF37]"
                  />
                  <div className="flex-1">
                    <label className="block text-[11px] font-mono text-[#E5C378] font-bold uppercase mb-1">
                      Foto de Perfil / Avatar do Administrador
                    </label>
                    <input
                      type="url"
                      value={formAvatarUrl}
                      onChange={(e) => setFormAvatarUrl(e.target.value)}
                      placeholder="URL da foto ou escolha um avatar abaixo..."
                      className="w-full bg-[#050B1A] border border-white/15 text-white rounded-xl px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">Sugestões:</span>
                  {CURATED_TEAM_AVATARS.map((av, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormAvatarUrl(av.url)}
                      className={`p-0.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                        formAvatarUrl === av.url
                          ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-8 h-8 rounded-lg object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 font-bold">
                    NOME COMPLETO DO ADMINISTRADOR *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Dr. Roberto ou Fernanda Bratu"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/35 text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#E5C378] mb-1 font-bold">
                    E-MAIL CORPORATIVO / LOGIN *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Ex: fernanda@bratu.com.br"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/35 text-white rounded-xl px-3.5 py-2.5 text-xs font-mono focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Phone & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    WHATSAPP (PARA RECEBER CREDENCIAIS)
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Ex: +55 (21) 98098-4243"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-emerald-400 font-mono rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    SETOR / DEPARTAMENTO
                  </label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="Ex: Diretoria Executiva / Gestão de Condomínios"
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Role & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#050B1A] border border-[#D4AF37]/30">
                <div>
                  <label className="block text-[11px] font-mono text-[#E5C378] mb-1 font-bold">
                    NÍVEL DE ACESSO / CARGO *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
                    className="w-full bg-[#0B163B] border border-[#D4AF37]/40 text-white rounded-xl px-3 py-2.5 text-xs font-bold cursor-pointer"
                  >
                    <option value="Super Admin">Super Admin (Diretoria / Acesso Total)</option>
                    <option value="Gestor Imobiliário">Gestor Imobiliário (Imóveis, Proprietários & Leads)</option>
                    <option value="Gestor de Condomínios">Gestor de Condomínios (Condomínios & Locações)</option>
                    <option value="Consultor">Consultor / Editor (Catálogo & Atendimento)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-[#E5C378] font-bold">
                      {editingAdmin ? 'NOVA SENHA (OPCIONAL)' : 'SENHA DE ACESSO *'}
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSmartPassword}
                      className="text-[10px] font-mono text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Gerar Senha</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      required={!editingAdmin}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={
                        editingAdmin
                          ? 'Deixe em branco para manter a atual...'
                          : 'Digite a senha deste administrador...'
                      }
                      className="w-full bg-[#0B163B] border border-[#D4AF37]/40 text-white rounded-xl pl-3.5 pr-9 py-2.5 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showFormPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Granular Module Permissions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-mono text-[#E5C378] font-bold uppercase">
                    Permissões e Módulos Liberados para este Administrador:
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormPermissions(ALL_ADMIN_PERMISSIONS.map((p) => p.id))
                    }
                    className="text-[10px] font-mono text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    Marcar Todos
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_ADMIN_PERMISSIONS.map((perm) => {
                    const checked = formPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          checked
                            ? 'bg-[#0B163B] border-[#D4AF37]/60 text-white'
                            : 'bg-[#050B1A] border-white/10 text-slate-400 hover:border-white/25'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                            checked
                              ? 'bg-[#D4AF37] border-[#D4AF37] text-[#050B1A]'
                              : 'border-white/30'
                          }`}
                        >
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold block leading-tight">
                            {perm.label}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {perm.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B163B]/50 border border-white/10">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Status da Conta do Administrador
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Administradores ativos podem fazer login imediatamente no painel.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-5 h-5 accent-[#D4AF37] cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingAdmin}
                  className="tech-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold text-[#050B1A] cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-[#050B1A]" />
                  <span>
                    {isSavingAdmin
                      ? 'Criptografando e Salvando...'
                      : editingAdmin
                      ? 'Salvar Alterações do Administrador'
                      : 'Concluir Cadastro do Administrador'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WHATSAPP CREDENTIALS DISPATCH */}
      {inviteModalAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B1A]/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setInviteModalAdmin(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#070F26] text-white rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/50 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    Enviar Acesso para {inviteModalAdmin.admin.name}
                  </h4>
                  <span className="text-xs text-slate-400">
                    Envie as instruções de login pelo WhatsApp ou copie o convite
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalAdmin(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/15 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {buildInviteText(inviteModalAdmin.admin, inviteModalAdmin.plainPassword)}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  handleSendWhatsAppInvite(
                    inviteModalAdmin.admin,
                    inviteModalAdmin.plainPassword
                  )
                }
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar via WhatsApp Agora</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleCopyInviteText(
                    inviteModalAdmin.admin,
                    inviteModalAdmin.plainPassword
                  )
                }
                className="py-3 px-4 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/40 text-[#ECC97E] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedInvite ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirmAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B1A]/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setDeleteConfirmAdmin(null)}
        >
          <div
            className="relative w-full max-w-md bg-[#070F26] text-white rounded-3xl p-6 border border-red-500/50 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-extrabold text-white">
              Remover Administrador?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja revogar o acesso e remover{' '}
              <strong className="text-white">{deleteConfirmAdmin.name}</strong> (
              {deleteConfirmAdmin.email}) da lista de administradores?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAdmin(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-900 hover:bg-red-800 text-white border border-red-500/50 cursor-pointer"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
