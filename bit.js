// ==========================
// bit.js v3.0
// Método Paco Bit
// ==========================

const metodoPacoBit = {

    bitcoin:{

        nombre:"Bitcoin",
        simbolo:"₿",

        // Mercado

        precio:0,
        variacion:0,
        ath:0,
        caidaATH:0,
        fearGreed:"--",

        // Método Paco Bit

        indice:50,
        estado:"Sin datos",
        accion:"Esperar",

        // Posición

        precioCompra:0,
        cantidad:0,
        invertido:0,
        valorActual:0,
        ganancia:0,
        rentabilidad:0,

        ultimaRevision:"--"

    },

    oro:{
        nombre:"Oro",
        precio:0,
        variacion:0,
        indice:50,
        estado:"Sin datos",
        accion:"Esperar",
        ultimaRevision:"--"
    },

    plata:{
        nombre:"Plata",
        precio:0,
        variacion:0,
        indice:50,
        estado:"Sin datos",
        accion:"Esperar",
        ultimaRevision:"--"
    },

    platino:{
        nombre:"Platino",
        precio:0,
        variacion:0,
        indice:50,
        estado:"Sin datos",
        accion:"Esperar",
        ultimaRevision:"--"
    },

    paladio:{
        nombre:"Paladio",
        precio:0,
        variacion:0,
        indice:50,
        estado:"Sin datos",
        accion:"Esperar",
        ultimaRevision:"--"
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

    const activo = metodoPacoBit[nombre];

    if(!activo) return;

    let indice = 50;

    if(activo.variacion <= -10){

        indice = 90;

    }else if(activo.variacion <= -5){

        indice = 80;

    }else if(activo.variacion <= -2){

        indice = 70;

    }else if(activo.variacion >= 10){

        indice = 30;

    }else if(activo.variacion >= 5){

        indice = 40;

    }

    activo.indice = indice;

}

// ==========================
// ESTADO
// ==========================

function actualizarEstadoBit(nombre){

    const activo = metodoPacoBit[nombre];

    if(!activo) return;

    if(activo.indice >= 80){

        activo.estado = "🟢 Comprar";
        activo.accion = "Comprar";

    }else if(activo.indice >= 60){

        activo.estado = "🟡 Mantener";
        activo.accion = "Mantener";

    }else if(activo.indice >= 40){

        activo.estado = "🟠 Esperar";
        activo.accion = "Esperar";

    }else{

        activo.estado = "🔴 No comprar";
        activo.accion = "No comprar";

    }

}

// ==========================
// POSICIÓN BITCOIN
// ==========================

function actualizarPosicionBitcoin(){

    const btc = metodoPacoBit.bitcoin;

    btc.invertido = btc.precioCompra * btc.cantidad;

    btc.valorActual = btc.precio * btc.cantidad;

    btc.ganancia = btc.valorActual - btc.invertido;

    if(btc.invertido > 0){

        btc.rentabilidad =
            (btc.ganancia / btc.invertido) * 100;

    }else{

        btc.rentabilidad = 0;

    }

    if(btc.ath > 0){

        btc.caidaATH =
            ((btc.precio - btc.ath) / btc.ath) * 100;

    }else{

        btc.caidaATH = 0;

    }

}

// ==========================
// ACTUALIZAR INDICADORES
// ==========================

function actualizarIndicadoresBit(nombre){

    calcularIndiceBit(nombre);

    actualizarEstadoBit(nombre);

    if(nombre === "bitcoin"){

        actualizarPosicionBitcoin();

    }

}

// ==========================
// FUNCIONES AUXILIARES
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

// ==========================
// ACTUALIZAR PANTALLA
// ==========================

function mostrarMetodoPacoBit(){

    const btc=metodoPacoBit.bitcoin;

    escribir(
        "bitcoinPrecio",
        btc.precio ? formatoEuro(btc.precio) : "--"
    );

    escribir(
        "bitcoinVariacion",
        btc.variacion.toFixed(2)+" %"
    );

    escribir(
        "bitcoinATH",
        btc.ath ? formatoEuro(btc.ath) : "--"
    );

    escribir(
        "bitcoinCaidaATH",
        btc.caidaATH.toFixed(2)+" %"
    );

    escribir(
        "bitcoinFearGreed",
        btc.fearGreed
    );

    escribir(
        "bitcoinIndice",
        btc.indice
    );

    escribir(
        "bitcoinEstado",
        btc.estado
    );

    escribir(
        "bitcoinAccion",
        btc.accion
    );

    escribir(
        "bitcoinRevision",
        btc.ultimaRevision
    );

    escribir(
        "bitcoinCompra",
        btc.precioCompra ?
        formatoEuro(btc.precioCompra) : "--"
    );

    escribir(
        "bitcoinCantidad",
        btc.cantidad.toFixed(8)
    );

    escribir(
        "bitcoinInvertido",
        formatoEuro(btc.invertido)
    );

    escribir(
        "bitcoinValorActual",
        formatoEuro(btc.valorActual)
    );

    escribir(
        "bitcoinGanancia",
        formatoEuro(btc.ganancia)
    );

    escribir(
        "bitcoinRentabilidad",
        btc.rentabilidad.toFixed(2)+" %"
    );

    // Oro

    escribir("oroPrecio",
        metodoPacoBit.oro.precio ?
        formatoEuro(metodoPacoBit.oro.precio) : "--");

    escribir("oroVariacion",
        metodoPacoBit.oro.variacion.toFixed(2)+" %");

    escribir("oroIndice",
        metodoPacoBit.oro.indice);

    escribir("oroEstado",
        metodoPacoBit.oro.estado);

    escribir("oroAccion",
        metodoPacoBit.oro.accion);

    escribir("oroRevision",
        metodoPacoBit.oro.ultimaRevision);

    // Plata

    escribir("plataPrecio",
        metodoPacoBit.plata.precio ?
        formatoEuro(metodoPacoBit.plata.precio) : "--");

    escribir("plataVariacion",
        metodoPacoBit.plata.variacion.toFixed(2)+" %");

    escribir("plataIndice",
        metodoPacoBit.plata.indice);

    escribir("plataEstado",
        metodoPacoBit.plata.estado);

    escribir("plataAccion",
        metodoPacoBit.plata.accion);

    escribir("plataRevision",
        metodoPacoBit.plata.ultimaRevision);

    // Platino

    escribir("platinoPrecio",
        metodoPacoBit.platino.precio ?
        formatoEuro(metodoPacoBit.platino.precio) : "--");

    escribir("platinoVariacion",
        metodoPacoBit.platino.variacion.toFixed(2)+" %");

    escribir("platinoIndice",
        metodoPacoBit.platino.indice);

    escribir("platinoEstado",
        metodoPacoBit.platino.estado);

    escribir("platinoAccion",
        metodoPacoBit.platino.accion);

    escribir("platinoRevision",
        metodoPacoBit.platino.ultimaRevision);

    // Paladio

    escribir("paladioPrecio",
        metodoPacoBit.paladio.precio ?
        formatoEuro(metodoPacoBit.paladio.precio) : "--");

    escribir("paladioVariacion",
        metodoPacoBit.paladio.variacion.toFixed(2)+" %");

    escribir("paladioIndice",
        metodoPacoBit.paladio.indice);

    escribir("paladioEstado",
        metodoPacoBit.paladio.estado);

    escribir("paladioAccion",
        metodoPacoBit.paladio.accion);

    escribir("paladioRevision",
        metodoPacoBit.paladio.ultimaRevision);

}

// ==========================
// GUARDAR POSICIÓN BTC
// ==========================

function guardarPosicionBitcoin(precioCompra,cantidad){

    metodoPacoBit.bitcoin.precioCompra =
        Number(precioCompra) || 0;

    metodoPacoBit.bitcoin.cantidad =
        Number(cantidad) || 0;

    actualizarPosicionBitcoin();

    mostrarMetodoPacoBit();

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
// ACTUALIZAR TODO
// ==========================

function actualizarMetodoPacoBit(){

    Object.keys(metodoPacoBit).forEach(function(nombre){

        actualizarIndicadoresBit(nombre);

    });

    mostrarMetodoPacoBit();

}

// ==========================
// REINICIAR
// ==========================

function reiniciarMetodoPacoBit(){

    Object.keys(metodoPacoBit).forEach(function(nombre){

        metodoPacoBit[nombre].precio = 0;
        metodoPacoBit[nombre].variacion = 0;
        metodoPacoBit[nombre].indice = 50;
        metodoPacoBit[nombre].estado = "Sin datos";
        metodoPacoBit[nombre].accion = "Esperar";
        metodoPacoBit[nombre].ultimaRevision = "--";

    });

    metodoPacoBit.bitcoin.ath = 0;
    metodoPacoBit.bitcoin.caidaATH = 0;
    metodoPacoBit.bitcoin.fearGreed = "--";
    metodoPacoBit.bitcoin.precioCompra = 0;
    metodoPacoBit.bitcoin.cantidad = 0;
    metodoPacoBit.bitcoin.invertido = 0;
    metodoPacoBit.bitcoin.valorActual = 0;
    metodoPacoBit.bitcoin.ganancia = 0;
    metodoPacoBit.bitcoin.rentabilidad = 0;

    mostrarMetodoPacoBit();

}

// ==========================
// INICIO
// ==========================

document.addEventListener("DOMContentLoaded",function(){

    mostrarMetodoPacoBit();

});