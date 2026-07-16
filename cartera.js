// ==========================
// cartera.js v4.1
// Método Paco
// ==========================

const CARTERA_STORAGE_KEY = "cartera";
const CARTERA_UPDATE_KEY = "carteraUltimaActualizacion";

let cartera = [];
let indiceEditar = -1;

function numeroSeguro(valor, defecto = 0) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : defecto;
}

function formatoEuroCartera(valor) {
    return numeroSeguro(valor).toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " €";
}

function formatoMonedaNativa(valor, moneda = "") {
    const numero = numeroSeguro(valor);

    const texto = numero.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    });

    return moneda ? `${texto} ${moneda}` : texto;
}

function formatoPorcentajeCartera(valor) {
    return numeroSeguro(valor).toFixed(2) + " %";
}

function escaparHtml(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizarActivo(activo = {}) {
    const precioCompra = numeroSeguro(activo.precioCompra ?? activo.precio);
    const precioActual = numeroSeguro(activo.precioActual ?? activo.actual);
    const cantidad = numeroSeguro(activo.cantidad);
    const precioObjetivo = numeroSeguro(activo.precioObjetivo ?? activo.objetivo);

    return {
        nombre: String(activo.nombre || activo.ticker || "Activo").trim(),
        ticker: String(activo.ticker || "").trim().toUpperCase(),
        exchange: String(activo.exchange || "").trim().toUpperCase(),
        tipo: activo.tipo || "Common Stock",
        moneda: String(activo.moneda || activo.currency || "EUR").trim().toUpperCase(),
        precioCompra,
        cantidad,
        precioObjetivo,
        precioNativo: numeroSeguro(activo.precioNativo, precioActual),
        precioActual,
        fxEur: numeroSeguro(activo.fxEur, 1),
        variacion: numeroSeguro(activo.variacion),
        max52Nativo: numeroSeguro(activo.max52Nativo),
        max52: numeroSeguro(activo.max52),
        caidaMaximo: numeroSeguro(activo.caidaMaximo),
        potencial: numeroSeguro(activo.potencial),
        indice: numeroSeguro(activo.indice, 50),
        estado: activo.estado || "Sin datos",
        ultimaRevision: activo.ultimaRevision || "--",
        error: activo.error || ""
    };
}

function cargarCartera() {
    try {
        const guardada = JSON.parse(localStorage.getItem(CARTERA_STORAGE_KEY));
        cartera = Array.isArray(guardada)
            ? guardada.map(normalizarActivo)
            : [];
    } catch (error) {
        console.warn("No se pudo cargar la cartera:", error);
        cartera = [];
    }
}

function guardarDatos() {
    localStorage.setItem(CARTERA_STORAGE_KEY, JSON.stringify(cartera));
}

function recalcularActivoCartera(activo) {
    activo.precioCompra = numeroSeguro(activo.precioCompra);
    activo.cantidad = numeroSeguro(activo.cantidad);
    activo.precioActual = numeroSeguro(activo.precioActual);
    activo.precioObjetivo = numeroSeguro(activo.precioObjetivo);
    activo.max52 = numeroSeguro(activo.max52);

    activo.invertido = activo.precioCompra * activo.cantidad;
    activo.valorActual = activo.precioActual * activo.cantidad;
    activo.beneficio = activo.valorActual - activo.invertido;
    activo.rentabilidad = activo.invertido > 0
        ? (activo.beneficio / activo.invertido) * 100
        : 0;

    activo.caidaMaximo = activo.max52 > 0
        ? ((activo.precioActual - activo.max52) / activo.max52) * 100
        : 0;

    activo.potencial = activo.precioObjetivo > 0 && activo.precioActual > 0
        ? ((activo.precioObjetivo - activo.precioActual) / activo.precioActual) * 100
        : 0;
}

function calcularPesoCartera() {
    const valorTotal = cartera.reduce(function(total, activo) {
        recalcularActivoCartera(activo);
        return total + activo.valorActual;
    }, 0);

    cartera.forEach(function(activo) {
        activo.peso = valorTotal > 0
            ? (activo.valorActual / valorTotal) * 100
            : 0;
    });
}

function calcularIndiceCartera(activo) {
    let puntuacion = 50;

    // Potencial frente al precio objetivo: hasta 25 puntos.
    if (activo.potencial >= 40) puntuacion += 25;
    else if (activo.potencial >= 25) puntuacion += 20;
    else if (activo.potencial >= 15) puntuacion += 15;
    else if (activo.potencial >= 5) puntuacion += 8;
    else if (activo.potencial < -10) puntuacion -= 18;
    else if (activo.potencial < 0) puntuacion -= 8;

    // Descuento frente al máximo de 52 semanas: hasta 15 puntos.
    if (activo.caidaMaximo <= -40) puntuacion += 15;
    else if (activo.caidaMaximo <= -25) puntuacion += 12;
    else if (activo.caidaMaximo <= -15) puntuacion += 8;
    else if (activo.caidaMaximo >= -3) puntuacion -= 5;

    // Momento diario: evita premiar caídas bruscas sin control.
    if (activo.variacion >= 0.5 && activo.variacion <= 4) puntuacion += 6;
    else if (activo.variacion > 7) puntuacion -= 6;
    else if (activo.variacion <= -7) puntuacion -= 8;
    else if (activo.variacion <= -3) puntuacion -= 3;

    // Concentración: penalización si pesa demasiado en cartera.
    if (activo.peso > 35) puntuacion -= 12;
    else if (activo.peso > 25) puntuacion -= 6;

    activo.indice = Math.max(0, Math.min(100, Math.round(puntuacion)));

    if (activo.indice >= 80) activo.estado = "🟢 Compra fuerte";
    else if (activo.indice >= 65) activo.estado = "🟢 Comprar / Acumular";
    else if (activo.indice >= 50) activo.estado = "🟡 Mantener";
    else if (activo.indice >= 35) activo.estado = "🟠 Esperar";
    else activo.estado = "🔴 Evitar / Revisar";
}

function recalcularTodaLaCartera() {
    calcularPesoCartera();
    cartera.forEach(calcularIndiceCartera);
}

function crearFilaCartera(etiqueta, valor) {
    return `
        <div class="carteraRow">
            <span class="carteraLabel">${etiqueta}</span>
            <strong>${valor}</strong>
        </div>
    `;
}

function crearTarjetaActivo(activo, indice) {
    const nombre = escaparHtml(activo.nombre);
    const ticker = escaparHtml(activo.ticker);
    const exchange = escaparHtml(activo.exchange);
    const moneda = escaparHtml(activo.moneda);

    const mercado = exchange
        ? `${ticker} · ${exchange}`
        : ticker;

    const precioMercado = activo.precioActual > 0
        ? formatoEuroCartera(activo.precioActual)
        : "--";

    const precioNativo = activo.precioNativo > 0 && activo.moneda !== "EUR"
        ? `${formatoMonedaNativa(activo.precioNativo, moneda)} · ${precioMercado}`
        : precioMercado;

    return `
        <section class="cartera-activo">

            <div class="cartera-activo-cabecera">
                <div>
                    <h2 class="cartera-activo-titulo">📈 ${nombre}</h2>
                    <p class="cartera-activo-subtitulo">${mercado}${activo.tipo ? " · " + escaparHtml(activo.tipo) : ""}</p>
                </div>

                <span class="cartera-badge">${activo.indice}/100</span>
            </div>

            <div class="carteraDashboard">

                <div class="carteraCard">
                    <h3>📊 Mercado</h3>

                    ${crearFilaCartera("💶 Precio actual", precioNativo)}
                    ${crearFilaCartera("📈 Cambio diario", formatoPorcentajeCartera(activo.variacion))}
                    ${crearFilaCartera("🏆 Máximo 52 semanas", activo.max52 > 0 ? formatoEuroCartera(activo.max52) : "--")}
                    ${crearFilaCartera("📉 Caída desde máximo", formatoPorcentajeCartera(activo.caidaMaximo))}
                    ${crearFilaCartera("🎯 Precio objetivo", activo.precioObjetivo > 0 ? formatoEuroCartera(activo.precioObjetivo) : "--")}
                    ${crearFilaCartera("🚀 Potencial", activo.precioObjetivo > 0 ? formatoPorcentajeCartera(activo.potencial) : "--")}
                    ${crearFilaCartera("🧭 Índice Método Paco", `${activo.indice}/100`)}
                    ${crearFilaCartera("📌 Estado", escaparHtml(activo.estado))}
                </div>

                <div class="carteraCard">
                    <h3>💼 Tu posición</h3>

                    ${crearFilaCartera("💰 Precio medio", formatoEuroCartera(activo.precioCompra))}
                    ${crearFilaCartera("🔢 Participaciones", numeroSeguro(activo.cantidad).toLocaleString("es-ES", {maximumFractionDigits: 6}))}
                    ${crearFilaCartera("💵 Invertido", formatoEuroCartera(activo.invertido))}
                    ${crearFilaCartera("💎 Valor actual", formatoEuroCartera(activo.valorActual))}
                    ${crearFilaCartera("📊 Ganancia / Pérdida", formatoEuroCartera(activo.beneficio))}
                    ${crearFilaCartera("📈 Rentabilidad", formatoPorcentajeCartera(activo.rentabilidad))}
                    ${crearFilaCartera("⚖️ Peso en cartera", formatoPorcentajeCartera(activo.peso))}
                </div>

            </div>

            <button class="cartera-editar" onclick="abrirEditorActivo(${indice})">✏️ Editar activo</button>

            <p class="cartera-error">${escaparHtml(activo.error || "")}</p>

        </section>
    `;
}

function pintarResumen() {
    const totalInvertido = cartera.reduce((total, activo) => total + activo.invertido, 0);
    const totalActual = cartera.reduce((total, activo) => total + activo.valorActual, 0);
    const beneficio = totalActual - totalInvertido;
    const rentabilidad = totalInvertido > 0
        ? (beneficio / totalInvertido) * 100
        : 0;

    const mayorPeso = cartera.length
        ? [...cartera].sort((a, b) => b.peso - a.peso)[0]
        : null;

    document.getElementById("numActivos").textContent = cartera.length;
    document.getElementById("totalInvertido").textContent = formatoEuroCartera(totalInvertido);
    document.getElementById("valorActual").textContent = formatoEuroCartera(totalActual);
    document.getElementById("beneficioCartera").textContent = formatoEuroCartera(beneficio);
    document.getElementById("rentabilidad").textContent = formatoPorcentajeCartera(rentabilidad);
    document.getElementById("mayorPesoCartera").textContent = mayorPeso
        ? `${mayorPeso.nombre} · ${formatoPorcentajeCartera(mayorPeso.peso)}`
        : "--";
}

function pintarCartera() {
    recalcularTodaLaCartera();

    const lista = document.getElementById("lista");
    const vacia = document.getElementById("carteraVacia");

    if (!lista) return;

    lista.innerHTML = cartera.map(crearTarjetaActivo).join("");

    if (vacia) {
        vacia.classList.toggle("oculto", cartera.length > 0);
    }

    pintarResumen();
}

function abrirEditorActivo(indice = -1) {
    indiceEditar = Number.isInteger(indice) ? indice : -1;

    const activo = indiceEditar >= 0
        ? cartera[indiceEditar]
        : null;

    document.getElementById("tituloModalActivoCartera").textContent =
        activo ? `✏️ Editar ${activo.nombre}` : "➕ Añadir activo";

    document.getElementById("activoNombreInput").value = activo?.nombre || "";
    document.getElementById("activoTickerInput").value = activo?.ticker || "";
    document.getElementById("activoExchangeInput").value = activo?.exchange || "";
    document.getElementById("activoPrecioCompraInput").value = activo?.precioCompra || "";
    document.getElementById("activoCantidadInput").value = activo?.cantidad || "";
    document.getElementById("activoObjetivoInput").value = activo?.precioObjetivo || "";

    document.getElementById("botonEliminarActivoModal")
        ?.classList.toggle("oculto", !activo);

    document.getElementById("modalActivoCartera")
        ?.classList.remove("oculto");
}

function cerrarEditorActivo() {
    indiceEditar = -1;
    document.getElementById("modalActivoCartera")
        ?.classList.add("oculto");
}

function guardarActivo() {
    const nombre = document.getElementById("activoNombreInput").value.trim();
    const ticker = document.getElementById("activoTickerInput").value.trim().toUpperCase();
    const exchange = document.getElementById("activoExchangeInput").value.trim().toUpperCase();
    const precioCompra = numeroSeguro(document.getElementById("activoPrecioCompraInput").value);
    const cantidad = numeroSeguro(document.getElementById("activoCantidadInput").value);
    const precioObjetivo = numeroSeguro(document.getElementById("activoObjetivoInput").value);

    if (!nombre || !ticker || !(precioCompra > 0) || !(cantidad > 0)) {
        alert("Completa nombre, ticker, precio de compra y participaciones.");
        return;
    }

    if (indiceEditar >= 0) {
        cartera[indiceEditar] = normalizarActivo({
            ...cartera[indiceEditar],
            nombre,
            ticker,
            exchange,
            precioCompra,
            cantidad,
            precioObjetivo
        });
    } else {
        cartera.push(normalizarActivo({
            nombre,
            ticker,
            exchange,
            precioCompra,
            cantidad,
            precioObjetivo,
            precioActual: 0
        }));
    }

    guardarDatos();
    cerrarEditorActivo();
    pintarCartera();
}

function eliminarActivo(indice) {
    if (!Number.isInteger(indice) || !cartera[indice]) return;
    if (!confirm(`¿Eliminar ${cartera[indice].nombre}?`)) return;

    cartera.splice(indice, 1);
    guardarDatos();
    cerrarEditorActivo();
    pintarCartera();
}

function eliminarActivoDesdeModal() {
    eliminarActivo(indiceEditar);
}

function editarActivo(indice) {
    abrirEditorActivo(indice);
}

document.addEventListener("DOMContentLoaded", function() {
    cargarCartera();

    const ultima = localStorage.getItem(CARTERA_UPDATE_KEY);
    if (ultima) {
        const elemento = document.getElementById("carteraUltimaActualizacion");
        if (elemento) elemento.textContent = ultima;
    }

    pintarCartera();
});
