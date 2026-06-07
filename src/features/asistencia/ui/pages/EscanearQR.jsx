import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const EscanearQR = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/asistencias/registros', { replace: true });
  }, [navigate]);

  return null;
};