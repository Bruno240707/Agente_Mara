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
- Registrarse en la plataforma
- Iniciar sesión correctamente
- Recuperar una contraseña olvidada

Usá las herramientas disponibles para dar instrucciones claras y paso a paso.
Usá listas markdown (con "- ") para mostrar resultados
`.trim();

const ollamaLLM = new Ollama({
    model: "qwen3:1.7b",
    temperature: 0.75,
    timeout: 2 * 60 * 1000,
    baseUrl: "http://localhost:11435"
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
        ).join('');
      } catch (error) {
        return `Error: ${error.message}`;
      }
    }
  });
  
  export const guiarEditarPerfilTool = tool({
    name: "guiarEditarPerfil",
    description: "Guía al usuario para editar su perfil (nombre, email, contraseña)",
    parameters: z.object({}),
    execute: async () => {
      return `Para editar tu perfil:
  1. Iniciá sesión en la plataforma.
  2. Hacé clic en tu nombre o ícono de usuario (arriba a la derecha).
  3. Elegí la opción “Editar perfil”.
  4. Modificá los datos que necesites (nombre, email, contraseña, etc.).
  5. Guardá los cambios.`;
    },
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
            ).join('');
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
            ).join('');
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
            ).join('');
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
            ).join('');
        } catch (error) {
            return `Error al filtrar productos: ${error.message}`;
        }
    },
});

export const guiarRegistroTool = tool({
    name: "guiarRegistro",
    description: "Indica al usuario cómo registrarse en la plataforma paso a paso",
    parameters: z.object({}),
    execute: async () => {
      return `Para registrarte en la plataforma:
  1. Hacé clic en el botón "Registrarse" en la parte superior derecha.
  2. Ingresá tu nombre de usuario, correo electrónico y una contraseña segura.
  3. Confirmá los datos y presioná "Crear cuenta".
  4. ¡Listo! Ya podés iniciar sesión con tus credenciales.`;
    },
});

export const guiarLoginTool = tool({
    name: "guiarLogin",
    description: "Indica al usuario cómo iniciar sesión correctamente",
    parameters: z.object({}),
    execute: async () => {
      return `Para iniciar sesión:
  1. Hacé clic en el botón "Iniciar sesión" en la pantalla principal.
  2. Escribí tu nombre de usuario y contraseña.
  3. Presioná "Entrar" y accederás a tu cuenta.`;
    },
});

export const guiarRecuperarClaveTool = tool({
    name: "guiarRecuperarClave",
    description: "Indica cómo recuperar una contraseña olvidada",
    parameters: z.object({}),
    execute: async () => {
      return `Si olvidaste tu contraseña:
  1. En la pantalla de inicio de sesión, hacé clic en “¿Olvidaste tu contraseña?”.
  2. Ingresá el correo electrónico asociado a tu cuenta.
  3. Revisá tu email y seguí las instrucciones para restablecer tu contraseña.`;
    },
});

export const guiarEliminarCuentaTool = tool({
    name: "guiarEliminarCuenta",
    description: "Explica cómo eliminar la cuenta del sistema",
    parameters: z.object({}),
    execute: async () => {
      return `Si querés eliminar tu cuenta:
  1. Iniciá sesión.
  2. Accedé a “Editar perfil” o “Configuración”.
  3. Al final de la página, encontrarás la opción “Eliminar cuenta”.
  4. Confirmá la acción ingresando tu contraseña.
  ⚠️ Esta acción es irreversible.`;
    },
});

export const guiarPublicarProductoTool = tool({
    name: "guiarPublicarProducto",
    description: "Explica cómo un usuario puede publicar un producto con fotos, precio y detalles",
    parameters: z.object({}),
    execute: async () => {
      return `Para publicar un producto:
  1. Iniciá sesión en la plataforma.
  2. Dirigite a la sección “Mis productos” o “Publicar producto”.
  3. Completá:
     - Descripción del producto
     - Precio
     - Categoría
     - Fotos (opcional)
     - Detalles adicionales
  4. Guardá los cambios y el producto quedará disponible.`;
    },
});

export function crearMarap({ verbose = true } = {}) {
    return agent({
        tools: [
            buscarProductosPorCiudadTool,
            listarProductosTool,
            listarCategoriasTool,
            filtrarProductosPorCiudadYCategoriasTool,
            filtrarProductosPorCategoriasTool,
            guiarRegistroTool,
            guiarLoginTool,
            guiarRecuperarClaveTool,
            guiarEditarPerfilTool,
            guiarEliminarCuentaTool,
            guiarPublicarProductoTool,
        ],
        llm: ollamaLLM,
        verbose,
        systemPrompt,
    });
}


