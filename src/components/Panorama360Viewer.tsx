import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Compass,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  HelpCircle,
} from 'lucide-react';

interface Panorama360ViewerProps {
  imageSource: string;
  title?: string;
  className?: string;
  initialFov?: number;
}

export const Panorama360Viewer: React.FC<Panorama360ViewerProps> = ({
  imageSource,
  title,
  className = '',
  initialFov = 75,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [headingDegrees, setHeadingDegrees] = useState(0);

  // References to keep animation and interaction state without re-rendering Three.js
  const stateRef = useRef({
    lon: 0,
    lat: 0,
    targetLon: 0,
    targetLat: 0,
    fov: initialFov,
    targetFov: initialFov,
    isUserInteracting: false,
    onPointerDownPointerX: 0,
    onPointerDownPointerY: 0,
    onPointerDownLon: 0,
    onPointerDownLat: 0,
    autoRotate: true,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
  });

  // Keep auto-rotate ref synchronized with state
  useEffect(() => {
    stateRef.current.autoRotate = isAutoRotating;
  }, [isAutoRotating]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const handleZoom = useCallback((delta: number) => {
    const nextFov = Math.max(30, Math.min(95, stateRef.current.targetFov + delta));
    stateRef.current.targetFov = nextFov;
  }, []);

  const resetView = useCallback(() => {
    stateRef.current.targetLon = 0;
    stateRef.current.targetLat = 0;
    stateRef.current.targetFov = initialFov;
  }, [initialFov]);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    setIsLoading(true);
    setLoadError(null);

    // 1. Detect Software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Three.js Scene, Camera & Renderer
    const scene = new THREE.Scene();

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(initialFov, width / height, 1, 1100);
    stateRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    stateRef.current.renderer = renderer;

    mount.appendChild(renderer.domElement);

    // 3. Create Inside-Out Sphere Geometry for 360° Panorama
    const sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
    sphereGeometry.scale(-1, 1, 1); // Invert normals so texture is visible from the inside

    let sphereMaterial: THREE.MeshBasicMaterial;
    let sphereMesh: THREE.Mesh | null = null;
    let loadedTexture: THREE.Texture | null = null;

    // Helper: generate procedural luxury interior panorama fallback if network fails
    const createProceduralFallbackTexture = (): THREE.Texture => {
      const c = document.createElement('canvas');
      c.width = 2048;
      c.height = 1024;
      const ctx = c.getContext('2d')!;
      
      // Gradient sky/ceiling to floor
      const grad = ctx.createLinearGradient(0, 0, 0, c.height);
      grad.addColorStop(0, '#061026');
      grad.addColorStop(0.3, '#0b1938');
      grad.addColorStop(0.5, '#152b57');
      grad.addColorStop(0.7, '#24211d');
      grad.addColorStop(1, '#110e0a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, c.width, c.height);

      // Floor grid and architectural luxury horizon
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
      ctx.lineWidth = 2;
      for (let i = 0; i < c.width; i += 128) {
        ctx.beginPath();
        ctx.moveTo(i, c.height * 0.5);
        ctx.lineTo(i, c.height);
        ctx.stroke();
      }
      for (let j = c.height * 0.5; j < c.height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(c.width, j);
        ctx.stroke();
      }

      // Compass text markings
      ctx.fillStyle = '#ECC97E';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NORTE [N 0°] · LIVING ROOM 360°', c.width * 0.25, c.height * 0.48);
      ctx.fillText('LESTE [E 90°] · TERRAÇO PANORÂMICO', c.width * 0.5, c.height * 0.48);
      ctx.fillText('SUL [S 180°] · SUÍTE MASTER & SPA', c.width * 0.75, c.height * 0.48);
      ctx.fillText('OESTE [W 270°] · COZINHA GOURMET', c.width, c.height * 0.48);

      const texture = new THREE.CanvasTexture(c);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    // Load panoramic texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    textureLoader.load(
      imageSource,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        loadedTexture = texture;

        sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
        sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphereMesh);
        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.warn('Failed to load 360 texture directly, applying procedural fallback:', err);
        setLoadError('Aviso: Carregando visualização 360° com fallback.');
        loadedTexture = createProceduralFallbackTexture();
        sphereMaterial = new THREE.MeshBasicMaterial({ map: loadedTexture });
        sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphereMesh);
        setIsLoading(false);
      }
    );

    // 4. Pointer Interaction Listeners (Mouse & Touch)
    const onPointerDown = (event: PointerEvent) => {
      if (event.isPrimary === false) return;
      stateRef.current.isUserInteracting = true;
      stateRef.current.onPointerDownPointerX = event.clientX;
      stateRef.current.onPointerDownPointerY = event.clientY;
      stateRef.current.onPointerDownLon = stateRef.current.targetLon;
      stateRef.current.onPointerDownLat = stateRef.current.targetLat;

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.isPrimary === false || !stateRef.current.isUserInteracting) return;
      const factor = stateRef.current.fov / 400; // sensitivity adjusts with zoom
      stateRef.current.targetLon =
        (stateRef.current.onPointerDownPointerX - event.clientX) * factor +
        stateRef.current.onPointerDownLon;
      stateRef.current.targetLat =
        (event.clientY - stateRef.current.onPointerDownPointerY) * factor +
        stateRef.current.onPointerDownLat;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.isPrimary === false) return;
      stateRef.current.isUserInteracting = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY * 0.05;
      stateRef.current.targetFov = Math.max(30, Math.min(95, stateRef.current.targetFov + delta));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Pinch-to-zoom support for mobile touch devices
    let touchDistance = 0;
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (touchDistance > 0) {
          const delta = (touchDistance - dist) * 0.2;
          stateRef.current.targetFov = Math.max(30, Math.min(95, stateRef.current.targetFov + delta));
        }
        touchDistance = dist;
      }
    };
    const onTouchEnd = () => {
      touchDistance = 0;
    };
    domElement.addEventListener('touchmove', onTouchMove, { passive: true });
    domElement.addEventListener('touchend', onTouchEnd, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 5. Render Loop with Smooth Damping & Direction Update
    let animationFrameId = 0;
    let lastHeadingUpdate = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth auto-rotation if user is not actively dragging
      if (stateRef.current.autoRotate && !stateRef.current.isUserInteracting) {
        stateRef.current.targetLon += 0.08;
      }

      // Smooth exponential damping
      stateRef.current.lon += (stateRef.current.targetLon - stateRef.current.lon) * 0.1;
      stateRef.current.lat += (stateRef.current.targetLat - stateRef.current.lat) * 0.1;
      stateRef.current.fov += (stateRef.current.targetFov - stateRef.current.fov) * 0.1;

      // Clamp latitude to avoid pole gimbal lock
      stateRef.current.lat = Math.max(-85, Math.min(85, stateRef.current.lat));
      stateRef.current.targetLat = Math.max(-85, Math.min(85, stateRef.current.targetLat));

      // Update camera FOV
      camera.fov = stateRef.current.fov;
      camera.updateProjectionMatrix();

      // Convert spherical coordinates to Cartesian vector
      const phi = THREE.MathUtils.degToRad(90 - stateRef.current.lat);
      const theta = THREE.MathUtils.degToRad(stateRef.current.lon);

      const targetX = 500 * Math.sin(phi) * Math.cos(theta);
      const targetY = 500 * Math.cos(phi);
      const targetZ = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(targetX, targetY, targetZ);
      renderer.render(scene, camera);

      // Throttled heading update for UI compass
      const now = performance.now();
      if (now - lastHeadingUpdate > 100) {
        lastHeadingUpdate = now;
        const normalizedDeg = Math.round(((stateRef.current.lon % 360) + 360) % 360);
        setHeadingDegrees(normalizedDeg);
      }
    };

    animate();

    // 6. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchmove', onTouchMove);
      domElement.removeEventListener('touchend', onTouchEnd);

      if (sphereMesh) scene.remove(sphereMesh);
      sphereGeometry.dispose();
      sphereMaterial?.dispose();
      loadedTexture?.dispose();
      renderer.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [imageSource, initialFov]);

  // Compass cardinal label helper
  const getCardinalLabel = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5) return 'N (Norte)';
    if (deg >= 22.5 && deg < 67.5) return 'NE (Nordeste)';
    if (deg >= 67.5 && deg < 112.5) return 'L (Leste)';
    if (deg >= 112.5 && deg < 157.5) return 'SE (Sudeste)';
    if (deg >= 157.5 && deg < 202.5) return 'S (Sul)';
    if (deg >= 202.5 && deg < 247.5) return 'SO (Sudoeste)';
    if (deg >= 247.5 && deg < 292.5) return 'O (Oeste)';
    return 'NO (Noroeste)';
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[440px] bg-black select-none overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Three.js Canvas Mount */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top HUD: Info Badge & Direction */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-[#050B1A]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2 shadow-lg">
            <Compass
              className="w-4 h-4 text-cyan-400"
              style={{ transform: `rotate(${-headingDegrees}deg)`, transition: 'transform 0.1s linear' }}
            />
            <span className="font-bold">{getCardinalLabel(headingDegrees)}</span>
            <span className="text-[10px] text-cyan-400/70 border-l border-white/20 pl-2">
              {headingDegrees}°
            </span>
          </div>

          {title && (
            <div className="hidden sm:flex bg-[#050B1A]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-xs font-sans shadow">
              <span className="truncate max-w-xs">{title}</span>
            </div>
          )}
        </div>

        {/* Top-Right: Help and Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 rounded-xl bg-[#050B1A]/85 backdrop-blur-md border border-white/15 text-slate-300 hover:text-white hover:border-cyan-400/50 transition-colors cursor-pointer shadow"
            title="Como navegar"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#050B1A]/85 backdrop-blur-md border border-white/15 text-slate-300 hover:text-white hover:border-cyan-400/50 transition-colors cursor-pointer shadow"
            title={isFullscreen ? 'Sair da tela cheia' : 'Visualizar em tela cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-300" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Help Overlay Drawer */}
      {showHelp && (
        <div className="absolute top-16 right-4 z-20 max-w-xs bg-[#050B1A]/95 backdrop-blur-xl border border-cyan-500/40 p-4 rounded-2xl text-xs text-slate-200 shadow-2xl space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-1 border-b border-white/10 font-bold text-cyan-300 font-mono">
            <span>Controles 360°</span>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] leading-relaxed">
            • <strong>Arrastar</strong> com o mouse ou dedo para girar 360° horizontal e verticalmente.
          </p>
          <p className="text-[11px] leading-relaxed">
            • <strong>Scroll ou Pinça</strong> para aproximar (zoom in) ou afastar (zoom out).
          </p>
          <p className="text-[11px] leading-relaxed">
            • <strong>Giro Automático</strong> pode ser pausado ou retomado na barra inferior.
          </p>
        </div>
      )}

      {/* Loading State Spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-15 flex flex-col items-center justify-center bg-[#050B1A]/90 backdrop-blur-md gap-3 pointer-events-none">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
            Carregando Foto Panorâmica 360°...
          </span>
        </div>
      )}

      {/* Load error notification if any */}
      {loadError && (
        <div className="absolute top-16 left-4 z-20 bg-amber-950/90 border border-amber-500/40 text-amber-200 text-xs px-3 py-1.5 rounded-xl shadow-lg font-mono">
          {loadError}
        </div>
      )}

      {/* Central Viewport Remains 100% Unobstructed */}

      {/* Collapsible Sleek Bottom Dock */}
      <div className="relative z-10 pb-3 sm:pb-4 flex flex-col items-center gap-2 pointer-events-none">
        {/* Navigation hint pill */}
        <div className="pointer-events-auto">
          <span className="bg-[#050B1A]/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-cyan-200 border border-cyan-500/30 shadow flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Arraste para girar a visão 360° · Scroll para zoom</span>
          </span>
        </div>

        {/* Unified Bottom Control Dock */}
        <div className="pointer-events-auto bg-[#050B1A]/90 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          {/* Auto-rotate Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isAutoRotating
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
            }`}
            title={isAutoRotating ? 'Pausar rotação contínua' : 'Ativar rotação automática'}
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAutoRotating ? 'Pausar Giro' : 'Auto Giro'}</span>
          </button>

          <div className="w-[1px] h-4 bg-white/15 mx-1" />

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => handleZoom(-10)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Aproximar (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => handleZoom(10)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Afastar (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-white/15 mx-1" />

          {/* Reset View */}
          <button
            type="button"
            onClick={resetView}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
            title="Recentralizar câmera ao ponto inicial"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#ECC97E]" />
            <span className="hidden sm:inline">Recentralizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
