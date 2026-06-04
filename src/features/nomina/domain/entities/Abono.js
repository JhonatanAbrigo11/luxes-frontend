// c:/Users/Morqu/OneDrive/Documentos/JAIMS/Luxes/luxes-frontend/src/features/nomina/domain/entities/Abono.js

/**
 * Entidad Abono
 */
export class Abono {
  /**
   * @param {Object} data
   * @param {number} data.monto - Monto abonado
   * @param {string} data.fecha - Fecha del abono (AAAA-MM-DD)
   */
  constructor({ monto, fecha }) {
    this.monto = Number(monto);
    this.fecha = fecha;
  }

  /**
   * Valida el abono
   * @returns {boolean}
   */
  validate() {
    if (isNaN(this.monto) || this.monto <= 0) throw new Error("El monto del abono debe ser mayor a cero.");
    if (!this.fecha) throw new Error("La fecha del abono es obligatoria.");
    return true;
  }
}
