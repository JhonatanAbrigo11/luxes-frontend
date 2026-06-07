// src/features/proyectos/domain/entities/AsignacionPersonal.js

/**
 * Representa la asignación de un empleado a la fase de instalación.
 * No importa nada de fuera del dominio.
 */
export class AsignacionPersonal {
  constructor({ empleadoId, nombre, rol }) {
    if (!empleadoId) throw new Error('empleadoId es requerido');
    if (!nombre || nombre.trim() === '') throw new Error('nombre es requerido');
    if (!AsignacionPersonal.ROLES.includes(rol)) {
      throw new Error(`Rol inválido. Roles válidos: ${AsignacionPersonal.ROLES.join(', ')}`);
    }

    this.empleadoId = empleadoId;
    this.nombre = nombre.trim();
    this.rol = rol;
  }

  static ROLES = ['Instalador principal', 'Ayudante', 'Conductor'];
}
