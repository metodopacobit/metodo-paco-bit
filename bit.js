// ==========================
// MÉTODO PACO BIT
// v2.1
// ==========================

const metodoPacoBit={

bitcoin:{

nombre:"Bitcoin",
simbolo:"₿",
ticker:"BTC",

// Mercado

precio:0,
precioAnterior:0,
variacion:0,
ath:0,
caidaATH:0,
fearGreed:"--",

// Método Paco Bit

indice:0,
estado:"Sin datos",
accion:"Esperar",

// Posición

precioCompra:0,
cantidad:0,
invertido:0,
valorActual:0,
ganancia:0,
rentabilidad:0,

ultimaRevision:""

},

oro:{

nombre:"Oro",
simbolo:"🥇",
ticker:"XAU",

precio:0,
precioAnterior:0,
variacion:0,

indice:0,
estado:"Sin datos",
accion:"Esperar",

ultimaRevision:""

},

plata:{

nombre:"Plata",
simbolo:"🥈",
ticker:"XAG",

precio:0,
precioAnterior:0,
variacion:0,

indice:0,
estado:"Sin datos",
accion:"Esperar",

ultimaRevision:""

},

platino:{

nombre:"Platino",
simbolo:"⚪",
ticker:"XPT",

precio:0,
precioAnterior:0,
variacion:0,

indice:0,
estado:"Sin datos",
accion:"Esperar",

ultimaRevision:""

},

paladio:{

nombre:"Paladio",
simbolo:"🟠",
ticker:"XPD",

precio:0,
precioAnterior:0,
variacion:0,

indice:0,
estado:"Sin datos",
accion:"Esperar",

ultimaRevision:""

}

};

// ==========================
// ACTUALIZAR ACTIVO
// ==========================

function actualizarActivoBit(nombre,datos){

if(!metodoPacoBit[nombre]) return;

Object.assign(
metodoPacoBit[nombre],
datos
);

metodoPacoBit[nombre].ultimaRevision=
new Date().toLocaleString("es-ES");

actualizarIndicadoresBit(nombre);

}

// ==========================
// ÍNDICE MÉTODO PACO BIT
// ==========================

function calcularIndiceBit(nombre){

const activo=metodoPacoBit[nombre];

if(!activo) return;

let indice=50;

if(activo.variacion<=-10){

indice=90;

}else if(activo.variacion<=-5){

indice=80;

}else if(activo.variacion<=-2){

indice=70;

}else if(activo.variacion>=10){

indice=30;

}else if(activo.variacion>=5){

indice=40;

}

activo.indice=indice;

}

// ==========================
// ESTADO
// ==========================

function actualizarEstadoBit(nombre){

const activo=metodoPacoBit[nombre];

if(!activo) return;

if(activo.indice>=80){

activo.estado="🟢 Comprar";
activo.accion="Comprar";

}else if(activo.indice>=60){

activo.estado="🟡 Mantener";
activo.accion="Mantener";

}else if(activo.indice>=40){

activo.estado="🟠 Esperar";
activo.accion="Esperar";

}else{

activo.estado="🔴 No comprar";
activo.accion="No comprar";

}

}

// ==========================
// POSICIÓN BITCOIN
// ==========================

function actualizarPosicionBitcoin(){

const btc=metodoPacoBit.bitcoin;

btc.invertido=
btc.precioCompra*
btc.cantidad;

btc.valorActual=
btc.precio*
btc.cantidad;

btc.ganancia=
btc.valorActual-
btc.invertido;

if(btc.invertido>0){

btc.rentabilidad=
(btc.ganancia/
btc.invertido)*100;

}else{

btc.rentabilidad=0;

}

}

// ==========================
// CAÍDA DESDE ATH
// ==========================

function calcularCaidaATH(){

const btc=metodoPacoBit.bitcoin;

if(btc.ath<=0){

btc.caidaATH=0;

return;

}

btc.caidaATH=
((btc.precio-btc.ath)
/btc.ath)*100;

}

// ==========================
// ACTUALIZAR INDICADORES
// ==========================

function actualizarIndicadoresBit(nombre){

calcularIndiceBit(nombre);

actualizarEstadoBit(nombre);

if(nombre==="bitcoin"){

calcularCaidaATH();

actualizarPosicionBitcoin();

}

}

// ==========================
// MOSTRAR MÉTODO PACO BIT
// ==========================

function mostrarMetodoPacoBit(){

Object.keys(metodoPacoBit).forEach(function(nombre){

const activo=metodoPacoBit[nombre];

function escribir(id,valor){

const e=document.getElementById(id);

if(e) e.textContent=valor;

}

escribir(nombre+"Precio",
activo.precio ?
activo.precio.toLocaleString("es-ES",{
minimumFractionDigits:2,
maximumFractionDigits:2
})+" €":"--");

escribir(nombre+"Variacion",
activo.variacion.toFixed(2)+" %");

escribir(nombre+"Indice",
activo.indice);

escribir(nombre+"Estado",
activo.estado);

const accion=document.getElementById(nombre+"Accion");

if(accion){

accion.textContent=activo.accion;

}

const revision=document.getElementById(nombre+"Revision");

if(revision){

revision.textContent=
activo.ultimaRevision || "--";

}

// ===== SOLO BITCOIN =====

if(nombre==="bitcoin"){

escribir("bitcoinATH",
activo.ath ?
activo.ath.toLocaleString("es-ES",{
maximumFractionDigits:0
})+" €":"--");

escribir("bitcoinCaidaATH",
activo.caidaATH.toFixed(2)+" %");

escribir("bitcoinFearGreed",
activo.fearGreed);

escribir("bitcoinCompra",
activo.precioCompra ?
activo.precioCompra.toLocaleString("es-ES",{
maximumFractionDigits:2
})+" €":"--");

escribir("bitcoinCantidad",
activo.cantidad.toFixed(8));

escribir("bitcoinInvertido",
activo.invertido.toLocaleString("es-ES",{
maximumFractionDigits:2
})+" €");

escribir("bitcoinValorActual",
activo.valorActual.toLocaleString("es-ES",{
maximumFractionDigits:2
})+" €");

escribir("bitcoinGanancia",
activo.ganancia.toLocaleString("es-ES",{
maximumFractionDigits:2
})+" €");

escribir("bitcoinRentabilidad",
activo.rentabilidad.toFixed(2)+" %");

}

});

}

// ==========================
// GETTERS
// ==========================

function obtenerActivoBit(nombre){

return metodoPacoBit[nombre];

}

function obtenerTodosBit(){

return metodoPacoBit;

}

// ==========================
// INFORME
// ==========================

function generarInformeMetodoPacoBit(){

console.table(metodoPacoBit);

}

// ==========================
// INICIO
// ==========================

document.addEventListener("DOMContentLoaded",function(){

mostrarMetodoPacoBit();

});