// src/features/proyectos/domain/entities/Fase.js

/**
 * Representa el estado de una fase dentro de un proyecto.
 * No importa nada de fuera del dominio.
 */
export class Fase {
  constructor({
    completada = false,
    fechaCompletada = null,
    datos = {},
  } = {}) {
    this.completada = completada;
    this.fechaCompletada = fechaCompletada;
    this.datos = datos;
  }

  /** Marca la fase como completada con la fecha actual */
  completar() {
    return new Fase({
      completada: true,
      fechaCompletada: new Date().toISOString().split('T')[0],
      datos: this.datos,
    });
  }

  /** Actualiza los datos de la fase */
  actualizarDatos(nuevosDatos) {
    return new Fase({
      completada: this.completada,
      fechaCompletada: this.fechaCompletada,
      datos: { ...this.datos, ...nuevosDatos },
    });
  }
}
