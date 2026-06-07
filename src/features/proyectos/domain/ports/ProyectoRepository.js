// src/features/proyectos/domain/ports/ProyectoRepository.js

/**
 * Puerto (interfaz) que define las operaciones de persistencia para Proyectos.
 * La infraestructura debe implementar todos estos métodos.
 *
 * @interface ProyectoRepository
 */
export class ProyectoRepository {
  /**
   * Obtiene todos los proyectos.
   * @returns {Promise<Proyecto[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async getAll() {
    throw new Error('ProyectoRepository.getAll() no implementado');
  }

  /**
   * Obtiene un proyecto por su id.
   * @param {string} id
   * @returns {Promise<Proyecto|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getById(id) {
    throw new Error('ProyectoRepository.getById() no implementado');
  }

  /**
   * Guarda (crea o actualiza) un proyecto.
   * @param {Proyecto} proyecto
   * @returns {Promise<Proyecto>}
   */
  // eslint-disable-next-line no-unused-vars
  async save(proyecto) {
    throw new Error('ProyectoRepository.save() no implementado');
  }

  /**
   * Actualiza parcialmente un proyecto.
   * @param {string} id
   * @param {Partial<Proyecto>} cambios
   * @returns {Promise<Proyecto>}
   */
  // eslint-disable-next-line no-unused-vars
  async update(id, cambios) {
    throw new Error('ProyectoRepository.update() no implementado');
  }

  /**
   * Elimina un proyecto por su id.
   * @param {string} id
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async delete(id) {
    throw new Error('ProyectoRepository.delete() no implementado');
  }
}
