// ==========================
// precios.js v4.1
// Twelve Data
// ==========================

const TWELVE_API_KEY = "55a72c9584b14cecb6b1fa5c4f52ce3b";
const TWELVE_BASE_URL = "https://api.twelvedata.com";
const TWELVE_CREDITOS_POR_MINUTO = 8;
const TWELVE_ESPERA_LOTE_MS = 61000;

let actualizandoCartera = false;
const cacheFxEur = { EUR: 1 };

function construirSimboloTwelve(activo) {
    const ticker = String(activo.ticker || "").trim().toUpperCase();
    const exchange = String(activo.exchange || "").trim().toUpperCase();

    return exchange ? `${ticker}:${exchange}` : ticker;
}

async function fetchTwelve(endpoint, parametros = {}) {
    const url = new URL(`${TWELVE_BASE_URL}/${endpoint}`);

    Object.entries({
        ...parametros,
        apikey: TWELVE_API_KEY
    }).forEach(function([clave, valor]) {
        if (valor !== "" && valor !== null && valor !== undefined) {
            url.searchParams.set(clave, valor);
        }
    });

    const respuesta = await fetch(url.toString(), { cache: "no-store" });

    if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    if (datos?.status === "error" || datos?.code) {
        throw new Error(datos.message || "Error de Twelve Data");
    }

    return datos;
}

async function obtenerCambioAEur(moneda) {
    const codigo = String(moneda || "EUR").toUpperCase();

    if (cacheFxEur[codigo]) return cacheFxEur[codigo];

    const datos = await fetchTwelve("exchange_rate", {
        symbol: `${codigo}/EUR`
    });

    const rate = Number(datos?.rate);

    if (!(rate > 0)) {
        throw new Error(`No se pudo convertir ${codigo} a EUR`);
    }

    cacheFxEur[codigo] = rate;
    return rate;
}

function obtenerMaximo52(datos) {
    return Number(
        datos?.fifty_two_week?.high ??
        datos?.fifty_two_week?.high_price ??
        datos?.["52_week"]?.high ??
        0
    ) || 0;
}

function extraerCotizacion(datos) {
    const precio = Number(datos?.close ?? datos?.price ?? datos?.last ?? 0) || 0;
    const variacion = Number(datos?.percent_change ?? datos?.change_percent ?? 0) || 0;
    const moneda = String(datos?.currency || "EUR").toUpperCase();
    const max52 = obtenerMaximo52(datos);

    if (!(precio > 0)) {
        throw new Error("La respuesta no contiene un precio válido");
    }

    return {
        precio,
        variacion,
        moneda,
        max52,
        nombre: datos?.name || "",
        exchange: datos?.exchange || "",
        tipo: datos?.type || ""
    };
}

async function actualizarActivoDesdeTwelve(activo) {
    const simbolo = construirSimboloTwelve(activo);

    const datos = await fetchTwelve("quote", {
        symbol: simbolo
    });

    const cotizacion = extraerCotizacion(datos);
    const fxEur = await obtenerCambioAEur(cotizacion.moneda);

    activo.precioNativo = cotizacion.precio;
    activo.precioActual = cotizacion.precio * fxEur;
    activo.moneda = cotizacion.moneda;
    activo.fxEur = fxEur;
    activo.variacion = cotizacion.variacion;
    activo.max52Nativo = cotizacion.max52;
    activo.max52 = cotizacion.max52 * fxEur;
    activo.exchange = activo.exchange || cotizacion.exchange || "";
    activo.tipo = cotizacion.tipo || activo.tipo;
    activo.ultimaRevision = new Date().toLocaleString("es-ES");
    activo.error = "";

    recalcularActivoCartera(activo);
}

function dormir(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function actualizarLoteCartera(inicio, fin) {
    for (let indice = inicio; indice < fin; indice += 1) {
        const activo = cartera[indice];

        try {
            await actualizarActivoDesdeTwelve(activo);
        } catch (error) {
            console.error(activo.ticker, error);
            activo.error = `No se pudo actualizar: ${error.message}`;
        }

        recalcularTodaLaCartera();
        pintarCartera();
        actualizarProgresoCartera(indice + 1, cartera.length);
    }
}

function actualizarProgresoCartera(completados, total) {
    const boton = document.getElementById("botonActualizarCartera");

    if (boton) {
        boton.textContent = `⏳ Actualizando ${completados}/${total}`;
    }
}

async function actualizarTodaLaCartera() {
    if (actualizandoCartera || !Array.isArray(cartera)) return;

    if (cartera.length === 0) {
        pintarCartera();
        return;
    }

    actualizandoCartera = true;

    const boton = document.getElementById("botonActualizarCartera");

    if (boton) {
        boton.disabled = true;
        boton.textContent = "⏳ Preparando actualización...";
    }

    try {
        for (
            let inicio = 0;
            inicio < cartera.length;
            inicio += TWELVE_CREDITOS_POR_MINUTO
        ) {
            const fin = Math.min(
                inicio + TWELVE_CREDITOS_POR_MINUTO,
                cartera.length
            );

            await actualizarLoteCartera(inicio, fin);

            if (fin < cartera.length) {
                if (boton) {
                    boton.textContent =
                        `⏳ Límite gratuito: esperando para continuar (${fin}/${cartera.length})`;
                }

                await dormir(TWELVE_ESPERA_LOTE_MS);
            }
        }

        recalcularTodaLaCartera();
        guardarDatos();
        pintarCartera();

        const fecha = new Date().toLocaleString("es-ES");
        localStorage.setItem(CARTERA_UPDATE_KEY, fecha);

        const elementoFecha =
            document.getElementById("carteraUltimaActualizacion");

        if (elementoFecha) {
            elementoFecha.textContent = fecha;
        }
    } finally {
        actualizandoCartera = false;

        if (boton) {
            boton.disabled = false;
            boton.textContent = "🔄 Actualizar toda la cartera";
        }
    }
}
