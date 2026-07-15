// ==========================
// MÉTODO PACO BIT
// apiBit.js
// ==========================

const GOLD_API = "https://api.gold-api.com";

// ==========================
// OBTENER PRECIO
// ==========================

async function obtenerPrecioBit(simbolo){

    try{

        const respuesta = await fetch(
            GOLD_API + "/symbols"
        );

        const texto = await respuesta.text();

        alert(texto);

        return null;

    }catch(error){

        alert("ERROR: " + error);

        return null;

    }

}

// ==========================
// ACTUALIZAR UN ACTIVO
// ==========================

async function actualizarActivoAPI(nombre){

    const activo = metodoPacoBit[nombre];

    if(!activo) return;

    await obtenerPrecioBit(activo.ticker);

}

// ==========================
// ACTUALIZAR TODOS
// ==========================

async function actualizarMetodoPacoBitAPI(){

    const activos = [
        "bitcoin",
        "oro",
        "plata",
        "platino",
        "paladio"
    ];

    for(const nombre of activos){

        await actualizarActivoAPI(nombre);

    }

    if(typeof mostrarMetodoPacoBit==="function"){

        mostrarMetodoPacoBit();

    }

}

// ==========================
// BOTÓN ACTUALIZAR
// ==========================

function actualizarBit(){

    actualizarMetodoPacoBitAPI();

}

// ==========================
// CARGA AUTOMÁTICA
// ==========================

document.addEventListener("DOMContentLoaded",function(){

    actualizarMetodoPacoBitAPI();

});