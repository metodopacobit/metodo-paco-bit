// ==========================
// MÉTODO PACO v1.0
// PRECIOS - FINNHUB
// ==========================

// ⚠️ Cuando terminemos las pruebas,
// cambia esta API Key por una nueva.

const API_KEY = "d9bq8mpr01ql2jmt25v0d9bq8mpr01ql2jmt25vg";

// ==========================
// OBTENER PRECIO
// ==========================

async function obtenerPrecio(ticker){

    try{

        const url =
        `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY}`;

        const respuesta = await fetch(url);

        if(!respuesta.ok){

            throw new Error("Error al conectar con Finnhub");

        }

        const datos = await respuesta.json();

        // Precio actual

        if(datos.c && datos.c > 0){

            return Number(datos.c);

        }

        return null;

    }

    catch(error){

        console.error("Error API:",error);

        return null;

    }

}

// ==========================
// ACTUALIZAR UN ACTIVO
// ==========================

async function actualizarPrecioActivo(activo){

    if(!activo.ticker) return;

    const precio = await obtenerPrecio(activo.ticker);

    if(precio){

        activo.actual = precio;

    }

}

// ==========================
// ACTUALIZAR TODA LA CARTERA
// ==========================

async function actualizarTodaLaCartera(){

    if(typeof cartera==="undefined") return;

    for(const activo of cartera){

        await actualizarPrecioActivo(activo);

    }

    guardarDatos();

    pintarCartera();

    console.log("✔ Precios actualizados");

}