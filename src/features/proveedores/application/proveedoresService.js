const STORAGE_KEY = 'luxes_proveedores';

const MOCK = [
  { id: 'PRO-001', nombre: 'Importadora del Sur S.A.', cedulaRuc: '1790034567001', telefono: '022345678', email: 'ventas@importadoradelsur.com', direccion: 'Av. 6 de Diciembre N45-78, Quito', contacto: 'Pedro Martínez', tipo: 'Empresa', notas: 'Proveedor de insumos de oficina' },
  { id: 'PRO-002', nombre: 'Tecnología Andina Cía. Ltda.', cedulaRuc: '1790045678001', telefono: '043456789', email: 'info@tecandina.com', direccion: 'Av. Francisco de Orellana, Guayaquil', contacto: 'Lucía Fernández', tipo: 'Empresa', notas: 'Equipos informáticos' },
  { id: 'PRO-003', nombre: 'Carlos Mendoza', cedulaRuc: '0919876543', telefono: '0998765432', email: 'cmendoza@gmail.com', direccion: 'Cdla. Los Ceibos, Guayaquil', contacto: '', tipo: 'Persona', notas: '' },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProveedores() {
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

export async function saveProveedor(proveedor) {
  await delay(200);
  const list = await getProveedores();
  const idx = list.findIndex(p => p.id === proveedor.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...proveedor };
  } else {
    const maxNum = list.reduce((max, p) => {
      const n = parseInt(p.id.replace('PRO-', ''), 10);
      return n > max ? n : max;
    }, 0);
    proveedor.id = `PRO-${String(maxNum + 1).padStart(3, '0')}`;
    list.push(proveedor);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return proveedor;
}

export async function deleteProveedor(id) {
  await delay(200);
  const list = await getProveedores();
  const filtered = list.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
