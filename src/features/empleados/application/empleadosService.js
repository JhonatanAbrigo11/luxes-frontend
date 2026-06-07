const STORAGE_KEY = 'luxes_empleados';

const MOCK_EMPLEADOS = [
  { id: 'EMP-001', nombre: 'Carlos Mendoza', cedula: '0912345678', cargo: 'Desarrollador Senior', departamento: 'Tecnología', telefono: '0991234567', correo: 'carlos@luxes.com', cuentaBanco: '00123456789012345678', banco: 'Pichincha', tipoContrato: 'Fijo', sueldoDiario: 45, direccion: 'Guayaquil' },
  { id: 'EMP-002', nombre: 'Laura Solís', cedula: '0923456789', cargo: 'Diseñadora UX/UI', departamento: 'Diseño', telefono: '0992345678', correo: 'laura@luxes.com', cuentaBanco: '00234567890123456789', banco: 'Guayaquil', tipoContrato: 'Fijo', sueldoDiario: 40, direccion: 'Guayaquil' },
  { id: 'EMP-003', nombre: 'Andrés López', cedula: '0934567890', cargo: 'Gerente de Proyectos', departamento: 'Operaciones', telefono: '0993456789', correo: 'andres@luxes.com', cuentaBanco: '00345678901234567890', banco: 'Bolivariano', tipoContrato: 'Indefinido', sueldoDiario: 55, direccion: 'Samborondón' },
  { id: 'EMP-004', nombre: 'Sofía Castro', cedula: '0945678901', cargo: 'Analista QA', departamento: 'Tecnología', telefono: '0994567890', correo: 'sofia@luxes.com', cuentaBanco: '00456789012345678901', banco: 'Pichincha', tipoContrato: 'Fijo', sueldoDiario: 38, direccion: 'Guayaquil' },
  { id: 'EMP-005', nombre: 'Miguel Ángel Ruiz', cedula: '0956789012', cargo: 'Contador', departamento: 'Finanzas', telefono: '0995678901', correo: 'miguel@luxes.com', cuentaBanco: '00567890123456789012', banco: 'Pacifico', tipoContrato: 'Indefinido', sueldoDiario: 50, direccion: 'Daule' },
];

const delay = (ms) => new Promise(r => setTimeout(r, ms));

export const getEmpleados = async () => {
  await delay(150);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_EMPLEADOS));
    return MOCK_EMPLEADOS;
  } catch {
    return MOCK_EMPLEADOS;
  }
};

export const saveEmpleado = async (empleado) => {
  await delay(100);
  const list = await getEmpleados();
  const idx = list.findIndex(e => e.id === empleado.id);
  if (idx >= 0) {
    list[idx] = empleado;
  } else {
    const maxNum = list.reduce((max, e) => {
      const n = parseInt(e.id.replace('EMP-', ''), 10);
      return n > max ? n : max;
    }, 0);
    empleado.id = `EMP-${String(maxNum + 1).padStart(3, '0')}`;
    list.push(empleado);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return empleado;
};

export const deleteEmpleado = async (id) => {
  await delay(100);
  const list = await getEmpleados();
  const filtered = list.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return id;
};
