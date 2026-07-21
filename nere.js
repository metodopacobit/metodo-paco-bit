// ==========================
// nere.js v1.4
// Método Nere
// ==========================

const NERE_STORAGE_KEY = "metodoNereV1";
const NERE_WORKER_URL = "https://late-lab-2625.rjaresarias.workers.dev";

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
    const resultado = new Date(fecha.getFullYear() + anos, fecha.getMonth(), fecha.getDate());

    // Ajuste para nacimientos el 29 de febrero.
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
    let meses = fin.getMonth() - inicio.getMonth();
    let dias = fin.getDate() - inicio.getDate();

    if (dias < 0) {
        meses -= 1;
        const ultimoDiaMesAnterior = new Date(
            fin.getFullYear(),
            fin.getMonth(),
            0
        ).getDate();
        dias += ultimoDiaMesAnterior;
    }

    if (meses < 0) {
        anos -= 1;
        meses += 12;
    }

    return {
        anos: Math.max(0, anos),
        meses: Math.max(0, meses),
        dias: Math.max(0, dias)
    };
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
    const config = metodoNere.configuracion || {};
    const nacimiento = fechaLocalNere(config.fechaNacimiento || "2016-05-06");
    const hoy = hoyNere();

    const proximoCumple = siguienteCumpleanosNere(nacimiento);
    const mayoria = sumarAnosNere(nacimiento, 18);
    const objetivo = sumarAnosNere(nacimiento, 25);

    const faltaCumple = diferenciaExactaNere(hoy, proximoCumple);
    const faltaMayoria = diferenciaExactaNere(hoy, mayoria);
    const faltaObjetivo = diferenciaExactaNere(hoy, objetivo);

    escribirNere("nereFechaNacimientoTexto", formatearFechaNere(nacimiento));

    escribirNere("nereProximoCumpleFecha", `· ${formatearFechaNere(proximoCumple)}`);
    escribirNere("nereCumpleMeses", faltaCumple.meses);
    escribirNere("nereCumpleDias", faltaCumple.dias);
    escribirNere("nereCumpleMesesLabel", palabraNere(faltaCumple.meses, "mes", "meses"));
    escribirNere("nereCumpleDiasLabel", palabraNere(faltaCumple.dias, "día", "días"));

    escribirNere("nereMayoriaFecha", `· ${formatearFechaNere(mayoria)}`);
    escribirNere("nereMayoriaAnos", faltaMayoria.anos);
    escribirNere("nereMayoriaMeses", faltaMayoria.meses);
    escribirNere("nereMayoriaDias", faltaMayoria.dias);
    escribirNere("nereMayoriaAnosLabel", palabraNere(faltaMayoria.anos, "año", "años"));
    escribirNere("nereMayoriaMesesLabel", palabraNere(faltaMayoria.meses, "mes", "meses"));
    escribirNere("nereMayoriaDiasLabel", palabraNere(faltaMayoria.dias, "día", "días"));

    escribirNere("nereObjetivoFecha", `· ${formatearFechaNere(objetivo)}`);
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
    document.getElementById("nereRentabilidadEsperadaInput").value = config.rentabilidadEsperada;

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


document.addEventListener("DOMContentLoaded", () => {
    pintarContadoresNere();
    setInterval(pintarContadoresNere, 60 * 60 * 1000);
});


window.abrirAjustesNere = abrirAjustesNere;
window.cerrarAjustesNere = cerrarAjustesNere;
window.guardarAjustesNere = guardarAjustesNere;


// ==========================
// MÉTODO NERE v1.4 · FUNCIONES ESTABLES
// ==========================

function nereGetEstado() {
    if (!window.metodoNere || typeof window.metodoNere !== "object") {
        window.metodoNere = {};
    }
    if (!window.metodoNere.configuracion) {
        window.metodoNere.configuracion = {
            fechaNacimiento: "2016-05-06",
            edadObjetivo: 25,
            aportacionMensual: 100,
            rentabilidadEsperada: 7
        };
    }
    if (!Array.isArray(window.metodoNere.etfs)) {
        window.metodoNere.etfs = [];
    }
    return window.metodoNere;
}

function nereGuardarEstado() {
    localStorage.setItem("metodoNere", JSON.stringify(nereGetEstado()));
}

function nereCargarEstado() {
    try {
        const raw = localStorage.getItem("metodoNere");
        if (!raw) return nereGetEstado();

        const guardado = JSON.parse(raw);
        const estado = nereGetEstado();

        if (guardado && guardado.configuracion) {
            estado.configuracion = {
                ...estado.configuracion,
                ...guardado.configuracion
            };
        }

        if (guardado && Array.isArray(guardado.etfs)) {
            estado.etfs = guardado.etfs;
        }

        return estado;
    } catch (e) {
        console.error("Error al cargar Método Nere", e);
        return nereGetEstado();
    }
}

function abrirAjustesNereV14() {
    const estado = nereCargarEstado();
    const c = estado.configuracion;

    document.getElementById("nereFechaNacimientoInput").value = c.fechaNacimiento || "2016-05-06";
    document.getElementById("nereEdadObjetivoInput").value = c.edadObjetivo ?? 25;
    document.getElementById("nereAportacionInput").value = c.aportacionMensual ?? 100;
    document.getElementById("nereRentabilidadEsperadaInput").value = c.rentabilidadEsperada ?? 7;

    document.getElementById("modalAjustesNere").classList.remove("oculto");
}

function cerrarAjustesNereV14() {
    document.getElementById("modalAjustesNere")?.classList.add("oculto");
}

function guardarAjustesNereV14() {
    const fechaNacimiento = document.getElementById("nereFechaNacimientoInput").value;
    const edadObjetivo = Number(document.getElementById("nereEdadObjetivoInput").value);
    const aportacionMensual = Number(document.getElementById("nereAportacionInput").value);
    const rentabilidadEsperada = Number(document.getElementById("nereRentabilidadEsperadaInput").value);

    if (!fechaNacimiento) {
        alert("Introduce la fecha de nacimiento.");
        return;
    }

    if (!Number.isFinite(edadObjetivo) || edadObjetivo < 18) {
        alert("Introduce una edad objetivo válida.");
        return;
    }

    const estado = nereGetEstado();
    estado.configuracion = {
        fechaNacimiento,
        edadObjetivo,
        aportacionMensual: Number.isFinite(aportacionMensual) ? aportacionMensual : 0,
        rentabilidadEsperada: Number.isFinite(rentabilidadEsperada) ? rentabilidadEsperada : 0
    };

    nereGuardarEstado();
    cerrarAjustesNereV14();

    if (typeof pintarMetodoNere === "function") pintarMetodoNere();
    if (typeof pintarContadoresNere === "function") pintarContadoresNere();
}

function abrirModalEtfNereV14(indice = -1) {
    const estado = nereCargarEstado();
    const etf = indice >= 0 ? estado.etfs[indice] : null;

    document.getElementById("nereEtfIndiceEditar").value = indice;
    document.getElementById("tituloModalEtfNere").textContent = etf ? "✏️ Editar ETF" : "➕ Añadir ETF";
    document.getElementById("nereEtfNombreInput").value = etf?.nombre || "";
    document.getElementById("nereEtfTickerInput").value = etf?.ticker || "";
    document.getElementById("nereEtfPrecioCompraInput").value = etf?.precioCompra ?? "";
    document.getElementById("nereEtfPrecioActualInput").value = etf?.precioActual ?? "";
    document.getElementById("nereEtfCantidadInput").value = etf?.cantidad ?? "";

    document.getElementById("modalEtfNere").classList.remove("oculto");
}

function cerrarModalEtfNereV14() {
    document.getElementById("modalEtfNere")?.classList.add("oculto");
}

function guardarEtfNereV14() {
    const indice = Number(document.getElementById("nereEtfIndiceEditar").value);
    const nombre = document.getElementById("nereEtfNombreInput").value.trim();
    const ticker = document.getElementById("nereEtfTickerInput").value.trim().toUpperCase();
    const precioCompra = Number(document.getElementById("nereEtfPrecioCompraInput").value || 0);
    const precioActual = Number(document.getElementById("nereEtfPrecioActualInput").value || 0);
    const cantidad = Number(document.getElementById("nereEtfCantidadInput").value || 0);

    if (!nombre) {
        alert("Introduce el nombre del ETF.");
        return;
    }
    if (!ticker) {
        alert("Introduce el ticker del ETF.");
        return;
    }

    const estado = nereGetEstado();
    const registro = { nombre, ticker, precioCompra, precioActual, cantidad };

    if (indice >= 0 && estado.etfs[indice]) {
        estado.etfs[indice] = registro;
    } else {
        estado.etfs.push(registro);
    }

    nereGuardarEstado();
    cerrarModalEtfNereV14();
    pintarCarteraNereV14();
}

function eliminarEtfNereV14(indice) {
    const estado = nereGetEstado();
    if (!estado.etfs[indice]) return;
    if (!confirm("¿Eliminar este ETF?")) return;
    estado.etfs.splice(indice, 1);
    nereGuardarEstado();
    pintarCarteraNereV14();
}

function pintarCarteraNereV14() {
    const contenedor = document.getElementById("nereListaEtfs");
    if (!contenedor) return;

    const estado = nereCargarEstado();

    if (!estado.etfs.length) {
        contenedor.innerHTML = '<p class="nere-vacio">No hay ETFs añadidos todavía.</p>';
        return;
    }

    contenedor.innerHTML = estado.etfs.map((etf, i) => {
        const invertido = (Number(etf.precioCompra) || 0) * (Number(etf.cantidad) || 0);
        const valor = (Number(etf.precioActual) || 0) * (Number(etf.cantidad) || 0);
        const beneficio = valor - invertido;
        const rent = invertido > 0 ? (beneficio / invertido) * 100 : 0;

        return `
          <article class="nere-etf-card">
            <div><strong>${etf.nombre}</strong><span>${etf.ticker}</span></div>
            <div><small>Invertido</small><strong>${invertido.toLocaleString("es-ES",{style:"currency",currency:"EUR"})}</strong></div>
            <div><small>Valor actual</small><strong>${valor.toLocaleString("es-ES",{style:"currency",currency:"EUR"})}</strong></div>
            <div><small>Rentabilidad</small><strong>${rent.toFixed(2)}%</strong></div>
            <div class="nere-etf-acciones">
              <button type="button" onclick="abrirModalEtfNere(${i})">Editar</button>
              <button type="button" onclick="eliminarEtfNere(${i})">Eliminar</button>
            </div>
          </article>
        `;
    }).join("");
}

window.abrirAjustesNere = abrirAjustesNereV14;
window.cerrarAjustesNere = cerrarAjustesNereV14;
window.guardarAjustesNere = guardarAjustesNereV14;
window.abrirModalEtfNere = abrirModalEtfNereV14;
window.cerrarModalEtfNere = cerrarModalEtfNereV14;
window.guardarEtfNere = guardarEtfNereV14;
window.eliminarEtfNere = eliminarEtfNereV14;

document.addEventListener("DOMContentLoaded", () => {
    nereCargarEstado();
    pintarCarteraNereV14();
    if (typeof pintarContadoresNere === "function") pintarContadoresNere();
});
