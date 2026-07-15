// ==========================
// MÉTODO PACO BIT
// v3.0
// ==========================

// ==========================
// DATOS
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

indice:50,
estado:"Esperar",
accion:"Esperar",

// Tu posición

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

indice:50,
estado:"Esperar",
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

indice:50,
estado:"Esperar",
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

indice:50,
estado:"Esperar",
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

indice:50,
estado:"Esperar",
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
// OBTENER ACTIVO
// ==========================

function obtenerActivoBit(nombre){

return metodoPacoBit[nombre];

}

function obtenerTodosBit(){

return metodoPacoBit;

}

// ==========================
// ÍNDICE MÉTODO PACO BIT
// ==========================

function calcularIndiceBit(nombre){

const activo=metodoPacoBit[nombre];

if(!activo) return;

let indice=50;

if(activo.variacion<=-15){

indice=95;

}else if(activo.variacion<=-10){

indice=90;

}else if(activo.variacion<=-5){

indice=80;

}else if(activo.variacion<=-2){

indice=70;

}else if(activo.variacion>=15){

indice=20;

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

if(activo.indice>=90){

activo.estado="🟢 Muy alcista";
activo.accion="Comprar";

}else if(activo.indice>=70){

activo.estado="🟢 Alcista";
activo.accion="Acumular";

}else if(activo.indice>=50){

activo.estado="🟡 Neutral";
activo.accion="Mantener";

}else if(activo.indice>=30){

activo.estado="🟠 Caliente";
activo.accion="Esperar";

}else{

activo.estado="🔴 Sobrecalentado";
activo.accion="No comprar";

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

function escribir(id,valor){

    const elemento=document.getElementById(id);

    if(elemento){

        elemento.textContent=valor;

    }

}

function formatoEuro(valor){

    return Number(valor).toLocaleString("es-ES",{

        minimumFractionDigits:2,
        maximumFractionDigits:2

    })+" €";

}

function mostrarMetodoPacoBit(){

    Object.keys(metodoPacoBit).forEach(function(nombre){

        const activo=metodoPacoBit[nombre];

        // ----------------------
        // Datos comunes
        // ----------------------

        escribir(
            nombre+"Precio",
            activo.precio>0 ?
            formatoEuro(activo.precio) :
            "--"
        );

        escribir(
            nombre+"Variacion",
            activo.variacion.toFixed(2)+" %"
        );

        escribir(
            nombre+"Indice",
            activo.indice
        );

        escribir(
            nombre+"Estado",
            activo.estado
        );

        escribir(
            nombre+"Accion",
            activo.accion
        );

        escribir(
            nombre+"Revision",
            activo.ultimaRevision || "--"
        );

        // ----------------------
        // Solo Bitcoin
        // ----------------------

        if(nombre==="bitcoin"){

            escribir(
                "bitcoinATH",
                activo.ath>0 ?
                formatoEuro(activo.ath) :
                "--"
            );

            escribir(
                "bitcoinCaidaATH",
                activo.caidaATH.toFixed(2)+" %"
            );

            escribir(
                "bitcoinFearGreed",
                activo.fearGreed || "--"
            );

            escribir(
                "bitcoinCompra",
                activo.precioCompra>0 ?
                formatoEuro(activo.precioCompra) :
                "--"
            );

            escribir(
                "bitcoinCantidad",
                activo.cantidad.toFixed(8)
            );

            escribir(
                "bitcoinInvertido",
                formatoEuro(activo.invertido)
            );

            escribir(
                "bitcoinValorActual",
                formatoEuro(activo.valorActual)
            );

            escribir(
                "bitcoinGanancia",
                formatoEuro(activo.ganancia)
            );

            escribir(
                "bitcoinRentabilidad",
                activo.rentabilidad.toFixed(2)+" %"
            );

        }

    });

}

// ==========================
// INFORME
// ==========================

function generarInformeMetodoPacoBit(){

    console.clear();

    console.table(metodoPacoBit);

}

// ==========================
// GUARDAR POSICIÓN BTC
// ==========================

function guardarPosicionBitcoin(precioCompra,cantidad){

    const btc=metodoPacoBit.bitcoin;

    btc.precioCompra=Number(precioCompra)||0;

    btc.cantidad=Number(cantidad)||0;

    actualizarPosicionBitcoin();

    mostrarMetodoPacoBit();

}

// ==========================
// ACTUALIZAR TODO
// ==========================

function actualizarMetodoPacoBit(){

    actualizarIndicadoresBit("bitcoin");

    actualizarIndicadoresBit("oro");

    actualizarIndicadoresBit("plata");

    actualizarIndicadoresBit("platino");

    actualizarIndicadoresBit("paladio");

    mostrarMetodoPacoBit();

}

// ==========================
// REINICIAR
// ==========================

function reiniciarMetodoPacoBit(){

    Object.keys(metodoPacoBit).forEach(function(nombre){

        metodoPacoBit[nombre].precio=0;
        metodoPacoBit[nombre].precioAnterior=0;
        metodoPacoBit[nombre].variacion=0;
        metodoPacoBit[nombre].indice=50;
        metodoPacoBit[nombre].estado="Esperar";
        metodoPacoBit[nombre].accion="Esperar";
        metodoPacoBit[nombre].ultimaRevision="";

    });

    metodoPacoBit.bitcoin.ath=0;
    metodoPacoBit.bitcoin.caidaATH=0;
    metodoPacoBit.bitcoin.fearGreed="--";
    metodoPacoBit.bitcoin.precioCompra=0;
    metodoPacoBit.bitcoin.cantidad=0;
    metodoPacoBit.bitcoin.invertido=0;
    metodoPacoBit.bitcoin.valorActual=0;
    metodoPacoBit.bitcoin.ganancia=0;
    metodoPacoBit.bitcoin.rentabilidad=0;

    mostrarMetodoPacoBit();

}

// ==========================
// INICIO
// ==========================

document.addEventListener("DOMContentLoaded",function(){

    actualizarMetodoPacoBit();

});