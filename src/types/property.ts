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

export interface HomepageSegment {
  id: string; // 'segment_01' | 'segment_02'
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
  updatedAt?: string;
}

export interface HomepageSegmentsConfig {
  headerTag: string;
  headerTitle: string;
  headerDescription: string;
  segment1: HomepageSegment;
  segment2: HomepageSegment;
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
    ctaText: 'Explorar Imóveis Comerciais',
    category: 'comercial',
    footerLabel: 'Venda & Locação',
    techEffect: 'cyber-lidar',
  },
};
