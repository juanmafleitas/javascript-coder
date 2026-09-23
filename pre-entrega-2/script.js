// Simulador: carrito de compras con beneficio.

const nombre = "Carmela";
const descuentoVip = 0.15;
const limiteIntentos = 3;

let sosMiembro = false;
let intentos = 0;

let articulo = "Nike";

// Verificar si el articulo está en Stock
switch (articulo) {
  case "Adidas":
    console.log("El articulo no está en stock.");
    break;
  case "Timberland":
    console.log("El articulo no está en stock.");
    break;
  case "Nike":
    console.log("El articulo está en stock.");
    break;
  default:
    console.log("Lo siento, debes ingresar un articulo válido.");
    break;
}

// Verificar si el cliente es VIP (hasta 3 intentos)
while (intentos < 3 && !sosMiembro) {
  const respuesta = prompt("Tienes cuenta?:");

  if (respuesta === "si") {
    sosMiembro = true;
    console.log(
      `Bienvenida ${nombre}. Se aplicó tu 15% de descuento como miembro.`,
    );
  } else if (respuesta === "no") {
    console.log("Usuario invitado. No se aplicará descuento.");
  } else {
    intentos++;
    console.log(
      `Formato invalido. Te quedan: ${3 - intentos} intentos restantes.`,
    );
  }
}
