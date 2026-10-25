// Pre-Entrega 6: funciones de orden superior sobre el array de productos

// Clase Producto (Módulo 5): base de los objetos del simulador.
class Producto {
  constructor(id, nombre, precio, stock) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
  }

  // Disminuye el stock por cantidad y devuelve el precio total (0 si no alcanza).
  vender(cantidad = 1) {
    if (cantidad > this.stock) {
      console.log(`Stock insuficiente para ${this.nombre}`);
      return 0;
    }
    this.stock -= cantidad;
    const total = this.precio * cantidad;
    console.log(
      `${cantidad} × ${this.nombre} vendido por $${total}. Stock restante: ${this.stock}`,
    );
    return total;
  }
}

// Array de instancias de Producto: simula la base de datos de la tienda.
const productos = [
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

// Render: map arma cada línea; se muestra por consola y también en un alert.
function listarProductos(lista, titulo) {
  console.log(`--- ${titulo} ---`);
  if (lista.length === 0) {
    console.log("No se encontraron productos.");
    alert(`${titulo}\n\nNo se encontraron productos.`);
    return;
  }
  const lineas = lista.map(
    (p) => `#${p.id} ${p.nombre} - $${p.precio} - stock: ${p.stock}`,
  );
  lineas.forEach((linea) => console.log(linea));
  console.log(`Total: ${lista.length} productos`);
  alert(
    `${titulo}\n\n${lineas.join("\n")}\n\nTotal: ${lista.length} productos`,
  );
}

// Pide un texto y lo limpia. Devuelve null si el usuario cancela o lo deja vacío.
function pedirTexto(mensaje) {
  const respuesta = prompt(mensaje);
  if (respuesta === null || respuesta.trim() === "") {
    alert("Debes ingresar un valor.");
    return null;
  }
  return respuesta.trim();
}

// Pide un número positivo. Devuelve null si no es válido.
function pedirNumero(mensaje) {
  const texto = pedirTexto(mensaje);
  if (texto === null) return null;
  const numero = Number(texto);
  if (Number.isNaN(numero) || numero <= 0) {
    alert(`"${texto}" no es un número válido.`);
    return null;
  }
  return numero;
}

// BÚSQUEDA 1 - filter: productos cuyo nombre contiene el texto.
function buscarPorNombre(lista, texto) {
  const buscado = texto.toLowerCase();
  return lista.filter((p) => p.nombre.toLowerCase().includes(buscado));
}

// BÚSQUEDA 2 - find: un producto por su id.
function buscarPorId(lista, id) {
  return lista.find((p) => p.id === id);
}

// BÚSQUEDA 3 - some: ¿existe algún producto con precio menor o igual al máximo?
function hayProductoHasta(lista, maximo) {
  return lista.some((p) => p.precio <= maximo);
}

// BÚSQUEDA 4 - filter: productos con stock disponible.
function filtrarConStock(lista) {
  return lista.filter((p) => p.stock > 0);
}

// TRANSFORMACIÓN 1 - sort: ordena una copia por precio para no mutar el original.
function ordenarPorPrecio(lista, ascendente = true) {
  return [...lista].sort((a, b) =>
    ascendente ? a.precio - b.precio : b.precio - a.precio,
  );
}

// TRANSFORMACIÓN 2 - reduce: valor total del inventario (precio × stock).
function calcularValorInventario(lista) {
  return lista.reduce((acumulado, p) => acumulado + p.precio * p.stock, 0);
}

// Carrito de compras: cada ítem es { producto, cantidad }.
const carrito = [];

// Resuelve lo que escribió el usuario (id o nombre) a un único producto.
// find: por id si es número; filter (buscarPorNombre): por nombre si es texto.
function resolverProducto(entrada) {
  const numero = Number(entrada);
  if (Number.isInteger(numero) && numero > 0) {
    const porId = buscarPorId(productos, numero);
    if (!porId) alert(`No existe un producto con id ${numero}.`);
    return porId;
  }
  const coincidencias = buscarPorNombre(productos, entrada);
  if (coincidencias.length === 0) {
    alert(`No se encontró ningún producto con "${entrada}".`);
    return undefined;
  }
  if (coincidencias.length > 1) {
    const opciones = coincidencias
      .map((p) => `#${p.id} ${p.nombre}`)
      .join("\n");
    alert(
      `Hay varios productos con "${entrada}":\n\n${opciones}\n\nEscribe el nombre completo o el id.`,
    );
    return undefined;
  }
  return coincidencias[0];
}

// findIndex: agrega al carrito validando que alcance el stock.
function agregarAlCarrito(producto, cantidad) {
  // findIndex: ¿el producto ya estaba en el carrito?
  const indice = carrito.findIndex((item) => item.producto.id === producto.id);
  const yaEnCarrito = indice === -1 ? 0 : carrito[indice].cantidad;
  if (yaEnCarrito + cantidad > producto.stock) {
    alert(
      `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, en tu carrito: ${yaEnCarrito}.`,
    );
    return;
  }
  if (indice === -1) carrito.push({ producto, cantidad });
  else carrito[indice].cantidad += cantidad;
  alert(`Agregaste ${cantidad} × ${producto.nombre} al carrito.`);
}

// reduce: total del carrito (precio × cantidad de cada ítem).
function calcularTotalCarrito(items) {
  return items.reduce(
    (acumulado, item) => acumulado + item.producto.precio * item.cantidad,
    0,
  );
}

// map: arma el detalle del carrito, lo muestra y devuelve el total.
function mostrarCarrito() {
  if (carrito.length === 0) {
    console.log("El carrito está vacío.");
    alert("El carrito está vacío.");
    return;
  }
  const lineas = carrito.map(
    (item) =>
      `${item.cantidad} × ${item.producto.nombre} = $${item.producto.precio * item.cantidad}`,
  );
  const total = calcularTotalCarrito(carrito);
  console.log("--- Carrito ---");
  lineas.forEach((linea) => console.log(linea));
  console.log(`Total: $${total}`);
  alert(`Tu carrito:\n\n${lineas.join("\n")}\n\nTotal: $${total}`);
}

// forEach: descuenta stock con Producto.vender y vacía el carrito.
function finalizarCompra() {
  if (carrito.length === 0) {
    alert("El carrito está vacío. Agrega productos antes de finalizar.");
    return;
  }
  const total = calcularTotalCarrito(carrito);
  carrito.forEach((item) => item.producto.vender(item.cantidad));
  carrito.length = 0;
  console.log(`Compra finalizada. Total pagado: $${total}`);
  alert(`¡Gracias por tu compra! Total pagado: $${total}`);
}

// Cada opción del menú dispara un método de orden superior.
function ejecutarOpcion(opcion) {
  switch (opcion) {
    case "1": {
      const entrada = pedirTexto("Producto a agregar (id o nombre, ej: Nike):");
      if (entrada === null) break;
      const producto = resolverProducto(entrada);
      if (!producto) break;
      const cantidad = pedirNumero("Cantidad:");
      if (cantidad === null) break;
      if (!Number.isInteger(cantidad)) {
        alert("La cantidad debe ser un número entero.");
        break;
      }
      agregarAlCarrito(producto, cantidad);
      break;
    }
    case "2": {
      const texto = pedirTexto("Nombre (o parte) del producto:");
      if (texto === null) break;
      const resultado = buscarPorNombre(productos, texto);
      listarProductos(resultado, `Búsqueda: "${texto}"`);
      break;
    }
    case "3": {
      const maximo = pedirNumero("Precio máximo:");
      if (maximo === null) break;
      alert(
        hayProductoHasta(productos, maximo)
          ? `Sí, hay productos hasta $${maximo}.`
          : `No hay productos hasta $${maximo}.`,
      );
      break;
    }
    case "4":
      listarProductos(filtrarConStock(productos), "Productos con stock");
      break;
    case "5": {
      const orden = prompt(
        "Ordenar por precio: 1) menor a mayor, 2) mayor a menor",
      );
      if (orden !== "1" && orden !== "2") {
        alert("Opción inválida. Elegí 1 o 2.");
        break;
      }
      listarProductos(
        ordenarPorPrecio(productos, orden === "1"),
        "Productos ordenados por precio",
      );
      break;
    }
    case "6":
      alert(`Valor del inventario: $${calcularValorInventario(productos)}`);
      break;
    case "7":
      mostrarCarrito();
      break;
    case "8":
      finalizarCompra();
      break;
    case "9":
      listarProductos(productos, "Catálogo de productos");
      break;
    default:
      alert("Opción inválida.");
  }
}

// Menú principal: se repite hasta que el usuario elija salir o cancele.
function menuProductos() {
  let opcion = "";
  while (opcion !== "0" && opcion !== null) {
    opcion = prompt(
      "Menú:\n1) Comprar - Agregar al carrito\n2) Buscar por nombre\n3) ¿Hay productos hasta un precio?\n4) Ver con stock\n5) Ordenar por precio\n6) Valor del inventario\n7) Ver carrito y total\n8) Finalizar compra\n9) Ver catálogo completo\n0) Salir",
    );
    if (opcion !== null && opcion !== "0") ejecutarOpcion(opcion.trim());
  }
}

menuProductos();
