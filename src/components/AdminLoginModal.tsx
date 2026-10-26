import React, { useState, useEffect } from 'react';
import { Lock, X, ShieldCheck, AlertCircle, KeyRound, Eye, EyeOff, UserCheck, Users } from 'lucide-react';
import { verifyAdminPassword, getLockoutStatus, getCachedAdminUsers } from '../utils/security';
import { fetchAdminUsers } from '../services/propertyService';
import { AdminUser } from '../types/property';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSuccess,
}) => {
  const [selectedIdentifier, setSelectedIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [activeAdmins, setActiveAdmins] = useState<AdminUser[]>(() =>
    getCachedAdminUsers().filter((a) => a.active !== false)
  );

  useEffect(() => {
    if (!isOpen) return;
    fetchAdminUsers().then((list) => {
      setActiveAdmins(list.filter((a) => a.active !== false));
    });
    const checkLock = () => {
      const status = getLockoutStatus();
      setLockoutSeconds(status.locked ? status.remainingSeconds : 0);
    };
    checkLock();
    const timer = setInterval(checkLock, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0 || isVerifying) return;

    setIsVerifying(true);
    setError('');

    const result = await verifyAdminPassword(password, selectedIdentifier);
    setIsVerifying(false);

    if (result.success) {
      setPassword('');
      setError('');
      onLoginSuccess?.();
      onSuccess?.();
      onClose();
    } else {
      setError(
        result.error ||
          'Senha de administrador incorreta. Acesso negado aos dados confidenciais.'
      );
      const status = getLockoutStatus();
      if (status.locked) {
        setLockoutSeconds(status.remainingSeconds);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B1A]/90 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#070F26] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-[#D4AF37]/40 p-6 sm:p-8 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle High-Tech Ambient Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#0B163B] hover:bg-[#12235E] border border-white/10 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-[#D4AF37]" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="relative h-12 px-2.5 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/50 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.25)] overflow-hidden">
            <img
              src="/assets/aistudio/LOGOPNG_100042ea.png"
              alt="Bratu Imobiliária & Administradora"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo-bratu.png';
              }}
            />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5C378] block">
              CENTRAL DE COMANDO · MULTI-ADMIN
            </span>
            <h3 className="text-lg font-extrabold text-white">
              Acesso Administrativo Bratu
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          Selecione seu perfil de administrador ou insira sua credencial criptografada para gerenciar imóveis, condomínios, proprietários e equipe.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Profile Selector */}
          {activeAdmins.length > 0 && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span>PERFIL DE ADMINISTRADOR (OPCIONAL)</span>
                <span className="text-[#D4AF37]">{activeAdmins.length} ativos</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedIdentifier('')}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono transition-all cursor-pointer border flex items-center gap-1.5 ${
                    selectedIdentifier === ''
                      ? 'bg-[#0B163B] border-[#D4AF37] text-[#ECC97E] font-bold shadow-sm'
                      : 'bg-[#050B1A] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3 h-3 text-[#D4AF37]" />
                  <span>Acesso Direto</span>
                </button>
                {activeAdmins.slice(0, 4).map((adm) => {
                  const isSelected = selectedIdentifier === adm.email;
                  return (
                    <button
                      key={adm.id}
                      type="button"
                      onClick={() => setSelectedIdentifier(adm.email)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono transition-all cursor-pointer border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#0B163B] border-[#D4AF37] text-[#ECC97E] font-bold shadow-sm'
                          : 'bg-[#050B1A] border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      <UserCheck className="w-3 h-3 text-[#D4AF37]" />
                      <span className="truncate max-w-[115px]">{adm.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={selectedIdentifier}
                onChange={(e) => {
                  setSelectedIdentifier(e.target.value);
                  setError('');
                }}
                placeholder="E-mail ou nome do administrador (ou deixe em branco)..."
                className="w-full bg-[#0B163B]/70 border border-white/15 text-white placeholder-slate-500 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#E5C378] mb-1.5 font-bold">
              Senha de Administrador *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                disabled={lockoutSeconds > 0}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Digite sua senha de administrador..."
                className="w-full bg-[#0B163B] border border-[#D4AF37]/35 text-white placeholder-slate-400 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {(error || lockoutSeconds > 0) && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>
                {lockoutSeconds > 0
                  ? `Sistema bloqueado temporariamente por segurança. Aguarde ${lockoutSeconds}s para tentar novamente.`
                  : error}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={lockoutSeconds > 0 || isVerifying}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] hover:brightness-110 text-[#050B1A] font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(212,175,55,0.35)] cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-[#050B1A]" />
            <span>
              {isVerifying
                ? 'Validando Hash Criptográfico...'
                : lockoutSeconds > 0
                ? `Bloqueado (${lockoutSeconds}s)`
                : 'Entrar no Painel de Comando'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
