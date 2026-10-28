import React, { useState } from 'react';
import {
  Building,
  PlusCircle,
  UserCheck,
  Users,
  Inbox,
  Star,
  Sparkles,
  ShieldCheck,
  Download,
  Copy,
  Check,
  ArrowUpRight,
  Globe,
  Compass,
  Zap,
  Layers,
  MapPin,
  Phone,
  Send,
  FileCode,
} from 'lucide-react';
import {
  Property,
  LeadSubmission,
  PropertyOwner,
  Condominium,
  Realtor,
  TeamMember,
  AdminUser,
} from '../types/property';

export type AdminTabType =
  | 'overview'
  | 'properties'
  | 'new'
  | 'owners'
  | 'condos'
  | 'realtors'
  | 'team'
  | 'leads'
  | 'segments'
  | 'googleReviews'
  | 'security';

interface AdminDashboardOverviewProps {
  properties: Property[];
  leads: LeadSubmission[];
  owners: PropertyOwner[];
  condos: Condominium[];
  realtors: Realtor[];
  teamMembers: TeamMember[];
  admins: AdminUser[];
  currentAdmin: AdminUser;
  onNavigateTab: (tab: AdminTabType) => void;
  onEditProperty: (prop: Property) => void;
  onDuplicateProperty: (prop: Property) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  properties,
  leads,
  owners,
  condos,
  realtors,
  teamMembers,
  admins,
  currentAdmin,
  onNavigateTab,
  onEditProperty,
  onDuplicateProperty,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [exportFeedback, setExportFeedback] = useState(false);

  // Portfolio Metrics
  const totalProps = properties.length;
  const featuredCount = properties.filter((p) => p.featured).length;
  const residentialCount = properties.filter((p) => p.category.includes('residencial')).length;
  const commercialCount = properties.filter((p) => p.category.includes('comercial')).length;
  const saleCount = properties.filter((p) => p.purpose === 'Venda').length;
  const rentCount = properties.filter((p) => p.purpose === 'Locação').length;
  const tour360Count = properties.filter(
    (p) => Boolean(p.virtualTour360Url || p.virtualTour360Image)
  ).length;

  const brCount = properties.filter((p) => p.country === 'Brasil').length;
  const pyCount = properties.filter((p) => p.country === 'Paraguai').length;
  const usCount = properties.filter((p) => p.country === 'Estados Unidos').length;

  const activeAdminsCount = admins.filter((a) => a.active !== false).length;

  // Smart Function 1: Export Complete CSV Spreadsheet of Properties + Confidential Data
  const handleExportCSV = () => {
    const headers = [
      'Codigo',
      'Titulo',
      'Finalidade',
      'Tipo',
      'Pais',
      'Cidade',
      'Bairro',
      'Area_m2',
      'Preco_Exibido',
      'Condominio',
      'Destaque',
      'Proprietario_Confidencial',
      'Telefone_Proprietario',
      'Documento_Proprietario',
      'Corretor_Responsavel',
      'Comissao',
    ];

    const escapeCsv = (val: any) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = properties.map((p) => [
      escapeCsv(p.code),
      escapeCsv(p.title),
      escapeCsv(p.purpose),
      escapeCsv(p.type),
      escapeCsv(p.country),
      escapeCsv(p.city),
      escapeCsv(p.neighborhood),
      escapeCsv(p.areaM2),
      escapeCsv(p.priceFormatted),
      escapeCsv(p.condoName || '-'),
      escapeCsv(p.featured ? 'Sim' : 'Não'),
      escapeCsv(p.ownerName || '-'),
      escapeCsv(p.ownerPhone || '-'),
      escapeCsv(p.ownerDocument || '-'),
      escapeCsv(p.realtorName || '-'),
      escapeCsv(p.realtorCommission || '-'),
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Relatorio_Imoveis_Bratu_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportFeedback(true);
    setTimeout(() => setExportFeedback(false), 3000);
  };

  // Smart Function 2: Copy Executive Portfolio Summary for WhatsApp
  const handleCopyPortfolioSummary = () => {
    const featuredList = properties
      .filter((p) => p.featured)
      .slice(0, 6)
      .map(
        (p) =>
          `▪ *[${p.code}] ${p.title}* (${p.city}/${p.country}) — ${p.areaM2}m² · *${p.priceFormatted}*`
      )
      .join('\n');

    const text = `*BRATU IMOBILIÁRIA & ADMINISTRADORA LTDA*
📊 *Resumo Executivo do Portfólio Atualizado*

• *Total de Ativos:* ${totalProps} imóveis (${residentialCount} Residenciais | ${commercialCount} Comerciais)
• *Presença Internacional:* Brasil (${brCount}) · Paraguai (${pyCount}) · EUA (${usCount})

⭐ *Destaques Selecionados:*
${featuredList}

🌐 Solicite o dossiê completo ou agende uma apresentação exclusiva.`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="py-6 flex-1 space-y-8 animate-in fade-in duration-200">
      {/* Welcome & Smart Command Bar */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#070F26] via-[#0B163B] to-[#070F26] border border-[#D4AF37]/45 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#050B1A] border border-[#D4AF37]/40 text-[#ECC97E] text-[11px] font-mono uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>CENTRAL DE COMANDO EXECUTIVA · ALTA PERFORMANCE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Olá, <span className="text-[#ECC97E]">{currentAdmin.name}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Bem-vindo ao painel administrativo moderno da <strong>Bratu Imobiliária & Administradora</strong>. Utilize os atalhos inteligentes abaixo para cadastrar imóveis, gerenciar condomínios, adicionar novos administradores e atender clientes com facilidade.
            </p>
          </div>

          {/* 1-Click Quick Facilitators */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('new')}
              className="tech-btn-primary inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold text-[#050B1A] shadow-[0_0_25px_rgba(212,175,55,0.35)] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#050B1A]" />
              <span>+ Novo Imóvel</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('security')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#050B1A] hover:bg-[#12235E] border border-[#D4AF37]/50 text-[#ECC97E] text-xs font-mono font-bold transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>+ Novo Administrador</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('googleReviews')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#050B1A] hover:bg-[#12235E] border border-amber-400/40 text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Avaliação Google</span>
            </button>
          </div>
        </div>

        {/* Smart Productivity Tools Strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>FERRAMENTAS RÁPIDAS DE PRODUTIVIDADE:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#050B1A]/90 hover:bg-[#050B1A] border border-white/15 hover:border-[#D4AF37]/50 text-xs font-mono text-slate-200 transition-all cursor-pointer"
            >
              {exportFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Planilha CSV Baixada!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Exportar Catálogo & Proprietários (CSV/Excel)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyPortfolioSummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#050B1A]/90 hover:bg-[#050B1A] border border-white/15 hover:border-[#D4AF37]/50 text-xs font-mono text-slate-200 transition-all cursor-pointer"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Resumo Copiado para WhatsApp!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Copiar Resumo Executivo p/ WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* High-Visibility KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Properties */}
        <div
          onClick={() => onNavigateTab('properties')}
          className="group bg-[#070F26] hover:bg-[#0B163B]/80 rounded-3xl p-5 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all cursor-pointer shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase text-slate-400">
              Portfólio de Imóveis
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalProps}</span>
            <span className="text-xs font-mono text-[#ECC97E]">
              ({featuredCount} em destaque)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>🏡 {residentialCount} Resid. · 🏢 {commercialCount} Comerc.</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
        </div>

        {/* KPI 2: Condominiums & Owners */}
        <div
          onClick={() => onNavigateTab('owners')}
          className="group bg-[#070F26] hover:bg-[#0B163B]/80 rounded-3xl p-5 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all cursor-pointer shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase text-slate-400">
              Proprietários & Condomínios
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-3xl font-extrabold text-white">{owners.length}</span>
              <span className="text-xs text-slate-400 ml-1">Proprietários</span>
            </div>
            <span className="text-slate-600">|</span>
            <div>
              <span className="text-2xl font-extrabold text-[#ECC97E]">{condos.length}</span>
              <span className="text-xs text-slate-400 ml-1">Condomínios</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Venda ({saleCount}) · Locação ({rentCount})</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
        </div>

        {/* KPI 3: Leads & Proposals */}
        <div
          onClick={() => onNavigateTab('leads')}
          className="group bg-[#070F26] hover:bg-[#0B163B]/80 rounded-3xl p-5 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all cursor-pointer shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase text-slate-400">
              Propostas & Leads
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{leads.length}</span>
            <span className="text-xs font-mono text-emerald-400">contatos recebidos</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Atendimento direto no WhatsApp</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* KPI 4: Administrators & Team */}
        <div
          onClick={() => onNavigateTab('security')}
          className="group bg-[#070F26] hover:bg-[#0B163B]/80 rounded-3xl p-5 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all cursor-pointer shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase text-slate-400">
              Administradores & Equipe
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-3xl font-extrabold text-[#ECC97E]">
                {activeAdminsCount}
              </span>
              <span className="text-xs text-slate-400 ml-1">Admins Ativos</span>
            </div>
            <span className="text-slate-600">|</span>
            <div>
              <span className="text-2xl font-extrabold text-white">
                {teamMembers.length}
              </span>
              <span className="text-xs text-slate-400 ml-1">Equipe</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#E5C378] font-mono">
            <span>Gerenciar ou Adicionar Admin</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
        </div>
      </div>

      {/* Categorized Visual Navigation Directory (Easy to Understand for Any Admin) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#D4AF37]" />
              <span>Central de Módulos do Sistema (Acesso Fácil por Área)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Clique em qualquer módulo abaixo para gerenciar a respectiva área do site com total clareza.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-400 bg-[#070F26] px-3.5 py-2 rounded-xl border border-white/10">
            <Globe className="w-4 h-4 text-[#D4AF37]" />
            <span>
              BR: <strong className="text-white">{brCount}</strong> · PY:{' '}
              <strong className="text-white">{pyCount}</strong> · EUA:{' '}
              <strong className="text-white">{usCount}</strong> · Tour 360°:{' '}
              <strong className="text-cyan-400">{tour360Count}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Catálogo de Imóveis */}
          <button
            type="button"
            onClick={() => onNavigateTab('properties')}
            className="text-left p-5 rounded-3xl bg-[#070F26] hover:bg-[#0B163B]/90 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all group cursor-pointer flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:scale-105 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#E5C378]">
                  01 · PORTFÓLIO IMOBILIÁRIO
                </span>
                <span className="text-xs font-mono font-bold text-white bg-[#0B163B] px-2 py-0.5 rounded-md border border-white/10">
                  {properties.length}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white mt-0.5">
                Catálogo de Imóveis & Notas
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Visualize, edite, duplique imóveis em 1 clique, adicione fotos, vídeos do YouTube, Tour 360° e observações internas.
              </p>
            </div>
          </button>

          {/* Card 2: Administradores & Senhas */}
          <button
            type="button"
            onClick={() => onNavigateTab('security')}
            className="text-left p-5 rounded-3xl bg-gradient-to-br from-[#070F26] to-[#0B163B] hover:brightness-110 border border-[#D4AF37]/60 transition-all group cursor-pointer flex items-start gap-4 shadow-[0_0_20px_rgba(212,175,55,0.12)]"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ECC97E] to-[#D4AF37] flex items-center justify-center text-[#050B1A] shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#ECC97E] font-bold">
                  02 · GOVERNANÇA & ACESSOS
                </span>
                <span className="text-xs font-mono font-bold text-[#050B1A] bg-[#ECC97E] px-2 py-0.5 rounded-md">
                  {admins.length} Admins
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white mt-0.5">
                Administradores & Senhas
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Adicione novos administradores, escolha permissões por cargo, gere senhas individuais e envie convites via WhatsApp.
              </p>
            </div>
          </button>

          {/* Card 3: Proprietários & Condomínios */}
          <button
            type="button"
            onClick={() => onNavigateTab('condos')}
            className="text-left p-5 rounded-3xl bg-[#070F26] hover:bg-[#0B163B]/90 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all group cursor-pointer flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:scale-105 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#E5C378]">
                  03 · ADMINISTRADORA PREDIAL
                </span>
                <span className="text-xs font-mono font-bold text-white bg-[#0B163B] px-2 py-0.5 rounded-md border border-white/10">
                  {condos.length} Cond.
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white mt-0.5">
                Condomínios & Proprietários
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Gerencie edifícios, taxas condominiais, infraestrutura de lazer e fichas confidenciais de proprietários e repasses PIX.
              </p>
            </div>
          </button>

          {/* Card 4: Equipe Bratu & Corretores */}
          <button
            type="button"
            onClick={() => onNavigateTab('team')}
            className="text-left p-5 rounded-3xl bg-[#070F26] hover:bg-[#0B163B]/90 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all group cursor-pointer flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#E5C378]">
                  04 · INSTITUCIONAL & EQUIPE
                </span>
                <span className="text-xs font-mono font-bold text-white bg-[#0B163B] px-2 py-0.5 rounded-md border border-white/10">
                  {teamMembers.length} Membros
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white mt-0.5">
                Equipe Bratu & Corretores ({realtors.length})
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Gerencie os profissionais exibidos na seção pública "Nossa Equipe" e os corretores responsáveis pelas vendas e locações.
              </p>
            </div>
          </button>

          {/* Card 5: Segmentos 01 & 02 (Capa) */}
          <button
            type="button"
            onClick={() => onNavigateTab('segments')}
            className="text-left p-5 rounded-3xl bg-[#070F26] hover:bg-[#0B163B]/90 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all group cursor-pointer flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0B163B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#E5C378]">
                  05 · VITRINE DE CAPA
                </span>
                <span className="text-xs font-mono font-bold text-[#ECC97E] bg-[#0B163B] px-2 py-0.5 rounded-md border border-[#D4AF37]/30">
                  4K HUD
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white mt-0.5">
                Segmentos 01 & 02 (Página Inicial)
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Personalize fotos, efeitos tecnológicos (Holo-Gold, LIDAR, Blueprint) e sub-itens dos segmentos Residencial e Comercial.
              </p>
            </div>
          </button>

          {/* Card 6: Avaliações Google & Disparo */}
          <button
            type="button"
            onClick={() => onNavigateTab('googleReviews')}
            className="text-left p-5 rounded-3xl bg-[#070F26] hover:bg-[#0B163B]/90 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all group cursor-pointer flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0B163B] border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-amber-300">
                  06 · REPUTAÇÃO 5 ESTRELAS
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-[#0B163B] px-2 py-0.5 rounded-md border border-amber-400/30">
                  5.0 ★
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white mt-0.5">
                Disparo de Avaliações Google
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Envie convites diretos no WhatsApp dos clientes para avaliarem a Bratu no Google e baixe o QR Code oficial de balcão.
              </p>
            </div>
          </button>

          {/* Card 7: Arquivos de Indexação (Google & IAs) - Reservado aos Administradores */}
          <div className="text-left p-5 rounded-3xl bg-[#070F26] border border-[#D4AF37]/35 flex flex-col justify-between gap-4 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0B163B] border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-cyan-300 font-bold">
                    07 · SEO & INTELIGÊNCIA ARTIFICIAL
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Ativo
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-white mt-0.5">
                  Arquivos Técnicos de Indexação
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Arquivos internos de leitura direta para robôs do Google e IAs (ChatGPT, Perplexity, Claude). Ocultos do internauta na navegação pública.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
              <a
                href="/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/30 text-slate-200 hover:text-[#ECC97E] text-xs font-mono font-bold transition-all"
                title="Acessar base de conhecimento llms.txt"
              >
                <FileCode className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>llms.txt</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/30 text-slate-200 hover:text-[#ECC97E] text-xs font-mono font-bold transition-all"
                title="Acessar sitemap.xml do Google"
              >
                <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>sitemap.xml</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/30 text-slate-200 hover:text-[#ECC97E] text-xs font-mono font-bold transition-all"
                title="Acessar robots.txt"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>robots.txt</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Split: Quick Property Management & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Featured Properties Quick Access (Span 7) */}
        <div className="lg:col-span-7 bg-[#070F26] rounded-3xl border border-[#D4AF37]/30 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span>Ativos em Destaque · Edição & Clonagem Rápida</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                Edite ou duplique rapidamente um imóvel para cadastrar unidades similares
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('properties')}
              className="text-xs font-mono text-[#ECC97E] hover:underline cursor-pointer"
            >
              Ver todos ({properties.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {properties.slice(0, 4).map((prop) => (
              <div
                key={prop.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0B163B]/70 border border-white/10 hover:border-[#D4AF37]/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    className="w-14 h-12 rounded-xl object-cover border border-[#D4AF37]/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#ECC97E] bg-[#050B1A] px-1.5 py-0.5 rounded">
                        {prop.code}
                      </span>
                      <span className="text-xs font-bold text-white truncate">
                        {prop.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#D4AF37]" />
                        {prop.city}
                      </span>
                      <span>·</span>
                      <span className="text-[#ECC97E] font-mono font-semibold">
                        {prop.priceFormatted}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onDuplicateProperty(prop)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#050B1A] hover:bg-[#12235E] border border-white/15 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                    title="Clonar este imóvel para criar outro parecido rapidamente"
                  >
                    <Copy className="w-3 h-3 text-[#D4AF37]" />
                    <span>Clonar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab('properties');
                      onEditProperty(prop);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#0B163B] hover:bg-[#12235E] border border-[#D4AF37]/40 text-[#ECC97E] text-[11px] font-mono font-bold transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Leads & Contacts (Span 5) */}
        <div className="lg:col-span-5 bg-[#070F26] rounded-3xl border border-[#D4AF37]/30 p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-emerald-400" />
                  <span>Últimas Propostas & Contatos</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  Clientes que solicitaram atendimento pelo site
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('leads')}
                className="text-xs font-mono text-emerald-400 hover:underline cursor-pointer"
              >
                Abrir CRM →
              </button>
            </div>

            {leads.length > 0 ? (
              <div className="space-y-3">
                {leads.slice(0, 4).map((lead, idx) => (
                  <div
                    key={lead.id || idx}
                    className="p-3 rounded-2xl bg-[#0B163B]/70 border border-white/10 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{lead.name}</span>
                      <span className="text-[10px] font-mono text-[#ECC97E] bg-[#050B1A] px-2 py-0.5 rounded">
                        {lead.purpose || 'Contato'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1 font-mono text-emerald-400">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </span>
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-emerald-300 hover:underline flex items-center gap-1"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Responder</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 rounded-2xl bg-[#050B1A]/60 border border-dashed border-white/10 space-y-2">
                <Inbox className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-semibold">
                  Nenhuma proposta pendente no momento
                </p>
                <p className="text-[11px] text-slate-400">
                  Novos contatos enviados pelos formulários do site aparecerão automaticamente aqui em tempo real.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Sincronização em Tempo Real</span>
            <span className="text-emerald-400 font-mono">● Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
