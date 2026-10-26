// Pre-Entrega 7: Tienda deportiva. Interfaz completa mediante DOM y eventos.

// ---------- Modelo ----------

// Clase Producto (Módulo 5): base de los objetos del simulador.
class Producto {
  constructor(id, nombre, precio, stock) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
  }

  // Disminuye el stock; devuelve el total vendido o 0 si no alcanza.
  vender(cantidad = 1) {
    if (cantidad > this.stock) return 0;
    this.stock -= cantidad;
    return this.precio * cantidad;
  }
}

const CLAVE_PRODUCTOS = "tienda-productos";
const CLAVE_CARRITO = "tienda-carrito";

// Catálogo inicial (se usa si no hay datos guardados).
const productosIniciales = [
  new Producto(1, "Adidas Shoes", 900, 10),
  new Producto(2, "Nike Sneakers", 1500, 5),
  new Producto(3, "Puma Tee", 1100, 20),
  new Producto(4, "Asics Gel", 1200, 7),
  new Producto(5, "Reebok Classic", 1000, 0),
  new Producto(6, "New Balance 574", 1300, 12),
  new Producto(7, "Vans Old Skool", 800, 3),
  new Producto(8, "Fila Disruptor", 700, 9),
  new Producto(9, "Under Armour Hoodie", 1250, 6),
  new Producto(10, "Puma Edición Limitada", 1400, 0),
];

// Lee de localStorage con respaldo si falla o no hay datos.
function leerGuardado(clave, respaldo) {
  try {
    const texto = localStorage.getItem(clave);
    return texto ? JSON.parse(texto) : respaldo;
  } catch {
    return respaldo;
  }
}

function guardar() {
  try {
    localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos));
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  } catch {
    // Sin almacenamiento disponible: la app sigue funcionando en memoria.
  }
}

// map: reconstruye las instancias de Producto desde los datos guardados.
const productos = leerGuardado(CLAVE_PRODUCTOS, null)
  ? leerGuardado(CLAVE_PRODUCTOS, []).map(
      (p) => new Producto(p.id, p.nombre, p.precio, p.stock),
    )
  : productosIniciales;

// Carrito: array de { id, cantidad }.
const carrito = leerGuardado(CLAVE_CARRITO, []);

// ---------- Selección de elementos ----------

const formProducto = document.getElementById("form-producto");
const inputNombre = document.getElementById("input-nombre");
const inputPrecio = document.getElementById("input-precio");
const inputStock = document.getElementById("input-stock");
const inputBuscar = document.getElementById("input-buscar");
const selectOrden = document.getElementById("select-orden");
const checkStock = document.getElementById("check-stock");
const contenedorItems = document.getElementById("contenedor-items");
const contenedorCarrito = document.getElementById("contenedor-carrito");
const totalCarrito = document.getElementById("total-carrito");
const contador = document.getElementById("contador-resultados");
const mensaje = document.getElementById("aviso");
const btnFinalizar = document.getElementById("btn-finalizar");
const btnVaciar = document.getElementById("btn-vaciar");

let idResaltado = null;
let temporizadorMensaje;

// ---------- Utilidades ----------

// Evita que el texto ingresado se interprete como HTML.
function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// Feedback visual: muestra un mensaje de éxito o error y lo oculta solo.
function mostrarMensaje(texto, tipo = "ok") {
  mensaje.textContent = texto;
  mensaje.className = `mensaje visible ${tipo}`;
  clearTimeout(temporizadorMensaje);
  temporizadorMensaje = setTimeout(() => {
    mensaje.classList.remove("visible");
  }, 3500);
}

// find: ¿cuántas unidades de un producto hay en el carrito?
function cantidadEnCarrito(id) {
  const item = carrito.find((i) => i.id === id);
  return item ? item.cantidad : 0;
}

// ---------- Filtros y transformaciones ----------

// filter + sort sobre una copia: aplica búsqueda, stock y orden elegidos.
function obtenerProductosVisibles() {
  const texto = inputBuscar.value.trim().toLowerCase();
  let lista = productos.filter((p) => p.nombre.toLowerCase().includes(texto));
  if (checkStock.checked) lista = lista.filter((p) => p.stock > 0);
  if (selectOrden.value === "asc") {
    lista = [...lista].sort((a, b) => a.precio - b.precio);
  } else if (selectOrden.value === "desc") {
    lista = [...lista].sort((a, b) => b.precio - a.precio);
  }
  return lista;
}

// reduce: total del carrito (precio × cantidad de cada ítem).
function calcularTotal() {
  return carrito.reduce((acc, item) => {
    const producto = productos.find((p) => p.id === item.id);
    return acc + producto.precio * item.cantidad;
  }, 0);
}

// ---------- Renderizado ----------

// map + innerHTML: dibuja una tarjeta por producto.
function renderProductos() {
  const lista = obtenerProductosVisibles();
  contador.textContent = `Mostrando ${lista.length} de ${productos.length} productos`;

  if (lista.length === 0) {
    contenedorItems.innerHTML =
      '<p class="vacio">No se encontraron productos.</p>';
    return;
  }

  contenedorItems.innerHTML = lista
    .map(
      (p) => `
      <article class="tarjeta ${p.stock === 0 ? "sin-stock" : ""} ${p.id === idResaltado ? "nuevo" : ""}">
        <h3>${escaparHtml(p.nombre)}</h3>
        <p class="precio">$${p.precio}</p>
        <p class="stock">${p.stock > 0 ? `Stock: ${p.stock}` : "Sin stock"}</p>
        <div class="botones">
          <button class="btn" data-accion="agregar" data-id="${p.id}" ${p.stock === 0 ? "disabled" : ""}>Agregar</button>
          <button class="btn btn-peligro" data-accion="eliminar" data-id="${p.id}">Eliminar</button>
        </div>
      </article>`,
    )
    .join("");
  idResaltado = null;
}

// map + innerHTML: dibuja los ítems del carrito y actualiza el total.
function renderCarrito() {
  if (carrito.length === 0) {
    contenedorCarrito.innerHTML = '<p class="vacio">Tu carrito está vacío.</p>';
  } else {
    contenedorCarrito.innerHTML = carrito
      .map((item) => {
        const p = productos.find((prod) => prod.id === item.id);
        return `
        <div class="item-carrito">
          <span>${escaparHtml(p.nombre)}<br /><small>$${p.precio * item.cantidad}</small></span>
          <span class="cantidad">
            <button data-accion="restar" data-id="${p.id}">−</button>
            ${item.cantidad}
            <button data-accion="sumar" data-id="${p.id}">+</button>
          </span>
        </div>`;
      })
      .join("");
  }
  totalCarrito.textContent = `$${calcularTotal()}`;
  btnFinalizar.disabled = carrito.length === 0;
  btnVaciar.disabled = carrito.length === 0;
}

function renderTodo() {
  renderProductos();
  renderCarrito();
  guardar();
}

// Acá agrego las acciones de los botones de cada tarjeta y del carrito, y los eventos de los filtros y el formulario.

// Valida el formulario y devuelve los datos o null si hay errores.
function leerFormulario() {
  const nombre = inputNombre.value.trim();
  const precio = Number(inputPrecio.value);
  const stock = Number(inputStock.value);

  [inputNombre, inputPrecio, inputStock].forEach((i) =>
    i.classList.remove("invalido"),
  );

  if (nombre === "") {
    inputNombre.classList.add("invalido");
    mostrarMensaje("Ingresá el nombre del producto.", "error");
    return null;
  }
  if (inputPrecio.value === "" || Number.isNaN(precio) || precio <= 0) {
    inputPrecio.classList.add("invalido");
    mostrarMensaje("El precio debe ser un número mayor a 0.", "error");
    return null;
  }
  if (inputStock.value === "" || !Number.isInteger(stock) || stock < 0) {
    inputStock.classList.add("invalido");
    mostrarMensaje("El stock debe ser un entero de 0 o más.", "error");
    return null;
  }
  // some: evita duplicar un producto con el mismo nombre.
  if (productos.some((p) => p.nombre.toLowerCase() === nombre.toLowerCase())) {
    inputNombre.classList.add("invalido");
    mostrarMensaje(`"${nombre}" ya existe en el catálogo.`, "error");
    return null;
  }
  return { nombre, precio, stock };
}

// Submit del formulario: crea el producto y refresca la vista.
function agregarProducto(evento) {
  evento.preventDefault();
  const datos = leerFormulario();
  if (datos === null) return;

  // reduce: próximo id = mayor id actual + 1.
  const nuevoId = productos.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  productos.push(
    new Producto(nuevoId, datos.nombre, datos.precio, datos.stock),
  );
  idResaltado = nuevoId;
  formProducto.reset();
  inputNombre.focus();
  renderTodo();
  mostrarMensaje(`Se agregó "${datos.nombre}" al catálogo.`);
}

// Quita un producto del catálogo (y del carrito si estaba).
function eliminarProducto(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;
  const indice = productos.findIndex((p) => p.id === id);
  productos.splice(indice, 1);
  const indiceCarrito = carrito.findIndex((i) => i.id === id);
  if (indiceCarrito !== -1) carrito.splice(indiceCarrito, 1);
  renderTodo();
  mostrarMensaje(`Se eliminó "${producto.nombre}" del catálogo.`, "error");
}

// Suma una unidad al carrito si alcanza el stock.
function agregarAlCarrito(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;
  if (cantidadEnCarrito(id) + 1 > producto.stock) {
    mostrarMensaje(`No hay más stock de "${producto.nombre}".`, "error");
    return;
  }
  const item = carrito.find((i) => i.id === id);
  if (item) item.cantidad += 1;
  else carrito.push({ id, cantidad: 1 });
  renderTodo();
  mostrarMensaje(`"${producto.nombre}" se agregó al carrito.`);
}

// Resta una unidad; si llega a 0 el ítem sale del carrito.
function restarDelCarrito(id) {
  const item = carrito.find((i) => i.id === id);
  if (!item) return;
  item.cantidad -= 1;
  if (item.cantidad === 0) carrito.splice(carrito.indexOf(item), 1);
  renderTodo();
}

function vaciarCarrito() {
  carrito.length = 0;
  renderTodo();
  mostrarMensaje("Vaciaste el carrito.", "error");
}

// forEach: descuenta el stock de cada ítem con Producto.vender.
function finalizarCompra() {
  if (carrito.length === 0) {
    mostrarMensaje("El carrito está vacío.", "error");
    return;
  }
  const total = calcularTotal();
  carrito.forEach((item) => {
    productos.find((p) => p.id === item.id).vender(item.cantidad);
  });
  carrito.length = 0;
  renderTodo();
  mostrarMensaje(`¡Gracias por tu compra! Total pagado: $${total}`);
}

// Los eventos se agregan al final para que el DOM esté listo y no haya errores.

formProducto.addEventListener("submit", agregarProducto);

// Evento de teclado: filtra mientras se escribe.
inputBuscar.addEventListener("keyup", renderProductos);
selectOrden.addEventListener("change", renderProductos);
checkStock.addEventListener("change", renderProductos);

// Delegación de eventos: un solo listener para los botones de cada tarjeta.
contenedorItems.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;
  const id = Number(boton.dataset.id);
  if (boton.dataset.accion === "agregar") agregarAlCarrito(id);
  if (boton.dataset.accion === "eliminar") eliminarProducto(id);
});

contenedorCarrito.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;
  const id = Number(boton.dataset.id);
  if (boton.dataset.accion === "sumar") agregarAlCarrito(id);
  if (boton.dataset.accion === "restar") restarDelCarrito(id);
});

btnFinalizar.addEventListener("click", finalizarCompra);
btnVaciar.addEventListener("click", vaciarCarrito);

renderTodo();
