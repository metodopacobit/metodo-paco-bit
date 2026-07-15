// ==========================
// MÉTODO PACO BIT
// API GOLD-API
// v2.0
// ==========================

// URL base

const GOLD_API = "https://api.gold-api.com";

// ==========================
// OBTENER PRECIO
// ==========================

async function obtenerPrecioBit(simbolo){

    try{

        const respuesta = await fetch(
            `${GOLD_API}/${simbolo}`
        );

        if(!respuesta.ok){

            throw new Error(
                "Error al conectar con Gold API"
            );

        }

        const datos = await respuesta.json();

        return {

            precio: datos.price || 0,

            variacion: datos.chg_percent || 0,

            moneda: datos.currency || "USD"

        };

    }

    catch(error){

        console.error(error);

        return null;

    }

}

// ==========================
// ACTUALIZAR UN ACTIVO
// ==========================

async function actualizarActivoAPI(nombre){

    const activo = metodoPacoBit[nombre];

    if(!activo) return;

    const datos = await obtenerPrecioBit(
        activo.ticker
    );

    if(!datos) return;

    actualizarActivoBit(nombre,{

        precio: datos.precio,

        variacion: datos.variacion

    });

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

    if(typeof actualizarTodosBit==="function"){

        actualizarTodosBit();

    }

    if(typeof mostrarMetodoPacoBit==="function"){

        mostrarMetodoPacoBit();

    }

    console.log("✅ Método Paco Bit actualizado");

}

// ==========================
// ACTUALIZACIÓN AUTOMÁTICA
// ==========================

document.addEventListener("DOMContentLoaded",function(){

    actualizarMetodoPacoBitAPI();

});

// ==========================
// ACTUALIZAR CADA 5 MINUTOS
// ==========================

setInterval(function(){

    actualizarMetodoPacoBitAPI();

},300000);

// ==========================
// BOTÓN ACTUALIZAR
// ==========================

function actualizarBit(){

    actualizarMetodoPacoBitAPI();

}