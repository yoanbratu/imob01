import { Property } from '../types/property';
import { COMPANY_INFO } from './whatsapp';
import { getYouTubeEmbedUrl } from './youtube';

/**
 * Builds comprehensive Schema.org JSON-LD data for Google Search and AI Knowledge Engines
 * (ChatGPT, Perplexity, Claude, Gemini, Copilot).
 */
export function buildSchemaOrgJSONLD(properties: Property[]): object[] {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-2fxulkkt5n7wmkafrqtodb-123966933238.us-west2.run.app';

  // 1. Real Estate Agency Schema (Authority & Official Brand Identity)
  const agencySchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${origin}/#agency`,
    name: COMPANY_INFO.name,
    legalName: 'Bratu Imobiliária e Administradora de Bens Ltda',
    alternateName: ['Bratu Imóveis', 'Bratu Real Estate', 'Bratu Administradora'],
    url: origin,
    logo: `${origin}/assets/aistudio/LOGOPNG_100042ea.png`,
    image: `${origin}/assets/aistudio/LOGOPNG_100042ea.png`,
    description:
      'Imobiliária e administradora de imóveis de alto padrão, especialista em compra, venda, locação e gestão patrimonial no Brasil (Curitiba, São Paulo, Balneário Camboriú), Estados Unidos (Miami, Orlando) e Paraguai (Asunción, Ciudad del Este).',
    telephone: COMPANY_INFO.phoneDisplay,
    email: COMPANY_INFO.email,
    currenciesAccepted: 'BRL, USD, PYG',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer, PIX, Wire Transfer',
    priceRange: '$$$$',
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: 'Curitiba, Paraná, Brasil',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Balneário Camboriú, Santa Catarina, Brasil',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'São Paulo, Brasil',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Miami, Flórida, Estados Unidos',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Orlando, Flórida, Estados Unidos',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Asunción, Paraguai',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Ciudad del Este, Paraguai',
      },
    ],
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: 'Av. Cândido de Abreu, 526',
        addressLocality: 'Curitiba',
        addressRegion: 'PR',
        postalCode: '80530-000',
        addressCountry: 'BR',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: '1200 Brickell Ave, Suite 1950',
        addressLocality: 'Miami',
        addressRegion: 'FL',
        postalCode: '33131',
        addressCountry: 'US',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: 'Av. Santa Teresa esq. Aviadores del Chaco',
        addressLocality: 'Asunción',
        addressCountry: 'PY',
      },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:30',
        closes: '18:30',
      },
    ],
  };

  // 2. ItemList of RealEstateListing for ALL registered properties
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${origin}/#catalog-items`,
    name: 'Catálogo de Imóveis Cadastrados · Bratu Imobiliária',
    description: `Catálogo completo com ${properties.length} imóveis comerciais e residenciais de alto padrão no Brasil, EUA e Paraguai.`,
    numberOfItems: properties.length,
    itemListElement: properties.map((prop, idx) => {
      const isRent = prop.purpose === 'Locação';
      const cleanPrice = parseFloat(prop.priceFormatted.replace(/[^0-9]/g, '')) || 0;
      const currency = prop.country === 'Estados Unidos' ? 'USD' : 'BRL';

      const listingType =
        prop.type === 'Apartamento' || prop.type === 'Cobertura'
          ? 'Apartment'
          : prop.type === 'Casa'
          ? 'SingleFamilyResidence'
          : prop.type === 'Comercial'
          ? 'CommercialBuilding'
          : 'Accommodation';

      return {
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': ['RealEstateListing', listingType],
          '@id': `${origin}/#imovel-${prop.code}`,
          identifier: prop.code,
          name: prop.title,
          alternateName: prop.subtitle,
          description: prop.description,
          url: `${origin}/#imovel-${prop.code}`,
          image: prop.images && prop.images.length > 0 ? prop.images : undefined,
          ...(prop.youtubeUrl
            ? {
                video: {
                  '@type': 'VideoObject',
                  name: `Tour em Vídeo: ${prop.title}`,
                  description: `Tour virtual completo do imóvel ${prop.title} (${prop.code})`,
                  thumbnailUrl: prop.images[0],
                  contentUrl: prop.youtubeUrl,
                  embedUrl: getYouTubeEmbedUrl(prop.youtubeUrl),
                  uploadDate: prop.createdAt || new Date().toISOString(),
                },
              }
            : {}),
          ...(prop.virtualTour360Url
            ? {
                tourBookingPage: prop.virtualTour360Url,
                subjectOf: {
                  '@type': 'VirtualLocation',
                  name: `Tour Virtual 360° Interativo - ${prop.title}`,
                  url: prop.virtualTour360Url,
                  description: `Navegação imersiva em 360 graus para o imóvel de alto padrão ${prop.title} (${prop.code})`,
                },
              }
            : {}),
          address: {
            '@type': 'PostalAddress',
            streetAddress: prop.address || prop.neighborhood,
            addressLocality: prop.city,
            addressRegion: prop.stateOrDept,
            postalCode: prop.zipCode || '80000-000',
            addressCountry:
              prop.country === 'Estados Unidos'
                ? 'US'
                : prop.country === 'Paraguai'
                ? 'PY'
                : 'BR',
          },
          ...(prop.coordinates
            ? {
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: prop.coordinates.lat,
                  longitude: prop.coordinates.lng,
                },
              }
            : {}),
          offers: {
            '@type': 'Offer',
            price: cleanPrice,
            priceCurrency: currency,
            priceValidUntil: '2027-12-31',
            availability: 'https://schema.org/InStock',
            businessFunction: isRent
              ? 'http://purl.org/goodrelations/v1#LeaseOut'
              : 'http://purl.org/goodrelations/v1#Sell',
            seller: {
              '@type': 'RealEstateAgent',
              name: COMPANY_INFO.name,
              telephone: COMPANY_INFO.phoneDisplay,
              email: COMPANY_INFO.email,
            },
          },
          floorSize: {
            '@type': 'QuantitativeValue',
            value: prop.areaM2,
            unitCode: 'MTK',
            unitText: 'm²',
          },
          numberOfBedrooms: prop.bedrooms || 0,
          numberOfBathroomsTotal: prop.bathrooms || 1,
          amenityFeature: (prop.amenities || []).map((amenity) => ({
            '@type': 'LocationFeatureSpecification',
            name: amenity,
            value: true,
          })),
        },
      };
    }),
  };

  // 3. WebSite with Site Search Action (for Google Sitemarkers and search bar)
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: origin,
    name: 'Bratu Imobiliária e Administradora',
    description: 'Portal oficial de imóveis e gestão patrimonial no Brasil, EUA e Paraguai.',
    publisher: {
      '@type': 'RealEstateAgent',
      name: COMPANY_INFO.name,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/?q={search_term_string}#imoveis`,
      'query-input': 'required name=search_term_string',
    },
  };

  // 4. FAQPage Schema (Heavily crawled and cited by ChatGPT, Perplexity, Gemini & Claude)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${origin}/#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Quais tipos de imóveis a Bratu Imobiliária comercializa e administra?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A Bratu Imobiliária e Administradora é especializada em imóveis comerciais e residenciais de alto padrão, incluindo coberturas duplex/penthouse no Batel (Curitiba), mansões, lajes corporativas, apartamentos de luxo em Miami Brickell e Orlando (EUA), além de condomínios fechados e investimentos imobiliários com segurança jurídica em Asunción e Ciudad del Este (Paraguai).',
        },
      },
      {
        '@type': 'Question',
        name: 'Como funciona o sigilo e privacidade dos dados dos proprietários na Bratu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Seguindo rigorosas diretrizes de LGPD e segurança da informação, todos os contatos diretos dos proprietários (telefones particulares, WhatsApp pessoal, e-mail e dados bancários para repasse) são mantidos sob estrito sigilo institucional, visíveis unicamente para administradores autenticados com credenciais criptográficas. O público geral é atendido diretamente pela equipe oficial da Bratu no WhatsApp +55 21 98098-4243 e e-mail Demy@Bratu.com.br.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como assistir aos tours em vídeo do YouTube dos imóveis cadastrados?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Os anúncios com tours virtuais possuem um selo "VÍDEO TOUR". Ao clicar no imóvel, o visitante pode alternar diretamente entre a galeria de fotos em alta definição e o player incorporado em 16:9 do YouTube, conhecendo cada detalhe arquitetônico em vídeo.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quais são as opções de imóveis em destaque nas sugestões rápidas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Na barra de pesquisa rápida e no menu de auto-completar da Bratu Imobiliária, os imóveis marcados em destaque pelo administrador aparecem como atalhos diretos, permitindo que o usuário ou assistente de IA consulte instantaneamente coberturas, residências contemporâneas e lajes corporativas com liquidez comprovada.',
        },
      },
    ],
  };

  return [agencySchema, itemListSchema, websiteSchema, faqSchema];
}

/**
 * Injects or updates the JSON-LD <script> tag in the document head dynamically,
 * ensuring Googlebot, GPTBot, PerplexityBot, and Bingbot receive instant, updated structured data.
 */
export function injectOrUpdateJSONLD(properties: Property[]): void {
  if (typeof document === 'undefined') return;

  const scriptId = 'schema-org-realestate-jsonld';
  let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (!scriptElement) {
    scriptElement = document.createElement('script');
    scriptElement.id = scriptId;
    scriptElement.type = 'application/ld+json';
    document.head.appendChild(scriptElement);
  }

  const schemas = buildSchemaOrgJSONLD(properties);
  scriptElement.text = JSON.stringify(schemas, null, 2);
}
