const STORAGE_KEY = 'luxes_gastos';

const MOCK = [
  { id: 'GTO-001', concepto: 'Papelería y útiles de oficina', categoria: 'oficina', fecha: '2026-05-03', monto: 125.50, proveedor: 'Importadora del Sur S.A.', notas: '' },
  { id: 'GTO-002', concepto: 'Mantenimiento de equipos', categoria: 'mantenimiento', fecha: '2026-05-08', monto: 340.00, proveedor: 'Tecnología Andina Cía. Ltda.', notas: 'Impresoras y scanner' },
  { id: 'GTO-003', concepto: 'Servicio de internet', categoria: 'servicios', fecha: '2026-05-15', monto: 89.90, proveedor: 'NetPlus', notas: 'Plan corporativo mayo' },
  { id: 'GTO-004', concepto: 'Transporte de materiales', categoria: 'logistica', fecha: '2026-05-20', monto: 210.00, proveedor: 'Carlos Mendoza', notas: '' },
  { id: 'GTO-005', concepto: 'Alimentación personal', categoria: 'varios', fecha: '2026-05-22', monto: 56.00, proveedor: '', notas: 'Reunión de equipo' },
  { id: 'GTO-006', concepto: 'Material de limpieza', categoria: 'oficina', fecha: '2026-06-01', monto: 78.50, proveedor: 'Importadora del Sur S.A.', notas: '' },
  { id: 'GTO-007', concepto: 'Envío de documentos', categoria: 'logistica', fecha: '2026-06-05', monto: 15.00, proveedor: 'ServiEntrega', notas: '' },
  { id: 'GTO-008', concepto: 'Suscripción software', categoria: 'servicios', fecha: '2026-06-07', monto: 199.00, proveedor: 'CloudTech', notas: 'Plan mensual herramientas' },
];

const CATEGORIAS = ['oficina', 'mantenimiento', 'servicios', 'logistica', 'varios'];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function getGastos() {
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

export async function saveGasto(gasto) {
  await delay(200);
  const list = await getGastos();
  const idx = list.findIndex(g => g.id === gasto.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...gasto };
  } else {
    const maxNum = list.reduce((max, g) => {
      const n = parseInt(g.id.replace('GTO-', ''), 10);
      return n > max ? n : max;
    }, 0);
    gasto.id = `GTO-${String(maxNum + 1).padStart(3, '0')}`;
    list.push(gasto);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return gasto;
}

export async function deleteGasto(id) {
  await delay(200);
  const list = await getGastos();
  const filtered = list.filter(g => g.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export { CATEGORIAS };
