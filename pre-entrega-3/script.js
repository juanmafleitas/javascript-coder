// Simulador: carrito de compras con beneficios.
// Pre-Entrega 3 : Seguimos con el simulador pero aplicando Funciones.

const nombre = prompt("Cómo te llamas?");

const descuentoPro = 0.15;
let sosPro = false;
let intentos = 0;

const precioNike = 1500;
const precioAdidas = 900;

let articulo = prompt("Qué marca estás buscando?");

// Verificar si el articulo está en Stock
switch (articulo) {
  case "Adidas":
    console.log("El articulo está en stock.");
    break;
  case "New Balance":
    console.log("El articulo no está en stock.");
    break;
  case "Puma":
    console.log("El articulo no está en stock.");
    break;
  case "Asics":
    console.log("El articulo no está en stock.");
    break;
  case "Nike":
    console.log("El articulo está en stock.");
    break;
  default:
    console.log("Lo siento, debes ingresar un articulo válido.");
    break;
}

// FUNCION FLECHA: Definimos descuento si el usuario es PRO
const descontar = (precio, descuentoPro) => precio - descuentoPro;

//también podría ser
//function descontar(precio, descuentoPro) {
//const total = precio - descuentoPro;
//return total;
//}

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
  let precioBase;

  if (articulo === "Nike") {
    precioBase = precioNike;
  } else if (articulo === "Adidas") {
    precioBase = precioAdidas;
  } else {
    precioBase = 0;
  }

  return esPro ? descontar(precioBase, precioBase * descuentoPro) : precioBase;
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
