const STORAGE_KEY = 'luxes_clientes';

const MOCK_CLIENTES = [
  { id: 'CLI-001', nombre: 'Corporación Lojana S.A.', cedulaRuc: '1790012345001', telefono: '0991234567', email: 'info@corporacionlojana.com', direccion: 'Av. Amazonas N32-456, Quito', tipo: 'Empresa', notas: 'Cliente corporativo, pago a 30 días' },
  { id: 'CLI-002', nombre: 'María Fernanda Torres', cedulaRuc: '0912345678', telefono: '0987654321', email: 'maria.torres@gmail.com', direccion: 'Cdla. Kennedy Norte, Guayaquil', tipo: 'Persona', notas: '' },
  { id: 'CLI-003', nombre: 'Distribuidora del Pacífico', cedulaRuc: '1790023456001', telefono: '042345678', email: 'ventas@distpacifico.com', direccion: 'Av. 9 de Octubre 1204, Guayaquil', tipo: 'Empresa', notas: '' },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function getClientes() {
  await delay(200);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CLIENTES));
    return [...MOCK_CLIENTES];
  } catch {
    return [...MOCK_CLIENTES];
  }
}

export async function saveCliente(cliente) {
  await delay(200);
  const list = await getClientes();
  const idx = list.findIndex(c => c.id === cliente.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...cliente };
  } else {
    const maxNum = list.reduce((max, c) => {
      const n = parseInt(c.id.replace('CLI-', ''), 10);
      return n > max ? n : max;
    }, 0);
    cliente.id = `CLI-${String(maxNum + 1).padStart(3, '0')}`;
    list.push(cliente);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return cliente;
}

export async function deleteCliente(id) {
  await delay(200);
  const list = await getClientes();
  const filtered = list.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
