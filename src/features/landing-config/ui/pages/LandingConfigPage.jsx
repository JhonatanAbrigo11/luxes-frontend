import React, { useEffect, useState } from 'react';
import { ImageIcon, RotateCcw, Upload } from 'lucide-react';
import {
  getLandingImageOverrides,
  resetLandingImage,
  uploadLandingImage,
} from '../../application/landingConfigService';
import {
  LANDING_IMAGE_SECTIONS,
  mergeLandingImageOverrides,
} from '../../application/landingImageDefaults';
import { toast } from '../../../../shared/ui/components/Toast';
import { confirmDialog } from '../../../../shared/ui/components/ConfirmModal';

export const LandingConfigPage = () => {
  const [overrides, setOverrides] = useState({});
  const [mergedImages, setMergedImages] = useState(() => mergeLandingImageOverrides());
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState(null);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await getLandingImageOverrides();
      setOverrides(data);
      setMergedImages(mergeLandingImageOverrides(data));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleUpload = async (section, item, file) => {
    if (!file) return;

    const uploadKey = `${section}:${item.id}`;
    setUploadingKey(uploadKey);

    try {
      const result = await uploadLandingImage(section, item.id, file);
      setOverrides(result.overrides);
      setMergedImages(mergeLandingImageOverrides(result.overrides));
      toast.success(`Imagen de "${item.label}" actualizada`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al subir imagen');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleReset = async (section, item) => {
    const confirmed = await confirmDialog(
      '¿Restaurar imagen?',
      `Se volverá a usar la imagen predeterminada de "${item.label}".`,
      { confirmLabel: 'Restaurar', cancelLabel: 'Cancelar', type: 'warning' }
    );
    if (!confirmed) return;

    const uploadKey = `${section}:${item.id}`;
    setUploadingKey(uploadKey);

    try {
      const result = await resetLandingImage(section, item.id);
      setOverrides(result.overrides);
      setMergedImages(mergeLandingImageOverrides(result.overrides));
      toast.success(`Imagen de "${item.label}" restaurada`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al restaurar imagen');
    } finally {
      setUploadingKey(null);
    }
  };

  const hasOverride = (section, itemId) => Boolean(overrides?.[section]?.[itemId]);

  return (
    <div className="lc-root p-6 xl:p-8 w-full animate-slide-up" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .lc-header {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
        }
        .lc-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }
        .lc-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          max-width: 640px;
          line-height: 1.6;
        }
        .lc-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }
        .lc-section-title {
          margin: 0 0 6px;
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
        }
        .lc-section-desc {
          margin: 0 0 20px;
          color: #64748b;
          font-size: 13px;
        }
        .lc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .lc-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          background: #f8fafc;
        }
        .lc-preview {
          position: relative;
          aspect-ratio: 16 / 10;
          background: #e2e8f0;
          overflow: hidden;
        }
        .lc-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .lc-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(15, 23, 42, 0.78);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .lc-card-body {
          padding: 14px;
        }
        .lc-card-label {
          margin: 0 0 12px;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }
        .lc-actions {
          display: flex;
          gap: 8px;
        }
        .lc-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .lc-btn-upload {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.25);
        }
        .lc-btn-upload:hover {
          transform: translateY(-1px);
        }
        .lc-btn-upload:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }
        .lc-btn-reset {
          background: white;
          color: #64748b;
          border: 1px solid #cbd5e1;
        }
        .lc-btn-reset:hover:not(:disabled) {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.35);
          background: rgba(239, 68, 68, 0.05);
        }
        .lc-btn-reset:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .lc-file-input {
          display: none;
        }
        .lc-loading {
          padding: 48px;
          text-align: center;
          color: #64748b;
        }
      `}</style>

      <div className="lc-header">
        <div>
          <h1 className="lc-title">Landing page</h1>
          <p className="lc-subtitle">
            Administra las imágenes públicas del sitio: carrusel principal, servicios,
            marcas asociadas y catálogo de productos.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="lc-loading">Cargando configuración del landing...</div>
      ) : (
        LANDING_IMAGE_SECTIONS.map((section) => (
          <section key={section.key} className="lc-section">
            <h2 className="lc-section-title">{section.title}</h2>
            <p className="lc-section-desc">{section.description}</p>

            <div className="lc-grid">
              {section.items.map((item) => {
                const currentSrc = mergedImages[section.key][item.id];
                const isCustom = hasOverride(section.key, item.id);
                const itemKey = `${section.key}:${item.id}`;
                const isBusy = uploadingKey === itemKey;

                return (
                  <article key={item.id} className="lc-card">
                    <div className="lc-preview">
                      <img src={currentSrc} alt={item.label} />
                      <span className="lc-badge">{isCustom ? 'Personalizada' : 'Predeterminada'}</span>
                    </div>
                    <div className="lc-card-body">
                      <p className="lc-card-label">{item.label}</p>
                      <div className="lc-actions">
                        <label className={`lc-btn lc-btn-upload ${isBusy ? 'disabled' : ''}`}>
                          <Upload size={14} />
                          {isBusy ? 'Guardando...' : 'Cambiar'}
                          <input
                            type="file"
                            accept="image/*"
                            className="lc-file-input"
                            disabled={isBusy}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                handleUpload(section.key, item, file);
                              }
                              event.target.value = '';
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          className="lc-btn lc-btn-reset"
                          disabled={!isCustom || isBusy}
                          onClick={() => handleReset(section.key, item)}
                        >
                          <RotateCcw size={14} />
                          Restaurar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}

      {!loading && (
        <div className="lc-section" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ImageIcon size={20} color="#7c3aed" />
          <p className="lc-section-desc" style={{ margin: 0 }}>
            Los cambios se reflejan de inmediato en la página pública del landing.
          </p>
        </div>
      )}
    </div>
  );
};
