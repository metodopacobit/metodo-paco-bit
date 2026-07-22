// ==========================
// nere.js v1.3
// Método Nere
// Precios compartidos con precios.js
// ==========================

const NERE_STORAGE_KEY = "metodoNereV1";
const METAS_NERE = [1000, 5000, 10000, 25000, 50000, 100000, 250000];

let metodoNere = {
    configuracion: {
        fechaNacimiento: "2016-05-06",
        edadObjetivo: 25,
        aportacionMensual: 100,
        rentabilidadEsperada: 7
    },
    activos: [],
    ultimaActualizacion: "--"
};

let indiceActivoNereEditar = -1;
let actualizandoNere = false;

function numeroNere(valor, defecto = 0) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : defecto;
}

function fechaLocalNere(valor) {
    if (valor instanceof Date) {
        return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
    }

    const partes = String(valor || "").split("-").map(Number);

    if (partes.length !== 3 || !partes.every(Number.isFinite)) {
        return new Date(2016, 4, 6);
    }

    return new Date(partes[0], partes[1] - 1, partes[2]);
}

function hoyNere() {
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

function sumarAnosNere(fecha, anos) {
    const resultado = new Date(
        fecha.getFullYear() + anos,
        fecha.getMonth(),
        fecha.getDate()
    );

    if (resultado.getMonth() !== fecha.getMonth()) {
        resultado.setDate(0);
    }

    return resultado;
}

function formatearFechaNere(fecha) {
    return fecha.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function edadExactaNere(fechaNacimiento, referencia = hoyNere()) {
    let anos = referencia.getFullYear() - fechaNacimiento.getFullYear();
    const aniversario = sumarAnosNere(fechaNacimiento, anos);

    if (aniversario > referencia) anos -= 1;

    return Math.max(0, anos);
}

function diferenciaExactaNere(desde, hasta) {
    const inicio = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
    const fin = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());

    if (fin <= inicio) {
        return { anos: 0, meses: 0, dias: 0 };
    }

    let anos = fin.getFullYear() - inicio.getFullYear();
    let cursor = new Date(inicio);
    cursor.setFullYear(cursor.getFullYear() + anos);

    if (cursor > fin) {
        anos -= 1;
        cursor = new Date(inicio);
        cursor.setFullYear(cursor.getFullYear() + anos);
    }

    let meses = 0;

    while (meses < 11) {
        const siguiente = new Date(cursor);
        siguiente.setMonth(siguiente.getMonth() + 1);

        if (siguiente > fin) break;

        cursor = siguiente;
        meses += 1;
    }

    const dias = Math.max(
        0,
        Math.round((fin.getTime() - cursor.getTime()) / 86400000)
    );

    return { anos, meses, dias };
}

function mesesCompletosHastaNere(fechaObjetivo) {
    const hoy = hoyNere();

    if (fechaObjetivo <= hoy) return 0;

    let meses =
        (fechaObjetivo.getFullYear() - hoy.getFullYear()) * 12 +
        (fechaObjetivo.getMonth() - hoy.getMonth());

    if (fechaObjetivo.getDate() < hoy.getDate()) meses -= 1;

    return Math.max(0, meses);
}

function siguienteCumpleanosNere(fechaNacimiento) {
    const hoy = hoyNere();
    let cumple = new Date(
        hoy.getFullYear(),
        fechaNacimiento.getMonth(),
        fechaNacimiento.getDate()
    );

    if (cumple < hoy) {
        cumple = new Date(
            hoy.getFullYear() + 1,
            fechaNacimiento.getMonth(),
            fechaNacimiento.getDate()
        );
    }

    return cumple;
}

function palabraNere(cantidad, singular, plural) {
    return cantidad === 1 ? singular : plural;
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
        moneda: "EUR",
        monedaNativa: String(activo.monedaNativa || activo.moneda || "EUR").toUpperCase(),
        precioNativo: numeroNere(activo.precioNativo),
        fxEur: numeroNere(activo.fxEur, 1),
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

            if (!metodoNere.configuracion.fechaNacimiento) {
                metodoNere.configuracion.fechaNacimiento = "2016-05-06";
            }

            delete metodoNere.configuracion.edadActual;

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
    const nacimiento = fechaLocalNere(config.fechaNacimiento);
    const fechaObjetivo = sumarAnosNere(nacimiento, edad);
    const meses = mesesCompletosHastaNere(fechaObjetivo);
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

    const nacimiento = fechaLocalNere(config.fechaNacimiento);
    const edadActual = edadExactaNere(nacimiento);

    escribirNere(
        "nereEdadActual",
        `${edadActual} ${palabraNere(edadActual, "año", "años")}`
    );

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
}

function pintarContadoresNere() {
    const config = metodoNere.configuracion;
    const nacimiento = fechaLocalNere(config.fechaNacimiento);
    const hoy = hoyNere();

    const proximoCumple = siguienteCumpleanosNere(nacimiento);
    const mayoria = sumarAnosNere(nacimiento, 18);
    const objetivo = sumarAnosNere(nacimiento, config.edadObjetivo);

    const faltaCumple = diferenciaExactaNere(hoy, proximoCumple);
    const faltaMayoria = diferenciaExactaNere(hoy, mayoria);
    const faltaObjetivo = diferenciaExactaNere(hoy, objetivo);

    escribirNere("nereFechaNacimientoTexto", formatearFechaNere(nacimiento));

    escribirNere("nereProximoCumpleFecha", formatearFechaNere(proximoCumple));
    escribirNere("nereCumpleMeses", faltaCumple.meses);
    escribirNere("nereCumpleDias", faltaCumple.dias);
    escribirNere("nereCumpleMesesLabel", palabraNere(faltaCumple.meses, "mes", "meses"));
    escribirNere("nereCumpleDiasLabel", palabraNere(faltaCumple.dias, "día", "días"));

    escribirNere("nereMayoriaFecha", formatearFechaNere(mayoria));
    escribirNere("nereMayoriaAnos", faltaMayoria.anos);
    escribirNere("nereMayoriaMeses", faltaMayoria.meses);
    escribirNere("nereMayoriaDias", faltaMayoria.dias);
    escribirNere("nereMayoriaAnosLabel", palabraNere(faltaMayoria.anos, "año", "años"));
    escribirNere("nereMayoriaMesesLabel", palabraNere(faltaMayoria.meses, "mes", "meses"));
    escribirNere("nereMayoriaDiasLabel", palabraNere(faltaMayoria.dias, "día", "días"));

    escribirNere(
        "nereObjetivoFecha",
        `${formatearFechaNere(objetivo)} (${config.edadObjetivo} años)`
    );
    escribirNere("nereObjetivoAnos", faltaObjetivo.anos);
    escribirNere("nereObjetivoMeses", faltaObjetivo.meses);
    escribirNere("nereObjetivoDias", faltaObjetivo.dias);
    escribirNere("nereObjetivoAnosLabel", palabraNere(faltaObjetivo.anos, "año", "años"));
    escribirNere("nereObjetivoMesesLabel", palabraNere(faltaObjetivo.meses, "mes", "meses"));
    escribirNere("nereObjetivoDiasLabel", palabraNere(faltaObjetivo.dias, "día", "días"));
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
    pintarContadoresNere();
    pintarProyeccionesNere();
}

function abrirAjustesNere() {
    const config = metodoNere.configuracion;

    document.getElementById("nereFechaNacimientoInput").value =
        config.fechaNacimiento || "2016-05-06";
    document.getElementById("nereEdadObjetivoInput").value = config.edadObjetivo;
    document.getElementById("nereAportacionInput").value = config.aportacionMensual;
    document.getElementById("nereRentabilidadEsperadaInput").value =
        config.rentabilidadEsperada;

    document.getElementById("modalAjustesNere")?.classList.remove("oculto");
}

function cerrarAjustesNere() {
    document.getElementById("modalAjustesNere")?.classList.add("oculto");
}

function guardarAjustesNere() {
    const fechaNacimiento =
        document.getElementById("nereFechaNacimientoInput").value;
    const edadObjetivo =
        numeroNere(document.getElementById("nereEdadObjetivoInput").value);
    const aportacionMensual =
        numeroNere(document.getElementById("nereAportacionInput").value);
    const rentabilidadEsperada =
        numeroNere(document.getElementById("nereRentabilidadEsperadaInput").value);

    const nacimiento = fechaLocalNere(fechaNacimiento);
    const edadActual = edadExactaNere(nacimiento);

    if (!fechaNacimiento) {
        alert("Introduce la fecha de nacimiento.");
        return;
    }

    if (nacimiento > hoyNere()) {
        alert("La fecha de nacimiento no puede ser futura.");
        return;
    }

    if (edadObjetivo <= edadActual) {
        alert("La edad objetivo debe ser superior a la edad actual.");
        return;
    }

    metodoNere.configuracion = {
        fechaNacimiento,
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
    const nombre =
        document.getElementById("nereNombreActivoInput").value.trim();
    const ticker =
        document.getElementById("nereTickerActivoInput").value.trim().toUpperCase();
    const exchange =
        document.getElementById("nereExchangeActivoInput").value.trim().toUpperCase();
    const precioCompra =
        numeroNere(document.getElementById("nerePrecioCompraInput").value);
    const cantidad =
        numeroNere(document.getElementById("nereCantidadInput").value);
    const pesoObjetivo =
        numeroNere(document.getElementById("nerePesoObjetivoInput").value);

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
    ) {
        return;
    }

    if (!confirm(`¿Eliminar ${metodoNere.activos[indiceActivoNereEditar].nombre}?`)) {
        return;
    }

    metodoNere.activos.splice(indiceActivoNereEditar, 1);

    guardarMetodoNere();
    cerrarEditorActivoNere();
    pintarMetodoNere();
}


// =====================================================
// PRECIOS COMPARTIDOS CON precios.js
// =====================================================

async function actualizarPrecioActivoNere(activo) {
    if (typeof obtenerCotizacionActivo !== "function") {
        throw new Error("precios.js no está disponible.");
    }

    if (typeof obtenerCambioAEur !== "function") {
        throw new Error("No está disponible la conversión a EUR.");
    }

    const cotizacion = await obtenerCotizacionActivo(activo);
    const fxEur = await obtenerCambioAEur(cotizacion.moneda);

    activo.precioNativo = numeroNere(cotizacion.precio);
    activo.monedaNativa = String(cotizacion.moneda || "EUR").toUpperCase();
    activo.fxEur = numeroNere(fxEur, 1);

    activo.precioActual = activo.precioNativo * activo.fxEur;
    activo.max52 = numeroNere(cotizacion.max52) * activo.fxEur;
    activo.variacion = numeroNere(cotizacion.variacion);
    activo.moneda = "EUR";
    activo.error = "";
    activo.ultimaRevision = new Date().toLocaleString("es-ES");

    recalcularActivoNere(activo);
}

async function actualizarMetodoNere() {
    if (actualizandoNere) return;

    const boton = document.getElementById("botonActualizarNere");

    if (metodoNere.activos.length === 0) {
        pintarMetodoNere();
        return;
    }

    actualizandoNere = true;

    if (boton) {
        boton.disabled = true;
        boton.textContent = "⏳ Actualizando...";
    }

    try {
        for (let indice = 0; indice < metodoNere.activos.length; indice += 1) {
            const activo = metodoNere.activos[indice];

            try {
                await actualizarPrecioActivoNere(activo);
            } catch (error) {
                console.error("Método Nere:", activo.ticker, error);
                activo.error = `❌ ${activo.ticker}: ${error.message || "Precio no disponible"}`;
            }

            recalcularNere();
            pintarMetodoNere();

            if (boton) {
                boton.textContent =
                    `⏳ Actualizando ${indice + 1}/${metodoNere.activos.length}`;
            }
        }

        metodoNere.ultimaActualizacion =
            new Date().toLocaleString("es-ES");

        guardarMetodoNere();
        pintarMetodoNere();

    } finally {
        actualizandoNere = false;

        if (boton) {
            boton.disabled = false;
            boton.textContent = "🔄 Actualizar ETF";
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    cargarMetodoNere();
    pintarMetodoNere();
});
