import React, { useState } from 'react';
import {
  Users,
  Shield,
  Phone,
  Mail,
  Award,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Building2,
  ChevronRight,
  Edit,
  X,
  FileCheck,
} from 'lucide-react';
import { TeamMember, INITIAL_TEAM_MEMBERS } from '../types/property';
import { TechImage } from './TechImage';

interface TeamSectionProps {
  teamMembers?: TeamMember[];
  isAdmin?: boolean;
  onOpenAdminTeam?: () => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  teamMembers = INITIAL_TEAM_MEMBERS,
  isAdmin = false,
  onOpenAdminTeam,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);

  const activeMembers = (teamMembers && teamMembers.length > 0 ? teamMembers : INITIAL_TEAM_MEMBERS)
    .filter((m) => m.active !== false);

  const departments = Array.from(
    new Set(activeMembers.map((m) => m.department).filter(Boolean))
  );

  const filteredMembers = selectedDept === 'all'
    ? activeMembers
    : activeMembers.filter((m) => m.department === selectedDept);

  const formatWhatsAppUrl = (phone?: string, name?: string) => {
    if (!phone) return '#';
    const digitsOnly = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá, ${name || 'Equipe Bratu'}! Gostaria de falar sobre os serviços da Bratu Imobiliária & Administradora LTDA.`
    );
    return `https://wa.me/${digitsOnly}?text=${message}`;
  };

  return (
    <section id="equipe" className="py-24 bg-[#050B1A] text-white border-b border-[#D4AF37]/20 relative overflow-hidden">
      {/* Background Tech Elements */}
      <div className="absolute inset-0 tech-grid-pattern opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-[#D4AF37] mb-3 px-4 py-1.5 rounded-full bg-[#070F26] border border-[#D4AF37]/35 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>BRATU IMOBILIÁRIA & ADMINISTRADORA LTDA</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Nossa Equipe de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#ECC97E]">
              Especialistas
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed font-sans">
            Profissionais multidisciplinares dedicados à gestão de condomínios, consultoria patrimonial de alto padrão, due diligence jurídica e comercialização de ativos corporativos e residenciais no Brasil e no Paraguai.
          </p>

          {/* Admin Direct Action */}
          {isAdmin && onOpenAdminTeam && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={onOpenAdminTeam}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/60 text-[#E5C378] text-xs font-mono font-bold transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Gerenciar Equipe no Painel (Criar, Editar, Excluir)</span>
              </button>
            </div>
          )}

          {/* Department Filter Pills */}
          {departments.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              <button
                type="button"
                onClick={() => setSelectedDept('all')}
                className={`px-4 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                  selectedDept === 'all'
                    ? 'bg-[#D4AF37] text-[#050B1A] font-bold shadow-md'
                    : 'bg-[#070F26] text-slate-300 border border-white/10 hover:border-[#D4AF37]/40'
                }`}
              >
                Todos os Setores ({activeMembers.length})
              </button>
              {departments.map((dept) => {
                const count = activeMembers.filter((m) => m.department === dept).length;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                      selectedDept === dept
                        ? 'bg-[#D4AF37] text-[#050B1A] font-bold shadow-md'
                        : 'bg-[#070F26] text-slate-300 border border-white/10 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    {dept} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="group rounded-3xl bg-[#070F26] border border-[#D4AF37]/30 hover:border-[#D4AF37]/90 hover:shadow-[0_20px_45px_rgba(212,175,55,0.18)] transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
            >
              {/* Tech Reticle Corners */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none" />
              <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none" />

              <div>
                {/* Photo with Tech Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#0B163B] border-b border-[#D4AF37]/25">
                  <TechImage
                    src={member.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80'}
                    alt={member.name}
                    aspectClass="aspect-[4/3]"
                    badge={member.department || 'Bratu Staff'}
                    techEffect="holo-gold"
                    allowEffectToggle={false}
                    showTechHud={true}
                    onClick={() => setViewingMember(member)}
                  />

                  {/* Status Indicator */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#050B1A]/85 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>EQUIPE BRATU</span>
                  </div>
                </div>

                {/* Member Information */}
                <div className="p-6">
                  {/* Department Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5C378] bg-[#0B163B] px-2.5 py-0.5 rounded-md border border-[#D4AF37]/30">
                      {member.department}
                    </span>
                    {member.creci && (
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <FileCheck className="w-3 h-3 text-[#D4AF37]" />
                        <span>{member.creci}</span>
                      </span>
                    )}
                  </div>

                  {/* Name & Role */}
                  <h3 className="text-xl font-black text-white group-hover:text-[#ECC97E] transition-colors tracking-tight">
                    {member.name}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-[#D4AF37] mt-0.5">
                    {member.role}
                  </p>

                  {/* Bio Preview */}
                  {member.bio && (
                    <p className="text-slate-300 text-xs mt-3 line-clamp-3 leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-6 pt-0 border-t border-white/5 mt-4 space-y-2.5">
                <div className="grid grid-cols-2 gap-2 pt-3">
                  {member.phone ? (
                    <a
                      href={formatWhatsAppUrl(member.phone, member.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="px-3 py-2 rounded-xl bg-[#0B163B] border border-white/10 text-slate-500 text-xs font-mono"
                    >
                      Sem Telefone
                    </button>
                  )}

                  {member.email ? (
                    <a
                      href={`mailto:${member.email}?subject=${encodeURIComponent('Contato via Site Bratu Imobiliária & Administradora')}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-white/20 hover:border-[#D4AF37] text-slate-200 text-xs font-bold transition-all"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>E-mail</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setViewingMember(member)}
                      className="px-3 py-2 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-white/20 text-slate-200 text-xs font-mono"
                    >
                      Ver Perfil
                    </button>
                  )}
                </div>

                {member.bio && (
                  <button
                    type="button"
                    onClick={() => setViewingMember(member)}
                    className="w-full text-center text-[11px] font-mono text-slate-400 hover:text-[#ECC97E] transition-colors py-1 cursor-pointer"
                  >
                    Ver perfil completo & trajetória &rarr;
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Corporate Trust Banner */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#070F26] via-[#0B163B] to-[#070F26] border border-[#D4AF37]/35 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] text-[#050B1A] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E5C378] block">
                ATENDIMENTO INSTITUCIONAL SOB DEMANDA
              </span>
              <h4 className="text-lg sm:text-xl font-extrabold text-white">
                Bratu Imobiliária & Administradora LTDA
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Agende uma reunião presencial em nossa sede no Centro Cívico (Curitiba) ou uma videoconferência com nossos diretores para consultoria patrimonial e gestão de condomínios.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/5521980984243?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20reuni%C3%A3o%20com%20a%20diretoria%20da%20Bratu%20Imobili%C3%A1ria."
              target="_blank"
              rel="noopener noreferrer"
              className="tech-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-[#050B1A] transition-all cursor-pointer shadow-lg"
            >
              <MessageCircle className="w-4 h-4 text-[#050B1A]" />
              <span>Agendar Reunião com a Diretoria</span>
            </a>
          </div>
        </div>
      </div>

      {/* FULL BIO & PROFILE MODAL */}
      {viewingMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B1A]/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setViewingMember(null)}
        >
          <div
            className="relative w-full max-w-xl bg-[#070F26] text-white rounded-3xl border border-[#D4AF37]/60 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-[#050B1A]">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C378]">
                  Perfil Profissional · Bratu Imobiliária
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingMember(null)}
                className="w-8 h-8 rounded-full bg-[#0B163B] hover:bg-[#12235E] border border-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start gap-4">
                <img
                  src={viewingMember.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80'}
                  alt={viewingMember.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4AF37]/50 shadow-md shrink-0"
                />
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#E5C378] bg-[#0B163B] px-2.5 py-0.5 rounded-md border border-[#D4AF37]/30 inline-block mb-1">
                    {viewingMember.department}
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {viewingMember.name}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-[#D4AF37]">
                    {viewingMember.role}
                  </p>
                  {viewingMember.creci && (
                    <p className="text-xs font-mono text-slate-300 mt-1 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{viewingMember.creci}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="p-4 rounded-2xl bg-[#0B163B]/70 border border-white/10">
                <h5 className="text-xs font-mono font-bold text-[#E5C378] uppercase mb-2">
                  Histórico Profissional & Especialidades
                </h5>
                <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {viewingMember.bio || 'Profissional atuante na Bratu Imobiliária & Administradora LTDA.'}
                </p>
              </div>

              {/* Contacts */}
              <div className="space-y-2">
                {viewingMember.phone && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#050B1A] border border-white/10 text-xs">
                    <span className="font-mono text-slate-400 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Telefone / WhatsApp:</span>
                    </span>
                    <a
                      href={formatWhatsAppUrl(viewingMember.phone, viewingMember.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-bold text-emerald-400 hover:underline"
                    >
                      {viewingMember.phone}
                    </a>
                  </div>
                )}

                {viewingMember.email && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#050B1A] border border-white/10 text-xs">
                    <span className="font-mono text-slate-400 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>E-mail Corporativo:</span>
                    </span>
                    <a
                      href={`mailto:${viewingMember.email}`}
                      className="font-mono text-slate-200 hover:text-[#ECC97E] hover:underline"
                    >
                      {viewingMember.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#050B1A] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewingMember(null)}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
              >
                Fechar
              </button>
              {viewingMember.phone && (
                <a
                  href={formatWhatsAppUrl(viewingMember.phone, viewingMember.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tech-btn-primary inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-[#050B1A]"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#050B1A]" />
                  <span>Iniciar Conversa no WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
