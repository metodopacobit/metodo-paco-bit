// ==========================
// MÉTODO PACO BIT
// v1.4
// ==========================

const metodoPacoBit = {

    bitcoin: {
        nombre: "Bitcoin",
        simbolo: "₿",
        ticker: "BTC",
        precio: 0,
        precioAnterior: 0,
        variacion: 0,
        indice: 0,
        estado: "Sin datos",
        accion: "Esperar",
        ultimaRevision: ""
    },

    oro: {
        nombre: "Oro",
        simbolo: "🥇",
        ticker: "XAU",
        precio: 0,
        precioAnterior: 0,
        variacion: 0,
        indice: 0,
        estado: "Sin datos",
        accion: "Esperar",
        ultimaRevision: ""
    },

    plata: {
        nombre: "Plata",
        simbolo: "🥈",
        ticker: "XAG",
        precio: 0,
        precioAnterior: 0,
        variacion: 0,
        indice: 0,
        estado: "Sin datos",
        accion: "Esperar",
        ultimaRevision: ""
    },

    platino: {
        nombre: "Platino",
        simbolo: "⚪",
        ticker: "XPT",
        precio: 0,
        precioAnterior: 0,
        variacion: 0,
        indice: 0,
        estado: "Sin datos",
        accion: "Esperar",
        ultimaRevision: ""
    },

    paladio: {
        nombre: "Paladio",
        simbolo: "🟠",
        ticker: "XPD",
        precio: 0,
        precioAnterior: 0,
        variacion: 0,
        indice: 0,
        estado: "Sin datos",
        accion: "Esperar",
        ultimaRevision: ""
    },

    rodio: {
        nombre: "Rodio",
        simbolo: "🔘",
        ticker: "XRH",
        precio: 0,
        precioAnterior: 0,
        variacion: 0,
        indice: 0,
        estado: "Sin datos",
        accion: "Esperar",
        ultimaRevision: ""
    }

};

// ==========================
// ACTUALIZAR ACTIVO
// ==========================

function actualizarActivoBit(nombre, datos){

    if(!metodoPacoBit[nombre]) return;

    metodoPacoBit[nombre].precioAnterior =
        metodoPacoBit[nombre].precio;

    Object.assign(metodoPacoBit[nombre], datos);

    metodoPacoBit[nombre].ultimaRevision =
        new Date().toLocaleString();

}

// ==========================
// CALCULAR ÍNDICE
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

        activo.estado = "🟢 Muy alcista";
        activo.accion = "Comprar";

    }

    else if(activo.indice >= 60){

        activo.estado = "🟡 Alcista";
        activo.accion = "Mantener";

    }

    else if(activo.indice >= 40){

        activo.estado = "🟠 Neutral";
        activo.accion = "Esperar";

    }

    else{

        activo.estado = "🔴 Sobrecalentado";
        activo.accion = "No comprar";

    }

}

// ==========================
// ACTUALIZAR INDICADORES
// ==========================

function actualizarIndicadoresBit(nombre){

    calcularIndiceBit(nombre);

    actualizarEstadoBit(nombre);

}

// ==========================
// ACTUALIZAR TODOS
// ==========================

function actualizarTodosBit(){

    Object.keys(metodoPacoBit).forEach(function(nombre){

        actualizarIndicadoresBit(nombre);

    });

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
// ACTUALIZAR PRECIO
// ==========================

function actualizarPrecioBit(nombre, precioActual){

    const activo = metodoPacoBit[nombre];

    if(!activo) return;

    activo.precioAnterior = activo.precio;

    activo.precio = precioActual;

    if(activo.precioAnterior > 0){

        activo.variacion =
        ((activo.precio-activo.precioAnterior)
        /activo.precioAnterior)*100;

    }else{

        activo.variacion = 0;

    }

    actualizarIndicadoresBit(nombre);

}

// ==========================
// ACTUALIZAR TODOS
// ==========================

function actualizarMetodoPacoBit(datos){

    Object.keys(datos).forEach(function(nombre){

        if(metodoPacoBit[nombre]){

            actualizarPrecioBit(
                nombre,
                datos[nombre]
            );

        }

    });

}

// ==========================
// INFORME
// ==========================

function generarInformeMetodoPacoBit(){

    console.table(metodoPacoBit);

}

// ==========================
// FUTURAS VERSIONES
// ==========================

// API Bitcoin
// API Metales
// Histórico
// Alertas
// Watchlist automática
// Radar de Gangas
// Gráficos