export type ProjectFormat = 'landscape' | 'reel';
export type Category = { id: string; name: string; visible: boolean };
export type Project = {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  youtubeUrl: string;
  coverUrl: string;
  images: string[];
  featured: boolean;
  published: boolean;
  type: string;
  format: ProjectFormat;
};
export type ShowcaseImage = {
  id: string;
  src: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  order: number;
  row: 1 | 2;
};

export type SiteSettings = {
  brandName: string;
  name: string;
  role: string;
  heroTitle: string;
  heroBlurb: string;
  heroBlurbSize: number;
  heroBlurbAlign: 'left' | 'center' | 'right';
  about: string;
  aboutSize: number;
  aboutAlign: 'left' | 'center' | 'right';
  email: string;
  accent: string;
  cursorEnabled: boolean;
  cursorSvg: string;
  cursorOriginalSvg: string;
  cursorHotspotX: number;
  cursorHotspotY: number;
  cursorRotation: number;
  showcaseImages: ShowcaseImage[];
  showcaseSpeed: number;
};

// 1. ضفنا نوع جديد للصور عشان نحدد هي لاندسكيب ولا فيرتكال (Reel)
export type GalleryImage = {
  id: string;
  url: string;
  format: ProjectFormat;
};

// 2. ضفنا الخدمات والمعرض لبيانات الـ CMS
export type CMSData = { 
  categories: Category[]; 
  projects: Project[]; 
  settings: SiteSettings;
  services: [string, string, string][]; // [الرقم, العنوان, الوصف]
  gallery: GalleryImage[];
};

export const STORAGE_KEY = 'jack-portfolio-cms-v1';

const nextlevel = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85';
const nextlevel1 = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85';
const nextlevel2 = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85';

// 3. حطينا الداتا بتاعتك الافتراضية عشان الموقع مايضربش في البداية
const defaultServices: [string, string, string][] = [
  ['01','3D Modeling','Creation of detailed objects, characters, or environments tailored to specific client needs, ideal for games, products, and visualizations.'],
  ['02','Rendering','High-quality, photorealistic renders that showcase designs with custom lighting, textures, and materials to bring concepts to life.'],
  ['03','Motion Design','Dynamic animations and motion graphics that add energy and storytelling to brands, products, and digital experiences.'],
  ['04','Branding','Crafting cohesive visual identities — from logos to full brand systems — that communicate a clear and memorable presence.'],
  ['05','Web Design','Designing clean, modern, and conversion-focused websites with attention to layout, typography, and user experience.']
];

const defaultGallery: GalleryImage[] = [
  '1.png','2.png','https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif','https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif','https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif','https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif','https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif','https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif','https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif','https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif','https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif','https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif','https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif','https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif','https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif','https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif','https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif','https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif','https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif','https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif','https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif'
].map((url, i) => ({ id: `default-gal-${i}`, url, format: 'landscape' })); // افترضنا مبدأياً إن كلهم لاندسكيب وتقدر تغيرهم من الداش بورد

export const defaults: CMSData = {
  categories: [
    { id: 'video-editing', name: 'Video Editing', visible: true },
    { id: 'motion-design', name: 'Motion Design', visible: true },
    { id: '3d-animation', name: '3D Animation', visible: true },
    { id: '3d-modeling', name: '3D Modeling', visible: true },
    { id: 'branding', name: 'Branding', visible: true },
    { id: 'web-design', name: 'Web Design', visible: true },
  ],
  projects: [
    { id: 'nextlevel-studio', name: 'Nextlevel Studio', categoryId: '3d-animation', description: 'A bold visual project exploring form, light and movement.', youtubeUrl: '', coverUrl: nextlevel, images: [nextlevel1, nextlevel2], featured: true, published: true, type: 'Client', format: 'landscape' },
    { id: 'aura-brand-identity', name: 'Aura Brand Identity', categoryId: 'branding', description: 'A personal identity study built around a clear visual language.', youtubeUrl: '', coverUrl: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85', images: ['https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85', 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85'], featured: true, published: true, type: 'Personal', format: 'reel' },
    { id: 'solaris-digital', name: 'Solaris Digital', categoryId: 'motion-design', description: 'A client project focused on cinematic digital storytelling.', youtubeUrl: '', coverUrl: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85', images: ['https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85', 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85'], featured: true, published: true, type: 'Client', format: 'landscape' },
  ],
  settings: {
    brandName: 'HONDA', name: 'Muhannad Mamdouh', role: 'Video Editor & Telecommunications Engineer', heroTitle: 'HONDA',
   heroBlurb: 'Muhannad Mamdouh — Video Editor & Telecommunications Engineer, focused on crafting powerful visual stories.',
heroBlurbSize: 16,
heroBlurbAlign: 'left',

about: "I'm Muhannad Mamdouh, a video editor and telecommunications engineer. I work with video, motion, and visual storytelling to turn ideas into clear, engaging experiences. Let's create something memorable together.",
aboutSize: 22,
aboutAlign: 'center',
    email: 'your-email@example.com', accent: '#B600A8', cursorEnabled: false, cursorSvg: '', cursorOriginalSvg: '', cursorHotspotX: 8, cursorHotspotY: 8, cursorRotation: 0, showcaseImages: [], showcaseSpeed: 35,
  },
  services: defaultServices,
  gallery: defaultGallery,
};

function normalizeProject(project: Partial<Project> & { id?: string }): Project {
  return {
    id: project.id || crypto.randomUUID(), name: project.name || '', categoryId: project.categoryId || '', description: project.description || '',
    youtubeUrl: project.youtubeUrl || '', coverUrl: project.coverUrl || '', images: Array.isArray(project.images) ? [project.images[0] || '', project.images[1] || ''] : ['', ''],
    featured: Boolean(project.featured), published: project.published !== false, type: project.type || 'Client', format: project.format === 'reel' ? 'reel' : 'landscape',
  };
}

export function readCMS(): CMSData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<CMSData>;
    const savedSettings = { ...defaults.settings, ...(parsed.settings || {}) };
    
    // 4. دمجنا الخدمات والصور مع الداتا المحفوظة في المتصفح
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : defaults.categories,
      projects: Array.isArray(parsed.projects) ? parsed.projects.map(normalizeProject) : defaults.projects,
      settings: savedSettings,
      services: Array.isArray(parsed.services) ? parsed.services : defaults.services,
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery : defaults.gallery,
    };
  } catch { return defaults; }
}

export function writeCMS(data: CMSData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (error) { console.error('Could not save portfolio settings in localStorage.', error); }
}

export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname === 'youtu.be' || u.hostname.endsWith('.youtu.be')) id = u.pathname.slice(1).split('/')[0] || null;
    else if (u.hostname === 'youtube.com' || u.hostname.endsWith('.youtube.com') || u.hostname === 'youtube-nocookie.com' || u.hostname.endsWith('.youtube-nocookie.com')) {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else {
        const parts = u.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts', 'live'].includes(parts[0])) id = parts[1] || null;
      }
    }
    return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : null;
  } catch { return null; }
}
export function youtubeThumbnail(url: string): string { const id = youtubeId(url); return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''; }

const safeSvgTags = new Set(['svg', 'g', 'path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect', 'defs', 'lineargradient', 'radialgradient', 'stop', 'clippath', 'mask', 'title', 'desc', 'style']);
const safeSvgAttributes = new Set(['xmlns', 'viewbox', 'width', 'height', 'preserveaspectratio', 'fill', 'fill-rule', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity', 'opacity', 'transform', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'id', 'class', 'style', 'offset', 'stop-color', 'stop-opacity', 'gradientunits', 'gradienttransform', 'clip-path', 'mask', 'vector-effect']);
function safeStyleDeclarations(style: string): string {
  const allowed = new Set(['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity', 'fill-opacity', 'fill-rule', 'opacity', 'stop-color', 'stop-opacity', 'clip-path', 'mask', 'vector-effect', 'transform']);
  return style.split(';').map(part => {
    const colon = part.indexOf(':');
    if (colon < 1) return '';
    const property = part.slice(0, colon).trim().toLowerCase();
    const value = part.slice(colon + 1).trim();
    if (!allowed.has(property) || /javascript:|https?:|expression|@import/i.test(value)) return '';
    if (/url\(/i.test(value) && !/^url\(#[\w.-]+\)$/i.test(value)) return '';
    return `${property}:${value}`;
  }).filter(Boolean).join(';');
}
export function sanitizeSvg(input: string): string {
  if (typeof DOMParser === 'undefined' || !input.trim()) return '';
  try {
    const doc = new DOMParser().parseFromString(input, 'image/svg+xml');
    if (doc.querySelector('parsererror')) return '';
    const root = doc.documentElement;
    if (root.localName.toLowerCase() !== 'svg') return '';
    for (const styleNode of Array.from(root.querySelectorAll('style'))) {
      const css = styleNode.textContent || '';
      const rulePattern = /([^{}]+)\{([^{}]*)\}/g;
      let match: RegExpExecArray | null;
      while ((match = rulePattern.exec(css))) {
        const declarations = safeStyleDeclarations(match[2]);
        if (!declarations) continue;
        for (const selector of match[1].split(',')) {
          const classMatch = selector.trim().match(/^\.([a-zA-Z_][\w-]*)$/);
          if (!classMatch) continue;
          for (const target of Array.from(root.querySelectorAll('*'))) {
            if ((target.getAttribute('class') || '').split(/\s+/).includes(classMatch[1])) {
              const existing = target.getAttribute('style') || '';
              target.setAttribute('style', [existing, declarations].filter(Boolean).join(';'));
            }
          }
        }
      }
      styleNode.remove();
    }
    const all = [root, ...Array.from(root.querySelectorAll('*'))];
    for (const element of all) {
      const tag = element.localName.toLowerCase();
      if (!safeSvgTags.has(tag)) { element.remove(); continue; }
      for (const attr of Array.from(element.attributes)) {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim();
        if (name.startsWith('on') || !safeSvgAttributes.has(name) || /javascript:|data:text\/html|https?:\/\//i.test(value)) {
          element.removeAttribute(attr.name);
        } else if (name === 'style') {
          const cleanedStyle = safeStyleDeclarations(value);
          for (const declaration of cleanedStyle.split(';')) {
            const colon = declaration.indexOf(':');
            if (colon < 1) continue;
            const property = declaration.slice(0, colon).trim();
            const styleValue = declaration.slice(colon + 1).trim();
            if (!element.hasAttribute(property)) element.setAttribute(property, styleValue);
          }
          element.removeAttribute('style');
        } else if (name === 'class' && !/^[\w\s-]*$/.test(value)) {
          element.removeAttribute(attr.name);
        }
      }
    }
    if (!root.hasAttribute('viewBox')) {
      const width = Number.parseFloat(root.getAttribute('width') || '32');
      const height = Number.parseFloat(root.getAttribute('height') || '32');
      root.setAttribute('viewBox', `0 0 ${Number.isFinite(width) && width > 0 ? width : 32} ${Number.isFinite(height) && height > 0 ? height : 32}`);
    }
    root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    return new XMLSerializer().serializeToString(root);
  } catch { return ''; }
}
export type SvgPathAttributes = { d: string; fill: string; stroke: string; strokeWidth: string; opacity: string };
export function getSvgPaths(svg: string): SvgPathAttributes[] {
  const clean = sanitizeSvg(svg);
  if (!clean) return [];
  const doc = new DOMParser().parseFromString(clean, 'image/svg+xml');
  return Array.from(doc.querySelectorAll('path')).map(path => ({
    d: path.getAttribute('d') || '', fill: path.getAttribute('fill') || 'currentColor', stroke: path.getAttribute('stroke') || 'none',
    strokeWidth: path.getAttribute('stroke-width') || '1', opacity: path.getAttribute('opacity') || '1',
  }));
}
export function updateSvgPath(svg: string, index: number, changes: Partial<SvgPathAttributes>): string {
  const clean = sanitizeSvg(svg);
  if (!clean) return '';
  const doc = new DOMParser().parseFromString(clean, 'image/svg+xml');
  const paths = Array.from(doc.querySelectorAll('path'));
  const path = paths[index];
  if (!path) return clean;
  const mapping: Record<keyof SvgPathAttributes, string> = { d: 'd', fill: 'fill', stroke: 'stroke', strokeWidth: 'stroke-width', opacity: 'opacity' };
  for (const [key, value] of Object.entries(changes) as [keyof SvgPathAttributes, string][]) {
    if (key === 'd' && value.length > 20000) continue;
    if (value === '') path.removeAttribute(mapping[key]); else path.setAttribute(mapping[key], value);
  }
  return sanitizeSvg(new XMLSerializer().serializeToString(doc.documentElement));
}