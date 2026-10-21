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

class Product {
  constructor(id, name, price, stock) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
  }

  // Disminuir el stock por quantity y return el precio total
  vender(cantidad = 1) {
    if (cantidad > this.stock) {
      console.log(`Insufficient stock for ${this.name}`);
      return 0;
    }
    this.stock -= cantidad;
    const total = this.price * cantidad;
    console.log(`${cantidad} × ${this.name} sold for $${total}. Remaining stock: ${this.stock}`);
    return total;
  }

  // Aplico descuento
  applyDiscount(percent) {
    const oldPrice = this.price;
    this.price = Math.round(this.price * (1 - percent));
    console.log(`${this.name} price changed from $${oldPrice} to $${this.price}`);
  }
}

// Crear tres instancias del producto
const prodA = new Product(1, "Adidas Shoes", 900, 10);
const prodB = new Product(2, "Nike Sneakers", 1500, 5);
const prodC = new Product(3, "Puma Tee", 1100, 20);

// Mostrar métodos
prodA.applyDiscount(0.15);
prodA.vender(2);
prodB.vender(1);
prodC.applyDiscount(0.10);
prodC.vender(5);
