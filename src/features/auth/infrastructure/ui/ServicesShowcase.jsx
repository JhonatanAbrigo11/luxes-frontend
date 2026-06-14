import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ServicesShowcase.css';

const WHATSAPP_NUMBER = '593968982380';
const AUTO_PLAY_MS = 4500;

const getQuoteLink = (serviceTitle) => {
  const message = `Hola, me gustaría cotizar el servicio de ${serviceTitle}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const ServicesShowcase = ({ services }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const getScrollStep = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 0;

    const track = el.querySelector('.landing-services-track');
    const card = el.querySelector('.landing-showcase-column');
    if (!card || !track) return 0;

    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return card.offsetWidth + gap;
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateScrollState();

    const el = scrollRef.current;
    if (!el) return undefined;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, services.length]);

  const scrollByDirection = useCallback((direction) => {
    const el = scrollRef.current;
    if (!el) return;

    const step = getScrollStep();
    if (!step) return;

    el.scrollBy({ left: step * direction, behavior: 'smooth' });
  }, [getScrollStep]);

  const scrollNextAuto = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const step = getScrollStep();
    if (!step) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 4) return;

    if (el.scrollLeft >= maxScroll - 4) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    el.scrollBy({ left: step, behavior: 'smooth' });
  }, [getScrollStep]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isPaused) return undefined;

    const timer = window.setInterval(scrollNextAuto, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [isPaused, scrollNextAuto, services.length]);

  return (
    <div
      className="landing-services-showcase-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <button
        type="button"
        className="landing-services-nav landing-services-nav--prev"
        onClick={() => scrollByDirection(-1)}
        disabled={!canScrollLeft}
        aria-label="Ver servicios anteriores"
      >
        <ChevronLeft size={22} strokeWidth={2.5} aria-hidden="true" />
      </button>

      <div className="landing-services-showcase" ref={scrollRef} aria-label="Servicios destacados">
        <div className="landing-services-track">
          {services.map((service) => (
            <div key={service.id} className="landing-showcase-column">
              <article
                className="landing-showcase-card"
                aria-label={`${service.title}. ${service.subtitle}`}
              >
                <div className="landing-showcase-card-header">
                  <h3 className="landing-showcase-card-title">{service.title}</h3>
                  <p className="landing-showcase-card-subtitle">{service.subtitle}</p>
                </div>

                <div className="landing-showcase-card-visual">
                  <img
                    src={service.image}
                    alt=""
                    className="landing-showcase-card-image"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="landing-showcase-card-visual-shade" aria-hidden="true" />
                  <span className="landing-showcase-card-label">{service.title}</span>
                  {service.tags?.length > 0 && (
                    <div className="landing-showcase-card-overlay">
                      <p>{service.tags.join(' · ')}</p>
                    </div>
                  )}
                </div>
              </article>

              <a
                href={getQuoteLink(service.title)}
                className="landing-showcase-quote-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Cotizar ahora: ${service.title}`}
              >
                Cotizar ahora
              </a>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="landing-services-nav landing-services-nav--next"
        onClick={() => scrollByDirection(1)}
        disabled={!canScrollRight}
        aria-label="Ver más servicios"
      >
        <ChevronRight size={22} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  );
};
