// ==========================
// apiBit.js v4.2
// Bitcoin + Brent + metales + EUR
// ==========================

const COINGECKO_API =
    "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false";

const FEAR_GREED_API =
    "https://api.alternative.me/fng/?limit=1";

const GOLD_API_BASE =
    "https://api.gold-api.com";

const FRANKFURTER_USD_EUR =
    "https://api.frankfurter.dev/v2/rate/USD/EUR";

let actualizandoBit = false;

async function fetchJson(url) {
    const respuesta = await fetch(url, { cache: "no-store" });

    if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status}`);
    }

    return respuesta.json();
}

async function obtenerFearGreed() {
    try {
        const datos = await fetchJson(FEAR_GREED_API);
        const item = datos?.data?.[0];

        if (!item) return null;

        return `${item.value ?? "--"}${item.value_classification ? " · " + item.value_classification : ""}`;
    } catch (error) {
        console.warn("Fear & Greed no disponible:", error);
        return null;
    }
}

async function obtenerUsdEur() {
    const datos = await fetchJson(FRANKFURTER_USD_EUR);
    const rate = Number(datos?.rate);

    if (!(rate > 0)) {
        throw new Error("Cambio USD/EUR no disponible");
    }

    return rate;
}

function leerCampoPrecio(datos) {
    return Number(
        datos?.price ??
        datos?.ask ??
        datos?.close ??
        datos?.value ??
        datos?.current_price
    ) || 0;
}

function leerCampoVariacion(datos) {
    return Number(
        datos?.change_percent ??
        datos?.chg_percent ??
        datos?.percentage_change ??
        datos?.changePercentage ??
        datos?.change
    ) || 0;
}

async function obtenerMetalUsdOnza(simbolo) {
    const rutas = [
        `${GOLD_API_BASE}/price/${simbolo}`,
        `${GOLD_API_BASE}/${simbolo}`
    ];

    let ultimoError = null;

    for (const url of rutas) {
        try {
            const datos = await fetchJson(url);
            const precio = leerCampoPrecio(datos);

            if (precio > 0) {
                return {
                    precio,
                    variacion: leerCampoVariacion(datos)
                };
            }

            ultimoError = new Error("Respuesta sin precio");
        } catch (error) {
            ultimoError = error;
        }
    }

    throw ultimoError || new Error("Precio no disponible");
}

async function actualizarBitcoinV4() {
    const datos = await fetchJson(COINGECKO_API);
    const mercado = datos?.market_data;

    if (!mercado?.current_price?.eur) {
        throw new Error("CoinGecko no devolvió precio EUR");
    }

    const fearGreed = await obtenerFearGreed();

    actualizarActivoBit("bitcoin", {
        precio: Number(mercado.current_price.eur) || 0,
        variacion: Number(mercado.price_change_percentage_24h) || 0,
        maximoRegistrado: Number(mercado.ath?.eur) || metodoPacoBit.bitcoin.maximoRegistrado,
        fearGreed: fearGreed || metodoPacoBit.bitcoin.fearGreed
    });
}

async function actualizarMetalV4(clave, usdEur) {
    const activo = metodoPacoBit[clave];
    const datos = await obtenerMetalUsdOnza(activo.ticker);

    // Gold API ofrece USD por onza troy.
    // Convertimos a euros por kilogramo.
    const precioEurKg = datos.precio * usdEur * BIT_OZ_TROY_POR_KG;

    actualizarActivoBit(clave, {
        precio: precioEurKg,
        variacion: datos.variacion
    });
}

async function obtenerBrentTwelve() {
    if (typeof fetchTwelve !== "function") {
        throw new Error("Twelve Data no está disponible");
    }

    const datos = await fetchTwelve("quote", {
        symbol: "XBR/USD"
    });

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

    const maximo = Number(
        datos?.fifty_two_week?.high ??
        datos?.fifty_two_week?.high_price ??
        datos?.["52_week"]?.high ??
        0
    ) || 0;

    if (!(precio > 0)) {
        throw new Error("Twelve Data no devolvió un precio Brent válido");
    }

    return { precio, variacion, maximo };
}

async function obtenerBrentYahoo() {
    const url =
        "https://query1.finance.yahoo.com/v8/finance/chart/BZ%3DF?interval=1d&range=5d";

    const datos = await fetchJson(url);
    const resultado = datos?.chart?.result?.[0];

    if (!resultado) {
        throw new Error("Yahoo no devolvió datos de Brent");
    }

    const meta = resultado.meta || {};
    const cierres = resultado?.indicators?.quote?.[0]?.close || [];
    const validos = cierres.filter(function(valor) {
        return Number(valor) > 0;
    });

    const precio = Number(meta.regularMarketPrice) ||
        Number(validos[validos.length - 1]) ||
        0;

    const anterior = Number(meta.chartPreviousClose) ||
        Number(meta.previousClose) ||
        Number(validos[validos.length - 2]) ||
        precio;

    const variacion = anterior > 0
        ? ((precio - anterior) / anterior) * 100
        : 0;

    if (!(precio > 0)) {
        throw new Error("Yahoo no devolvió un precio Brent válido");
    }

    return {
        precio,
        variacion,
        maximo: 0
    };
}

async function actualizarBrentV4(usdEur) {
    let datos;

    try {
        datos = await obtenerBrentTwelve();
    } catch (errorTwelve) {
        console.warn("Brent Twelve Data no disponible, usando respaldo Yahoo:", errorTwelve);
        datos = await obtenerBrentYahoo();
    }

    actualizarActivoBit("brent", {
        precio: datos.precio,
        variacion: datos.variacion,
        maximoRegistrado: datos.maximo > 0
            ? Math.max(datos.maximo, metodoPacoBit.brent.maximoRegistrado || 0)
            : metodoPacoBit.brent.maximoRegistrado,
        factorEur: Number(usdEur) > 0 ? Number(usdEur) : metodoPacoBit.brent.factorEur
    });
}

async function actualizarBit() {
    if (actualizandoBit) return;

    actualizandoBit = true;

    const boton = document.getElementById("botonActualizarBit");
    if (boton) {
        boton.disabled = true;
        boton.textContent = "⏳ Actualizando...";
    }

    Object.keys(metodoPacoBit).forEach(function(clave) {
        metodoPacoBit[clave].error = "";
    });

    const tareas = [];

    tareas.push(
        actualizarBitcoinV4().catch(function(error) {
            console.error("Bitcoin:", error);
            marcarErrorBit("bitcoin", "Bitcoin no pudo actualizarse.");
        })
    );

    let usdEur = null;

    try {
        usdEur = await obtenerUsdEur();
    } catch (error) {
        console.error("USD/EUR:", error);

        ["oro", "plata", "platino", "paladio"].forEach(function(clave) {
            marcarErrorBit(clave, "No se pudo obtener el cambio USD/EUR.");
        });
    }

    tareas.push(
        actualizarBrentV4(usdEur).catch(function(error) {
            console.error("Brent:", error);
            marcarErrorBit("brent", "El petróleo Brent no pudo actualizarse.");
        })
    );

    if (usdEur) {
        ["oro", "plata", "platino", "paladio"].forEach(function(clave) {
            tareas.push(
                actualizarMetalV4(clave, usdEur).catch(function(error) {
                    console.error(clave, error);
                    marcarErrorBit(clave, `${metodoPacoBit[clave].nombre} no pudo actualizarse.`);
                })
            );
        });
    }

    await Promise.allSettled(tareas);

    Object.keys(metodoPacoBit).forEach(recalcularActivo);

    const fecha = new Date().toLocaleString("es-ES");
    escribir("bitUltimaActualizacion", fecha);

    guardarDatosBit();
    mostrarMetodoPacoBit();

    if (boton) {
        boton.disabled = false;
        boton.textContent = "🔄 Actualizar todo";
    }

    actualizandoBit = false;
}

document.addEventListener("DOMContentLoaded", function() {
    actualizarBit();

    setInterval(function() {
        actualizarBit();
    }, 300000);
});
