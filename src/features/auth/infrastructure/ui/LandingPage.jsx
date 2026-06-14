import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServicesShowcase } from './ServicesShowcase';
import { LANDING_SERVICES } from './landingServices';
import { LANDING_PARTNERS } from './landingPartners';
import { useLandingImages } from '../../../landing-config/application/useLandingImages';
import { ArrowRight } from 'lucide-react';
import { HeroCarousel } from './HeroCarousel';
import { WhatsAppFloat } from './WhatsAppFloat';
import './LandingPage.css';

const CATALOG_ITEMS = [
  {
    id: 'letrero-3d',
    title: 'Letrero 3D Retroiluminado',
    category: 'letreros',
    description: 'Letras corporativas volumétricas en acrílico y metal con iluminación LED posterior indirecta.',
    tags: ['Iluminación LED', 'Fachada comercial', 'Acrílico difusor']
  },
  {
    id: 'caja-luz-ext',
    title: 'Caja de Luz LED Extraplana',
    category: 'letreros',
    description: 'Bastidor de aluminio anodizado con cambio rápido de lona backlite y panel LED difusor.',
    tags: ['Extraplana', 'Fácil cambio', 'Bajo consumo']
  },
  {
    id: 'vinilo-esm',
    title: 'Vinilo Esmerilado Premium',
    category: 'rotulacion',
    description: 'Película decorativa de privacidad esmerilada con cortes geométricos y logotipos calados.',
    tags: ['Privacidad', 'Oficinas', 'Vidrio templado']
  },
  {
    id: 'rotulacion-vehicular',
    title: 'Rotulación Vehicular Comercial',
    category: 'rotulacion',
    description: 'Gráficas en vinilo fundido de alta durabilidad para flotas vehiculares comerciales y corporativas.',
    tags: ['Durabilidad 3M', 'Protección UV', 'Sin burbujas']
  },
  {
    id: 'stand-publicitario',
    title: 'Stand de Exhibición Custom',
    category: 'stands',
    description: 'Estructuras modulares creativas para convenciones con mostradores, displays e iluminación LED.',
    tags: ['Eventos', 'Estructura modular', 'Mostrador']
  },
  {
    id: 'senaletica-corporativa',
    title: 'Señalética Arquitectónica',
    category: 'senaletica',
    description: 'Placas informativas directorios fabricados en acrílico cristal y soportes de acero inoxidable.',
    tags: ['Acrílico pulido', 'Soportes de acero', 'Wayfinding']
  }
];

const CATALOG_CATEGORIES = [
  { key: 'todos', label: 'Todos' },
  { key: 'letreros', label: 'Letreros' },
  { key: 'rotulacion', label: 'Rotulación' },
  { key: 'stands', label: 'Stands' },
  { key: 'senaletica', label: 'Señalética' },
];

const getCategoryLabel = (key) =>
  CATALOG_CATEGORIES.find((c) => c.key === key)?.label ?? key;

export const LandingPage = () => {
  const navigate = useNavigate();
  const { images } = useLandingImages();
  const [activeSection, setActiveSection] = useState('inicio');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const heroImages = useMemo(
    () => [
      { id: 'hero-1', src: images.hero['hero-1'], alt: 'Proyecto Luxes 1' },
      { id: 'hero-2', src: images.hero['hero-2'], alt: 'Proyecto Luxes 2' },
      { id: 'hero-3', src: images.hero['hero-3'], alt: 'Proyecto Luxes 3' },
    ],
    [images.hero]
  );

  const services = useMemo(
    () => LANDING_SERVICES.map((service) => ({
      ...service,
      image: images.services[service.id],
    })),
    [images.services]
  );

  const partners = useMemo(
    () => LANDING_PARTNERS.map((partner) => ({
      ...partner,
      logo: images.partners[partner.id],
    })),
    [images.partners]
  );

  const catalogItems = useMemo(
    () => CATALOG_ITEMS.map((item) => ({
      ...item,
      image: images.catalog[item.id],
    })),
    [images.catalog]
  );

  const filteredCatalog = useMemo(() => {
    if (selectedCategory === 'todos') return catalogItems;
    return catalogItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, catalogItems]);

  useEffect(() => {
    const sections = ['inicio', 'servicios', 'catalogo'];
    const observers = sections.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setActiveSection(id);
        }
      }, {
        rootMargin: '-30% 0px -50% 0px'
      });
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach(obs => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, []);

  return (
    <div className="landing-page-container">

      {/* FIXED HEADER WITH BLUR EFFECT */}
      <header className="landing-header">
        <div className="landing-logo-group">
          <img src="/Logo.jpg" alt="Luxes" className="landing-logo" />
          <span className="landing-brand-name">LUXES</span>
        </div>

        <nav className="landing-nav">
          <a href="#inicio" className={`landing-nav-link ${activeSection === 'inicio' ? 'active' : ''}`}>Inicio</a>
          <a href="#servicios" className={`landing-nav-link ${activeSection === 'servicios' ? 'active' : ''}`}>Servicios</a>
          <a href="#catalogo" className={`landing-nav-link ${activeSection === 'catalogo' ? 'active' : ''}`}>Catálogo</a>
          <button
            type="button"
            className="landing-header-login-btn"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </button>
        </nav>
      </header>

      {/* SECTION 1: HERO */}
      <section id="inicio" className="landing-section landing-hero-section">
        <div className="landing-slide-inner">
          <div className="landing-hero">
            <div className="landing-hero-content">
              <div className="landing-hero-promo">
                <span className="landing-hero-promo-badge">
                  <span className="landing-badge-dot" aria-hidden="true" />
                  Portal empresarial 2026
                </span>
                <span className="landing-hero-brand" aria-hidden="true">LUXES</span>
                <h1 className="landing-hero-impact">
                  <span className="landing-hero-impact-line">RENUEVA</span>
                  <span className="landing-hero-impact-line">TU MARCA</span>
                </h1>
                <p className="landing-hero-promo-tagline">
                  Damos vida a tus ideas, impulsamos tu marca.
                </p>
                <p className="landing-hero-promo-description">
                  Soluciones creativas, producción e instalaciones para empresas que buscan
                  destacar. Gestiona todo tu flujo desde nuestro portal.
                </p>
                <div className="landing-hero-actions">
                  <a href="#catalogo" className="landing-cta-primary landing-cta-promo">
                    Ver catálogo
                    <ArrowRight size={20} style={{ marginLeft: '6px' }} />
                  </a>
                </div>
              </div>
            </div>

            <div className="landing-hero-carousel">
              <HeroCarousel heroImages={heroImages} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SERVICES */}
      <section id="servicios" className="landing-section landing-services-section">
        <div className="landing-slide-inner">
          <div className="landing-services-header">
            <h2 className="landing-section-title">
              Nuestros <span className="landing-section-title-accent">servicios</span>
            </h2>
            <p className="landing-section-description">
              Soluciones integrales para potenciar la presencia visual de tu marca.
            </p>
          </div>

          <ServicesShowcase services={services} />
        </div>
      </section>

      {/* SECTION 3: TRUST / PARTNERS */}
      <section className="landing-section landing-trust-section" aria-label="Empresas que confían en Luxes">
        <div className="landing-slide-inner landing-trust-inner">
          <div className="landing-trust-header">
            <h2 className="landing-trust-title">
              Empresas que confían en <span className="landing-trust-brand">Luxes</span>
            </h2>
            <span className="landing-trust-accent" aria-hidden="true" />
            <p className="landing-trust-description">
              Hemos acompañado a marcas de distintos sectores con soluciones de diseño,
              producción e instalación que fortalecen su presencia visual.
            </p>
          </div>

          <div className="landing-partners-marquee">
            <div className="landing-partners-track">
              {[...partners, ...partners].map((partner, index) => (
                <div key={`${partner.id}-${index}`} className="landing-partner-item">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="landing-partner-logo"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CATALOG */}
      <section id="catalogo" className="landing-section landing-catalog-section">
        <div className="landing-slide-inner">
          <div className="landing-catalog-header">
            <span className="landing-section-badge">Nuestra galería</span>
            <h2 className="landing-section-title">
              Catálogo de <span className="landing-section-title-accent">productos</span>
            </h2>
            <p className="landing-section-description">
              Explora algunos de nuestros proyectos más destacados e instalaciones reales.
            </p>
          </div>

          <div className="landing-catalog-filters">
            {CATALOG_CATEGORIES.map((category) => (
              <button
                key={category.key}
                type="button"
                className={`landing-catalog-filter-btn ${selectedCategory === category.key ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="landing-catalog-grid">
            {filteredCatalog.map((item) => (
              <article key={item.id} className="landing-catalog-card">
                <div className="landing-catalog-img-box">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="landing-catalog-img"
                    loading="lazy"
                  />
                  <span className="landing-catalog-category-tag">
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
                <div className="landing-catalog-info">
                  <h3 className="landing-catalog-item-title">{item.title}</h3>
                  <p className="landing-catalog-item-desc">{item.description}</p>
                  <ul className="landing-catalog-tags">
                    {item.tags.map((tag) => (
                      <li key={tag} className="landing-catalog-tag">{tag}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p className="landing-footer-brand">LUXES — Diseño y Publicidad</p>
        <div className="landing-footer-meta">
          <p className="landing-footer-copy">© {new Date().getFullYear()} · Todos los derechos reservados</p>
          <p className="landing-footer-credit">Realizado por: Jaims Sotfeware Development</p>
        </div>
      </footer>

      <WhatsAppFloat />
    </div>
  );
};
