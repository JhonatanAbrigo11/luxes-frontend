// c:/Users/Morqu/OneDrive/Documentos/JAIMS/Luxes/luxes-frontend/src/features/nomina/domain/value-objects/Periodo.js

/**
 * Objeto de Valor: Periodo
 */
export class Periodo {
  /**
   * @param {string} fechaInicio - Fecha de inicio (AAAA-MM-DD)
   * @param {string} fechaFin - Fecha de fin (AAAA-MM-DD)
   */
  constructor(fechaInicio, fechaFin) {
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.validate();
  }

  /**
   * Valida las fechas del período
   * @throws {Error}
   */
  validate() {
    if (!this.fechaInicio || !this.fechaFin) {
      throw new Error("Las fechas de inicio y fin son requeridas para el período.");
    }
    const start = new Date(this.fechaInicio);
    const end = new Date(this.fechaFin);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Las fechas ingresadas para el período no son válidas.");
    }
    if (start > end) {
      throw new Error("La fecha de inicio no puede ser posterior a la fecha de fin.");
    }
  }

  /**
   * Calcula la diferencia de días calendario
   * @returns {number}
   */
  obtenerDiasCalendario() {
    const start = new Date(this.fechaInicio);
    const end = new Date(this.fechaFin);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Devuelve una descripción legible del período
   * @returns {string}
   */
  toString() {
    return `${this.fechaInicio} al ${this.fechaFin}`;
  }
}
