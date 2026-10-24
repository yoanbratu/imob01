/**
 * Utilitários para detecção, formatação e incorporação de Tours Virtuais 360°
 * Suporta plataformas líderes de mercado: Matterport 3D, Kuula, CloudPano,
 * Momento360, YouTube 360°, Google Street View e URLs de iframes imersivos.
 */

export interface VirtualTour360Info {
  isValid: boolean;
  embedUrl: string | null;
  provider: 'Matterport 3D' | 'Kuula 360°' | 'CloudPano' | 'Momento360' | 'Google Street View' | 'YouTube 360°' | 'Tour Virtual 360°';
  originalUrl: string;
}

/**
 * Valida se uma string é uma URL válida para tour virtual 360°
 */
export function isValid360Url(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 10) return false;
  
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
export function detect360Provider(url: string): VirtualTour360Info['provider'] {
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

  // 1. Matterport: https://my.matterport.com/show/?m=xxxxxxxx
  if (trimmed.includes('matterport.com')) {
    try {
      const parsed = new URL(trimmed);
      const modelId = parsed.searchParams.get('m');
      if (modelId) {
        return `https://my.matterport.com/show/?m=${modelId}&play=1&qs=1&brand=0&title=0&hl=1`;
      }
      // Se já for uma URL direta do show/
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
      // Fallback regex
      const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      videoId = match ? match[1] : null;
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    }
  }

  // 6. Generic / Outros visualizadores 360° com HTTPS
  return trimmed;
}

/**
 * Retorna dados consolidados sobre o Tour 360° para componentes React
 */
export function parse360Tour(url: string | null | undefined): VirtualTour360Info {
  if (!url || !isValid360Url(url)) {
    return {
      isValid: false,
      embedUrl: null,
      provider: 'Tour Virtual 360°',
      originalUrl: url || '',
    };
  }

  return {
    isValid: true,
    embedUrl: get360EmbedUrl(url),
    provider: detect360Provider(url),
    originalUrl: url.trim(),
  };
}
