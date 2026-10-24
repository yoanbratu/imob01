/**
 * Utilitários para detecção, formatação e renderização de Tours Virtuais 360°
 * Suporta:
 * 1. Upload de Imagem Panorâmica 360° direta (Data URL ou link de foto equirretangular).
 * 2. Plataformas líderes de mercado: Matterport 3D, Kuula, CloudPano, Momento360, YouTube 360°.
 */

export interface VirtualTour360Info {
  isValid: boolean;
  mode: 'panorama' | 'iframe' | 'none';
  imageSource: string | null;
  embedUrl: string | null;
  provider: 'Foto Panorâmica 360°' | 'Matterport 3D' | 'Kuula 360°' | 'CloudPano' | 'Momento360' | 'Google Street View' | 'YouTube 360°' | 'Tour Virtual 360°';
  originalUrl: string;
}

/**
 * Detecta se uma string representa uma imagem (Data URL ou URL de imagem)
 */
export function is360ImageSource(source: string | null | undefined): boolean {
  if (!source || typeof source !== 'string') return false;
  const trimmed = source.trim();
  if (trimmed.startsWith('data:image/')) return true;

  const lower = trimmed.toLowerCase();
  // Check extension before query params
  const cleanUrl = lower.split('?')[0];
  if (
    cleanUrl.endsWith('.jpg') ||
    cleanUrl.endsWith('.jpeg') ||
    cleanUrl.endsWith('.png') ||
    cleanUrl.endsWith('.webp') ||
    cleanUrl.endsWith('.avif')
  ) {
    return true;
  }

  // Cloud/CDN image patterns
  if (
    lower.includes('images.unsplash.com') ||
    lower.includes('res.cloudinary.com') ||
    lower.includes('firebasestorage.googleapis.com') ||
    lower.includes('storage.googleapis.com')
  ) {
    // If not a tour host
    if (!lower.includes('matterport') && !lower.includes('kuula') && !lower.includes('cloudpano')) {
      return true;
    }
  }

  return false;
}

/**
 * Valida se uma string é uma URL válida
 */
export function isValid360Url(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 5) return false;
  if (trimmed.startsWith('data:image/')) return true;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Detecta a plataforma/provedor do Tour Virtual 360°
 */
export function detect360Provider(url: string, isImage: boolean = false): VirtualTour360Info['provider'] {
  if (isImage || is360ImageSource(url)) return 'Foto Panorâmica 360°';
  if (!url) return 'Tour Virtual 360°';

  const lower = url.toLowerCase();
  if (lower.includes('matterport.com')) return 'Matterport 3D';
  if (lower.includes('kuula.co')) return 'Kuula 360°';
  if (lower.includes('cloudpano.com')) return 'CloudPano';
  if (lower.includes('momento360.com')) return 'Momento360';
  if (lower.includes('google.com/maps') || lower.includes('goo.gl/maps')) return 'Google Street View';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'YouTube 360°';

  return 'Tour Virtual 360°';
}

/**
 * Converte URLs normais de tours 360 em URLs prontas para iframe com parâmetros imersivos
 */
export function get360EmbedUrl(url: string | null | undefined): string | null {
  if (!url || !isValid360Url(url)) return null;
  const trimmed = url.trim();

  // Se for imagem direta, não usa iframe
  if (is360ImageSource(trimmed)) return null;

  // 1. Matterport: https://my.matterport.com/show/?m=xxxxxxxx
  if (trimmed.includes('matterport.com')) {
    try {
      const parsed = new URL(trimmed);
      const modelId = parsed.searchParams.get('m');
      if (modelId) {
        return `https://my.matterport.com/show/?m=${modelId}&play=1&qs=1&brand=0&title=0&hl=1`;
      }
      if (trimmed.includes('/show/')) {
        const joiner = trimmed.includes('?') ? '&' : '?';
        return `${trimmed}${joiner}play=1&qs=1&brand=0`;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  // 2. Kuula: https://kuula.co/share/xxxx ou https://kuula.co/post/xxxx
  if (trimmed.includes('kuula.co')) {
    try {
      const match = trimmed.match(/kuula\.co\/(share|post)\/([a-zA-Z0-9_-]+)/);
      if (match && match[2]) {
        return `https://kuula.co/share/${match[2]}?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1`;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  // 3. Momento360: https://momento360.com/e/u/xxxx
  if (trimmed.includes('momento360.com')) {
    if (trimmed.includes('/e/u/')) return trimmed;
    return trimmed.replace('momento360.com/u/', 'momento360.com/e/u/');
  }

  // 4. CloudPano: https://app.cloudpano.com/tours/xxxx
  if (trimmed.includes('cloudpano.com')) {
    return trimmed;
  }

  // 5. YouTube 360
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    let videoId: string | null = null;
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname.includes('youtu.be')) {
        videoId = parsed.pathname.slice(1);
      } else if (parsed.searchParams.has('v')) {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.includes('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1];
      }
    } catch {
      const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      videoId = match ? match[1] : null;
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    }
  }

  // 6. Generic visualizadores 360°
  return trimmed;
}

/**
 * Retorna dados consolidados sobre o Tour 360° para componentes React
 */
export function parse360Tour(
  url: string | null | undefined,
  uploadedImage?: string | null | undefined
): VirtualTour360Info {
  // 1. Prioridade para imagem enviada diretamente por upload (Data URL ou URL de imagem)
  if (uploadedImage && (uploadedImage.startsWith('data:image/') || is360ImageSource(uploadedImage))) {
    return {
      isValid: true,
      mode: 'panorama',
      imageSource: uploadedImage,
      embedUrl: null,
      provider: 'Foto Panorâmica 360°',
      originalUrl: uploadedImage,
    };
  }

  // 2. Se a URL fornecida for diretamente uma imagem
  if (url && is360ImageSource(url)) {
    return {
      isValid: true,
      mode: 'panorama',
      imageSource: url.trim(),
      embedUrl: null,
      provider: 'Foto Panorâmica 360°',
      originalUrl: url.trim(),
    };
  }

  // 3. Se for uma URL externa de plataforma 360 (Matterport, Kuula, etc.)
  if (url && isValid360Url(url)) {
    return {
      isValid: true,
      mode: 'iframe',
      imageSource: null,
      embedUrl: get360EmbedUrl(url),
      provider: detect360Provider(url),
      originalUrl: url.trim(),
    };
  }

  return {
    isValid: false,
    mode: 'none',
    imageSource: null,
    embedUrl: null,
    provider: 'Tour Virtual 360°',
    originalUrl: url || '',
  };
}
