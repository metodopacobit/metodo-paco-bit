// ==========================
// API FINNHUB
// ==========================

const API_KEY = "d9bq8mpr01ql2jmt25v0d9bq8mpr01ql2jmt25vg";

async function obtenerPrecio(ticker){

    try{

        const respuesta = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY}`
        );

        const datos = await respuesta.json();

        return datos.c;

    }catch(error){

        console.error(error);

        return null;

    }

}