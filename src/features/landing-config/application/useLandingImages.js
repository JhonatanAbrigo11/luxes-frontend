import { useEffect, useState } from 'react';
import { getLandingImageOverrides } from './landingConfigService';
import { mergeLandingImageOverrides } from './landingImageDefaults';

export function useLandingImages() {
  const [images, setImages] = useState(() => mergeLandingImageOverrides());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const overrides = await getLandingImageOverrides();
        if (active) {
          setImages(mergeLandingImageOverrides(overrides));
        }
      } catch (error) {
        console.error('No se pudieron cargar las imágenes del landing:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return { images, loading };
}
