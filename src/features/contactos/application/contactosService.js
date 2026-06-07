const STORAGE_KEY = 'luxes_contactos';

const MOCK = [
  { id: 'CON-001', nombre: 'Ana Lucía Rivas', telefono: '0991237890', email: 'ana.rivas@corporacionlojana.com', empresa: 'Corporación Lojana S.A.', cargo: 'Gerente de Compras', notas: '' },
  { id: 'CON-002', nombre: 'Roberto Gómez', telefono: '0984561230', email: 'rgomez@distpacifico.com', empresa: 'Distribuidora del Pacífico', cargo: 'Jefe de Logística', notas: 'Prefiere contacto por email' },
  { id: 'CON-003', nombre: 'María José Paredes', telefono: '042567890', email: 'mjparedes@tecandina.com', empresa: 'Tecnología Andina Cía. Ltda.', cargo: 'Coordinadora de Ventas', notas: '' },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function getContactos() {
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

export async function saveContacto(contacto) {
  await delay(200);
  const list = await getContactos();
  const idx = list.findIndex(c => c.id === contacto.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...contacto };
  } else {
    const maxNum = list.reduce((max, c) => {
      const n = parseInt(c.id.replace('CON-', ''), 10);
      return n > max ? n : max;
    }, 0);
    contacto.id = `CON-${String(maxNum + 1).padStart(3, '0')}`;
    list.push(contacto);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return contacto;
}

export async function deleteContacto(id) {
  await delay(200);
  const list = await getContactos();
  const filtered = list.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
