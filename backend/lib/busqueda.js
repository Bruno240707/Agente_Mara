import { supabase } from '../supabaseClient.js';

export class Busqueda {
  async buscarProductosPorCiudad(ciudad) {
    const { data, error } = await supabase
      .from('Usuario')
      .select('nombre, apellido, razonSocial, localildad, Productos(descripcion, precio, detalles)')
      .eq('localidad', ciudad);

    if (error) throw error;
    return data.flatMap(usuario =>
      usuario.Productos.map(prod => ({
        producto: prod.descripcion,
        precio: prod.precio,
        proveedor: usuario.razonSocial,
        ciudad: usuario.localidad,
      }))
    );
  }

  async listarProductosConProveedor() {
    const { data, error } = await supabase
      .from('Productos')
      .select('descripcion, precio, detalles, Usuario(razonSocial, localidad)');

    if (error) throw error;
    return data.map(p => ({
      descripcion: p.descripcion,
      precio: p.precio,
      detalles: p.detalles,
      proveedor: p.Usuario?.razonSocial,
      ciudad: p.Usuario?.localidad,
    }));
  }

  async listarCategorias() {
    const { data, error } = await supabase
      .from('CategoriaProductos')
      .select('descripcion');

    if (error) throw error;
    return data;
  }

  async filtrarProductosPorCiudadYCategorias(ciudad, categorias) {
    const { data, error } = await supabase
      .from('Productos')
      .select('descripcion, precio, detalles, Usuario(localidad, razonSocial), CategoriaProductos(descripcion)')
      .ilike('Usuario.localidad', `%${ciudad}%`)
      .in('CategoriaProductos.descripcion', categorias);

    if (error) throw error;
    return data;
  }

  async filtrarProductosPorCategorias(categorias) {
    const { data, error } = await supabase
      .from('Productos')
      .select('descripcion, precio, detalles, Usuario(razonSocial), CategoriaProductos(descripcion)')
      .in('CategoriaProductos.descripcion', categorias);

    if (error) throw error;
    return data;
  }
}
