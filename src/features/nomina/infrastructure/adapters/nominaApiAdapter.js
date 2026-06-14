import { NominaRepositoryPort } from '../../domain/ports/NominaRepositoryPort';
import { Empleado } from '../../domain/entities/Empleado';
import { Nomina } from '../../domain/entities/Nomina';
import { HoraExtra } from '../../domain/entities/HoraExtra';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

const parseResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'Error en la operación');
  }
  return data.data;
};

export class NominaApiAdapter extends NominaRepositoryPort {
  constructor(baseUrl = '/api') {
    super();
    this.baseUrl = baseUrl;
  }

  async getEmployees() {
    const data = await parseResponse(
      await fetch(`${this.baseUrl}/empleados`, { headers: getHeaders() })
    );
    return data.map((emp) =>
      new Empleado({
        id: emp.id,
        nombre: emp.nombre,
        sueldoDiario: emp.sueldoDiario || 1,
        departamento: emp.departamento,
        cargo: emp.cargo,
        cedula: emp.cedula,
        tipoContrato: emp.tipoContrato,
        banco: emp.banco,
        cuentaBanco: emp.cuentaBanco,
      })
    );
  }

  async getPayrolls(fechaInicio, fechaFin) {
    const params = new URLSearchParams({ fechaInicio, fechaFin });
    const data = await parseResponse(
      await fetch(`${this.baseUrl}/nomina/nominas?${params}`, { headers: getHeaders() })
    );
    return data.map((item) => new Nomina(item));
  }

  async savePayroll(nomina) {
    const payload = {
      empleadoId: nomina.empleadoId,
      fechaInicio: nomina.fechaInicio,
      fechaFin: nomina.fechaFin,
      diasLaborables: nomina.diasLaborables,
      diasLaborados: nomina.diasLaborados,
      permisoHoras: nomina.permisoHoras,
      ingresos: nomina.ingresos,
      egresos: nomina.egresos,
      abonos: nomina.abonos,
      estado: nomina.estado,
    };

    const data = await parseResponse(
      await fetch(`${this.baseUrl}/nomina/nominas`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
    );
    return new Nomina(data);
  }

  async getOvertime(fechaInicio, fechaFin) {
    const params = new URLSearchParams({ fechaInicio, fechaFin });
    const data = await parseResponse(
      await fetch(`${this.baseUrl}/nomina/horas-extras?${params}`, { headers: getHeaders() })
    );
    return data.map((he) => new HoraExtra(he));
  }

  async saveOvertime(horasExtras, fechaInicio, fechaFin) {
    const records = horasExtras.map((he) => ({
      id: he.id,
      fecha: he.fecha,
      colaboradorId: he.colaboradorId,
      horas: he.horas,
      detalleHorario: he.detalleHorario,
      descripcion: he.descripcion,
      valorPorHora: he.valorPorHora,
      total: he.total,
    }));

    const data = await parseResponse(
      await fetch(`${this.baseUrl}/nomina/horas-extras/bulk`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ fechaInicio, fechaFin, records }),
      })
    );
    return data.map((he) => new HoraExtra(he));
  }
}
