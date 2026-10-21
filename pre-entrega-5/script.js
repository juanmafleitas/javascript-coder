// Simulador: carrito de compras con beneficios.
// Pre-Entrega 5 : Trabajando con objetos.

const nombre = prompt("Cómo te llamas?");

const descuentoPro = 0.15;
let sosPro = false;
let intentos = 0;

// Precio por marca: array de objetos.
const precios = [
  { marca: "New Balance", precio: 1300 },
  { marca: "Adidas", precio: 900 },
  { marca: "Puma", precio: 1100 },
  { marca: "Asics", precio: 1200 },
  { marca: "Nike", precio: 1500 },
  { marca: "Reebok", precio: 1000 },
  { marca: "Puma Edición Limitada", precio: 1400 },
];

// Array con nombre semántico: las marcas que tenemos en stock.
const marcasEnStock = ["Adidas", "Puma", "Asics", "Nike", "Reebok"];

// Manipulación de extremos.
marcasEnStock.unshift("New Balance");
marcasEnStock.push("Vans");

const marcaDescontinuada = marcasEnStock.pop();
console.log(`Se ha eliminado del stock la marca: ${marcaDescontinuada}`);

let articulo = prompt("Qué marca estás buscando?");

// Búsqueda y validación
const enStock = marcasEnStock.includes(articulo);

if (enStock) {
  const posicion = marcasEnStock.indexOf(articulo);
  console.log(
    `El artículo "${articulo}" está en stock, en la posición ${posicion}`,
  );
} else {
  console.log(`Error, "${articulo}" no está en stock`);
}

// Actualización por índice con splice
marcasEnStock.splice(2, 1, "Puma Edición Limitada");

// Reporte iterativo: la función que recorre y muestra el catálogo
function listarMarcas(lista) {
  console.log("--- Catálogo de marcas en stock ---");
  for (const marca of lista) {
    console.log(`Marca: ${marca}`);
  }
  console.log(`Total: ${lista.length} marcas`);
}

listarMarcas(marcasEnStock);

// EXTRA: Si el artículo no está en stock, se corta el flujo acá
if (!enStock) {
  alert(`Lo sentimos, "${articulo}" no está en stock.`);
} else {
  // FUNCION FLECHA (Modulo 3)
  const descontar = (precio, descuentoPro) => precio - descuentoPro;

  // Definimos envio en precio total
  function hacerEnvio(precio) {
    return precio + 150;
  }

  // Verificar si el cliente es PRO
  while (intentos < 3 && !sosPro) {
    const respuesta = prompt("Sos miembro PRO?:");

    if (respuesta === "Si" || respuesta === "si") {
      sosPro = true;
      console.log(`Bienvenido ${nombre}. Se aplicó el descuento como miembro.`);
    } else if (respuesta === "No" || respuesta === "no") {
      console.log(
        "No se agregaron beneficios como miembro. Puedes proseguir con la compra como invitado.",
      );
      break;
    } else {
      intentos++;
      console.log(
        `Respuesta inválida, por favor ingresa Si o No. Te quedan: ${3 - intentos} intentos restantes.`,
      );
    }
  }

  // FUNCION: calcula el subtotal según el artículo elegido y si el usuario es PRO
  function calcularSubtotal(articulo, esPro) {
    let precioBase = 0;

    for (const item of precios) {
      if (item.marca === articulo) {
        precioBase = item.precio;
        break;
      }
    }

    return esPro
      ? descontar(precioBase, precioBase * descuentoPro)
      : precioBase;
  }

  const subtotal = calcularSubtotal(articulo, sosPro);

  let quiereEnvio = prompt("Quieres que te enviemos el producto?");

  let precioFinal;

  if (quiereEnvio === "Si" || quiereEnvio === "si") {
    precioFinal = hacerEnvio(subtotal);
  } else if (quiereEnvio === "No" || quiereEnvio === "no") {
    precioFinal = subtotal;
  } else {
    console.log("Tu respuesta es inválida, escriba Si o No");
    precioFinal = subtotal;
  }

  alert(`Tu precio final es: $${precioFinal}`);
}

// Clase Product para manejar productos con stock y precios
class Producto {
  constructor(id, nombre, precio, stock) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
  }

  // Disminuir el stock por quantity y return el precio total
  vender(cantidad = 1) {
    if (cantidad > this.stock) {
      console.log(`Stock insuficiente para ${this.nombre}`);
      return 0;
    }
    this.stock -= cantidad;
    const total = this.precio * cantidad;
    console.log(`${cantidad} × ${this.nombre} vendido por $${total}. Stock restante: ${this.stock}`);
    return total;
  }

  // Aplico descuento
  aplicarDescuento(porcentaje) {
    const precioBase = this.precio;
    this.precio = Math.round(this.precio * (1 - porcentaje));
    console.log(`El precio de ${this.nombre} ha cambiado de $${precioBase} a $${this.precio}`);
  }
}

// Crear tres instancias del producto
const productoAdidas = new Producto(1, "Adidas Shoes", 900, 10);
const productoNike = new Producto(2, "Nike Sneakers", 1500, 5);
const productoPuma = new Producto(3, "Puma Tee", 1100, 20);

// Mostrar métodos
productoAdidas.aplicarDescuento(0.15);
productoAdidas.vender(2);
productoNike.vender(1);
productoPuma.aplicarDescuento(0.10);
productoPuma.vender(5);
