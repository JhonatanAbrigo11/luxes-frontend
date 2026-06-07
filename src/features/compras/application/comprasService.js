const STORAGE_KEY = 'luxes_compras';

const MOCK = [
  { id: 'OC-001', proveedor: 'Importadora del Sur S.A.', fecha: '2026-05-02', items: 5, total: 1250.00, estado: 'recibido', notas: '' },
  { id: 'OC-002', proveedor: 'Tecnología Andina Cía. Ltda.', fecha: '2026-05-10', items: 3, total: 3450.00, estado: 'pendiente', notas: 'Equipos informáticos' },
  { id: 'OC-003', proveedor: 'Carlos Mendoza', fecha: '2026-05-18', items: 2, total: 180.00, estado: 'completado', notas: '' },
  { id: 'OC-004', proveedor: 'Importadora del Sur S.A.', fecha: '2026-05-22', items: 8, total: 3200.00, estado: 'pendiente', notas: 'Insumos de oficina' },
  { id: 'OC-005', proveedor: 'Tecnología Andina Cía. Ltda.', fecha: '2026-06-01', items: 1, total: 890.00, estado: 'recibido', notas: '' },
  { id: 'OC-006', proveedor: 'Carlos Mendoza', fecha: '2026-06-05', items: 4, total: 560.00, estado: 'pendiente', notas: '' },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function getCompras() {
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

export async function saveCompra(compra) {
  await delay(200);
  const list = await getCompras();
  const idx = list.findIndex(c => c.id === compra.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...compra };
  } else {
    const maxNum = list.reduce((max, c) => {
      const n = parseInt(c.id.replace('OC-', ''), 10);
      return n > max ? n : max;
    }, 0);
    compra.id = `OC-${String(maxNum + 1).padStart(3, '0')}`;
    list.push(compra);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return compra;
}

export async function deleteCompra(id) {
  await delay(200);
  const list = await getCompras();
  const filtered = list.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
