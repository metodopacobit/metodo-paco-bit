// ==========================
// apiBit.js v3.1
// CoinGecko + Fear & Greed
// ==========================

const COINGECKO_API =
    "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false";

const FEAR_GREED_API =
    "https://api.alternative.me/fng/?limit=1";

let actualizandoBit = false;

async function obtenerFearGreed() {
    try {
        const respuesta = await fetch(FEAR_GREED_API, { cache: "no-store" });

        if (!respuesta.ok) return null;

        const datos = await respuesta.json();
        const item = datos?.data?.[0];

        if (!item) return null;

        return {
            valor: item.value ?? "--",
            clasificacion: item.value_classification ?? ""
        };
    } catch (error) {
        console.warn("Fear & Greed no disponible:", error);
        return null;
    }
}

async function actualizarBitcoin() {
    const respuesta = await fetch(COINGECKO_API, { cache: "no-store" });

    if (!respuesta.ok) {
        throw new Error("CoinGecko respondió con estado " + respuesta.status);
    }

    const datos = await respuesta.json();
    const mercado = datos?.market_data;

    if (!mercado?.current_price?.eur) {
        throw new Error("CoinGecko no devolvió el precio de Bitcoin en EUR");
    }

    const fearGreed = await obtenerFearGreed();

    actualizarActivoBit("bitcoin", {
        precio: Number(mercado.current_price.eur) || 0,
        variacion: Number(mercado.price_change_percentage_24h) || 0,
        ath: Number(mercado.ath?.eur) || 0,
        fearGreed: fearGreed
            ? `${fearGreed.valor}${fearGreed.clasificacion ? " · " + fearGreed.clasificacion : ""}`
            : metodoPacoBit.bitcoin.fearGreed
    });

    // El precio nuevo recalcula automáticamente valor actual,
    // ganancia y rentabilidad usando la posición guardada.
    actualizarPosicionBitcoin();
    mostrarMetodoPacoBit();

    const fecha = new Date().toLocaleString("es-ES");
    metodoPacoBit.bitcoin.ultimaRevision = fecha;
    escribir("bitcoinUltimaActualizacion", fecha);
}

async function actualizarBit() {
    if (actualizandoBit) return;

    actualizandoBit = true;

    try {
        await actualizarBitcoin();
    } catch (error) {
        console.error("Error actualizando Método Paco Bit:", error);
        alert("No se pudo actualizar Bitcoin. Inténtalo de nuevo en unos segundos.");
    } finally {
        actualizandoBit = false;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    actualizarBit();

    setInterval(function() {
        actualizarBit();
    }, 300000);
});
