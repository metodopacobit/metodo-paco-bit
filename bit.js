// ==========================
// bit.js v3.1
// Método Paco Bit
// ==========================

const POSICION_BTC_KEY = "metodoPacoBitPosicionBTC";

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

        // Tu posición

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
// ESCRIBIR EN PANTALLA
// ==========================

function escribir(id,valor){

    const elemento=document.getElementById(id);

    if(elemento){

        elemento.textContent=valor;

    }

}

// ==========================
// FORMATO €
//
// ==========================

function formatoEuro(valor){

    return Number(valor).toLocaleString(

        "es-ES",

        {

            minimumFractionDigits:2,
            maximumFractionDigits:2

        }

    )+" €";

}

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

    btc.invertido =
        btc.precioCompra * btc.cantidad;

    btc.valorActual =
        btc.precio * btc.cantidad;

    btc.ganancia =
        btc.valorActual - btc.invertido;

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
// MOSTRAR BITCOIN
// ==========================

function mostrarBitcoin(){

    const btc = metodoPacoBit.bitcoin;

    escribir(
        "bitcoinPrecio",
        btc.precio > 0 ? formatoEuro(btc.precio) : "--"
    );

    escribir(
        "bitcoinVariacion",
        Number(btc.variacion).toFixed(2) + " %"
    );

    escribir(
        "bitcoinATH",
        btc.ath > 0 ? formatoEuro(btc.ath) : "--"
    );

    escribir(
        "bitcoinCaidaATH",
        Number(btc.caidaATH).toFixed(2) + " %"
    );

    escribir(
        "bitcoinFearGreed",
        btc.fearGreed || "--"
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
        "bitcoinCompra",
        btc.precioCompra > 0
            ? formatoEuro(btc.precioCompra)
            : "--"
    );

    escribir(
        "bitcoinCantidadTexto",
        Number(btc.cantidad).toFixed(8)
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
        Number(btc.rentabilidad).toFixed(2) + " %"
    );

}

// ==========================
// MOSTRAR METALES
// ==========================

function mostrarMetales(){

    ["oro","plata","platino","paladio"].forEach(function(nombre){

        const activo = metodoPacoBit[nombre];

        escribir(
            nombre + "Precio",
            activo.precio > 0
                ? formatoEuro(activo.precio)
                : "--"
        );

        escribir(
            nombre + "Variacion",
            Number(activo.variacion).toFixed(2) + " %"
        );

        escribir(
            nombre + "Indice",
            activo.indice
        );

        escribir(
            nombre + "Estado",
            activo.estado
        );

        escribir(
            nombre + "Accion",
            activo.accion
        );

    });

}

// ==========================
// MOSTRAR TODO
// ==========================

function mostrarMetodoPacoBit(){

    mostrarBitcoin();

    mostrarMetales();

}

// ==========================
// GUARDAR POSICIÓN
// ==========================

function guardarPosicionLocal(){

    const btc = metodoPacoBit.bitcoin;

    localStorage.setItem(

        POSICION_BTC_KEY,

        JSON.stringify({

            precioCompra:btc.precioCompra,

            cantidad:btc.cantidad

        })

    );

}


// ==========================
// CARGAR POSICIÓN
// ==========================

function cargarPosicionBitcoin(){

    try{

        const datosGuardados =

        JSON.parse(

            localStorage.getItem(

                POSICION_BTC_KEY

            )

        );


        if(datosGuardados){

            metodoPacoBit.bitcoin.precioCompra =

                Number(

                    datosGuardados.precioCompra

                ) || 0;


            metodoPacoBit.bitcoin.cantidad =

                Number(

                    datosGuardados.cantidad

                ) || 0;

        }

    }catch(error){

        console.error(

            "Error cargando posición Bitcoin:",

            error

        );

    }


    actualizarPosicionBitcoin();

}


// ==========================
// ABRIR EDITOR
// ==========================

function abrirEditorPosicion(){

    const btc = metodoPacoBit.bitcoin;

    const modal =

        document.getElementById(

            "modalPosicionBitcoin"

        );

    const inputCompra =

        document.getElementById(

            "bitcoinPrecioCompraInput"

        );

    const inputCantidad =

        document.getElementById(

            "bitcoinCantidadInput"

        );


    if(inputCompra){

        inputCompra.value =

            btc.precioCompra > 0

            ? btc.precioCompra

            : "";

    }


    if(inputCantidad){

        inputCantidad.value =

            btc.cantidad > 0

            ? btc.cantidad

            : "";

    }


    if(modal){

        modal.classList.remove("oculto");

    }

}


// ==========================
// CERRAR EDITOR
// ==========================

function cerrarEditorPosicion(){

    const modal =

        document.getElementById(

            "modalPosicionBitcoin"

        );


    if(modal){

        modal.classList.add("oculto");

    }

}


// ==========================
// GUARDAR POSICIÓN BITCOIN
// ==========================

function guardarPosicionBitcoin(){

    const inputCompra =

        document.getElementById(

            "bitcoinPrecioCompraInput"

        );

    const inputCantidad =

        document.getElementById(

            "bitcoinCantidadInput"

        );


    if(!inputCompra || !inputCantidad){

        alert(

            "No se encuentran los campos de la posición."

        );

        return;

    }


    const precioCompra =

        Number(inputCompra.value);


    const cantidadBTC =

        Number(inputCantidad.value);


    if(

        precioCompra <= 0 ||

        cantidadBTC <= 0

    ){

        alert(

            "Introduce un precio de compra y una cantidad válidos."

        );

        return;

    }


    metodoPacoBit.bitcoin.precioCompra =

        precioCompra;


    metodoPacoBit.bitcoin.cantidad =

        cantidadBTC;


    actualizarPosicionBitcoin();

    guardarPosicionLocal();

    mostrarMetodoPacoBit();

    cerrarEditorPosicion();

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
// INICIO
// ==========================

document.addEventListener(

    "DOMContentLoaded",

    function(){

        cargarPosicionBitcoin();

        mostrarMetodoPacoBit();

    }

);