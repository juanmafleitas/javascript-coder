// Pre-Entrega 8: Tienda deportiva. Sincronización de estado entre DOM y Storage.

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

// Catálogo inicial (se usa solo si no hay datos guardados).
const productosIniciales = [
  new Producto(1, "Adidas Shoes", 900, 10),
  new Producto(2, "Nike Sneakers", 1500, 5),
  new Producto(3, "Puma Tee", 1100, 20),
  new Producto(4, "Asics Gel", 1200, 7),
  new Producto(5, "Reebok Classic", 1000, 0),
  new Producto(6, "New Balance 574", 1300, 12),
];

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

// Destructuring: reconstruye las instancias de Producto guardadas.
const productos = leerGuardado(CLAVE_PRODUCTOS, productosIniciales).map(
  ({ id, nombre, precio, stock }) => new Producto(id, nombre, precio, stock),
);

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
const mensaje = document.getElementById("aviso");
const btnFinalizar = document.getElementById("btn-finalizar");
const btnVaciar = document.getElementById("btn-vaciar");

// ---------- Utilidades ----------

// Evita que el texto ingresado se interprete como HTML.
function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// Feedback visual: muestra un mensaje de éxito o error.
function mostrarMensaje(texto, tipo = "ok") {
  mensaje.textContent = texto;
  mensaje.className = `mensaje visible ${tipo}`;
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
      ? '<p class="vacio">No se encontraron productos.</p>'
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

// forEach + destructuring + ?.: descuenta el stock de cada ítem comprado.
function finalizarCompra() {
  const total = calcularTotal();
  carrito.forEach(({ id, cantidad }) =>
    productos.find((p) => p.id === id)?.vender(cantidad),
  );
  carrito.length = 0;
  renderTodo();
  mostrarMensaje(`¡Gracias por tu compra! Total pagado: $${total}`);
}

// ---------- Eventos ----------

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

renderTodo();
