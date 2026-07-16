// ==========================
// bit.js v3.1
// Método Paco Bit
// ==========================

const metodoPacoBit = {

    bitcoin: {

        nombre: "Bitcoin",
        simbolo: "₿",

        // ==========================
        // MERCADO
        // ==========================

        precio: 0,
        variacion: 0,
        ath: 0,
        caidaATH: 0,
        fearGreed: "--",

        // ==========================
        // MÉTODO PACO BIT
        // ==========================

        indice: 50,
        estado: "Sin datos",
        accion: "Esperar",

        // ==========================
        // POSICIÓN
        // ==========================

        precioCompra: 0,
        cantidad: 0,
        invertido: 0,
        valorActual: 0,
        ganancia: 0,
        rentabilidad: 0,

        ultimaRevision: "--"

    },

    oro: {

        nombre: "Oro",
        precio: 0,
        variacion: 0,
        indice: 50,
        estado: "Sin datos",
        accion: "Esperar",
        ultimaRevision: "--"

    },

    plata: {

        nombre: "Plata",
        precio: 0,
        variacion: 0,
        indice: 50,
        estado: "Sin datos",
        accion: "Esperar",
        ultimaRevision: "--"

    },

    platino: {

        nombre: "Platino",
        precio: 0,
        variacion: 0,
        indice: 50,
        estado: "Sin datos",
        accion: "Esperar",
        ultimaRevision: "--"

    },

    paladio: {

        nombre: "Paladio",
        precio: 0,
        variacion: 0,
        indice: 50,
        estado: "Sin datos",
        accion: "Esperar",
        ultimaRevision: "--"

    }

};


// ==========================
// ACTUALIZAR ACTIVO
// ==========================

function actualizarActivoBit(nombre, datos) {

    if (!metodoPacoBit[nombre]) return;

    Object.assign(
        metodoPacoBit[nombre],
        datos
    );

    metodoPacoBit[nombre].ultimaRevision =
        new Date().toLocaleString("es-ES");

    actualizarIndicadoresBit(nombre);

}


// ==========================
// ÍNDICE MÉTODO PACO BIT
// ==========================

function calcularIndiceBit(nombre) {

    const activo = metodoPacoBit[nombre];

    if (!activo) return;

    let indice = 50;

    if (activo.variacion <= -10) {

        indice = 90;

    } else if (activo.variacion <= -5) {

        indice = 80;

    } else if (activo.variacion <= -2) {

        indice = 70;

    } else if (activo.variacion >= 10) {

        indice = 30;

    } else if (activo.variacion >= 5) {

        indice = 40;

    }

    activo.indice = indice;

}


// ==========================
// ESTADO
// ==========================

function actualizarEstadoBit(nombre) {

    const activo = metodoPacoBit[nombre];

    if (!activo) return;

    if (activo.indice >= 80) {

        activo.estado = "🟢 Comprar";
        activo.accion = "Comprar";

    } else if (activo.indice >= 60) {

        activo.estado = "🟡 Mantener";
        activo.accion = "Mantener";

    } else if (activo.indice >= 40) {

        activo.estado = "🟠 Esperar";
        activo.accion = "Esperar";

    } else {

        activo.estado = "🔴 No comprar";
        activo.accion = "No comprar";

    }

}


// ==========================
// ACTUALIZAR POSICIÓN BITCOIN
// ==========================

function actualizarPosicionBitcoin() {

    const btc = metodoPacoBit.bitcoin;

    btc.invertido =
        btc.precioCompra * btc.cantidad;

    btc.valorActual =
        btc.precio * btc.cantidad;

    btc.ganancia =
        btc.valorActual - btc.invertido;

    if (btc.invertido > 0) {

        btc.rentabilidad =
            (btc.ganancia / btc.invertido) * 100;

    } else {

        btc.rentabilidad = 0;

    }

    if (btc.ath > 0) {

        btc.caidaATH =
            ((btc.precio - btc.ath) / btc.ath) * 100;

    } else {

        btc.caidaATH = 0;

    }

}


// ==========================
// ACTUALIZAR INDICADORES
// ==========================

function actualizarIndicadoresBit(nombre) {

    calcularIndiceBit(nombre);

    actualizarEstadoBit(nombre);

    if (nombre === "bitcoin") {

        actualizarPosicionBitcoin();

    }

}


// ==========================
// FUNCIONES AUXILIARES
// ==========================

function escribir(id, valor) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.textContent = valor;

    }

}


function formatoEuro(valor) {

    return Number(valor).toLocaleString(
        "es-ES",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + " €";

}


// ==========================
// MOSTRAR BITCOIN
// ==========================

function mostrarBitcoin() {

    const btc =
        metodoPacoBit.bitcoin;


    // ==========================
    // MERCADO
    // ==========================

    escribir(
        "bitcoinPrecio",
        btc.precio > 0
            ? formatoEuro(btc.precio)
            : "--"
    );


    escribir(
        "bitcoinVariacion",
        Number(btc.variacion).toFixed(2) + " %"
    );


    escribir(
        "bitcoinATH",
        btc.ath > 0
            ? formatoEuro(btc.ath)
            : "--"
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


    // ==========================
    // POSICIÓN
    // ==========================

    const inputCompra =
        document.getElementById(
            "bitcoinPrecioCompra"
        );

    const inputCantidad =
        document.getElementById(
            "bitcoinCantidad"
        );


    // IMPORTANTE:
    // Los inputs conservan los datos
    // introducidos por el usuario.

    if (
        inputCompra &&
        document.activeElement !== inputCompra
    ) {

        inputCompra.value =
            btc.precioCompra > 0
                ? btc.precioCompra
                : "";

    }


    if (
        inputCantidad &&
        document.activeElement !== inputCantidad
    ) {

        inputCantidad.value =
            btc.cantidad > 0
                ? btc.cantidad
                : "";

    }


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

function mostrarMetales() {

    const metales = [

        "oro",
        "plata",
        "platino",
        "paladio"

    ];


    metales.forEach(function (nombre) {

        const activo =
            metodoPacoBit[nombre];


        escribir(

            nombre + "Precio",

            activo.precio > 0
                ? formatoEuro(activo.precio)
                : "--"

        );


        escribir(

            nombre + "Variacion",

            Number(activo.variacion).toFixed(2)
            + " %"

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


        escribir(

            nombre + "Revision",

            activo.ultimaRevision || "--"

        );

    });

}


// ==========================
// MOSTRAR TODO
// ==========================

function mostrarMetodoPacoBit() {

    mostrarBitcoin();

    mostrarMetales();

}


// ==========================
// GUARDAR POSICIÓN BITCOIN
// ==========================

function guardarPosicionBitcoin() {

    const inputCompra =
        document.getElementById(
            "bitcoinPrecioCompra"
        );


    const inputCantidad =
        document.getElementById(
            "bitcoinCantidad"
        );


    if (!inputCompra || !inputCantidad) {

        console.error(
            "No se encuentran los campos de posición Bitcoin"
        );

        return;

    }


    const precioCompra =
        parseFloat(inputCompra.value) || 0;


    const cantidad =
        parseFloat(inputCantidad.value) || 0;


    metodoPacoBit.bitcoin.precioCompra =
        precioCompra;


    metodoPacoBit.bitcoin.cantidad =
        cantidad;


    // Calcular inmediatamente

    actualizarPosicionBitcoin();


    // Mostrar inmediatamente

    mostrarMetodoPacoBit();


    console.log(
        "Posición Bitcoin guardada:",
        metodoPacoBit.bitcoin
    );

}


// ==========================
// GETTERS
// ==========================

function obtenerActivoBit(nombre) {

    return metodoPacoBit[nombre];

}


function obtenerTodosBit() {

    return metodoPacoBit;

}


// ==========================
// INFORME
// ==========================

function generarInformeMetodoPacoBit() {

    console.table(
        metodoPacoBit
    );

}


// ==========================
// ACTUALIZAR TODO
// ==========================

function actualizarMetodoPacoBit() {

    Object.keys(
        metodoPacoBit
    ).forEach(function (nombre) {

        actualizarIndicadoresBit(nombre);

    });


    mostrarMetodoPacoBit();

}


// ==========================
// REINICIAR
// ==========================

function reiniciarMetodoPacoBit() {

    Object.keys(
        metodoPacoBit
    ).forEach(function (nombre) {

        metodoPacoBit[nombre].precio = 0;

        metodoPacoBit[nombre].variacion = 0;

        metodoPacoBit[nombre].indice = 50;

        metodoPacoBit[nombre].estado =
            "Sin datos";

        metodoPacoBit[nombre].accion =
            "Esperar";

        metodoPacoBit[nombre].ultimaRevision =
            "--";

    });


    const btc =
        metodoPacoBit.bitcoin;


    btc.ath = 0;

    btc.caidaATH = 0;

    btc.fearGreed = "--";

    btc.precioCompra = 0;

    btc.cantidad = 0;

    btc.invertido = 0;

    btc.valorActual = 0;

    btc.ganancia = 0;

    btc.rentabilidad = 0;


    mostrarMetodoPacoBit();

}


// ==========================
// INICIO
// ==========================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        mostrarMetodoPacoBit();

    }
);