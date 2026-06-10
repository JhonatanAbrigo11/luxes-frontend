import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceCard } from './ServiceCard';
import { LANDING_SERVICES } from './landingServices';
import { LogoColorTrail } from './LogoColorTrail';
import './LandingPage.css';

const HERO_STATS = [
  { value: '360°', label: 'Gestión integral' },
  { value: '24/7', label: 'Acceso al portal' },
  { value: '6+', label: 'Líneas de servicio' },
  { value: '100%', label: 'Seguimiento' },
];

const MAIN_SLIDES = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'servicios', label: 'Servicios' },
];

const SERVICES_PER_PAGE = 3;
const AUTO_PLAY_MS = 3800;

export const LandingPage = () => {
  const navigate = useNavigate();
  const [mainSlide, setMainSlide] = useState(0);
  const [serviceSlide, setServiceSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const resumeTimerRef = useRef(null);
  const mainSlideRef = useRef(mainSlide);
  const serviceSlideRef = useRef(serviceSlide);

  const servicePages = useMemo(() => {
    const pages = [];
    for (let i = 0; i < LANDING_SERVICES.length; i += SERVICES_PER_PAGE) {
      pages.push(LANDING_SERVICES.slice(i, i + SERVICES_PER_PAGE));
    }
    return pages;
  }, []);

  const goToMainSlide = useCallback((index) => {
    setMainSlide(Math.max(0, Math.min(MAIN_SLIDES.length - 1, index)));
    if (index === 0) setServiceSlide(0);
  }, []);

  const goToServiceSlide = useCallback((index) => {
    setServiceSlide(Math.max(0, Math.min(servicePages.length - 1, index)));
  }, [servicePages.length]);

  useEffect(() => {
    mainSlideRef.current = mainSlide;
  }, [mainSlide]);

  useEffect(() => {
    serviceSlideRef.current = serviceSlide;
  }, [serviceSlide]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) setIsPaused(true);

    const handleChange = (e) => setIsPaused(e.matches);
    prefersReduced.addEventListener('change', handleChange);
    return () => prefersReduced.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isPaused) return undefined;

    const timer = setInterval(() => {
      const main = mainSlideRef.current;
      const service = serviceSlideRef.current;

      if (main === 0) {
        setMainSlide(1);
      } else if (service < servicePages.length - 1) {
        setServiceSlide(service + 1);
      } else {
        setMainSlide(0);
        setServiceSlide(0);
      }
    }, AUTO_PLAY_MS);

    return () => clearInterval(timer);
  }, [isPaused, servicePages.length]);

  const pauseAutoPlay = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    setIsPaused(true);
  }, []);

  const resumeAutoPlay = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    setIsPaused(false);
  }, []);

  const scheduleResumeAutoPlay = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(resumeAutoPlay, AUTO_PLAY_MS * 2);
  }, [resumeAutoPlay]);

  useEffect(() => () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  const handleTouchStart = (e) => {
    pauseAutoPlay();
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        if (mainSlide === 0) goToMainSlide(1);
        else if (serviceSlide < servicePages.length - 1) goToServiceSlide(serviceSlide + 1);
      } else if (mainSlide === 1 && serviceSlide > 0) {
        goToServiceSlide(serviceSlide - 1);
      } else if (mainSlide === 1) {
        goToMainSlide(0);
      }
    }

    touchStartX.current = null;
    scheduleResumeAutoPlay();
  };

  return (
    <div className="landing-page-container">
      <LogoColorTrail />

      <header className="landing-header">
        <div className="landing-logo-group">
          <img src="/Logo.jpg" alt="Luxes" className="landing-logo" />
          <span className="landing-brand-name">LUXES</span>
        </div>

        <nav className="landing-nav">
          <button
            type="button"
            className={`landing-nav-link ${mainSlide === 1 ? 'active' : ''}`}
            onClick={() => { pauseAutoPlay(); goToMainSlide(1); scheduleResumeAutoPlay(); }}
          >
            Servicios
          </button>
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => goToMainSlide(0)}
          >
            Contacto
          </button>
          <button
            type="button"
            className="landing-header-login-btn"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </button>
        </nav>
      </header>

      <main
        className="landing-carousel"
        onMouseEnter={pauseAutoPlay}
        onMouseLeave={resumeAutoPlay}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="landing-carousel-viewport">
          <div
            className="landing-carousel-track"
            style={{ transform: `translateX(calc(-100cqw * ${mainSlide}))` }}
          >
            {/* SLIDE 1: HERO / INICIO */}
            <section className="landing-carousel-slide landing-hero-slide">
              <div className="landing-slide-inner">
                <div className="landing-hero">
                  <div className="landing-hero-content">
                    <span className="landing-badge">
                      <span className="landing-badge-dot" aria-hidden="true" />
                      Portal empresarial 2026
                    </span>
                    <h1 className="landing-hero-title">
                      Damos vida a tus ideas,
                      <span className="landing-hero-highlight"> impulsamos tu marca.</span>
                    </h1>
                    <p className="landing-hero-description">
                      Soluciones creativas, producción e instalaciones para empresas que buscan
                      destacar. Gestiona todo tu flujo desde nuestro portal.
                    </p>
                    <div className="landing-hero-actions">
                      <button
                        type="button"
                        className="landing-cta-primary"
                        onClick={() => { pauseAutoPlay(); goToMainSlide(1); scheduleResumeAutoPlay(); }}
                      >
                        Ver catálogo
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="landing-hero-visual">
                    <div className="landing-highlight-card">
                      <span className="landing-highlight-icon">L</span>
                      <div>
                        <p className="landing-highlight-title">Creatividad · Producción · Resultados</p>
                        <p className="landing-highlight-subtitle">Diseño y publicidad integral</p>
                      </div>
                    </div>
                    <div className="landing-stats-grid">
                      {HERO_STATS.map((stat) => (
                        <div key={stat.label} className="landing-stat-card">
                          <span className="landing-stat-number">{stat.value}</span>
                          <span className="landing-stat-label">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SLIDE 2: SERVICIOS */}
            <section id="servicios" className="landing-carousel-slide landing-services-slide">
              <div className="landing-slide-inner">
                <div className="landing-services-header">
                  <span className="landing-section-badge">Lo que hacemos</span>
                  <h2 className="landing-section-title">Nuestros servicios</h2>
                  <p className="landing-section-description">
                    Soluciones integrales para potenciar la presencia visual de tu marca.
                  </p>
                </div>

                <div className="landing-services-carousel">
                  <div className="landing-services-carousel-viewport">
                    <div
                      className="landing-services-carousel-track"
                      style={{ transform: `translateX(calc(-100cqw * ${serviceSlide}))` }}
                    >
                      {servicePages.map((page, pageIndex) => (
                        <div key={pageIndex} className="landing-services-carousel-page">
                          <div className="landing-services-grid">
                            {page.map((service, index) => (
                              <ServiceCard
                                key={service.id}
                                index={pageIndex * SERVICES_PER_PAGE + index + 1}
                                {...service}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {servicePages.length > 1 && (
                    <div className="landing-services-carousel-controls">
                      <button
                        type="button"
                        className="landing-carousel-btn"
                        onClick={() => { pauseAutoPlay(); goToServiceSlide(serviceSlide - 1); scheduleResumeAutoPlay(); }}
                        disabled={serviceSlide === 0}
                        aria-label="Servicios anteriores"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>

                      <div className="landing-carousel-dots">
                        {servicePages.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`landing-carousel-dot ${serviceSlide === index ? 'active' : ''}`}
                            onClick={() => { pauseAutoPlay(); goToServiceSlide(index); scheduleResumeAutoPlay(); }}
                            aria-label={`Página de servicios ${index + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        className="landing-carousel-btn"
                        onClick={() => { pauseAutoPlay(); goToServiceSlide(serviceSlide + 1); scheduleResumeAutoPlay(); }}
                        disabled={serviceSlide === servicePages.length - 1}
                        aria-label="Siguientes servicios"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

      </main>

      <footer id="contacto" className="landing-footer">
        <p className="landing-footer-brand">LUXES — Diseño y Publicidad</p>
        <p className="landing-footer-copy">© {new Date().getFullYear()} · Todos los derechos reservados</p>
      </footer>
    </div>
  );
};
