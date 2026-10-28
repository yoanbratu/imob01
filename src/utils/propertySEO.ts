import { Property } from '../types/property';
import { COMPANY_INFO } from './whatsapp';
import { getYouTubeEmbedUrl } from './youtube';

/**
 * BRATU IMOBILIÁRIA & ADMINISTRADORA
 * Gerador de Metatags Dinâmicas & SEO Individual por Imóvel (Página de Detalhes)
 * 
 * Atualiza dinamicamente:
 * 1. <title> individual e específico
 * 2. <meta name="description"> otimizada para Google Search (150-160 caracteres)
 * 3. <meta name="keywords"> orientada a conversão e busca local
 * 4. OpenGraph tags (og:title, og:description, og:image, og:url, og:type, og:locale)
 * 5. Twitter / X Card tags (twitter:title, twitter:description, twitter:image, twitter:card)
 * 6. Metatags Geográficas (geo.placename, geo.region, geo.position, ICBM)
 * 7. Canonical URL (<link rel="canonical">) com deep-link indexável
 * 8. Schema.org JSON-LD específico do imóvel (SingleFamilyResidence / Apartment / CommercialProperty / RealEstateListing)
 */

const ORIGINAL_TITLE = 'Bratu Imobiliária e Administradora | Imóveis no Brasil, EUA e Paraguai';
const ORIGINAL_DESCRIPTION =
  'Portal oficial da Bratu Imobiliária e Administradora: Imóveis de alto padrão, coberturas no Batel, mansões, lajes corporativas e assessoria internacional em Curitiba, Miami e Asunción.';
const ORIGINAL_KEYWORDS =
  'Bratu Imobiliária, Bratu Administradora, imóveis alto padrão Curitiba, cobertura Batel, apartamentos Miami Brickell, mansões Orlando, imóveis Asunción Paraguai, lajes corporativas, compra e venda de imóveis, locação corporativa';

/**
 * Define ou atualiza uma tag <meta> no <head>
 */
function setMetaTag(selector: string, attributeName: string, attributeValue: string, content: string): void {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Define ou atualiza uma tag <link> no <head>
 */
function setLinkTag(rel: string, href: string): void {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Remove elemento do head por ID caso exista
 */
function removeHeadElement(id: string): void {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

/**
 * Extrai o valor numérico limpo do preço e a moeda
 */
function parsePriceAndCurrency(property: Property): { price: number; currency: string } {
  const formatted = property.priceFormatted || property.salePrice || property.rentPrice || '0';
  const isUSD = formatted.includes('US$') || property.country === 'Estados Unidos' || property.country === 'Paraguai';
  const numericOnly = formatted.replace(/[^0-9]/g, '');
  const price = parseFloat(numericOnly) || 0;
  return {
    price,
    currency: isUSD ? 'USD' : 'BRL',
  };
}

/**
 * Mapeia o tipo de imóvel para o schema correspondente da Schema.org
 */
function getSchemaPropertyType(type: string): string {
  switch (type) {
    case 'Casa':
      return 'SingleFamilyResidence';
    case 'Apartamento':
      return 'Apartment';
    case 'Cobertura':
      return 'Apartment'; // ou 'Residence'
    case 'Comercial':
      return 'CommercialProperty';
    case 'Terreno':
      return 'Landform';
    default:
      return 'Accommodation';
  }
}

/**
 * Gera a URL canônica individual do imóvel para indexação e compartilhamento
 */
export function getPropertyCanonicalURL(property: Property): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.bratu.com.br';
  return `${origin}/?imovel=${encodeURIComponent(property.code)}`;
}

/**
 * Aplica todas as metatags dinâmicas, OpenGraph, Twitter Cards e Schema.org
 * para o imóvel selecionado na tela de detalhes/modal.
 */
export function applyPropertySEO(property: Property): void {
  if (typeof document === 'undefined' || !property) return;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.bratu.com.br';
  const canonicalUrl = getPropertyCanonicalURL(property);
  const primaryImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : `${origin}/assets/aistudio/LOGOPNG_100042ea.png`;

  // 1. Title Tag Dinâmica Otimizada (Google Snippet padrão 50-65 chars)
  const neighborhoodPart = property.neighborhood ? ` no ${property.neighborhood}` : '';
  const statePart = property.stateOrDept ? `/${property.stateOrDept}` : '';
  const pageTitle = `${property.title} · ${property.code} | ${property.purpose} em ${property.city}${statePart} | Bratu`;
  document.title = pageTitle;

  // 2. Meta Description Otimizada (150-160 caracteres com dados reais)
  const roomsPart = property.bedrooms ? `, ${property.bedrooms} qts` : '';
  const suitesPart = property.suites ? ` (${property.suites} suítes)` : '';
  const parkingPart = property.parkingSpots ? `, ${property.parkingSpots} vagas` : '';
  const metaDescription = `${property.type} para ${property.purpose}${neighborhoodPart} em ${property.city}${statePart}. ${property.areaM2}m²${roomsPart}${suitesPart}${parkingPart}. ${property.priceFormatted}. Ref: ${property.code}. Assessoria Bratu.`;
  setMetaTag('meta[name="description"]', 'name', 'description', metaDescription);

  // 3. Meta Keywords Específicas
  const keywordsList = [
    property.code,
    property.title,
    `${property.type} em ${property.city}`,
    `${property.type} ${property.neighborhood || ''}`,
    `comprar ${property.type} ${property.city}`,
    `alugar ${property.type} ${property.city}`,
    `${property.purpose} ${property.city}`,
    'Bratu Imobiliária',
    'Bratu Administradora',
    property.country,
  ]
    .filter(Boolean)
    .join(', ');
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywordsList);

  // 4. Canonical URL
  setLinkTag('canonical', canonicalUrl);

  // 5. OpenGraph Tags (WhatsApp, Facebook, LinkedIn, Perplexity, iMessage)
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', `${property.title} (${property.code}) · ${property.priceFormatted}`);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', metaDescription);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', primaryImage);
  setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', `${property.title} - ${property.city}`);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Bratu Imobiliária e Administradora');
  setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'pt_BR');

  // 6. Twitter / X Social Card Tags
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', `${property.title} · ${property.code}`);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', metaDescription);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', primaryImage);

  // 7. Geo Tags de Localização do Imóvel
  const countryCode = property.country === 'Estados Unidos' ? 'US-FL' : property.country === 'Paraguai' ? 'PY' : 'BR-PR';
  setMetaTag('meta[name="geo.region"]', 'name', 'geo.region', countryCode);
  setMetaTag('meta[name="geo.placename"]', 'name', 'geo.placename', `${property.city}, ${property.stateOrDept || property.country}`);

  if (property.coordinates?.lat && property.coordinates?.lng) {
    setMetaTag('meta[name="geo.position"]', 'name', 'geo.position', `${property.coordinates.lat};${property.coordinates.lng}`);
    setMetaTag('meta[name="ICBM"]', 'name', 'ICBM', `${property.coordinates.lat}, ${property.coordinates.lng}`);
  }

  // 8. Schema.org JSON-LD Específico e Individual do Imóvel
  injectSinglePropertyJSONLD(property, canonicalUrl);
}

/**
 * Injeta o Script Schema.org estruturado em JSON-LD no <head> com suporte a
 * RealEstateListing, SingleFamilyResidence, Apartment e CommercialProperty
 */
function injectSinglePropertyJSONLD(property: Property, canonicalUrl: string): void {
  if (typeof document === 'undefined') return;

  const scriptId = 'schema-org-single-property-jsonld';
  let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (!scriptElement) {
    scriptElement = document.createElement('script');
    scriptElement.id = scriptId;
    scriptElement.type = 'application/ld+json';
    document.head.appendChild(scriptElement);
  }

  const { price, currency } = parsePriceAndCurrency(property);
  const specificType = getSchemaPropertyType(property.type);

  const countryCode =
    property.country === 'Estados Unidos' ? 'US' : property.country === 'Paraguai' ? 'PY' : 'BR';

  const singlePropertySchema = {
    '@context': 'https://schema.org',
    '@type': ['RealEstateListing', specificType],
    '@id': `${canonicalUrl}#listing`,
    url: canonicalUrl,
    name: property.title,
    alternateName: `${property.title} (${property.code})`,
    sku: property.code,
    identifier: property.code,
    description: property.description,
    image: property.images && property.images.length > 0 ? property.images : undefined,
    datePosted: '2025-01-01',
    category: property.type,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.areaM2,
      unitCode: 'MTK',
      unitText: 'm²',
    },
    numberOfBedrooms: property.bedrooms || 0,
    numberOfBathroomsTotal: property.bathrooms || 1,
    numberOfRooms: (property.bedrooms || 0) + (property.bathrooms || 1) + 2,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address || property.neighborhood,
      addressLocality: property.city,
      addressRegion: property.stateOrDept || '',
      postalCode: property.zipCode || '',
      addressCountry: countryCode,
    },
    geo:
      property.coordinates?.lat && property.coordinates?.lng
        ? {
            '@type': 'GeoCoordinates',
            latitude: property.coordinates.lat,
            longitude: property.coordinates.lng,
          }
        : undefined,
    offers: {
      '@type': 'Offer',
      price: price > 0 ? price : undefined,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      validFrom: '2025-01-01',
      businessFunction:
        property.purpose === 'Locação' ? 'https://schema.org/LeaseOut' : 'https://schema.org/Sell',
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: price > 0 ? price : undefined,
        priceCurrency: currency,
        valueAddedTaxIncluded: true,
      },
    },
    amenityFeature: (property.amenities || []).map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })),
    broker: {
      '@type': 'RealEstateAgent',
      name: COMPANY_INFO.name,
      legalName: 'Bratu Imobiliária e Administradora de Bens Ltda',
      telephone: COMPANY_INFO.phoneDisplay,
      email: COMPANY_INFO.email,
      url: typeof window !== 'undefined' ? window.location.origin : 'https://www.bratu.com.br',
    },
    video: property.youtubeUrl
      ? {
          '@type': 'VideoObject',
          name: `Tour em Vídeo: ${property.title}`,
          description: property.subtitle || property.description,
          thumbnailUrl: property.images?.[0] || '',
          contentUrl: property.youtubeUrl,
          embedUrl: getYouTubeEmbedUrl(property.youtubeUrl) || property.youtubeUrl,
          uploadDate: '2025-01-01',
        }
      : undefined,
  };

  scriptElement.text = JSON.stringify(singlePropertySchema, null, 2);
}

/**
 * Restaura as metatags institucionais padrão da página inicial quando a modal é fechada
 */
export function restoreInstitutionalSEO(): void {
  if (typeof document === 'undefined') return;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.bratu.com.br';

  document.title = ORIGINAL_TITLE;
  setMetaTag('meta[name="description"]', 'name', 'description', ORIGINAL_DESCRIPTION);
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', ORIGINAL_KEYWORDS);
  setLinkTag('canonical', origin + '/');

  setMetaTag('meta[property="og:title"]', 'property', 'og:title', 'Bratu Imobiliária e Administradora | Seu Imóvel, Nosso Compromisso');
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', ORIGINAL_DESCRIPTION);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', origin + '/');
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', `${origin}/assets/aistudio/LOGOPNG_100042ea.png`);
  setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', 'Bratu Imobiliária e Administradora - Logotipo Oficial');

  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', ORIGINAL_TITLE);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', ORIGINAL_DESCRIPTION);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', `${origin}/assets/aistudio/LOGOPNG_100042ea.png`);

  setMetaTag('meta[name="geo.region"]', 'name', 'geo.region', 'BR-PR; US-FL; PY-ASU');
  setMetaTag('meta[name="geo.placename"]', 'name', 'geo.placename', 'Curitiba, Miami, Asunción');

  // Remove o script de schema específico do imóvel
  removeHeadElement('schema-org-single-property-jsonld');
}

/**
 * Lê o código ou ID do imóvel a partir dos parâmetros de busca (?imovel=BRT-0101 ou ?id=...)
 * ou do hash da URL (#BRT-0101) para deep linking
 */
export function getPropertyCodeFromURL(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('imovel') || params.get('codigo') || params.get('code') || params.get('id');
    if (codeParam) return codeParam.trim();

    // Checa hash (ex: #BRT-0101)
    const hash = window.location.hash.replace('#', '').trim();
    if (hash && (hash.startsWith('BRT-') || hash.startsWith('brt-'))) {
      return hash;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Sincroniza a URL do navegador com o imóvel ativo sem recarregar a página
 */
export function syncPropertyURL(property: Property | null): void {
  if (typeof window === 'undefined') return;

  try {
    const url = new URL(window.location.href);

    if (property) {
      url.searchParams.set('imovel', property.code);
      window.history.replaceState({ propertyCode: property.code }, '', url.toString());
    } else {
      url.searchParams.delete('imovel');
      url.searchParams.delete('codigo');
      url.searchParams.delete('code');
      url.searchParams.delete('id');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + (url.hash ? url.hash : ''));
    }
  } catch {
    // ignore
  }
}
