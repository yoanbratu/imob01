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
