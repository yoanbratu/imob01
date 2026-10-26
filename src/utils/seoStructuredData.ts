import { Property } from '../types/property';
import { COMPANY_INFO } from './whatsapp';
import { getYouTubeEmbedUrl } from './youtube';

/**
 * BRATU IMOBILIÁRIA & ADMINISTRADORA DE BENS LTDA
 * High-Precision Schema.org Structured Data Generator
 *
 * Conforms to Google Search Central Guidelines, Schema.org v26+,
 * and LLM / AI Search Indexing Protocols (ChatGPT, Perplexity, Claude, Gemini, Copilot).
 */

export function buildSchemaOrgJSONLD(properties: Property[]): object[] {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-dev-2fxulkkt5n7wmkafrqtodb-123966933238.us-west2.run.app';

  // 1. Real Estate Agency Schema (Authority, Google Knowledge Graph & Official Brand Identity)
  const agencySchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${origin}/#agency`,
    name: COMPANY_INFO.name,
    legalName: 'Bratu Imobiliária e Administradora de Bens Ltda',
    alternateName: ['Bratu Imóveis', 'Bratu Real Estate', 'Bratu Administradora', 'Bratu Properties'],
    url: origin,
    logo: `${origin}/assets/aistudio/LOGOPNG_100042ea.png`,
    image: `${origin}/assets/aistudio/LOGOPNG_100042ea.png`,
    description:
      'Imobiliária e administradora de imóveis de alto padrão e gestão patrimonial de excelência. Especialista em compra, venda, locação corporativa e assessoria internacional em Curitiba (PR), Balneário Camboriú (SC), São Paulo (SP), Miami (Flórida/EUA) e Asunción (Paraguai). Registrada no CRECI-PR 32.410.',
    telephone: COMPANY_INFO.phoneDisplay,
    email: COMPANY_INFO.email,
    currenciesAccepted: 'BRL, USD, PYG',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer, PIX, Wire Transfer, Escrow',
    priceRange: '$$$$',
    knowsLanguage: ['pt-BR', 'en-US', 'es-PY'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '127',
      reviewCount: '127',
    },
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
        name: 'São Paulo, São Paulo, Brasil',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Foz do Iguaçu, Paraná, Brasil',
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
        name: 'Asunción, Distrito Capital, Paraguai',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Ciudad del Este, Alto Paraná, Paraguai',
      },
    ],
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: 'Av. Cândido de Abreu, 526, Centro Cívico',
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
        streetAddress: 'Av. Santa Teresa esq. Herminio Maldonado',
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
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '09:00',
        closes: '14:00',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Portfólio de Serviços Imobiliários e Patrimoniais Bratu',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Administração de Bens Imóveis e Locação Corporativa',
            description: 'Gestão completa de locações, vistorias técnicas com fotos e vídeos, cobrança automatizada e repasses pontuais.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Intermediação de Compra e Venda de Imóveis de Alto Luxo',
            description: 'Venda consultiva de coberturas no Batel, mansões e empreendimentos com assessoria jurídica e contratual integral.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Assessoria de Investimento Imobiliário Internacional (EUA e Paraguai)',
            description: 'Estruturação de aquisições de imóveis em Miami, Orlando e Asunción com segurança jurídica, abertura de LLC e contas bancárias.',
          },
        },
      ],
    },
  };

  // 2. ItemList of RealEstateListing for ALL active announced properties
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${origin}/#catalog-items`,
    name: 'Catálogo de Imóveis Cadastrados · Bratu Imobiliária',
    description: `Catálogo oficial contendo ${properties.length} imóveis comerciais e residenciais de alto padrão anunciados no Brasil, Estados Unidos e Paraguai.`,
    numberOfItems: properties.length,
    itemListElement: properties.map((prop, idx) => {
      const isRent = prop.purpose === 'Locação';
      const cleanPrice = parseFloat(prop.priceFormatted.replace(/[^0-9]/g, '')) || 0;
      const currency = prop.country === 'Estados Unidos' ? 'USD' : prop.country === 'Paraguai' && prop.priceFormatted.includes('US$') ? 'USD' : 'BRL';

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
                  description: `Tour virtual completo e guiado do imóvel ${prop.title} (${prop.code})`,
                  thumbnailUrl: prop.images?.[0] || `${origin}/assets/aistudio/LOGOPNG_100042ea.png`,
                  contentUrl: prop.youtubeUrl,
                  embedUrl: getYouTubeEmbedUrl(prop.youtubeUrl),
                  uploadDate: prop.createdAt || '2026-01-01T00:00:00Z',
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

  // 3. WebSite with Site Search Action (for Google Search box & sitelinks)
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: origin,
    name: 'Bratu Imobiliária e Administradora',
    description: 'Portal oficial de imóveis de alto padrão e gestão patrimonial no Brasil, Estados Unidos e Paraguai.',
    publisher: {
      '@type': 'RealEstateAgent',
      name: COMPANY_INFO.name,
      logo: `${origin}/assets/aistudio/LOGOPNG_100042ea.png`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/?q={search_term_string}#imoveis`,
      'query-input': 'required name=search_term_string',
    },
  };

  // 4. BreadcrumbList Schema (Hierarchical search result paths)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: origin,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Catálogo de Imóveis',
        item: `${origin}/#imoveis`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Curitiba & Batel',
        item: `${origin}/#curitiba-batel`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Estados Unidos (Miami & Orlando)',
        item: `${origin}/#eua-miami-orlando`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Paraguai (Asunción & CDE)',
        item: `${origin}/#paraguai-asuncion`,
      },
    ],
  };

  // 5. FAQPage Schema (Heavily crawled and cited by ChatGPT, Perplexity, Gemini & Claude)
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
          text: 'A Bratu Imobiliária e Administradora é especialista em imóveis residenciais e comerciais de alto padrão, incluindo coberturas duplex/penthouse no Batel (Curitiba), mansões em condomínios fechados (como Alphaville Graciosa), lajes corporativas Triple A, residências de luxo em Miami (Brickell) e Orlando (Lake Nona nos EUA), além de investimentos imobiliários com alto rendimento e segurança jurídica em Asunción e Ciudad del Este (Paraguai).',
        },
      },
      {
        '@type': 'Question',
        name: 'Como a Bratu protege o sigilo e privacidade dos dados dos proprietários?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Em estrita conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e normas bancárias de cibersegurança, todos os dados sensíveis dos proprietários (CPF/CNPJ, números de telefone particulares, contas bancárias para repasse e margens mínimas confidenciais de negociação) são mantidos em banco de dados isolado e criptografado. Nenhum dado financeiro ou documental é exposto em consultas públicas ou acessível por robôs externos; todo o atendimento com compradores e inquilinos é conduzido com discrição pela equipe credenciada da Bratu.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como funciona o investimento e a compra de imóveis nos Estados Unidos pela Bratu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A Bratu oferece assessoria completa de ponta a ponta: seleção do imóvel em Miami (Brickell, Edgewater) ou Orlando (Lake Nona), abertura de empresa americana (LLC), abertura de conta bancária nos EUA, contratação de Title Company para fechamento seguro em escrow e gestão de locação com repasse dos rendimentos em Dólar Americano (USD).',
        },
      },
      {
        '@type': 'Question',
        name: 'Quais as vantagens tributárias e de rendimento ao investir em imóveis no Paraguai?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'O Paraguai conta com a economia mais estável do Mercosul, moeda estável (Guarani) e política tributária simplificada (o modelo 10-10-10: 10% IVA, 10% Imposto de Renda Empresarial e 10% Imposto de Renda Pessoal). Lajes corporativas e apartamentos em Asunción geram rendimentos médios de 8% a 11% ao ano em Dólar Americano, com liquidez comprovada.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como posso avaliar meu imóvel para venda ou locação com a Bratu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Basta entrar em contato pelo botão "Anunciar Meu Imóvel" ou via WhatsApp oficial +55 (21) 98098-4243. Nossos avaliadores credenciados realizam um estudo mercadológico comparativo de valor, vistoria técnica e plano de marketing com fotos profissionais, tours 360° e vídeo para máxima valorização do patrimônio.',
        },
      },
    ],
  };

  return [agencySchema, itemListSchema, websiteSchema, breadcrumbSchema, faqSchema];
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
