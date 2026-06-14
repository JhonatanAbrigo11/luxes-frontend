import heroImage1 from '../../../assets/1.png';
import heroImage2 from '../../../assets/2.png';
import heroImage3 from '../../../assets/3.png';
import serviceDisenoBranding from '../../../assets/services/service-diseno-branding.png';
import serviceImpresion from '../../../assets/services/service-impresion-produccion.png';
import serviceInstalaciones from '../../../assets/services/service-instalaciones.png';
import serviceProyectos from '../../../assets/services/service-proyectos-publicitarios.png';
import serviceEventos from '../../../assets/services/service-eventos-activaciones.png';
import serviceConsultoria from '../../../assets/services/service-consultoria-creativa.png';
import logoAlber from '../../../assets/confiaron/alber.jpg';
import logoDisensa from '../../../assets/confiaron/disensa.png';
import logoDevies from '../../../assets/confiaron/devies.png';

export const LANDING_IMAGE_SECTIONS = [
  {
    key: 'hero',
    title: 'Carrusel principal',
    description: 'Imágenes del carrusel en la sección de inicio.',
    items: [
      { id: 'hero-1', label: 'Imagen 1', defaultSrc: heroImage1 },
      { id: 'hero-2', label: 'Imagen 2', defaultSrc: heroImage2 },
      { id: 'hero-3', label: 'Imagen 3', defaultSrc: heroImage3 },
    ],
  },
  {
    key: 'services',
    title: 'Servicios',
    description: 'Imágenes de cada tarjeta de servicio.',
    items: [
      { id: 'diseno-branding', label: 'Diseño y branding', defaultSrc: serviceDisenoBranding },
      { id: 'impresion-produccion', label: 'Impresión y producción', defaultSrc: serviceImpresion },
      { id: 'instalaciones', label: 'Instalaciones', defaultSrc: serviceInstalaciones },
      { id: 'proyectos-publicitarios', label: 'Proyectos publicitarios', defaultSrc: serviceProyectos },
      { id: 'eventos-activaciones', label: 'Eventos y activaciones', defaultSrc: serviceEventos },
      { id: 'consultoria', label: 'Consultoría creativa', defaultSrc: serviceConsultoria },
    ],
  },
  {
    key: 'partners',
    title: 'Empresas que confían',
    description: 'Logos del carrusel de marcas asociadas.',
    items: [
      { id: 'alber', label: 'Alber', defaultSrc: logoAlber },
      { id: 'disensa', label: 'Disensa', defaultSrc: logoDisensa },
      { id: 'devies', label: 'DeVies', defaultSrc: logoDevies },
    ],
  },
  {
    key: 'catalog',
    title: 'Catálogo de productos',
    description: 'Imágenes de los productos en la galería.',
    items: [
      { id: 'letrero-3d', label: 'Letrero 3D Retroiluminado', defaultSrc: '/mock_letrero.png' },
      { id: 'caja-luz-ext', label: 'Caja de Luz LED Extraplana', defaultSrc: '/mock_letras.png' },
      { id: 'vinilo-esm', label: 'Vinilo Esmerilado Premium', defaultSrc: '/vinilo_esmerilado.png' },
      { id: 'rotulacion-vehicular', label: 'Rotulación Vehicular', defaultSrc: '/mock_instalacion.png' },
      { id: 'stand-publicitario', label: 'Stand de Exhibición', defaultSrc: '/stand_publicitario.png' },
      { id: 'senaletica-corporativa', label: 'Señalética Arquitectónica', defaultSrc: '/bank_completed.png' },
    ],
  },
];

export function mergeLandingImageOverrides(overrides = {}) {
  const merged = {};

  LANDING_IMAGE_SECTIONS.forEach((section) => {
    merged[section.key] = {};
    section.items.forEach((item) => {
      merged[section.key][item.id] = overrides?.[section.key]?.[item.id] ?? item.defaultSrc;
    });
  });

  return merged;
}

export function resolveImageSrc(overrides, section, itemId, defaultSrc) {
  return overrides?.[section]?.[itemId] ?? defaultSrc;
}
