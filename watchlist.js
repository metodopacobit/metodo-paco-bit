// ==========================
// watchlist.js v1.0
// Watchlist compartida con Radar
// ==========================

const WATCHLIST_STORAGE_KEY = "metodoPacoWatchlistV1";

let watchlist = [];
let indiceWatchlistEditar = -1;
let actualizandoWatchlist = false;

const WATCHLIST_INICIAL = [
    { nombre: "Broadcom", ticker: "AVGO", exchange: "NASDAQ" },
    { nombre: "Microsoft", ticker: "MSFT", exchange: "NASDAQ" },
    { nombre: "Alphabet", ticker: "GOOGL", exchange: "NASDAQ" },
    { nombre: "Amazon", ticker: "AMZN", exchange: "NASDAQ" },
    { nombre: "Meta", ticker: "META", exchange: "NASDAQ" },
    { nombre: "ASML", ticker: "ASML", exchange: "NASDAQ" },
    { nombre: "TSMC", ticker: "TSM", exchange: "NYSE" },
    { nombre: "Novo Nordisk", ticker: "NVO", exchange: "NYSE" },
    { nombre: "Nike", ticker: "NKE", exchange: "NYSE" },
    { nombre: "Vanguard FTSE All-World", ticker: "VWCE", exchange: "XETR" }
];

function numeroWatchlist(valor, defecto = 0) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : defecto;
}

function escaparWatchlist(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizarActivoWatchlist(activo = {}) {
    return {
        nombre: String(activo.nombre || activo.ticker || "Activo").trim(),
        ticker: String(activo.ticker || "").trim().toUpperCase(),
        exchange: String(activo.exchange || "").trim().toUpperCase(),
        precio: numeroWatchlist(activo.precio),
        variacion: numeroWatchlist(activo.variacion),
        max52: numeroWatchlist(activo.max52),
        moneda: String(activo.moneda || "").trim().toUpperCase(),
        ultimaRevision: activo.ultimaRevision || "--",
        error: activo.error || ""
    };
}

function cargarWatchlist() {
    try {
        const guardado = JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY));

        if (Array.isArray(guardado)) {
            watchlist = guardado.map(normalizarActivoWatchlist);
        } else {
            watchlist = WATCHLIST_INICIAL.map(normalizarActivoWatchlist);
            guardarWatchlist();
        }
    } catch (error) {
        console.warn("No se pudo cargar la Watchlist:", error);
        watchlist = WATCHLIST_INICIAL.map(normalizarActivoWatchlist);
    }
}

function guardarWatchlist() {
    localStorage.setItem(
        WATCHLIST_STORAGE_KEY,
        JSON.stringify(watchlist)
    );
}

function formatoPrecioWatchlist(valor, moneda) {
    const numero = Number(valor);

    if (!Number.isFinite(numero) || !(numero > 0)) {
        return "--";
    }

    return numero.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + (moneda ? ` ${moneda}` : "");
}

function formatoPorcentajeWatchlist(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) return "--";

    return `${numero >= 0 ? "+" : ""}${numero.toFixed(2)} %`;
}

function caidaMaximoWatchlist(activo) {
    if (!(activo.precio > 0) || !(activo.max52 > 0)) {
        return 0;
    }

    return ((activo.precio - activo.max52) / activo.max52) * 100;
}

function tarjetaWatchlist(activo, indice) {
    const caida = caidaMaximoWatchlist(activo);

    return `
        <article class="watchlist-card">

            <div class="watchlist-cabecera">
                <div>
                    <h3>${escaparWatchlist(activo.nombre)}</h3>
                    <p>
                        ${escaparWatchlist(activo.ticker)}
                        ${activo.exchange ? " · " + escaparWatchlist(activo.exchange) : ""}
                    </p>
                </div>

                <button
                    class="watchlist-editar"
                    onclick="abrirEditorWatchlist(${indice})"
                    aria-label="Editar ${escaparWatchlist(activo.nombre)}"
                >
                    ✏️
                </button>
            </div>

            <div class="watchlist-datos">
                <div>
                    <span>Precio</span>
                    <strong>${formatoPrecioWatchlist(activo.precio, activo.moneda)}</strong>
                </div>

                <div>
                    <span>Cambio diario</span>
                    <strong>${formatoPorcentajeWatchlist(activo.variacion)}</strong>
                </div>

                <div>
                    <span>Máximo 52 sem.</span>
                    <strong>${formatoPrecioWatchlist(activo.max52, activo.moneda)}</strong>
                </div>

                <div>
                    <span>Desde máximo</span>
                    <strong>${formatoPorcentajeWatchlist(caida)}</strong>
                </div>
            </div>

            <p class="watchlist-error">${escaparWatchlist(activo.error || "")}</p>

        </article>
    `;
}

function pintarWatchlist() {
    const contenedor = document.getElementById("watchlistLista");
    const vacia = document.getElementById("watchlistVacia");

    if (!contenedor) return;

    contenedor.innerHTML = watchlist
        .map(tarjetaWatchlist)
        .join("");

    if (vacia) {
        vacia.classList.toggle("oculto", watchlist.length > 0);
    }

    const ultima = watchlist
        .map(activo => activo.ultimaRevision)
        .filter(fecha => fecha && fecha !== "--")
        .at(-1);

    const elementoFecha =
        document.getElementById("watchlistUltimaActualizacion");

    if (elementoFecha) {
        elementoFecha.textContent = ultima || "--";
    }
}

function abrirEditorWatchlist(indice = -1) {
    indiceWatchlistEditar = Number.isInteger(indice)
        ? indice
        : -1;

    const activo = indiceWatchlistEditar >= 0
        ? watchlist[indiceWatchlistEditar]
        : null;

    const titulo = document.getElementById("tituloModalWatchlist");
    const nombre = document.getElementById("watchlistNombreInput");
    const ticker = document.getElementById("watchlistTickerInput");
    const exchange = document.getElementById("watchlistExchangeInput");
    const eliminar = document.getElementById("botonEliminarWatchlist");

    if (titulo) {
        titulo.textContent = activo
            ? `✏️ Editar ${activo.nombre}`
            : "➕ Añadir a Watchlist";
    }

    if (nombre) nombre.value = activo?.nombre || "";
    if (ticker) ticker.value = activo?.ticker || "";
    if (exchange) exchange.value = activo?.exchange || "";

    eliminar?.classList.toggle("oculto", !activo);

    document
        .getElementById("modalWatchlist")
        ?.classList.remove("oculto");
}

function cerrarEditorWatchlist() {
    indiceWatchlistEditar = -1;

    document
        .getElementById("modalWatchlist")
        ?.classList.add("oculto");
}

function guardarActivoWatchlist() {
    const nombre =
        document.getElementById("watchlistNombreInput")
            ?.value.trim() || "";

    const ticker =
        document.getElementById("watchlistTickerInput")
            ?.value.trim().toUpperCase() || "";

    const exchange =
        document.getElementById("watchlistExchangeInput")
            ?.value.trim().toUpperCase() || "";

    if (!nombre || !ticker) {
        alert("Introduce al menos nombre y ticker.");
        return;
    }

    const anterior = indiceWatchlistEditar >= 0
        ? watchlist[indiceWatchlistEditar]
        : {};

    const nuevo = normalizarActivoWatchlist({
        ...anterior,
        nombre,
        ticker,
        exchange
    });

    if (indiceWatchlistEditar >= 0) {
        watchlist[indiceWatchlistEditar] = nuevo;
    } else {
        watchlist.push(nuevo);
    }

    guardarWatchlist();
    cerrarEditorWatchlist();
    pintarWatchlist();

    if (typeof pintarRadar === "function") {
        pintarRadar();
    }
}

function eliminarActivoWatchlist() {
    if (
        indiceWatchlistEditar < 0 ||
        !watchlist[indiceWatchlistEditar]
    ) {
        return;
    }

    const activo = watchlist[indiceWatchlistEditar];

    if (!confirm(`¿Eliminar ${activo.nombre} de la Watchlist?`)) {
        return;
    }

    watchlist.splice(indiceWatchlistEditar, 1);

    guardarWatchlist();
    cerrarEditorWatchlist();
    pintarWatchlist();

    if (typeof pintarRadar === "function") {
        pintarRadar();
    }
}

async function actualizarActivoWatchlist(activo) {
    if (typeof obtenerCotizacionActivo !== "function") {
        throw new Error("precios.js no está disponible.");
    }

    const cotizacion =
        await obtenerCotizacionActivo(activo);

    activo.precio =
        numeroWatchlist(cotizacion.precio);

    activo.variacion =
        numeroWatchlist(cotizacion.variacion);

    activo.max52 =
        numeroWatchlist(cotizacion.max52);

    activo.moneda =
        String(cotizacion.moneda || "").toUpperCase();

    activo.ultimaRevision =
        new Date().toLocaleString("es-ES");

    activo.error = "";
}

async function actualizarWatchlist(actualizarRadarDespues = true) {
    if (actualizandoWatchlist) return;

    if (watchlist.length === 0) {
        pintarWatchlist();
        return;
    }

    actualizandoWatchlist = true;

    const boton =
        document.getElementById("botonActualizarWatchlist");

    if (boton) {
        boton.disabled = true;
        boton.textContent = "⏳ Actualizando...";
    }

    try {
        for (
            let indice = 0;
            indice < watchlist.length;
            indice += 1
        ) {
            const activo = watchlist[indice];

            try {
                await actualizarActivoWatchlist(activo);
            } catch (error) {
                console.error("Watchlist:", activo.ticker, error);

                activo.error =
                    `❌ ${activo.ticker}: ${error.message || "Precio no disponible"}`;
            }

            pintarWatchlist();

            if (boton) {
                boton.textContent =
                    `⏳ Actualizando ${indice + 1}/${watchlist.length}`;
            }
        }

        guardarWatchlist();
        pintarWatchlist();

        if (
            actualizarRadarDespues &&
            typeof pintarRadar === "function"
        ) {
            pintarRadar();
        }

    } finally {
        actualizandoWatchlist = false;

        if (boton) {
            boton.disabled = false;
            boton.textContent = "🔄 Actualizar Watchlist";
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    cargarWatchlist();
    pintarWatchlist();
});
