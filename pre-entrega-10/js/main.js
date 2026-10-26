// Pre-Entrega 10: Tienda deportiva.

class Producto {
  constructor(id, nombre, precio, stock) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
  }

  // Disminuye el stock en la cantidad vendida.
  vender(cantidad) {
    this.stock -= cantidad;
  }
}

const CLAVE_PRODUCTOS = "tienda-productos";
const CLAVE_CARRITO = "tienda-carrito";
const LIMITE_COMPRA = 5000;

const RUTA_DATOS = "./data.json";

// RECUPERAR: JSON.parse devuelve null si la clave no existe; ?? aplica el respaldo.
function leerGuardado(clave, respaldo) {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? respaldo;
  } catch {
    return respaldo;
  }
}

// ALMACENAR / BORRAR: si el carrito está vacío se elimina su clave.
function guardar() {
  localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos));
  carrito.length > 0
    ? localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito))
    : localStorage.removeItem(CLAVE_CARRITO);
}

// Catálogo: se llena de forma asíncrona en cargarCatalogo().
const productos = [];

// Mensaje que se muestra en el catálogo si falla la carga de data.json.
let errorCarga = null;

// Carrito: array de { id, cantidad }.
const carrito = leerGuardado(CLAVE_CARRITO, []);

// ---------- Selección de elementos ----------

const formProducto = document.getElementById("form-producto");
const inputNombre = document.getElementById("input-nombre");
const inputPrecio = document.getElementById("input-precio");
const inputStock = document.getElementById("input-stock");
const inputBuscar = document.getElementById("input-buscar");
const contenedorItems = document.getElementById("contenedor-items");
const contenedorCarrito = document.getElementById("contenedor-carrito");
const totalCarrito = document.getElementById("total-carrito");
const btnFinalizar = document.getElementById("btn-finalizar");
const btnVaciar = document.getElementById("btn-vaciar");

// ---------- Utilidades ----------

// Evita que el texto ingresado se interprete como HTML.
function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// Toastify: notificación de éxito (verde) o error (rojo).
function mostrarMensaje(texto, tipo = "ok") {
  Toastify({
    text: texto,
    duration: 3000,
    gravity: "top",
    position: "right",
    close: true,
    style: { background: tipo === "error" ? "#c92a2a" : "#2b8a3e" },
  }).showToast();
}

// reduce + ?. + ??: total del carrito (precio × cantidad de cada ítem).
const calcularTotal = () =>
  carrito.reduce((acc, { id, cantidad }) => {
    const precio = productos.find((p) => p.id === id)?.precio ?? 0;
    return acc + precio * cantidad;
  }, 0);

// ---------- Renderizado ----------

// filter + map + innerHTML: dibuja las tarjetas que coinciden con la búsqueda.
function renderProductos() {
  const texto = inputBuscar.value.trim().toLowerCase();
  const lista = productos.filter((p) => p.nombre.toLowerCase().includes(texto));

  contenedorItems.innerHTML =
    lista.length === 0
      ? `<p class="vacio">${errorCarga ?? "No se encontraron productos."}</p>`
      : lista
          .map(
            ({ id, nombre, precio, stock }) => `
      <article class="tarjeta ${stock === 0 ? "sin-stock" : ""}">
        <h3>${escaparHtml(nombre)}</h3>
        <p class="precio">$${precio}</p>
        <p class="stock">${stock > 0 ? `Stock: ${stock}` : "Sin stock"}</p>
        <div class="botones">
          <button class="btn" data-accion="agregar" data-id="${id}" ${stock === 0 ? "disabled" : ""}>Agregar</button>
          <button class="btn btn-peligro" data-accion="eliminar" data-id="${id}">Eliminar</button>
        </div>
      </article>`,
          )
          .join("");
}

// map + innerHTML: dibuja los ítems del carrito y actualiza el total.
function renderCarrito() {
  contenedorCarrito.innerHTML =
    carrito.length === 0
      ? '<p class="vacio">Tu carrito está vacío.</p>'
      : carrito
          .map(({ id, cantidad }) => {
            const { nombre, precio } = productos.find((p) => p.id === id);
            return `
        <div class="item-carrito">
          <span>${escaparHtml(nombre)}<br /><small>$${precio * cantidad}</small></span>
          <span class="cantidad">
            <button data-accion="restar" data-id="${id}">−</button>
            ${cantidad}
            <button data-accion="sumar" data-id="${id}">+</button>
          </span>
        </div>`;
          })
          .join("");
  totalCarrito.textContent = `$${calcularTotal()}`;
  btnFinalizar.disabled = btnVaciar.disabled = carrito.length === 0;
}

// Tras cada cambio: guardar en localStorage y volver a renderizar.
function renderTodo() {
  renderProductos();
  renderCarrito();
  guardar();
}

// ---------- Acciones ----------

// Valida el formulario, crea el producto y refresca la vista.
function agregarProducto(evento) {
  evento.preventDefault();
  const nombre = inputNombre.value.trim();
  const precio = Number(inputPrecio.value);
  const stock = Number(inputStock.value);

  if (nombre === "" || !(precio > 0) || !Number.isInteger(stock) || stock < 0) {
    mostrarMensaje(
      "Completá nombre, precio mayor a 0 y stock entero.",
      "error",
    );
    return;
  }

  // reduce: próximo id = mayor id actual + 1.
  const nuevoId = productos.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  productos.push(new Producto(nuevoId, nombre, precio, stock));
  formProducto.reset();
  renderTodo();
  mostrarMensaje(`Se agregó "${nombre}" al catálogo.`);
}

// Quita un producto del catálogo y del carrito. splice + destructuring.
function eliminarProducto(id) {
  const indice = productos.findIndex((p) => p.id === id);
  const [{ nombre }] = productos.splice(indice, 1);
  const enCarrito = carrito.findIndex((i) => i.id === id);
  if (enCarrito !== -1) carrito.splice(enCarrito, 1);
  renderTodo();
  mostrarMensaje(`Se eliminó "${nombre}" del catálogo.`, "error");
}

// Suma una unidad al carrito si alcanza el stock.
function agregarAlCarrito(id) {
  const { nombre, stock } = productos.find((p) => p.id === id);
  const item = carrito.find((i) => i.id === id);
  if ((item?.cantidad ?? 0) + 1 > stock) {
    mostrarMensaje(`No hay más stock de "${nombre}".`, "error");
    return;
  }
  item ? item.cantidad++ : carrito.push({ id, cantidad: 1 });
  renderTodo();
  mostrarMensaje(`"${nombre}" se agregó al carrito.`);
}

// Resta una unidad; si llega a 0 el ítem sale del carrito.
function restarDelCarrito(id) {
  const item = carrito.find((i) => i.id === id);
  item.cantidad--;
  if (item.cantidad === 0) carrito.splice(carrito.indexOf(item), 1);
  renderTodo();
}

function vaciarCarrito() {
  carrito.length = 0;
  renderTodo();
  mostrarMensaje("Vaciaste el carrito.", "error");
}

// ---------- Asincronía ----------

// Promesa: simula la pasarela de pago (resuelve o rechaza tras 1,5 s con setTimeout).
function procesarPago(total) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      total > LIMITE_COMPRA
        ? reject(new Error(`el monto supera el límite de $${LIMITE_COMPRA}`))
        : resolve(total);
    }, 1500);
  });
}

// try/catch/finally + await: confirma la compra solo si el pago se aprueba.
async function finalizarCompra() {
  btnFinalizar.disabled = true;
  mostrarMensaje("⏳ Procesando pago...");
  try {
    const total = await procesarPago(calcularTotal());
    // forEach + destructuring + ?.: descuenta el stock de cada ítem comprado.
    carrito.forEach(({ id, cantidad }) =>
      productos.find((p) => p.id === id)?.vender(cantidad),
    );
    carrito.length = 0;
    renderTodo();
    mostrarMensaje(`✔️ ¡Gracias por tu compra! Total pagado: $${total}`);
  } catch ({ message }) {
    mostrarMensaje(
      `⚠️ No se pudo procesar la operación: ${message}. Intentá de nuevo.`,
      "error",
    );
  } finally {
    // Se ejecuta siempre: vuelve a habilitar el botón si quedan ítems.
    btnFinalizar.disabled = carrito.length === 0;
  }
}

// fetch + await: pide el catálogo a data.json y valida la respuesta HTTP.
async function obtenerProductos() {
  const respuesta = await fetch(RUTA_DATOS);
  if (!respuesta.ok) {
    throw new Error(`el servidor respondió ${respuesta.status}`);
  }
  return respuesta.json();
}

// await dentro de try/catch/finally: carga el catálogo y activa la interfaz.
async function cargarCatalogo() {
  contenedorItems.innerHTML = '<p class="vacio">Cargando productos...</p>';
  try {
    const datos = await obtenerProductos();
    // Lo guardado por el usuario (stock, altas, bajas) tiene prioridad sobre el JSON.
    const lista = leerGuardado(CLAVE_PRODUCTOS, null) ?? datos;
    productos.push(
      ...lista.map(
        ({ id, nombre, precio, stock }) =>
          new Producto(id, nombre, precio, stock),
      ),
    );
    mostrarMensaje(`Éxito. ${productos.length} productos cargados`);
  } catch ({ message }) {
    errorCarga = `⚠️ No se pudieron cargar los productos (${message}).`;
    mostrarMensaje(errorCarga, "error");
  } finally {
    // Descarta ítems del carrito cuyo producto ya no existe.
    const vigentes = carrito.filter(({ id }) =>
      productos.some((p) => p.id === id),
    );
    carrito.splice(0, carrito.length, ...vigentes);
    activarEventos();
    renderTodo();
  }
}

// ---------- Eventos ----------

// Los eventos se activan recién cuando el catálogo está cargado.
function activarEventos() {
  formProducto.addEventListener("submit", agregarProducto);
  inputBuscar.addEventListener("keyup", renderProductos);
  btnFinalizar.addEventListener("click", finalizarCompra);
  btnVaciar.addEventListener("click", vaciarCarrito);

  // Delegación de eventos: un solo listener para todos los botones con data-accion.
  document.addEventListener("click", (evento) => {
    const { accion, id } =
      evento.target.closest("button[data-accion]")?.dataset ?? {};
    const acciones = {
      agregar: agregarAlCarrito,
      sumar: agregarAlCarrito,
      restar: restarDelCarrito,
      eliminar: eliminarProducto,
    };
    acciones[accion]?.(Number(id));
  });
}

cargarCatalogo();
