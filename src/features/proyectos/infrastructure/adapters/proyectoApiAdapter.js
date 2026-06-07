// src/features/proyectos/infrastructure/adapters/proyectoApiAdapter.js

const BASE_URL = '/api/proyectos';

/**
 * Adaptador API real que implementa el ProyectoRepository con fetch().
 * Descomentar cada método cuando el backend esté disponible.
 */
export const proyectoApiAdapter = {
  async getAll() {
    // TODO: Conectar con GET /api/proyectos
    // const res = await fetch(BASE_URL);
    // if (!res.ok) throw new Error('Error al obtener proyectos');
    // return res.json();
    throw new Error('proyectoApiAdapter.getAll() no implementado — usa el mock por ahora');
  },

  async getById(id) {
    // TODO: Conectar con GET /api/proyectos/:id
    // const res = await fetch(`${BASE_URL}/${id}`);
    // if (!res.ok) throw new Error(`Error al obtener proyecto ${id}`);
    // return res.json();
    throw new Error('proyectoApiAdapter.getById() no implementado');
  },

  async save(proyecto) {
    // TODO: Conectar con POST /api/proyectos
    // const res = await fetch(BASE_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(proyecto),
    // });
    // if (!res.ok) throw new Error('Error al crear proyecto');
    // return res.json();
    throw new Error('proyectoApiAdapter.save() no implementado');
  },

  async update(id, cambios) {
    // TODO: Conectar con PATCH /api/proyectos/:id
    // const res = await fetch(`${BASE_URL}/${id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(cambios),
    // });
    // if (!res.ok) throw new Error(`Error al actualizar proyecto ${id}`);
    // return res.json();
    throw new Error('proyectoApiAdapter.update() no implementado');
  },

  async delete(id) {
    // TODO: Conectar con DELETE /api/proyectos/:id
    // const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    // if (!res.ok) throw new Error(`Error al eliminar proyecto ${id}`);
    throw new Error('proyectoApiAdapter.delete() no implementado');
  },

  async getEmpleados() {
    // TODO: Conectar con GET /api/empleados
    // const res = await fetch('/api/empleados');
    // if (!res.ok) throw new Error('Error al obtener empleados');
    // return res.json();
    throw new Error('proyectoApiAdapter.getEmpleados() no implementado');
  },
};
