import { tool, agent } from "llamaindex";
import { Ollama } from "@llamaindex/ollama";
import { z } from "zod";
import { Busqueda } from "../lib/busqueda.js";

const busqueda = new Busqueda();

const systemPrompt = `
Sos un asistente para consultar productos y proveedores de una plataforma de servicios.
Ayudás a encontrar productos según ciudad, categoría o proveedor.

Responde directamente a las preguntas del usuario sin mostrar tus pensamientos internos ni explicaciones.
No incluyas etiquetas ni texto adicional como "<think>" o "StopEvent" en tus respuestas.
Solo responde con el texto que el usuario debe ver.

Usá las herramientas disponibles para:
- Buscar productos por ciudad
- Listar todos los productos con su proveedor
- Mostrar todas las categorías
- Filtrar productos por ciudad y categoría
- Filtrar productos por categoría

Usá listas markdown (con "- ") para mostrar resultados
`.trim();

const ollamaLLM = new Ollama({
    model: "qwen3:1.7b",
    temperature: 0.75,
    timeout: 2 * 60 * 1000,
    baseUrl: "http://localhost:11436"
});

const buscarProductosPorCiudadTool = tool({
    name: "buscarProductosPorCiudad",
    description: "Busca productos disponibles en una ciudad específica",
    parameters: z.object({
      ciudad: z.string().describe("Nombre de la ciudad"),
    }),
    execute: async ({ ciudad }) => {
      try {
        const productos = await busqueda.buscarProductosPorCiudad(ciudad);
        if (!productos.length) return "No se encontraron productos en esa ciudad.";
        return productos.map(p => 
          `- Producto: ${p.producto}, Precio: $${p.precio}, Proveedor: ${p.proveedor}`
        ).join('\n');
      } catch (error) {
        return `Error: ${error.message}`;
      }
    }
  });
  

const listarProductosTool = tool({
    name: "listarProductos",
    description: "Muestra todos los productos con su proveedor y ciudad",
    parameters: z.object({}),
    execute: async () => {
        try {
            const lista = await busqueda.listarProductosConProveedor();
            if (!lista || lista.length === 0) return "No hay productos registrados.";
            return lista.map(prod =>
                `- Producto: ${prod.descripcion}, Precio: $${prod.precio}, Proveedor: ${prod.proveedor}, Ciudad: ${prod.ciudad}`
            ).join('\n');
        } catch (error) {
            return `Error al listar productos: ${error.message}`;
        }
    },
});

const listarCategoriasTool = tool({
    name: "listarCategorias",
    description: "Muestra la lista de todas las categorías de productos disponibles",
    parameters: z.object({}),
    execute: async () => {
        try {
            const categorias = await busqueda.listarCategorias();
            if (!categorias || categorias.length === 0) return "No hay categorías registradas.";
            return categorias.map(cat =>
                `- Categoría: ${cat.descripcion}`
            ).join('\n');
        } catch (error) {
            return `Error al listar categorías: ${error.message}`;
        }
    },
});

const filtrarProductosPorCiudadYCategoriasTool = tool({
    name: "filtrarProductosPorCiudadYCategorias",
    description: "Filtra productos que estén en una ciudad (puede ser parcial) y pertenezcan a todas las categorías especificadas por nombre",
    parameters: z.object({
        ciudad: z.string().describe("El nombre de la ciudad a buscar (puede ser parcial, puede quedar vacío para no filtrar por ciudad)"),
        categorias: z.array(z.string()).describe("Nombres de las categorías requeridas"),
    }),
    execute: async ({ ciudad, categorias }) => {
        try {
            const productos = await busqueda.filtrarProductosPorCiudadYCategorias(ciudad, categorias);
            if (!productos || productos.length === 0) return "No se encontraron productos en esa ciudad con esas categorías.";
            return productos.map(prod =>
                `- Producto: ${prod.descripcion}, Precio: $${prod.precio}, Proveedor: ${prod.proveedor}, Ciudad: ${prod.ciudad}`
            ).join('\n');
        } catch (error) {
            return `Error al filtrar productos: ${error.message}`;
        }
    },
});

const filtrarProductosPorCategoriasTool = tool({
    name: "filtrarProductosPorCategorias",
    description: "Filtra productos que pertenezcan a todas las categorías especificadas. No filtra por ciudad.",
    parameters: z.object({
        categorias: z.array(z.string()).describe("Nombres de las categorías requeridas"),
    }),
    execute: async ({ categorias }) => {
        try {
            const productos = await busqueda.filtrarProductosPorCiudadYCategorias("", categorias);
            if (!productos || productos.length === 0) return "No se encontraron productos con esas categorías.";
            return productos.map(prod =>
                `- Producto: ${prod.descripcion}, Precio: $${prod.precio}, Proveedor: ${prod.proveedor}, Ciudad: ${prod.ciudad}`
            ).join('\n');
        } catch (error) {
            return `Error al filtrar productos: ${error.message}`;
        }
    },
});

export function crearMarap({ verbose = true } = {}) {
    return agent({
        tools: [
            buscarProductosPorCiudadTool,
            listarProductosTool,
            listarCategoriasTool,
            filtrarProductosPorCiudadYCategoriasTool,
            filtrarProductosPorCategoriasTool
        ],
        llm: ollamaLLM,
        verbose,
        systemPrompt,
    });
}
