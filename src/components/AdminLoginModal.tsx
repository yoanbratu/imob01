import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, X, KeyRound, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { verifyAdminPassword, getLockoutStatus } from '../utils/security';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Monitor lockout countdown
  useEffect(() => {
    if (!isOpen) return;

    const checkLock = () => {
      const status = getLockoutStatus();
      if (status.isLocked) {
        setLockoutRemaining(status.remainingSeconds);
        setError(`Acesso temporariamente bloqueado. Aguarde ${status.remainingSeconds}s.`);
      } else {
        setLockoutRemaining(0);
      }
    };

    checkLock();
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyAdminPassword(password);
      if (result.success) {
        setPassword('');
        setError('');
        onLoginSuccess();
        onClose();
      } else {
        setError(result.message || 'Senha incorreta. Acesso não autorizado.');
        if (result.isLocked && result.remainingSeconds) {
          setLockoutRemaining(result.remainingSeconds);
        }
      }
    } catch (err) {
      setError('Erro ao validar credenciais criptografadas.');
    } finally {
      setIsVerifying(false);
    }
  };

  const isLocked = lockoutRemaining > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B1A]/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#070F26] text-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden border border-[#D4AF37]/40 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tech Corner HUD Marks */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]/50 pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]/50 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]/50 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]/50 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/50 flex items-center justify-center mx-auto mb-3 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)]">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5C378] block">
            ACESSO RESTRITO & CRIPTOGRAFADO
          </span>
          <h3 className="text-xl font-bold text-white mt-1">
            Painel do Administrador
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Autenticação segura protegida por hash criptográfico SHA-256 e blindagem contra força bruta.
          </p>
        </div>

        {/* Lockout / Error Banner */}
        {error && (
          <div className={`mb-4 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
            isLocked
              ? 'bg-amber-950/70 border-amber-500/50 text-amber-200'
              : 'bg-red-950/70 border-red-500/50 text-red-200'
          }`}>
            {isLocked ? (
              <Clock className="w-4 h-4 shrink-0 text-amber-400 animate-spin" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378] mb-1.5">
              SENHA DE ADMINISTRADOR
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLocked || isVerifying}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!isLocked) setError('');
                }}
                placeholder={isLocked ? 'Bloqueado temporariamente...' : 'Digite a senha confidencial...'}
                autoFocus={!isLocked}
                className="w-full bg-[#0B163B] border border-[#D4AF37]/30 text-white rounded-xl px-4 py-3 text-xs pr-11 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={isLocked}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Guarantee Notice - Zero Plaintext Exposed */}
          <div className="p-3.5 rounded-xl bg-[#0B163B]/60 border border-[#D4AF37]/20 flex items-start gap-2.5 text-[11px] text-slate-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#D4AF37] mt-0.5" />
            <div className="leading-snug">
              <span className="font-semibold text-white block">Proteção Criptográfica Ativa</span>
              <span className="text-slate-400">
                Sessão segura com token de expiração temporária e proteção de dados confidenciais de proprietários.
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked || isVerifying}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#B8934E] hover:brightness-110 text-[#050B1A] text-xs font-bold transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <KeyRound className="w-4 h-4 text-[#050B1A]" />
            <span>{isVerifying ? 'Verificando Hash...' : isLocked ? `Aguarde ${lockoutRemaining}s` : 'Autenticar com Segurança'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
