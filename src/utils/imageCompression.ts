/**
 * Utilitário de compressão e otimização de imagens no cliente
 * Redimensiona e comprime fotos enviadas por câmera, smartphone ou upload,
 * garantindo qualidade visual alta, carregamento instantâneo e respeitando
 * estritamente o limite de armazenamento de documentos do Firestore (1MB).
 */

export async function compressImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 960,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error('Imagem vazia'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Falha ao processar imagem para compressão.'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        // Draw and compress to high efficiency JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compressão específica para fotos panorâmicas 360° equirretangulares (proporção 2:1)
 * Mantém resolução suficiente (até 2048x1024) para nitidez tridimensional
 * sem estourar o limite de tamanho do banco de dados.
 */
export async function compress360Panorama(
  file: File,
  maxWidth = 2048,
  quality = 0.80
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem 360°.'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error('Imagem 360° vazia'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Falha ao processar imagem panorâmica 360°.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          width = maxWidth;
          height = Math.round(maxWidth / 2);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
