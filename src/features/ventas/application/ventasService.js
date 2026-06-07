const STORAGE_KEY = 'luxes_ventas';

const MOCK = [
  { id: 'FAC-001', cliente: 'Corporación Lojana S.A.', fecha: '2026-05-05', items: 3, total: 5400.00, estado: 'pagado', metodo: 'transferencia', notas: 'Pago a 30 días' },
  { id: 'FAC-002', cliente: 'María Fernanda Torres', fecha: '2026-05-12', items: 1, total: 250.00, estado: 'pagado', metodo: 'efectivo', notas: '' },
  { id: 'FAC-003', cliente: 'Distribuidora del Pacífico', fecha: '2026-05-20', items: 5, total: 8900.00, estado: 'pendiente', metodo: 'credito', notas: 'Factura a 60 días' },
  { id: 'FAC-004', cliente: 'Corporación Lojana S.A.', fecha: '2026-06-01', items: 2, total: 1200.00, estado: 'pagado', metodo: 'transferencia', notas: '' },
  { id: 'FAC-005', cliente: 'María Fernanda Torres', fecha: '2026-06-08', items: 4, total: 780.00, estado: 'pendiente', metodo: 'efectivo', notas: '' },
  { id: 'FAC-006', cliente: 'Distribuidora del Pacífico', fecha: '2026-06-10', items: 7, total: 12300.00, estado: 'pagado', metodo: 'cheque', notas: 'Pago anticipado' },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function getVentas() {
  await delay(200);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK));
    return [...MOCK];
  } catch {
    return [...MOCK];
  }
}

export async function saveVenta(venta) {
  await delay(200);
  const list = await getVentas();
  const idx = list.findIndex(v => v.id === venta.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...venta };
  } else {
    const maxNum = list.reduce((max, v) => {
      const n = parseInt(v.id.replace('FAC-', ''), 10);
      return n > max ? n : max;
    }, 0);
    venta.id = `FAC-${String(maxNum + 1).padStart(3, '0')}`;
    list.push(venta);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return venta;
}

export async function deleteVenta(id) {
  await delay(200);
  const list = await getVentas();
  const filtered = list.filter(v => v.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
