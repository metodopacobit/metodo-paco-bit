// ==========================
// MÉTODO PACO v1.2
// PRECIOS - FINNHUB
// ==========================

const API_KEY = "d9bqjjpr01ql2jmt3bugd9bqjjpr01ql2jmt3bv0"

// ==========================
// OBTENER PRECIO
// ==========================

async function obtenerPrecio(ticker) {

    try {

        const url =
            `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${API_KEY}`;

        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error("Error HTTP " + respuesta.status);
        }

        const datos = await respuesta.json();

        // Finnhub devuelve:
        // c = precio actual

        if (typeof datos.c === "number" && datos.c > 0) {
            return datos.c;
        }

        return null;

    } catch (error) {

        console.error("Error obteniendo precio de", ticker, error);

        return null;

    }

}

// ==========================
// ACTUALIZAR CARTERA
// ==========================

async function actualizarTodaLaCartera() {

    if (!Array.isArray(cartera)) return;

    let cambios = false;

    for (const activo of cartera) {

        if (!activo.ticker) continue;

        const precio = await obtenerPrecio(activo.ticker);

        if (precio !== null) {

            activo.actual = precio;

            cambios = true;

        }

    }

    if (cambios) {
        guardarDatos();
    }

    pintarCartera();

}