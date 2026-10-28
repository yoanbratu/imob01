export type PropertyType = 'Casa' | 'Apartamento' | 'Cobertura' | 'Comercial' | 'Terreno';

export type PropertyPurpose = 'Venda' | 'Locação';

export type PropertyCategory = 'todos' | 'residencial' | 'comercial' | 'lancamento' | 'alto-padrao';

export type Country = 'Brasil' | 'Estados Unidos' | 'Paraguai';

export interface Property {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  purpose: PropertyPurpose;
  type: PropertyType;
  category: ('residencial' | 'comercial' | 'lancamento' | 'alto-padrao')[];
  country: Country;
  city: string;
  neighborhood: string;
  stateOrDept: string;
  address?: string; // Endereço completo (ex: Av. Batel, 1550)
  zipCode?: string; // CEP (ex: 80420-090)
  coordinates?: {
    lat: number;
    lng: number;
  };
  priceFormatted: string;
  salePrice?: string; // Valor Venda (ex: R$ 7.950.000)
  rentPrice?: string; // Valor Aluguel (ex: R$ 22.000/mês)
  iptu?: string; // IPTU (ex: R$ 850/mês ou R$ 8.900/ano)
  condoName?: string; // Nome do Condomínio / Edifício (ex: Residencial Batel Diamond)
  condoFee?: string; // Taxa / Valor do Condomínio (ex: R$ 1.600/mês)
  priceNote?: string;
  areaM2: number; // M2 Área total / privativa
  bedrooms?: number;
  suites?: number;
  bathrooms: number;
  parkingSpots?: number;
  featured: boolean;
  featuredInQuickSuggestions?: boolean; // Exibir em destaque nas sugestões rápidas de pesquisa
  youtubeUrl?: string; // Link de vídeo do YouTube (Tour Virtual do Imóvel)
  virtualTour360Url?: string; // Link de Tour Virtual 360° (Matterport, Kuula, CloudPano, etc.)
  virtualTour360Image?: string; // Foto/arquivo de imagem panorâmica 360° enviada por upload
  isNewLaunch?: boolean;
  isHighEnd?: boolean;
  images: string[];
  description: string;
  highlights: string[];
  amenities: string[];

  // Confidential Admin-Only Fields (Somente para Administrador com Senha)
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerDocument?: string; // CPF / RG / RUC
  ownerBankDetails?: string; // Dados para repasse (Banco, Agência, Conta, PIX)
  ownerMinNegotiationValue?: string; // Margem mínima de negociação autorizada
  realtorName?: string; // Corretor responsável
  realtorCreci?: string; // CRECI ou Matrícula PY
  realtorPhone?: string; // Contato direto do corretor
  realtorEmail?: string;
  realtorCommission?: string; // % ou valor acordado
  adminNotes?: string; // Observações internas do administrador
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyFilters {
  searchQuery: string;
  purpose: 'Todos' | PropertyPurpose;
  type: 'Todos' | PropertyType;
  location: string;
  category: PropertyCategory;
  priceRange: 'Todos' | 'ate-1m' | '1m-3m' | '3m-5m' | 'acima-5m';
  onlyFeatured?: boolean; // Filtro de apenas imóveis em destaque
  hasVirtualTour360?: boolean; // Filtro de imóveis com Tour Virtual 360°
}

export interface LeadSubmission {
  id?: string;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  propertyType?: string;
  propertyCode?: string;
  city?: string;
  estimatedValue?: string;
  details?: string;
  message?: string;
  createdAt?: string;
  status?: 'Novo' | 'Em Atendimento' | 'Concluído';
}

export interface Realtor {
  id: string;
  name: string;
  creci: string;
  phone: string;
  email: string;
  defaultCommission?: string;
  specialty?: string;
  active?: boolean;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyOwner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  document?: string; // CPF, CNPJ, RUC, RG ou Tax ID
  bankDetails?: string; // Banco, Agência, Conta Corrente ou Chave PIX
  minNegotiationValue?: string; // Margem ou valor mínimo autorizado
  notes?: string; // Anotações internas e confidenciais
  createdAt?: string;
  updatedAt?: string;
}

export interface Condominium {
  id: string;
  name: string; // Nome oficial do Condomínio / Edifício
  condoFee?: string; // Taxa mensal estimada, ex: R$ 1.850 / mês
  address?: string; // Endereço / Logradouro
  neighborhood?: string; // Bairro
  city?: string; // Cidade
  stateOrDept?: string; // Estado / Província
  country?: Country; // Brasil | Paraguai | Estados Unidos
  zipCode?: string; // CEP / Código Postal
  amenities?: string[]; // Piscina, Portaria 24h, Academia, etc.
  notes?: string; // Notas de zeladoria, administração ou regras
  createdAt?: string;
  updatedAt?: string;
}

export type TechEffectType = 'holo-gold' | 'cyber-lidar' | 'blueprint' | 'matrix';

export interface SegmentItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  imageBadge?: string;
  badge?: string;
  priceHint?: string;
  techEffect?: TechEffectType;
  createdAt?: string;
}

export interface HomepageSegment {
  id: string; // 'segment_01' | 'segment_02' or custom id
  segmentTag: string; // ex: 'SEGMENTO 01'
  title: string; // ex: 'Imóveis Residenciais'
  badge: string; // ex: 'ALTO PADRÃO'
  imageUrl: string;
  imageBadge: string; // ex: 'RESIDENCIAL · LUXO AUTORAL'
  description: string;
  features: string[];
  ctaText: string;
  category: PropertyCategory;
  footerLabel: string;
  techEffect?: TechEffectType;
  items?: SegmentItem[]; // Sub-cards / ofertas específicas com foto e dados completos
  updatedAt?: string;
}

export interface HomepageSegmentsConfig {
  headerTag: string;
  headerTitle: string;
  headerDescription: string;
  segment1: HomepageSegment;
  segment2: HomepageSegment;
  customSegments?: HomepageSegment[]; // Segmentos adicionais criados pelo administrador
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string; // Cargo / Função oficial
  department: string; // Departamento ou setor de atuação
  photoUrl: string;
  creci?: string; // CRECI ou Registro Profissional
  phone?: string; // Telefone / WhatsApp para contato direto
  email?: string; // E-mail corporativo
  bio?: string; // Mini-biografia e histórico profissional
  order?: number; // Ordem de exibição na lista
  active?: boolean; // Se está visível no site público
  createdAt?: string;
  updatedAt?: string;
}

export const CURATED_TECH_PHOTOS = [
  {
    name: 'Residência High-End Vidro & Céu',
    category: 'residencial',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
    description: 'Mansão contemporânea com iluminação linear e integração com natureza',
  },
  {
    name: 'Mansão Cyber-Minimalista',
    category: 'residencial',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
    description: 'Arquitetura autoral com piscina espelhada e linhas geométricas',
  },
  {
    name: 'Penthouse Noturna Panorâmica',
    category: 'residencial',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
    description: 'Cobertura com vista de 360 graus e iluminação high-tech',
  },
  {
    name: 'Edifício Corporativo Triple A',
    category: 'comercial',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80',
    description: 'Fachada em pele de vidro espelhado com acabamento corporativo premium',
  },
  {
    name: 'Torre Empresarial Futurista',
    category: 'comercial',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1400&q=80',
    description: 'Complexo corporativo com linhas de engenharia modernas e iluminação noturna',
  },
  {
    name: 'Centro Financeiro & Lajes High-Tech',
    category: 'comercial',
    url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=80',
    description: 'Arranha-céu com tecnologia sustentável e infraestrutura para multinacionais',
  },
];

export const CURATED_TEAM_AVATARS = [
  {
    name: 'Executivo Líder Terno Escuro',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Executiva Sênior Blazer Azul',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Consultor Imobiliário Internacional',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Gestora Condominial & Patrimonial',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Consultor Técnico & Avaliador',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Diretora Jurídica & Contratos',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
];

export const INITIAL_HOMEPAGE_SEGMENTS: HomepageSegmentsConfig = {
  headerTag: 'SEGMENTOS DE ATUAÇÃO ESPECIALIZADA',
  headerTitle: 'Imóveis Comerciais & Residenciais',
  headerDescription: 'Atendimento consultivo sob medida com equipes dedicadas para o mercado residencial de alto padrão e para o setor corporativo e comercial.',
  segment1: {
    id: 'segment_01',
    segmentTag: 'SEGMENTO 01',
    title: 'Imóveis Residenciais',
    badge: 'ALTO PADRÃO',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    imageBadge: 'RESIDENCIAL · LUXO AUTORAL 4K',
    description: 'Curadoria refinada de casas e mansões em condomínios fechados, coberturas panorâmicas e apartamentos de luxo nos endereços mais nobres do Brasil e do Paraguai.',
    features: [
      'Mansões em Condomínios Fechados',
      'Coberturas & Penthouses Exclusivas',
      'Apartamentos Decorados e Mobiliados',
      'Lançamentos na Planta Frente Mar',
    ],
    items: [
      {
        id: 'seg1-item-1',
        title: 'Mansões Suspensas no Ecoville',
        subtitle: 'Curitiba · 4 Suítes · 650m²',
        description: 'Conceito biofílico com bosque privativo e heliponto homologado.',
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        badge: 'EXCLUSIVIDADE BRATU',
        techEffect: 'holo-gold',
      },
      {
        id: 'seg1-item-2',
        title: 'Penthouses Panorâmicas Batel',
        subtitle: 'Curitiba · Vista 360° · 520m²',
        description: 'Piscina de borda infinita aquecida no rooftop e automação Crestron.',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        badge: 'PRONTO PARA MORAR',
        techEffect: 'blueprint',
      },
    ],
    ctaText: 'Explorar Imóveis Residenciais',
    category: 'residencial',
    footerLabel: 'Venda & Locação',
    techEffect: 'holo-gold',
  },
  segment2: {
    id: 'segment_02',
    segmentTag: 'SEGMENTO 02',
    title: 'Imóveis Comerciais',
    badge: 'CORPORATIVO',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    imageBadge: 'COMERCIAL · CORPORATE TRIPLE A',
    description: 'Soluções estratégicas para empresas, consultorias e investidores patrimoniais. Lajes corporativas, conjuntos executivos e prédios comerciais com alta taxa de ocupação e rentabilidade.',
    features: [
      'Lajes Corporativas Triple A',
      'Salas Comerciais em Centros Financeiros',
      'Ativos com Contratos de Renda Ativos',
      'Imóveis no World Trade Center & Santa Teresa',
    ],
    items: [
      {
        id: 'seg2-item-1',
        title: 'Lajes Corporativas Centro Cívico',
        subtitle: 'Curitiba · 1.200m² · Certificação LEED Gold',
        description: 'Andares inteiros com piso elevado, gerador full e controle de acesso biométrico.',
        imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
        badge: 'TRIPLE A',
        techEffect: 'cyber-lidar',
      },
      {
        id: 'seg2-item-2',
        title: 'Hub Corporativo Santa Teresa',
        subtitle: 'Asunción · Distrito Financeiro · 850m²',
        description: 'Infraestrutura internacional pronta para multinacionais e holdings.',
        imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
        badge: 'HUB INTERNACIONAL',
        techEffect: 'matrix',
      },
    ],
    ctaText: 'Explorar Imóveis Comerciais',
    category: 'comercial',
    footerLabel: 'Venda & Locação',
    techEffect: 'cyber-lidar',
  },
};

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'bratu-team-01',
    name: 'Alexandre Bratu',
    role: 'Diretor Geral & Administrador',
    department: 'Diretoria Executiva',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    creci: 'CRECI-PR 32.410 / CRA-PR 28.190',
    phone: '+55 (21) 98098-4243',
    email: 'Demy@Bratu.com.br',
    bio: 'Liderança executiva da Bratu Imobiliária & Administradora LTDA. Especialista em gestão patrimonial, estruturação de operações imobiliárias corporativas e administração de condomínios de alto padrão no Brasil e no Paraguai.',
    order: 1,
    active: true,
  },
  {
    id: 'bratu-team-02',
    name: 'Mariana Esteves Bratu',
    role: 'Diretora de Gestão de Condomínios & Patrimônio',
    department: 'Administração Condominial',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    creci: 'CRA-PR 31.045 / CRECI-PR 41.220',
    phone: '+55 (21) 98098-4243',
    email: 'mariana@bratu.com.br',
    bio: 'Responsável pela divisão de administração condominial da Bratu. Mais de 14 anos de experiência em zeladoria preventiva, prestação de contas transparente, auditoria financeira e implantação de condomínios inteligentes.',
    order: 2,
    active: true,
  },
  {
    id: 'bratu-team-03',
    name: 'Carlos M. Bogado',
    role: 'Head de Negócios Internacionais (Paraguai & EUA)',
    department: 'Ativos Internacionais & Comercial',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    creci: 'Matrícula Registro PY 45.290',
    phone: '+595 981 445 220',
    email: 'carlos.bogado@bratu.com.br',
    bio: 'Especialista em ativos comerciais e investimentos transfronteiriços. Coordena as operações imobiliárias da Bratu em Asunción (Santa Teresa, Villa Morra) e assessora investidores institucionais na Lei de Maquila.',
    order: 3,
    active: true,
  },
  {
    id: 'bratu-team-04',
    name: 'Dra. Camila Vasconcellos',
    role: 'Consultora Jurídica & Compliance Imobiliário',
    department: 'Jurídico & Contratos',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
    creci: 'OAB-PR 78.432 / Especialista Direito Imobiliário',
    phone: '+55 (21) 98098-4243',
    email: 'juridico@bratu.com.br',
    bio: 'Garantia de segurança jurídica irrepreensível em todas as transações, escrituras, convenções de condomínio e due diligence documental para aquisição e locação de imóveis no Brasil e no exterior.',
    order: 4,
    active: true,
  },
  {
    id: 'bratu-team-05',
    name: 'Henrique Albuquerque',
    role: 'Consultor Sênior Residencial · Mansões & Penthouses',
    department: 'Vendas Residencial',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    creci: 'CRECI-PR 38.910',
    phone: '+55 (21) 98098-4243',
    email: 'henrique@bratu.com.br',
    bio: 'Atendimento private banking para compradores e famílias de alta renda nos bairros Batel, Graciosa Country Club e Ecoville em Curitiba, e Balneário Camboriú.',
    order: 5,
    active: true,
  },
  {
    id: 'bratu-team-06',
    name: 'Luciana Fontes',
    role: 'Gestora de Relacionamento & Locações Corporativas',
    department: 'Locação & Corporativo',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    creci: 'CRECI-PR 44.520',
    phone: '+55 (21) 98098-4243',
    email: 'luciana@bratu.com.br',
    bio: 'Especialista em locação corporativa de lajes e conjuntos comerciais, intermediação de contratos built-to-suit e relacionamento personalizado com condôminos e inquilinos.',
    order: 6,
    active: true,
  },
];

// Google Business Review Configuration & Dispatch Templates
export interface GoogleReviewTemplate {
  id: string;
  title: string;
  description: string;
  category: 'visita' | 'compra' | 'locacao' | 'condominio' | 'curto';
  text: string;
}

export interface GoogleReviewConfig {
  reviewUrl: string;
  placeId?: string;
  businessName: string;
  averageRating: number;
  totalReviewsCount: number;
  templates: GoogleReviewTemplate[];
  updatedAt?: string;
}

export const INITIAL_GOOGLE_REVIEW_TEMPLATES: GoogleReviewTemplate[] = [
  {
    id: 'tmpl_compra_venda',
    title: 'Pós-Fechamento de Negócio (Compra / Venda)',
    description: 'Ideal para clientes que acabaram de adquirir ou vender um imóvel com a Bratu.',
    category: 'compra',
    text: `Olá {NOME}! É uma honra para toda a equipe da Bratu Imobiliária & Administradora LTDA ter participado dessa importante conquista patrimonial.

Sua opinião sobre nosso atendimento e assessoria jurídica é fundamental para nós. Poderia nos dedicar 1 minuto para nos avaliar com 5 estrelas no Google?

👉 Clique aqui para avaliar direto no Google:
{LINK}

Muito obrigado pela confiança!
Equipe Bratu Imobiliária & Administradora LTDA`,
  },
  {
    id: 'tmpl_pos_visita',
    title: 'Pós-Visita e Atendimento aos Imóveis',
    description: 'Para clientes que visitaram imóveis ou receberam consultoria de investimentos.',
    category: 'visita',
    text: `Olá {NOME}, tudo bem? Aqui é da Bratu Imobiliária & Administradora LTDA!

Foi um grande prazer lhe apresentar as opções de imóveis e investimentos. Buscamos sempre proporcionar um atendimento transparente, técnico e de excelência.

Você poderia deixar uma breve avaliação sobre a sua experiência conosco no Google? Leva menos de 1 minuto e nos ajuda bastante:

⭐ Avaliar a Bratu no Google:
{LINK}

Agradecemos imensamente pela sua atenção!`,
  },
  {
    id: 'tmpl_locacao',
    title: 'Pós-Contrato de Locação Residencial / Corporativa',
    description: 'Para proprietários e inquilinos que fecharam contrato de locação com agilidade.',
    category: 'locacao',
    text: `Prezado(a) {NOME},

Parabéns pela assinatura do contrato de locação com a Bratu Imobiliária & Administradora LTDA! Nossa missão é garantir que toda a sua jornada seja ágil, segura e tranquila.

Gostaríamos muito de contar com a sua avaliação no nosso perfil oficial do Google:

⭐ Clique para avaliar no Google:
{LINK}

Conte conosco para o que precisar durante toda a sua permanência!`,
  },
  {
    id: 'tmpl_condominio',
    title: 'Gestão Patrimonial & Administração de Condomínios',
    description: 'Para síndicos, condôminos e proprietários com imóveis sob administração contínua.',
    category: 'condominio',
    text: `Olá {NOME},

A Bratu Imobiliária & Administradora LTDA preza pela transparência e pontualidade na gestão patrimonial e administração predial.

Seu feedback no Google é essencial para mantermos nosso padrão de qualidade elevado. Poderia compartilhar sua experiência conosco?

⭐ Deixe sua avaliação no Google:
{LINK}

Agradecemos a parceria e a confiança de sempre!`,
  },
  {
    id: 'tmpl_curto',
    title: 'Mensagem Rápida & Direta (WhatsApp)',
    description: 'Mensagem objetiva para clientes ocupados que preferem rapidez.',
    category: 'curto',
    text: `Olá {NOME}! Sua opinião sobre a Bratu Imobiliária & Administradora LTDA é muito importante para nós. Se puder nos avaliar com 5 estrelas no Google, leva apenas 30 segundos:

⭐ {LINK}

Muito obrigado pelo apoio!`,
  },
];

export const INITIAL_GOOGLE_REVIEW_CONFIG: GoogleReviewConfig = {
  // Direct evaluation prompt on Google for Bratu Imobiliária & Administradora LTDA
  reviewUrl: 'https://www.google.com/search?q=avaliar+Bratu+Imobiliaria+e+Administradora+LTDA',
  placeId: '',
  businessName: 'Bratu Imobiliária & Administradora LTDA',
  averageRating: 5.0,
  totalReviewsCount: 148,
  templates: INITIAL_GOOGLE_REVIEW_TEMPLATES,
};

// ==========================================
// MULTI-ADMINISTRATOR MANAGEMENT & RBAC TYPES
// ==========================================
export type AdminRole =
  | 'Super Admin'
  | 'Gestor Imobiliário'
  | 'Gestor de Condomínios'
  | 'Consultor';

export type AdminPermission =
  | 'properties'
  | 'owners'
  | 'condos'
  | 'realtors'
  | 'team'
  | 'leads'
  | 'segments'
  | 'googleReviews'
  | 'admins';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AdminRole;
  department?: string;
  avatarUrl?: string;
  passwordHash: string; // Salted SHA-256 hash
  permissions: AdminPermission[];
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export const ALL_ADMIN_PERMISSIONS: { id: AdminPermission; label: string; description: string }[] = [
  { id: 'properties', label: 'Catálogo & Cadastro de Imóveis', description: 'Criar, editar, clonar e destacar imóveis' },
  { id: 'owners', label: 'Proprietários & Dados Bancários', description: 'Acesso a documentos, PIX e margem mínima' },
  { id: 'condos', label: 'Condomínios & Edifícios', description: 'Gerenciar taxas, endereços e lazer de condomínios' },
  { id: 'realtors', label: 'Corretores & Comissões', description: 'Gerenciar corretores parceiros e honorários' },
  { id: 'leads', label: 'Propostas & Leads de Clientes', description: 'Atender contatos e propostas recebidas' },
  { id: 'team', label: 'Equipe Bratu (Site Público)', description: 'Editar membros exibidos na seção Nossa Equipe' },
  { id: 'segments', label: 'Segmentos 01 & 02 (Capa)', description: 'Personalizar vitrines da página inicial' },
  { id: 'googleReviews', label: 'Avaliações Google & Disparo', description: 'Disparar convites de avaliação e QR Code' },
  { id: 'admins', label: 'Gestão de Administradores & Senhas', description: 'Adicionar novos administradores e alterar senhas' },
];

export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  'Super Admin': ['properties', 'owners', 'condos', 'realtors', 'team', 'leads', 'segments', 'googleReviews', 'admins'],
  'Gestor Imobiliário': ['properties', 'owners', 'condos', 'realtors', 'leads', 'googleReviews'],
  'Gestor de Condomínios': ['properties', 'owners', 'condos', 'leads', 'googleReviews'],
  'Consultor': ['properties', 'condos', 'leads', 'googleReviews'],
};

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-master-01',
    name: 'Ioan G. Bratu',
    email: 'ioangbratu@gmail.com',
    phone: '+55 (21) 98098-4243',
    role: 'Super Admin',
    department: 'Diretoria Master & Tecnologia',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    passwordHash: '03df9744d6e35c694784d7e60bd626468eb3bc3cd91d5631257c3cf4a1d11cb3',
    permissions: ['properties', 'owners', 'condos', 'realtors', 'team', 'leads', 'segments', 'googleReviews', 'admins'],
    active: true,
    notes: 'Administrador Master Principal do Sistema Bratu Imobiliária & Administradora LTDA.',
    createdAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 'admin-exec-02',
    name: 'Alexandre Bratu',
    email: 'Demy@Bratu.com.br',
    phone: '+55 (21) 98098-4243',
    role: 'Super Admin',
    department: 'Diretoria Executiva',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    passwordHash: '03df9744d6e35c694784d7e60bd626468eb3bc3cd91d5631257c3cf4a1d11cb3',
    permissions: ['properties', 'owners', 'condos', 'realtors', 'team', 'leads', 'segments', 'googleReviews', 'admins'],
    active: true,
    notes: 'Diretor Geral & Administrador Responsável.',
    createdAt: '2025-01-15T12:00:00.000Z',
  },
  {
    id: 'admin-condo-03',
    name: 'Mariana Esteves Bratu',
    email: 'mariana@bratu.com.br',
    phone: '+55 (21) 98098-4243',
    role: 'Gestor de Condomínios',
    department: 'Administração Condominial',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    passwordHash: '03df9744d6e35c694784d7e60bd626468eb3bc3cd91d5631257c3cf4a1d11cb3',
    permissions: ['properties', 'owners', 'condos', 'leads', 'googleReviews'],
    active: true,
    notes: 'Diretora de Gestão de Condomínios & Patrimônio.',
    createdAt: '2025-02-01T14:30:00.000Z',
  },
];


