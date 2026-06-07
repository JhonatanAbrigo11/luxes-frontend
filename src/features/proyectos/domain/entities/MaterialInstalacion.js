// src/features/proyectos/domain/entities/MaterialInstalacion.js

/**
 * Representa un material necesario para la fase de instalación.
 * No importa nada de fuera del dominio.
 */
export class MaterialInstalacion {
  constructor({ nombre, cantidad, unidad = 'unidad', observacion = '' }) {
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre del material es requerido');
    }
    if (typeof cantidad !== 'number' || cantidad <= 0) {
      throw new Error('La cantidad debe ser un número mayor a 0');
    }

    this.nombre = nombre.trim();
    this.cantidad = cantidad;
    this.unidad = unidad;
    this.observacion = observacion;
  }

  /** Unidades válidas para materiales de instalación */
  static UNIDADES = ['metro', 'unidad', 'rollo', 'kg', 'plancha', 'litro'];
}
