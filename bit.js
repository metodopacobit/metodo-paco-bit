// ==========================
// MÉTODO PACO BIT
// v1.1
// ==========================

// Datos de los activos

const metodoPacoBit = {

    bitcoin: {
        nombre: "Bitcoin",
        simbolo: "₿",
        precio: 0,
        precioAnterior: 0,
        indice: 0,
        estado: "Sin datos",
        accion: "Esperar"
    },

    oro: {
        nombre: "Oro",
        simbolo: "🥇",
        precio: 0,
        precioAnterior: 0,
        indice: 0,
        estado: "Sin datos",
        accion: "Esperar"
    },

    plata: {
        nombre: "Plata",
        simbolo: "🥈",
        precio: 0,
        precioAnterior: 0,
        indice: 0,
        estado: "Sin datos",
        accion: "Esperar"
    },

    platino: {
        nombre: "Platino",
        simbolo: "⚪",
        precio: 0,
        precioAnterior: 0,
        indice: 0,
        estado: "Sin datos",
        accion: "Esperar"
    },

    paladio: {
        nombre: "Paladio",
        simbolo: "🟠",
        precio: 0,
        precioAnterior: 0,
        indice: 0,
        estado: "Sin datos",
        accion: "Esperar"
    },

    rodio: {
        nombre: "Rodio",
        simbolo: "🔘",
        precio: 0,
        precioAnterior: 0,
        indice: 0,
        estado: "Sin datos",
        accion: "Esperar"
    }

};

// ==========================
// ACTUALIZAR UN ACTIVO
// ==========================

function actualizarActivoBit(nombre, datos){

    if(!metodoPacoBit[nombre]) return;

    Object.assign(metodoPacoBit[nombre], datos);

}

// ==========================
// OBTENER DATOS
// ==========================

function obtenerActivoBit(nombre){

    return metodoPacoBit[nombre];

}

function obtenerTodosBit(){

    return metodoPacoBit;

}

// ==========================
// FUTURAS FUNCIONES
// ==========================

// actualizarPreciosAPI()
// calcularIndice()
// generarInformeMetodoPacoBit()
// generarWatchlist()
// enviarAlertas()
// guardarHistorico()
// compararMaximos()
// calcularVariaciones()