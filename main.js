// ==========================================
// PRE ENTREGA 1: SIMULADOR DE COMPRAS
// ==========================================

const nombreUsuario = prompt("¡Hola! ¿Cuál es tu nombre?");
let precio = prompt("¿Cuál es el precio unitario del producto que deseas comprar?");
let cantidad = prompt("¿Cuántas unidades deseas llevar?");


let precioProducto = parseFloat(precio);
let cantidadDeseada = parseInt(cantidad);


let subtotal = precioProducto * cantidadDeseada;
let envio = 15; 
let costoTotal = subtotal + envio;


let mensajeBienvenida = "Hola " + nombreUsuario + ", gracias por usar nuestro simulador.";
let mensajeDetalle = "Estás comprando " + cantidadDeseada + " unidades a $" + precioProducto + " cada una.";
let mensajeCosto = "El subtotal es $" + subtotal + " y sumando el envío, el total a pagar es $" + costoTotal + ".";


console.log("--- TICKET DE COMPRA ---");
console.log(mensajeBienvenida);
console.log(mensajeDetalle);
console.log(mensajeCosto);


alert(mensajeBienvenida);
alert(mensajeDetalle);
alert(mensajeCosto);
