import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import './CatalogBook.css';

const BOOK_CATEGORIES = [
  {
    key: 'letreros',
    label: 'Letreros',
    tagline: 'Presencia luminosa en fachada',
    blurb: 'Letreros corpóreos, cajas de luz LED y soluciones volumétricas que hacen brillar tu marca día y noche.',
  },
  {
    key: 'rotulacion',
    label: 'Rotulación',
    tagline: 'Gráfica aplicada con precisión',
    blurb: 'Vinilos, rotulación vehicular y gráfica de alto rendimiento para interiores, vidrios y flotas comerciales.',
  },
  {
    key: 'stands',
    label: 'Stands',
    tagline: 'Espacios que captan miradas',
    blurb: 'Estructuras modulares y stands a medida para ferias, activaciones y eventos corporativos.',
  },
  {
    key: 'senaletica',
    label: 'Señalética',
    tagline: 'Orientación con estilo',
    blurb: 'Placas directorio, señalética arquitectónica y wayfinding con acabados premium.',
  },
];

const buildPages = (items) =>
  BOOK_CATEGORIES.map((category) => ({
    ...category,
    items: items.filter((item) => item.category === category.key),
  })).filter((page) => page.items.length > 0);

const PageCover = ({ page, pageNum, onFlipNext, flipDisabled }) => (
  <div className="catalog-page catalog-page--cover">
    <div className="catalog-page__paper">
      <span className="catalog-page__chapter">Sección {String(pageNum).padStart(2, '0')}</span>
      <h3 className="catalog-page__category-title">{page.label}</h3>
      <p className="catalog-page__category-tagline">{page.tagline}</p>
      <p className="catalog-page__category-blurb">{page.blurb}</p>
      <div className={`catalog-page__mosaic catalog-page__mosaic--${Math.min(page.items.length, 4)}`}>
        {page.items.map((item) => (
          <img key={item.id} src={item.image} alt={item.title} className="catalog-page__mosaic-img" loading="lazy" />
        ))}
      </div>
      <span className="catalog-page__num">{String(pageNum).padStart(2, '0')}</span>
      {onFlipNext && (
        <button
          type="button"
          className="catalog-page__corner catalog-page__corner--next"
          aria-label="Pasar hoja"
          disabled={flipDisabled}
          onClick={onFlipNext}
        />
      )}
    </div>
  </div>
);

const PageProducts = ({ page, pageNum, totalPages, onFlipPrev, flipDisabled }) => (
  <div className="catalog-page catalog-page--products">
    <div className="catalog-page__paper">
      <header className="catalog-page__products-header">
        <span className="catalog-page__category">{page.label}</span>
        <span className="catalog-page__product-count">
          {page.items.length} {page.items.length === 1 ? 'proyecto' : 'proyectos'}
        </span>
      </header>
      <div className="catalog-page__product-list">
        {page.items.map((item) => (
          <article key={item.id} className="catalog-page__product-card">
            <img src={item.image} alt={item.title} className="catalog-page__product-img" loading="lazy" />
            <div className="catalog-page__product-body">
              <h4 className="catalog-page__product-title">{item.title}</h4>
              <p className="catalog-page__product-desc">{item.description}</p>
              <ul className="catalog-page__tags">
                {item.tags.map((tag) => (
                  <li key={tag} className="catalog-page__tag">{tag}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
      <span className="catalog-page__num catalog-page__num--right">
        {String(pageNum).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
      </span>
      {onFlipPrev && (
        <button
          type="button"
          className="catalog-page__corner catalog-page__corner--prev"
          aria-label="Hoja anterior"
          disabled={flipDisabled}
          onClick={onFlipPrev}
        />
      )}
    </div>
  </div>
);

const MobileCategoryPage = ({ page, pageNum, totalPages }) => (
  <div className="catalog-mobile-sheet">
    <div className="catalog-page__paper">
      <span className="catalog-page__chapter">Sección {String(pageNum).padStart(2, '0')}</span>
      <h3 className="catalog-page__category-title">{page.label}</h3>
      <p className="catalog-page__category-tagline">{page.tagline}</p>
      <div className="catalog-page__product-list catalog-page__product-list--mobile">
        {page.items.map((item) => (
          <article key={item.id} className="catalog-page__product-card">
            <img src={item.image} alt={item.title} className="catalog-page__product-img" loading="lazy" />
            <div className="catalog-page__product-body">
              <h4 className="catalog-page__product-title">{item.title}</h4>
              <p className="catalog-page__product-desc">{item.description}</p>
              <ul className="catalog-page__tags">
                {item.tags.map((tag) => (
                  <li key={tag} className="catalog-page__tag">{tag}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
      <span className="catalog-page__num catalog-page__num--right">
        {String(pageNum).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
      </span>
    </div>
  </div>
);

export const CatalogBook = ({ items }) => {
  const pages = useMemo(() => buildPages(items), [items]);
  const [pageIndex, setPageIndex] = useState(0);
  const [flip, setFlip] = useState(null);
  const pendingIndex = useRef(null);

  useEffect(() => {
    setPageIndex(0);
    setFlip(null);
    pendingIndex.current = null;
  }, [items]);

  const totalPages = pages.length;
  const isBusy = Boolean(flip);

  const startFlip = useCallback((direction) => {
    if (isBusy || !pages.length) return;
    const to = direction === 'next' ? pageIndex + 1 : pageIndex - 1;
    if (to < 0 || to >= totalPages) return;
    pendingIndex.current = to;
    setFlip({ direction, from: pageIndex, to });
  }, [isBusy, pages.length, pageIndex, totalPages]);

  const goToPage = (index) => {
    if (isBusy || index === pageIndex) return;
    if (Math.abs(index - pageIndex) === 1) {
      startFlip(index > pageIndex ? 'next' : 'prev');
    } else {
      setPageIndex(index);
    }
  };

  const handleFlipEnd = (event) => {
    if (event.target !== event.currentTarget) return;
    if (pendingIndex.current === null) return;
    setPageIndex(pendingIndex.current);
    pendingIndex.current = null;
    setFlip(null);
  };

  const canGoPrev = pageIndex > 0 && !isBusy;
  const canGoNext = pageIndex < totalPages - 1 && !isBusy;
  const flipNext = () => startFlip('next');
  const flipPrev = () => startFlip('prev');

  if (!pages.length) {
    return (
      <p className="catalog-book-empty" role="status">
        No hay productos en el catálogo por ahora.
      </p>
    );
  }

  const current = pages[pageIndex];
  const fromPage = flip ? pages[flip.from] : current;
  const toPage = flip ? pages[flip.to] : null;

  return (
    <div className="catalog-book" aria-label="Catálogo en formato cuaderno">
      <div className="catalog-notebook">
        <div className="catalog-notebook__binding" aria-hidden="true">
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i} className="catalog-notebook__ring" />
          ))}
        </div>

        <div className="catalog-notebook__body">
          <div className="catalog-notebook__cover catalog-notebook__cover--front" aria-hidden="true">
            <BookOpen size={26} strokeWidth={2} />
            <span>CATÁLOGO LUXES 2026</span>
          </div>

          <div className="catalog-notebook__stack" aria-hidden="true">
            <span className="catalog-notebook__stack-sheet" />
            <span className="catalog-notebook__stack-sheet" />
            <span className="catalog-notebook__stack-sheet" />
            <span className="catalog-notebook__stack-sheet" />
          </div>

          <div className="catalog-notebook__spread-wrap">
            <div className="catalog-notebook__spread">
              <div className="catalog-notebook__desktop">
                {!flip && (
                  <>
                    <PageCover
                      page={current}
                      pageNum={pageIndex + 1}
                      onFlipNext={canGoNext ? flipNext : undefined}
                      flipDisabled={isBusy}
                    />
                    <div className="catalog-notebook__spine" aria-hidden="true" />
                    <PageProducts
                      page={current}
                      pageNum={pageIndex + 1}
                      totalPages={totalPages}
                      onFlipPrev={canGoPrev ? flipPrev : undefined}
                      flipDisabled={isBusy}
                    />
                  </>
                )}

                {flip?.direction === 'next' && toPage && (
                  <>
                    <PageCover page={fromPage} pageNum={flip.from + 1} />
                    <div className="catalog-notebook__spine" aria-hidden="true" />
                    <div className="catalog-notebook__under catalog-notebook__under--right">
                      <PageProducts page={toPage} pageNum={flip.to + 1} totalPages={totalPages} />
                    </div>
                    <div className="catalog-flipper catalog-flipper--next" onAnimationEnd={handleFlipEnd}>
                      <div className="catalog-flipper__face catalog-flipper__face--front">
                        <PageProducts page={fromPage} pageNum={flip.from + 1} totalPages={totalPages} />
                      </div>
                      <div className="catalog-flipper__face catalog-flipper__face--back">
                        <PageCover page={toPage} pageNum={flip.to + 1} />
                      </div>
                      <div className="catalog-flipper__shadow" aria-hidden="true" />
                    </div>
                  </>
                )}

                {flip?.direction === 'prev' && toPage && (
                  <>
                    <div className="catalog-notebook__under catalog-notebook__under--left">
                      <PageCover page={toPage} pageNum={flip.to + 1} />
                    </div>
                    <div className="catalog-notebook__spine" aria-hidden="true" />
                    <PageProducts page={fromPage} pageNum={flip.from + 1} totalPages={totalPages} />
                    <div className="catalog-flipper catalog-flipper--prev" onAnimationEnd={handleFlipEnd}>
                      <div className="catalog-flipper__face catalog-flipper__face--front">
                        <PageCover page={fromPage} pageNum={flip.from + 1} />
                      </div>
                      <div className="catalog-flipper__face catalog-flipper__face--back">
                        <PageProducts page={toPage} pageNum={flip.to + 1} totalPages={totalPages} />
                      </div>
                      <div className="catalog-flipper__shadow" aria-hidden="true" />
                    </div>
                  </>
                )}
              </div>

              <div className="catalog-notebook__mobile">
                {!flip && (
                  <MobileCategoryPage page={current} pageNum={pageIndex + 1} totalPages={totalPages} />
                )}
                {flip && toPage && (
                  <>
                    <div className="catalog-notebook__under catalog-notebook__under--mobile">
                      <MobileCategoryPage page={toPage} pageNum={flip.to + 1} totalPages={totalPages} />
                    </div>
                    <div
                      className={`catalog-flipper catalog-flipper--mobile-${flip.direction}`}
                      onAnimationEnd={handleFlipEnd}
                    >
                      <div className="catalog-flipper__face catalog-flipper__face--front">
                        <MobileCategoryPage page={fromPage} pageNum={flip.from + 1} totalPages={totalPages} />
                      </div>
                      <div className="catalog-flipper__face catalog-flipper__face--back">
                        <MobileCategoryPage page={toPage} pageNum={flip.to + 1} totalPages={totalPages} />
                      </div>
                      <div className="catalog-flipper__shadow" aria-hidden="true" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="catalog-notebook__cover catalog-notebook__cover--back" aria-hidden="true" />
        </div>
      </div>

      <div className="catalog-book-tabs" role="tablist" aria-label="Categorías del catálogo">
        {pages.map((page, index) => (
          <button
            key={page.key}
            type="button"
            role="tab"
            className={`catalog-book-tab ${index === pageIndex ? 'active' : ''}`}
            aria-label={`Ver ${page.label}`}
            aria-selected={index === pageIndex}
            disabled={isBusy}
            onClick={() => goToPage(index)}
          >
            {page.label}
          </button>
        ))}
      </div>

      <div className="catalog-book-controls">
        <button
          type="button"
          className="catalog-book-nav"
          onClick={flipPrev}
          disabled={!canGoPrev}
          aria-label="Página anterior"
        >
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>

        <p className="catalog-book-hint">
          <span className="catalog-book-hint__desktop">Pasa las hojas con las flechas o desde la esquina de la página</span>
          <span className="catalog-book-hint__mobile">Usa las flechas para cambiar de sección</span>
        </p>

        <button
          type="button"
          className="catalog-book-nav"
          onClick={flipNext}
          disabled={!canGoNext}
          aria-label="Página siguiente"
        >
          <ChevronRight size={26} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
