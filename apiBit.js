// ==========================
// apiBit.js v4.3
// Método Paco Bit
// Bitcoin + Brent + metales
// ==========================

const COINGECKO_API =
    "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false";

const FEAR_GREED_API =
    "https://api.alternative.me/fng/?limit=1";

const GOLD_API_BASE =
    "https://api.gold-api.com";

const FRANKFURTER_USD_EUR =
    "https://api.frankfurter.dev/v2/rate/USD/EUR";

// Worker de Cloudflare que ya hemos comprobado que funciona
const PACO_WORKER =
    "https://late-lab-2625.rjaresarias.workers.dev";

let actualizandoBit = false;


// ==========================
// FUNCIÓN GENERAL FETCH
// ==========================

async function fetchJson(url) {

    const respuesta = await fetch(url, {
        cache: "no-store"
    });

    if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status}`);
    }

    return respuesta.json();
}


// ==========================
// FEAR & GREED
// ==========================

async function obtenerFearGreed() {

    try {

        const datos = await fetchJson(FEAR_GREED_API);

        const item = datos?.data?.[0];

        if (!item) return null;

        return `${item.value ?? "--"}${
            item.value_classification
                ? " · " + item.value_classification
                : ""
        }`;

    } catch (error) {

        console.warn(
            "Fear & Greed no disponible:",
            error
        );

        return null;
    }
}


// ==========================
// CAMBIO USD → EUR
// ==========================

async function obtenerUsdEur() {

    const datos =
        await fetchJson(FRANKFURTER_USD_EUR);

    const rate = Number(datos?.rate);

    if (!(rate > 0)) {

        throw new Error(
            "Cambio USD/EUR no disponible"
        );
    }

    return rate;
}


// ==========================
// METALES
// ==========================

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

            const datos =
                await fetchJson(url);

            const precio =
                leerCampoPrecio(datos);

            if (precio > 0) {

                return {

                    precio,

                    variacion:
                        leerCampoVariacion(datos)

                };
            }

            ultimoError =
                new Error(
                    "Respuesta sin precio"
                );

        } catch (error) {

            ultimoError = error;
        }
    }

    throw (
        ultimoError ||
        new Error("Precio no disponible")
    );
}


// ==========================
// BITCOIN
// ==========================

async function actualizarBitcoinV4() {

    const datos =
        await fetchJson(COINGECKO_API);

    const mercado =
        datos?.market_data;

    if (!mercado?.current_price?.eur) {

        throw new Error(
            "CoinGecko no devolvió precio EUR"
        );
    }

    const fearGreed =
        await obtenerFearGreed();

    actualizarActivoBit(
        "bitcoin",
        {

            precio:
                Number(
                    mercado.current_price.eur
                ) || 0,

            variacion:
                Number(
                    mercado.price_change_percentage_24h
                ) || 0,

            maximoRegistrado:
                Number(
                    mercado.ath?.eur
                ) ||
                metodoPacoBit.bitcoin
                    .maximoRegistrado,

            fearGreed:
                fearGreed ||
                metodoPacoBit.bitcoin
                    .fearGreed

        }
    );
}


// ==========================
// METALES → EUR/KG
// ==========================

async function actualizarMetalV4(
    clave,
    usdEur
) {

    const activo =
        metodoPacoBit[clave];

    const datos =
        await obtenerMetalUsdOnza(
            activo.ticker
        );

    // Gold API devuelve USD/onza troy
    // Convertimos a EUR/kg

    const precioEurKg =
        datos.precio *
        usdEur *
        BIT_OZ_TROY_POR_KG;

    actualizarActivoBit(
        clave,
        {

            precio: precioEurKg,

            variacion:
                datos.variacion

        }
    );
}


// =====================================================
// BRENT
// Cloudflare Worker + Yahoo Finance BZ=F
// =====================================================

async function obtenerBrentWorker() {

    const url =
        `${PACO_WORKER}/?ticker=${encodeURIComponent("BZ=F")}`;

    const datos =
        await fetchJson(url);

    console.log(
        "Respuesta Brent Worker:",
        datos
    );

    const precio =
        Number(datos?.price) || 0;

    const variacion =
        Number(
            datos?.percent_change
        ) || 0;

    const maximo52 =
        Number(
            datos?.high52
        ) || 0;

    if (!(precio > 0)) {

        throw new Error(
            "El Worker no devolvió un precio Brent válido"
        );
    }

    return {

        precio,

        variacion,

        maximo:
            maximo52

    };
}


// ==========================
// ACTUALIZAR BRENT
// ==========================

async function actualizarBrentV4(
    usdEur
) {

    const datos =
        await obtenerBrentWorker();

    let maximo =
        metodoPacoBit.brent
            .maximoRegistrado || 0;

    if (datos.maximo > 0) {

        maximo =
            datos.maximo;
    }

    actualizarActivoBit(
        "brent",
        {

            precio:
                datos.precio,

            variacion:
                datos.variacion,

            maximoRegistrado:
                maximo,

            factorEur:
                Number(usdEur) > 0
                    ? Number(usdEur)
                    : metodoPacoBit.brent
                        .factorEur

        }
    );
}


// =====================================================
// ACTUALIZACIÓN GENERAL
// =====================================================

async function actualizarBit() {

    if (actualizandoBit) return;

    actualizandoBit = true;

    const boton =
        document.getElementById(
            "botonActualizarBit"
        );

    if (boton) {

        boton.disabled = true;

        boton.textContent =
            "⏳ Actualizando...";
    }


    // Limpiar errores anteriores

    Object.keys(
        metodoPacoBit
    ).forEach(function(clave) {

        metodoPacoBit[clave]
            .error = "";

    });


    const tareas = [];


    // ==========================
    // BITCOIN
    // ==========================

    tareas.push(

        actualizarBitcoinV4()
            .catch(function(error) {

                console.error(
                    "Bitcoin:",
                    error
                );

                marcarErrorBit(
                    "bitcoin",
                    "Bitcoin no pudo actualizarse."
                );

            })

    );


    // ==========================
    // USD → EUR
    // ==========================

    let usdEur = null;

    try {

        usdEur =
            await obtenerUsdEur();

    } catch (error) {

        console.error(
            "USD/EUR:",
            error
        );

        [
            "oro",
            "plata",
            "platino",
            "paladio"
        ].forEach(function(clave) {

            marcarErrorBit(
                clave,
                "No se pudo obtener el cambio USD/EUR."
            );

        });

    }


    // ==========================
    // BRENT
    // ==========================

    tareas.push(

        actualizarBrentV4(
            usdEur
        )
        .catch(function(error) {

            console.error(
                "Brent:",
                error
            );

            marcarErrorBit(
                "brent",
                "El petróleo Brent no pudo actualizarse."
            );

        })

    );


    // ==========================
    // METALES
    // ==========================

    if (usdEur) {

        [
            "oro",
            "plata",
            "platino",
            "paladio"
        ].forEach(function(clave) {

            tareas.push(

                actualizarMetalV4(
                    clave,
                    usdEur
                )
                .catch(function(error) {

                    console.error(
                        clave,
                        error
                    );

                    marcarErrorBit(
                        clave,
                        `${metodoPacoBit[clave].nombre} no pudo actualizarse.`
                    );

                })

            );

        });

    }


    // Esperar todas las APIs

    await Promise.allSettled(
        tareas
    );


    // ==========================
    // RECALCULAR
    // ==========================

    Object.keys(
        metodoPacoBit
    ).forEach(
        recalcularActivo
    );


    // ==========================
    // FECHA ACTUALIZACIÓN
    // ==========================

    const fecha =
        new Date()
            .toLocaleString(
                "es-ES"
            );

    escribir(
        "bitUltimaActualizacion",
        fecha
    );


    // ==========================
    // GUARDAR
    // ==========================

    guardarDatosBit();


    // ==========================
    // MOSTRAR
    // ==========================

    mostrarMetodoPacoBit();


    // ==========================
    // BOTÓN
    // ==========================

    if (boton) {

        boton.disabled = false;

        boton.textContent =
            "🔄 Actualizar todo";
    }


    actualizandoBit = false;
}


// =====================================================
// INICIO AUTOMÁTICO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        actualizarBit();


        // Actualización automática
        // cada 5 minutos

        setInterval(
            function() {

                actualizarBit();

            },
            300000
        );

    }
);