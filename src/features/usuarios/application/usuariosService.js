const STORAGE_KEY = 'luxes_usuarios';

const MOCK = [
  { id: 'USR-001', nombre: 'Admin Principal', email: 'admin@luxes.com', rol: 'admin', estado: 'activo', fechaCreacion: '2025-01-15' },
  { id: 'USR-002', nombre: 'María Fernanda Torres', email: 'maria.torres@luxes.com', rol: 'editor', estado: 'activo', fechaCreacion: '2025-02-20' },
  { id: 'USR-003', nombre: 'Carlos Mendoza', email: 'carlos.mendoza@luxes.com', rol: 'visor', estado: 'activo', fechaCreacion: '2025-03-10' },
  { id: 'USR-004', nombre: 'Lucía Fernández', email: 'lucia.fernandez@luxes.com', rol: 'editor', estado: 'inactivo', fechaCreacion: '2025-04-05' },
  { id: 'USR-005', nombre: 'Pedro Martínez', email: 'pedro.martinez@luxes.com', rol: 'visor', estado: 'activo', fechaCreacion: '2025-05-12' },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function getUsuarios() {
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

export async function saveUsuario(usuario) {
  await delay(200);
  const list = await getUsuarios();
  const idx = list.findIndex(u => u.id === usuario.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...usuario };
  } else {
    const maxNum = list.reduce((max, u) => {
      const n = parseInt(u.id.replace('USR-', ''), 10);
      return n > max ? n : max;
    }, 0);
    usuario.id = `USR-${String(maxNum + 1).padStart(3, '0')}`;
    usuario.fechaCreacion = new Date().toISOString().split('T')[0];
    list.push(usuario);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return usuario;
}

export async function deleteUsuario(id) {
  await delay(200);
  const list = await getUsuarios();
  const filtered = list.filter(u => u.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
