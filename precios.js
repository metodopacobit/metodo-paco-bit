// ==========================
// precios.js v4.6
// Twelve Data + Yahoo Worker
// Fallback automático a Yahoo
// ==========================

const TWELVE_API_KEY =
    "55a72c9584b14cecb6b1fa5c4f52ce3b";

const TWELVE_BASE_URL =
    "https://api.twelvedata.com";

const YAHOO_WORKER_URL =
    "https://late-lab-2625.rjaresarias.workers.dev";

const FRANKFURTER_RATE_URL =
    "https://api.frankfurter.dev/v2/rate";

const TWELVE_CREDITOS_POR_MINUTO = 8;
const TWELVE_ESPERA_LOTE_MS = 61000;

let actualizandoCartera = false;

const cacheFxEur = {
    EUR: 1
};


// ==========================
// MERCADOS EUROPEOS
// ==========================

const MERCADOS_YAHOO = [
    "XETR",
    "XETRA",
    "GER",
    "LSE",
    "LONDON",
    "AMS",
    "AMSTERDAM",
    "PAR",
    "PARIS",
    "MIL",
    "MILAN",
    "BME",
    "MADRID",
    "SIX",
    "SWX"
];


// ==========================
// SABER QUÉ API UTILIZAR
// ==========================

function debeUsarYahoo(activo) {
    const exchange = String(
        activo.exchange || ""
    )
    .trim()
    .toUpperCase();

    return MERCADOS_YAHOO.includes(exchange);
}


// ==========================
// PETICIÓN JSON
// ==========================

async function fetchJson(url) {
    const respuesta = await fetch(url, {
        cache: "no-store"
    });

    let datos = null;

    try {
        datos = await respuesta.json();
    } catch (error) {
        throw new Error(
            "La fuente no devolvió datos JSON válidos"
        );
    }

    if (!respuesta.ok) {
        throw new Error(
            datos?.error ||
            datos?.message ||
            `HTTP ${respuesta.status}`
        );
    }

    return datos;
}


// ==========================
// PETICIÓN TWELVE DATA
// ==========================

async function fetchTwelve(
    endpoint,
    parametros = {}
) {
    const url = new URL(
        `${TWELVE_BASE_URL}/${endpoint}`
    );

    Object.entries({
        ...parametros,
        apikey: TWELVE_API_KEY
    }).forEach(function([clave, valor]) {
        if (
            valor !== "" &&
            valor !== null &&
            valor !== undefined
        ) {
            url.searchParams.set(
                clave,
                valor
            );
        }
    });

    const datos = await fetchJson(
        url.toString()
    );

    if (
        datos?.status === "error" ||
        datos?.code
    ) {
        throw new Error(
            datos.message ||
            "Error de Twelve Data"
        );
    }

    return datos;
}


// ==========================
// CAMBIO DE DIVISA A EUROS
// ==========================

async function obtenerCambioAEur(moneda) {
    const codigo = String(
        moneda || "EUR"
    )
    .trim()
    .toUpperCase();

    if (codigo === "EUR") {
        return 1;
    }

    if (cacheFxEur[codigo]) {
        return cacheFxEur[codigo];
    }

    let ultimoError = null;

    // Primero Twelve Data, para mantener la lógica actual.
    try {
        const datos = await fetchTwelve(
            "exchange_rate",
            {
                symbol: `${codigo}/EUR`
            }
        );

        const rate = Number(
            datos?.rate
        );

        if (rate > 0) {
            cacheFxEur[codigo] = rate;
            return rate;
        }

        ultimoError =
            new Error(
                `Twelve no devolvió cambio ${codigo}/EUR`
            );

    } catch (error) {
        ultimoError = error;
        console.warn(
            `Cambio ${codigo}/EUR en Twelve no disponible. Probando Frankfurter:`,
            error
        );
    }

    // Respaldo gratuito para el cambio de divisa.
    try {
        const url =
            `${FRANKFURTER_RATE_URL}/${encodeURIComponent(codigo)}/EUR`;

        const datos =
            await fetchJson(url);

        const rate =
            Number(datos?.rate);

        if (rate > 0) {
            cacheFxEur[codigo] = rate;
            return rate;
        }

    } catch (error) {
        ultimoError = error;
    }

    throw new Error(
        `No se pudo convertir ${codigo} a EUR: ` +
        (ultimoError?.message || "sin datos")
    );
}


// ==========================
// TWELVE DATA
// ACCIONES USA
// ==========================

function obtenerMaximo52Twelve(datos) {
    return Number(
        datos?.fifty_two_week?.high ??
        datos?.fifty_two_week?.high_price ??
        datos?.["52_week"]?.high ??
        0
    ) || 0;
}


function extraerCotizacionTwelve(datos) {
    const precio = Number(
        datos?.close ??
        datos?.price ??
        datos?.last ??
        0
    ) || 0;

    const variacion = Number(
        datos?.percent_change ??
        datos?.change_percent ??
        0
    ) || 0;

    const moneda = String(
        datos?.currency || "USD"
    ).toUpperCase();

    const max52 =
        obtenerMaximo52Twelve(datos);

    if (!(precio > 0)) {
        throw new Error(
            "Twelve Data no devolvió un precio válido"
        );
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


async function obtenerCotizacionTwelve(
    activo
) {
    const parametros = {
        symbol: String(
            activo.ticker || ""
        )
        .trim()
        .toUpperCase()
    };

    const exchange = String(
        activo.exchange || ""
    )
    .trim()
    .toUpperCase();

    if (exchange) {
        parametros.exchange =
            exchange;
    }

    const datos = await fetchTwelve(
        "quote",
        parametros
    );

    return extraerCotizacionTwelve(
        datos
    );
}


// ==========================
// YAHOO FINANCE WORKER
// ==========================

async function obtenerCotizacionYahoo(activo) {
    const url = new URL(
        YAHOO_WORKER_URL
    );

    url.searchParams.set(
        "ticker",
        String(activo.ticker || "")
            .trim()
            .toUpperCase()
    );

    url.searchParams.set(
        "exchange",
        String(activo.exchange || "")
            .trim()
            .toUpperCase()
    );

    const datos = await fetchJson(
        url.toString()
    );

    const precio = Number(
        datos?.price ??
        datos?.precio ??
        0
    ) || 0;

    let variacion = Number(
        datos?.percent_change ??
        datos?.cambio_porcentual ??
        0
    ) || 0;

    const max52 = Number(
        datos?.high52 ??
        datos?.maximo52 ??
        0
    ) || 0;

    const moneda = String(
        datos?.currency ??
        datos?.moneda ??
        "EUR"
    ).toUpperCase();

    const exchange = String(
        datos?.exchange ??
        datos?.intercambio ??
        activo.exchange ??
        ""
    ).toUpperCase();

    const nombre =
        datos?.name ??
        datos?.nombre ??
        activo.nombre ??
        "";

    if (!(precio > 0)) {
        throw new Error(
            datos?.error ||
            "Yahoo Finance no devolvió un precio válido"
        );
    }

    /*
     * Protección heredada para variaciones
     * anómalas. El Worker actual ya calcula
     * correctamente previousClose, pero
     * conservamos el filtro como salvaguarda.
     */
    if (Math.abs(variacion) > 15) {
        variacion = 0;
    }

    return {
        precio,
        variacion,
        moneda,
        max52,
        nombre,
        exchange,
        tipo: "Yahoo Finance"
    };
}


// ==========================
// ELEGIR FUENTE + FALLBACK
// ==========================

async function obtenerCotizacionActivo(
    activo
) {
    /*
     * Europeos: Yahoo directamente.
     *
     * Resto: Twelve Data primero.
     * Si Twelve falla por límite, ticker,
     * exchange o cualquier error temporal,
     * se intenta automáticamente Yahoo.
     *
     * Esto evita que activos como Nike
     * queden sin actualizar en Watchlist
     * y Radar cuando Twelve limita peticiones.
     */

    if (debeUsarYahoo(activo)) {
        return obtenerCotizacionYahoo(
            activo
        );
    }

    try {
        return await obtenerCotizacionTwelve(
            activo
        );
    } catch (errorTwelve) {
        console.warn(
            `Twelve Data falló para ${activo.ticker}. Probando Yahoo:`,
            errorTwelve
        );

        try {
            return await obtenerCotizacionYahoo(
                activo
            );
        } catch (errorYahoo) {
            throw new Error(
                `Twelve: ${errorTwelve.message || "error"} · Yahoo: ${errorYahoo.message || "error"}`
            );
        }
    }
}


// ==========================
// ACTUALIZAR UN ACTIVO
// ==========================

async function actualizarActivoMercado(
    activo
) {
    const cotizacion =
        await obtenerCotizacionActivo(
            activo
        );

    const fxEur =
        await obtenerCambioAEur(
            cotizacion.moneda
        );

    activo.precioNativo =
        cotizacion.precio;

    activo.precioActual =
        cotizacion.precio * fxEur;

    activo.moneda =
        cotizacion.moneda;

    activo.fxEur =
        fxEur;

    activo.variacion =
        cotizacion.variacion;

    activo.max52Nativo =
        cotizacion.max52;

    activo.max52 =
        cotizacion.max52 * fxEur;

    activo.exchange =
        activo.exchange ||
        cotizacion.exchange ||
        "";

    activo.tipo =
        cotizacion.tipo ||
        activo.tipo;

    activo.ultimaRevision =
        new Date().toLocaleString(
            "es-ES"
        );

    activo.error = "";

    recalcularActivoCartera(
        activo
    );
}


// ==========================
// ESPERAR
// ==========================

function dormir(ms) {
    return new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );
}


// ==========================
// PROGRESO
// ==========================

function actualizarProgresoCartera(
    completados,
    total
) {
    const boton =
        document.getElementById(
            "botonActualizarCartera"
        );

    if (boton) {
        boton.textContent =
            `⏳ Actualizando ${completados}/${total}`;
    }
}


// ==========================
// ACTUALIZAR LOTE
// ==========================

async function actualizarLoteCartera(
    inicio,
    fin
) {
    for (
        let indice = inicio;
        indice < fin;
        indice += 1
    ) {
        const activo =
            cartera[indice];

        try {
            await actualizarActivoMercado(
                activo
            );
        } catch (error) {
            console.error(
                activo.ticker,
                error
            );

            activo.error =
                `❌ ${activo.ticker}` +
                (
                    activo.exchange
                        ? " · " +
                          activo.exchange
                        : ""
                ) +
                ": " +
                (
                    error.message ||
                    "Precio no disponible"
                );
        }

        recalcularTodaLaCartera();
        pintarCartera();

        actualizarProgresoCartera(
            indice + 1,
            cartera.length
        );
    }
}


// ==========================
// ACTUALIZAR TODA LA CARTERA
// ==========================

async function actualizarTodaLaCartera() {
    if (
        actualizandoCartera ||
        !Array.isArray(cartera)
    ) {
        return;
    }

    if (cartera.length === 0) {
        pintarCartera();
        return;
    }

    actualizandoCartera = true;

    const boton =
        document.getElementById(
            "botonActualizarCartera"
        );

    if (boton) {
        boton.disabled = true;
        boton.textContent =
            "⏳ Preparando actualización...";
    }

    try {
        for (
            let inicio = 0;
            inicio < cartera.length;
            inicio += TWELVE_CREDITOS_POR_MINUTO
        ) {
            const fin = Math.min(
                inicio +
                TWELVE_CREDITOS_POR_MINUTO,
                cartera.length
            );

            await actualizarLoteCartera(
                inicio,
                fin
            );

            if (fin < cartera.length) {
                if (boton) {
                    boton.textContent =
                        "⏳ Límite gratuito: " +
                        `esperando (${fin}/` +
                        `${cartera.length})`;
                }

                await dormir(
                    TWELVE_ESPERA_LOTE_MS
                );
            }
        }

        recalcularTodaLaCartera();
        guardarDatos();
        pintarCartera();

        const fecha =
            new Date().toLocaleString(
                "es-ES"
            );

        localStorage.setItem(
            CARTERA_UPDATE_KEY,
            fecha
        );

        const elementoFecha =
            document.getElementById(
                "carteraUltimaActualizacion"
            );

        if (elementoFecha) {
            elementoFecha.textContent =
                fecha;
        }

    } catch (error) {
        console.error(
            "Error general actualizando cartera:",
            error
        );

    } finally {
        actualizandoCartera = false;

        if (boton) {
            boton.disabled = false;
            boton.textContent =
                "🔄 Actualizar toda la cartera";
        }
    }
}


// ==========================
// INICIO
// ==========================

document.addEventListener(
    "DOMContentLoaded",
    function() {
        if (Array.isArray(cartera)) {
            recalcularTodaLaCartera();
            pintarCartera();
        }
    }
);
