// ==========================
// nere.js v1.0
// Método Nere
// ==========================

const NERE_STORAGE_KEY = "metodoNereV1";
const NERE_WORKER_URL = "https://late-lab-2625.rjaresarias.workers.dev";

const METAS_NERE = [1000, 5000, 10000, 25000, 50000, 100000, 250000];

let metodoNere = {
    configuracion: {
        edadActual: 10,
        edadObjetivo: 25,
        aportacionMensual: 100,
        rentabilidadEsperada: 7
    },
    activos: [],
    ultimaActualizacion: "--"
};

let indiceActivoNereEditar = -1;

function numeroNere(valor, defecto = 0) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : defecto;
}

function euroNere(valor) {
    return numeroNere(valor).toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " €";
}

function porcentajeNere(valor) {
    return numeroNere(valor).toFixed(2) + " %";
}

function escribirNere(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor;
}

function escaparNere(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizarActivoNere(activo = {}) {
    return {
        nombre: String(activo.nombre || activo.ticker || "ETF").trim(),
        ticker: String(activo.ticker || "").trim().toUpperCase(),
        exchange: String(activo.exchange || "").trim().toUpperCase(),
        precioCompra: numeroNere(activo.precioCompra),
        cantidad: numeroNere(activo.cantidad),
        pesoObjetivo: numeroNere(activo.pesoObjetivo),
        precioActual: numeroNere(activo.precioActual),
        variacion: numeroNere(activo.variacion),
        max52: numeroNere(activo.max52),
        moneda: String(activo.moneda || "EUR").toUpperCase(),
        error: activo.error || "",
        ultimaRevision: activo.ultimaRevision || "--"
    };
}

function cargarMetodoNere() {
    try {
        const guardado = JSON.parse(localStorage.getItem(NERE_STORAGE_KEY));

        if (guardado && typeof guardado === "object") {
            metodoNere.configuracion = {
                ...metodoNere.configuracion,
                ...(guardado.configuracion || {})
            };

            metodoNere.activos = Array.isArray(guardado.activos)
                ? guardado.activos.map(normalizarActivoNere)
                : [];

            metodoNere.ultimaActualizacion =
                guardado.ultimaActualizacion || "--";
        }
    } catch (error) {
        console.warn("No se pudo cargar Método Nere:", error);
    }
}

function guardarMetodoNere() {
    localStorage.setItem(NERE_STORAGE_KEY, JSON.stringify(metodoNere));
}

function recalcularActivoNere(activo) {
    activo.invertido = activo.precioCompra * activo.cantidad;
    activo.valorActual = activo.precioActual * activo.cantidad;
    activo.ganancia = activo.valorActual - activo.invertido;
    activo.rentabilidad = activo.invertido > 0
        ? (activo.ganancia / activo.invertido) * 100
        : 0;

    activo.caidaMaximo = activo.max52 > 0
        ? ((activo.precioActual - activo.max52) / activo.max52) * 100
        : 0;
}

function recalcularNere() {
    metodoNere.activos.forEach(recalcularActivoNere);

    const valorTotal = metodoNere.activos.reduce(
        (total, activo) => total + activo.valorActual,
        0
    );

    metodoNere.activos.forEach(function(activo) {
        activo.pesoActual = valorTotal > 0
            ? (activo.valorActual / valorTotal) * 100
            : 0;

        activo.desviacion = activo.pesoActual - activo.pesoObjetivo;

        if (activo.desviacion <= -5) activo.estado = "🟢 Aportar más";
        else if (activo.desviacion >= 5) activo.estado = "🟠 Pausar aportación";
        else activo.estado = "🟡 En objetivo";
    });
}

function obtenerTotalesNere() {
    const invertido = metodoNere.activos.reduce(
        (total, activo) => total + activo.invertido,
        0
    );

    const valor = metodoNere.activos.reduce(
        (total, activo) => total + activo.valorActual,
        0
    );

    const ganancia = valor - invertido;
    const rentabilidad = invertido > 0
        ? (ganancia / invertido) * 100
        : 0;

    return { invertido, valor, ganancia, rentabilidad };
}

function calcularCapitalFuturo(capitalInicial, mensual, rentabilidadAnual, meses) {
    const tasaMensual = rentabilidadAnual / 100 / 12;

    if (meses <= 0) return capitalInicial;

    if (tasaMensual === 0) {
        return capitalInicial + mensual * meses;
    }

    return (
        capitalInicial * Math.pow(1 + tasaMensual, meses) +
        mensual * ((Math.pow(1 + tasaMensual, meses) - 1) / tasaMensual)
    );
}

function proyeccionAEdad(edad) {
    const config = metodoNere.configuracion;
    const meses = Math.max(0, (edad - config.edadActual) * 12);
    const total = obtenerTotalesNere();

    return calcularCapitalFuturo(
        total.valor,
        config.aportacionMensual,
        config.rentabilidadEsperada,
        meses
    );
}

function calcularPlanAportacionNere() {
    const mensual = metodoNere.configuracion.aportacionMensual;
    const activos = metodoNere.activos;

    if (activos.length === 0 || mensual <= 0) return [];

    const totalObjetivo = activos.reduce(
        (total, activo) => total + Math.max(0, activo.pesoObjetivo),
        0
    );

    if (totalObjetivo <= 0) {
        const reparto = mensual / activos.length;
        return activos.map(activo => ({
            nombre: activo.nombre,
            importe: reparto,
            motivo: "Reparto igual por no existir pesos objetivo."
        }));
    }

    const necesidades = activos.map(function(activo) {
        const objetivoNormalizado = activo.pesoObjetivo / totalObjetivo * 100;
        const deficit = Math.max(0, objetivoNormalizado - activo.pesoActual);

        return {
            activo,
            objetivoNormalizado,
            deficit
        };
    });

    const deficitTotal = necesidades.reduce(
        (total, item) => total + item.deficit,
        0
    );

    if (deficitTotal <= 0.001) {
        return necesidades.map(item => ({
            nombre: item.activo.nombre,
            importe: mensual * (item.objetivoNormalizado / 100),
            motivo: "Reparto según el peso objetivo."
        }));
    }

    return necesidades.map(item => ({
        nombre: item.activo.nombre,
        importe: mensual * (item.deficit / deficitTotal),
        motivo: item.deficit > 0
            ? `Está ${item.deficit.toFixed(1)} puntos por debajo de su objetivo.`
            : "No necesita aportación este mes."
    }));
}

function filaNere(etiqueta, valor) {
    return `
        <div class="nereRow">
            <span class="nereLabel">${etiqueta}</span>
            <strong>${valor}</strong>
        </div>
    `;
}

function tarjetaActivoNere(activo, indice) {
    return `
        <section class="nere-activo">

            <div class="nere-activo-cabecera">
                <div>
                    <h2>🌍 ${escaparNere(activo.nombre)}</h2>
                    <p>${escaparNere(activo.ticker)}${activo.exchange ? " · " + escaparNere(activo.exchange) : ""}</p>
                </div>

                <span class="nere-peso-badge">
                    ${porcentajeNere(activo.pesoActual)} / objetivo ${porcentajeNere(activo.pesoObjetivo)}
                </span>
            </div>

            <div class="nereDashboard">

                <div class="nereCard">
                    <h3>📊 Mercado</h3>
                    ${filaNere("💶 Precio actual", activo.precioActual > 0 ? euroNere(activo.precioActual) : "--")}
                    ${filaNere("📈 Cambio diario", porcentajeNere(activo.variacion))}
                    ${filaNere("🏆 Máximo 52 semanas", activo.max52 > 0 ? euroNere(activo.max52) : "--")}
                    ${filaNere("📉 Caída desde máximo", porcentajeNere(activo.caidaMaximo))}
                    ${filaNere("🎯 Peso objetivo", porcentajeNere(activo.pesoObjetivo))}
                    ${filaNere("📌 Estado", escaparNere(activo.estado || "--"))}
                </div>

                <div class="nereCard">
                    <h3>💼 Posición</h3>
                    ${filaNere("💰 Precio medio", euroNere(activo.precioCompra))}
                    ${filaNere("🔢 Participaciones", numeroNere(activo.cantidad).toLocaleString("es-ES", {maximumFractionDigits: 6}))}
                    ${filaNere("💵 Invertido", euroNere(activo.invertido))}
                    ${filaNere("💎 Valor actual", euroNere(activo.valorActual))}
                    ${filaNere("📊 Ganancia / Pérdida", euroNere(activo.ganancia))}
                    ${filaNere("📈 Rentabilidad", porcentajeNere(activo.rentabilidad))}
                    ${filaNere("⚖️ Peso actual", porcentajeNere(activo.pesoActual))}
                </div>

            </div>

            <button class="nere-editar" onclick="abrirEditorActivoNere(${indice})">✏️ Editar ETF</button>
            <p class="nere-error">${escaparNere(activo.error || "")}</p>

        </section>
    `;
}

function pintarResumenNere() {
    const config = metodoNere.configuracion;
    const total = obtenerTotalesNere();

    escribirNere("nereEdadActual", `${config.edadActual} años`);
    escribirNere("nereCapital", euroNere(total.invertido));
    escribirNere("nereValor", euroNere(total.valor));
    escribirNere("nereGanancia", euroNere(total.ganancia));
    escribirNere("nereRentabilidad", porcentajeNere(total.rentabilidad));
    escribirNere("nereMensual", euroNere(config.aportacionMensual));
    escribirNere("nereUltimaActualizacion", metodoNere.ultimaActualizacion);
}

function pintarPlanNere() {
    const contenedor = document.getElementById("nerePlanAportacion");
    if (!contenedor) return;

    const plan = calcularPlanAportacionNere();

    if (plan.length === 0) {
        contenedor.innerHTML =
            '<div class="nere-plan-fila"><div>Añade ETF y configura una aportación mensual.</div><strong>--</strong></div>';
        return;
    }

    contenedor.innerHTML = plan.map(item => `
        <div class="nere-plan-fila">
            <div>
                <strong>${escaparNere(item.nombre)}</strong>
                <small>${escaparNere(item.motivo)}</small>
            </div>
            <strong>${euroNere(item.importe)}</strong>
        </div>
    `).join("");
}

function pintarMetasNere() {
    const contenedor = document.getElementById("nereMetasLista");
    if (!contenedor) return;

    const valor = obtenerTotalesNere().valor;

    contenedor.innerHTML = METAS_NERE.map(meta => {
        const progreso = Math.min(100, meta > 0 ? valor / meta * 100 : 0);

        return `
            <div class="nere-meta">
                <div class="nere-meta-cabecera">
                    <strong>${euroNere(meta)}</strong>
                    <span>${progreso.toFixed(1)} %</span>
                </div>
                <div class="nere-barra">
                    <span style="width:${progreso}%"></span>
                </div>
            </div>
        `;
    }).join("");
}

function pintarProyeccionesNere() {
    const config = metodoNere.configuracion;

    escribirNere("nereProyeccion18", euroNere(proyeccionAEdad(18)));
    escribirNere("nereProyeccion25", euroNere(proyeccionAEdad(25)));
    escribirNere("nereProyeccion30", euroNere(proyeccionAEdad(30)));
    escribirNere(
        "nereProyeccionObjetivo",
        `${euroNere(proyeccionAEdad(config.edadObjetivo))} a los ${config.edadObjetivo}`
    );

    dibujarGraficoNere();
}

function dibujarGraficoNere() {
    const canvas = document.getElementById("nereGrafico");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const config = metodoNere.configuracion;
    const inicio = config.edadActual;
    const fin = Math.max(inicio + 1, config.edadObjetivo);
    const edades = [];

    for (let edad = inicio; edad <= fin; edad += 1) {
        edades.push({
            edad,
            valor: proyeccionAEdad(edad)
        });
    }

    const maximo = Math.max(1, ...edades.map(item => item.valor));
    const ancho = canvas.width;
    const alto = canvas.height;
    const margen = 55;

    ctx.clearRect(0, 0, ancho, alto);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, ancho, alto);

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "22px Arial";

    for (let i = 0; i <= 4; i += 1) {
        const y = margen + ((alto - margen * 2) / 4) * i;
        const valor = maximo * (1 - i / 4);

        ctx.beginPath();
        ctx.moveTo(margen, y);
        ctx.lineTo(ancho - margen, y);
        ctx.stroke();

        ctx.fillText(
            Math.round(valor).toLocaleString("es-ES") + " €",
            5,
            y + 7
        );
    }

    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 5;
    ctx.beginPath();

    edades.forEach(function(item, indice) {
        const x = margen + (
            indice / Math.max(1, edades.length - 1)
        ) * (ancho - margen * 2);

        const y = alto - margen - (
            item.valor / maximo
        ) * (alto - margen * 2);

        if (indice === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "20px Arial";
    ctx.fillText(`${inicio} años`, margen, alto - 15);
    ctx.fillText(`${fin} años`, ancho - margen - 75, alto - 15);
}

function pintarMetodoNere() {
    recalcularNere();

    const lista = document.getElementById("nereListaActivos");
    const vacia = document.getElementById("nereCarteraVacia");

    if (lista) {
        lista.innerHTML = metodoNere.activos.map(tarjetaActivoNere).join("");
    }

    if (vacia) {
        vacia.classList.toggle("oculto", metodoNere.activos.length > 0);
    }

    pintarResumenNere();
    pintarPlanNere();
    pintarMetasNere();
    pintarProyeccionesNere();
}

function abrirAjustesNere() {
    const config = metodoNere.configuracion;

    document.getElementById("nereEdadInput").value = config.edadActual;
    document.getElementById("nereEdadObjetivoInput").value = config.edadObjetivo;
    document.getElementById("nereAportacionInput").value = config.aportacionMensual;
    document.getElementById("nereRentabilidadEsperadaInput").value = config.rentabilidadEsperada;

    document.getElementById("modalAjustesNere")?.classList.remove("oculto");
}

function cerrarAjustesNere() {
    document.getElementById("modalAjustesNere")?.classList.add("oculto");
}

function guardarAjustesNere() {
    const edadActual = numeroNere(document.getElementById("nereEdadInput").value);
    const edadObjetivo = numeroNere(document.getElementById("nereEdadObjetivoInput").value);
    const aportacionMensual = numeroNere(document.getElementById("nereAportacionInput").value);
    const rentabilidadEsperada = numeroNere(document.getElementById("nereRentabilidadEsperadaInput").value);

    if (edadObjetivo <= edadActual) {
        alert("La edad objetivo debe ser superior a la edad actual.");
        return;
    }

    metodoNere.configuracion = {
        edadActual,
        edadObjetivo,
        aportacionMensual,
        rentabilidadEsperada
    };

    guardarMetodoNere();
    cerrarAjustesNere();
    pintarMetodoNere();
}

function abrirEditorActivoNere(indice = -1) {
    indiceActivoNereEditar = Number.isInteger(indice) ? indice : -1;
    const activo = indiceActivoNereEditar >= 0
        ? metodoNere.activos[indiceActivoNereEditar]
        : null;

    escribirNere(
        "tituloModalActivoNere",
        activo ? `✏️ Editar ${activo.nombre}` : "➕ Añadir ETF"
    );

    document.getElementById("nereNombreActivoInput").value = activo?.nombre || "";
    document.getElementById("nereTickerActivoInput").value = activo?.ticker || "";
    document.getElementById("nereExchangeActivoInput").value = activo?.exchange || "";
    document.getElementById("nerePrecioCompraInput").value = activo?.precioCompra || "";
    document.getElementById("nereCantidadInput").value = activo?.cantidad || "";
    document.getElementById("nerePesoObjetivoInput").value = activo?.pesoObjetivo || "";

    document.getElementById("botonEliminarNere")
        ?.classList.toggle("oculto", !activo);

    document.getElementById("modalActivoNere")?.classList.remove("oculto");
}

function cerrarEditorActivoNere() {
    indiceActivoNereEditar = -1;
    document.getElementById("modalActivoNere")?.classList.add("oculto");
}

function guardarActivoNere() {
    const nombre = document.getElementById("nereNombreActivoInput").value.trim();
    const ticker = document.getElementById("nereTickerActivoInput").value.trim().toUpperCase();
    const exchange = document.getElementById("nereExchangeActivoInput").value.trim().toUpperCase();
    const precioCompra = numeroNere(document.getElementById("nerePrecioCompraInput").value);
    const cantidad = numeroNere(document.getElementById("nereCantidadInput").value);
    const pesoObjetivo = numeroNere(document.getElementById("nerePesoObjetivoInput").value);

    if (!nombre || !ticker || !(precioCompra > 0) || !(cantidad > 0)) {
        alert("Completa nombre, ticker, precio medio y participaciones.");
        return;
    }

    const nuevo = normalizarActivoNere({
        ...(indiceActivoNereEditar >= 0
            ? metodoNere.activos[indiceActivoNereEditar]
            : {}),
        nombre,
        ticker,
        exchange,
        precioCompra,
        cantidad,
        pesoObjetivo
    });

    if (indiceActivoNereEditar >= 0) {
        metodoNere.activos[indiceActivoNereEditar] = nuevo;
    } else {
        metodoNere.activos.push(nuevo);
    }

    guardarMetodoNere();
    cerrarEditorActivoNere();
    pintarMetodoNere();
}

function eliminarActivoNereDesdeModal() {
    if (
        indiceActivoNereEditar < 0 ||
        !metodoNere.activos[indiceActivoNereEditar]
    ) return;

    if (!confirm(`¿Eliminar ${metodoNere.activos[indiceActivoNereEditar].nombre}?`)) {
        return;
    }

    metodoNere.activos.splice(indiceActivoNereEditar, 1);
    guardarMetodoNere();
    cerrarEditorActivoNere();
    pintarMetodoNere();
}

async function obtenerPrecioNere(activo) {
    const url = new URL(NERE_WORKER_URL);

    url.searchParams.set("ticker", activo.ticker);
    url.searchParams.set("exchange", activo.exchange);

    const respuesta = await fetch(url.toString(), { cache: "no-store" });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos?.error || `HTTP ${respuesta.status}`);
    }

    const precio = numeroNere(datos?.price ?? datos?.precio);
    const variacionBruta = numeroNere(
        datos?.percent_change ?? datos?.cambio_porcentual
    );

    if (!(precio > 0)) {
        throw new Error("La fuente no devolvió un precio válido.");
    }

    return {
        precio,
        variacion: Math.abs(variacionBruta) > 15 ? 0 : variacionBruta,
        max52: numeroNere(datos?.high52 ?? datos?.maximo52),
        moneda: String(datos?.currency ?? datos?.moneda ?? "EUR").toUpperCase()
    };
}

async function actualizarMetodoNere() {
    const boton = document.getElementById("botonActualizarNere");

    if (metodoNere.activos.length === 0) {
        pintarMetodoNere();
        return;
    }

    if (boton) {
        boton.disabled = true;
        boton.textContent = "⏳ Actualizando...";
    }

    for (let indice = 0; indice < metodoNere.activos.length; indice += 1) {
        const activo = metodoNere.activos[indice];

        try {
            const cotizacion = await obtenerPrecioNere(activo);

            activo.precioActual = cotizacion.precio;
            activo.variacion = cotizacion.variacion;
            activo.max52 = cotizacion.max52;
            activo.moneda = cotizacion.moneda;
            activo.error = "";
            activo.ultimaRevision = new Date().toLocaleString("es-ES");
        } catch (error) {
            activo.error = `❌ ${activo.ticker}: ${error.message}`;
        }

        pintarMetodoNere();

        if (boton) {
            boton.textContent =
                `⏳ Actualizando ${indice + 1}/${metodoNere.activos.length}`;
        }
    }

    metodoNere.ultimaActualizacion = new Date().toLocaleString("es-ES");
    guardarMetodoNere();
    pintarMetodoNere();

    if (boton) {
        boton.disabled = false;
        boton.textContent = "🔄 Actualizar ETF";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    cargarMetodoNere();
    pintarMetodoNere();
});
