// ==========================
// precios.js v4.2
// Twelve Data
// Quote + respaldo Time Series
// ==========================

const TWELVE_API_KEY = "55a72c9584b14cecb6b1fa5c4f52ce3b";
const TWELVE_BASE_URL = "https://api.twelvedata.com";
const TWELVE_CREDITOS_POR_MINUTO = 8;
const TWELVE_ESPERA_LOTE_MS = 61000;

let actualizandoCartera = false;

const cacheFxEur = {
    EUR: 1
};


// ==========================
// PETICIÓN TWELVE DATA
// ==========================

async function fetchTwelve(endpoint, parametros = {}) {

    const url =
        new URL(
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


    const respuesta =
        await fetch(

            url.toString(),

            {
                cache: "no-store"
            }

        );


    let datos = null;


    try {

        datos =
            await respuesta.json();

    } catch (error) {

        datos = null;

    }


    if (!respuesta.ok) {

        const mensaje =

            datos?.message ||

            `HTTP ${respuesta.status}`;


        const error =
            new Error(mensaje);


        error.status =
            respuesta.status;


        error.endpoint =
            endpoint;


        throw error;

    }


    if (
        datos?.status === "error" ||
        datos?.code
    ) {

        const error =
            new Error(

                datos.message ||

                "Error de Twelve Data"

            );


        error.code =
            datos.code;


        error.endpoint =
            endpoint;


        throw error;

    }


    return datos;

}


// ==========================
// PARÁMETROS DEL ACTIVO
// ==========================

function parametrosActivoTwelve(activo) {

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


    return parametros;

}


// ==========================
// CAMBIO A EUROS
// ==========================

async function obtenerCambioAEur(moneda) {

    const codigo = String(

        moneda || "EUR"

    ).toUpperCase();


    if (cacheFxEur[codigo]) {

        return cacheFxEur[codigo];

    }


    const datos =
        await fetchTwelve(

            "exchange_rate",

            {

                symbol:
                    `${codigo}/EUR`

            }

        );


    const rate =
        Number(datos?.rate);


    if (!(rate > 0)) {

        throw new Error(

            `No se pudo convertir ${codigo} a EUR`

        );

    }


    cacheFxEur[codigo] =
        rate;


    return rate;

}

// ==========================
// LECTURA DEL ENDPOINT QUOTE
// ==========================

function obtenerMaximo52Quote(datos) {

    return Number(

        datos?.fifty_two_week?.high ??

        datos?.fifty_two_week?.high_price ??

        datos?.["52_week"]?.high ??

        0

    ) || 0;

}


function extraerCotizacionQuote(datos) {

    const precio =

        Number(

            datos?.close ??

            datos?.price ??

            datos?.last ??

            0

        ) || 0;


    const variacion =

        Number(

            datos?.percent_change ??

            datos?.change_percent ??

            0

        ) || 0;


    const moneda =

        String(

            datos?.currency ||

            "EUR"

        ).toUpperCase();


    const max52 =

        obtenerMaximo52Quote(datos);


    if (!(precio > 0)) {

        throw new Error(

            "Quote no contiene un precio válido"

        );

    }


    return {

        precio,

        variacion,

        moneda,

        max52,

        nombre:

            datos?.name || "",

        exchange:

            datos?.exchange || "",

        tipo:

            datos?.type || ""

    };

}


// ==========================
// RESPALDO TIME SERIES
// ==========================

function extraerCotizacionTimeSeries(datos) {

    const valores =

        Array.isArray(datos?.values)

        ? datos.values

        : [];


    if (valores.length === 0) {

        throw new Error(

            "Time Series no contiene precios"

        );

    }


    const ultima = valores[0];

    const anterior =

        valores[1] || ultima;


    const precio =

        Number(

            ultima?.close

        ) || 0;


    const cierreAnterior =

        Number(

            anterior?.close

        ) || precio;


    const variacion =

        cierreAnterior > 0

        ? (

            (

                precio -

                cierreAnterior

            ) /

            cierreAnterior

        ) * 100

        : 0;


    const max52 =

        valores.reduce(

            function(maximo, vela) {

                const high =

                    Number(

                        vela?.high

                    ) || 0;

                return Math.max(

                    maximo,

                    high

                );

            },

            0

        );


    const meta =

        datos?.meta || {};


    if (!(precio > 0)) {

        throw new Error(

            "Time Series no contiene un cierre válido"

        );

    }


    return {

        precio,

        variacion,

        moneda:

            String(

                meta.currency ||

                "EUR"

            ).toUpperCase(),

        max52,

        nombre:

            meta.symbol || "",

        exchange:

            meta.exchange || "",

        tipo:

            meta.type || "ETF"

    };

}

// ==========================
// OBTENER COTIZACIÓN
// ==========================

async function obtenerCotizacionTwelve(activo) {

    const parametros =
        parametrosActivoTwelve(activo);


    // Primero intentamos QUOTE.
    // Suele funcionar mejor para acciones USA.

    try {

        const datosQuote =
            await fetchTwelve(

                "quote",

                parametros

            );


        return extraerCotizacionQuote(

            datosQuote

        );


    } catch (errorQuote) {

        console.warn(

            `Quote falló para ${activo.ticker}. ` +
            "Probando Time Series.",

            errorQuote

        );


        // Respaldo para ETF europeos,
        // por ejemplo EUNL en XETR.

        const datosSerie =
            await fetchTwelve(

                "time_series",

                {

                    ...parametros,

                    interval: "1day",

                    outputsize: 260,

                    order: "DESC"

                }

            );


        return extraerCotizacionTimeSeries(

            datosSerie

        );

    }

}


// ==========================
// ACTUALIZAR ACTIVO
// ==========================

async function actualizarActivoDesdeTwelve(activo) {

    const cotizacion =
        await obtenerCotizacionTwelve(

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
// UTILIDADES
// ==========================

function dormir(ms) {

    return new Promise(

        resolve => setTimeout(

            resolve,

            ms

        )

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

            await actualizarActivoDesdeTwelve(

                activo

            );

        }

        catch (error) {

            console.error(

                activo.ticker,

                error

            );


            activo.error =

                `❌ ${activo.ticker}` +

                (

                    activo.exchange

                    ? " · " + activo.exchange

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
// ACTUALIZAR CARTERA
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

    }

    finally {

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

    function () {

        // Si la cartera ya tiene activos
        // se recalculan todos los datos.

        if (Array.isArray(cartera)) {

            recalcularTodaLaCartera();

            pintarCartera();

        }

    }

);


// ==========================
// FIN DEL ARCHIVO
// ==========================