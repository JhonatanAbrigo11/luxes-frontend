const STORAGE_KEY = 'luxes_proformas';

const MOCK_PROFORMAS = [
  {
    id: 'PRO-001',
    cliente: 'Distribuidora XYZ',
    telefono: '0991234567',
    email: 'info@distxyz.com',
    fecha: '2026-06-01',
    vencimiento: '2026-07-01',
    items: [
      { descripcion: 'Camisetas personalizadas', cantidad: 50, precioUnitario: 12.50 },
      { descripcion: 'Gorras bordadas', cantidad: 30, precioUnitario: 8.00 },
    ],
    iva: 0.12,
    notas: 'Entrega a acordar',
    estado: 'Pendiente',
  },
  {
    id: 'PRO-002',
    cliente: 'Corporación ABC',
    telefono: '0987654321',
    email: 'ventas@corpabc.com',
    fecha: '2026-06-03',
    vencimiento: '2026-07-03',
    items: [
      { descripcion: 'Servicio de diseño gráfico', cantidad: 1, precioUnitario: 450.00 },
    ],
    iva: 0.12,
    notas: '',
    estado: 'Aprobada',
  },
  {
    id: 'PRO-003',
    cliente: 'Comercial López',
    telefono: '0976543210',
    email: 'comercial.lopez@gmail.com',
    fecha: '2026-06-05',
    vencimiento: '2026-07-05',
    items: [
      { descripcion: 'Lotes de esferos publicitarios', cantidad: 100, precioUnitario: 1.50 },
      { descripcion: 'Cuadernos institucionales', cantidad: 200, precioUnitario: 3.25 },
      { descripcion: 'Stickers personalizados', cantidad: 500, precioUnitario: 0.45 },
    ],
    iva: 0.12,
    notas: 'Descuento por volumen aplicado del 5%',
    estado: 'Rechazada',
  },
];

const delay = (ms) => new Promise(r => setTimeout(r, 150));

export const getProformas = async () => {
  await delay();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROFORMAS));
    return MOCK_PROFORMAS;
  } catch {
    return MOCK_PROFORMAS;
  }
};

export const saveProforma = async (proforma) => {
  await delay();
  const list = await getProformas();
  const idx = list.findIndex(p => p.id === proforma.id);
  if (idx >= 0) {
    list[idx] = proforma;
  } else {
    const maxNum = list.reduce((max, p) => {
      const n = parseInt(p.id.replace('PRO-', ''), 10);
      return n > max ? n : max;
    }, 0);
    proforma.id = `PRO-${String(maxNum + 1).padStart(3, '0')}`;
    list.push(proforma);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return proforma;
};

export const deleteProforma = async (id) => {
  await delay();
  const list = await getProformas();
  const filtered = list.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return id;
};

export const updateProformaEstado = async (id, estado) => {
  await delay();
  const list = await getProformas();
  const idx = list.findIndex(p => p.id === id);
  if (idx >= 0) {
    list[idx].estado = estado;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list[idx];
  }
  return null;
};
