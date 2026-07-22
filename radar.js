// ==========================
// radar.js v1.0
// Radar de Gangas
// Usa la Watchlist como fuente
// ==========================

function limitarRadar(valor, minimo, maximo) {
    return Math.min(
        maximo,
        Math.max(minimo, valor)
    );
}

function numeroRadar(valor, defecto = 0) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : defecto;
}

function escaparRadar(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function caidaDesdeMaximoRadar(activo) {
    const precio = numeroRadar(activo.precio);
    const max52 = numeroRadar(activo.max52);

    if (!(precio > 0) || !(max52 > 0)) {
        return 0;
    }

    return ((precio - max52) / max52) * 100;
}

/*
 * Puntuación técnica simple, 0-100.
 *
 * Premia:
 * - estar alejado del máximo de 52 semanas;
 * - una caída diaria moderada.
 *
 * Penaliza:
 * - subidas diarias fuertes.
 *
 * No mide calidad fundamental ni valor intrínseco.
 */
function calcularPuntuacionRadar(activo) {
    const precio = numeroRadar(activo.precio);
    const max52 = numeroRadar(activo.max52);
    const variacion = numeroRadar(activo.variacion);

    if (!(precio > 0)) {
        return 0;
    }

    let puntuacion = 45;

    if (max52 > 0) {
        const descuento =
            limitarRadar(
                ((max52 - precio) / max52) * 100,
                0,
                60
            );

        puntuacion += descuento * 0.75;
    }

    if (variacion < 0) {
        puntuacion +=
            limitarRadar(
                Math.abs(variacion) * 2,
                0,
                15
            );
    } else if (variacion > 0) {
        puntuacion -=
            limitarRadar(
                variacion * 1.5,
                0,
                12
            );
    }

    return Math.round(
        limitarRadar(
            puntuacion,
            0,
            100
        )
    );
}

function estadoRadar(puntuacion) {
    if (puntuacion >= 75) {
        return {
            etiqueta: "🟢 Oportunidad",
            clase: "radar-oportunidad"
        };
    }

    if (puntuacion >= 60) {
        return {
            etiqueta: "🟡 Vigilar",
            clase: "radar-vigilar"
        };
    }

    return {
        etiqueta: "🟠 Esperar",
        clase: "radar-esperar"
    };
}

function formatoPrecioRadar(valor, moneda) {
    const numero = Number(valor);

    if (!Number.isFinite(numero) || !(numero > 0)) {
        return "--";
    }

    return numero.toLocaleString(
        "es-ES",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + (moneda ? ` ${moneda}` : "");
}

function formatoPorcentajeRadar(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "--";
    }

    return `${numero >= 0 ? "+" : ""}${numero.toFixed(2)} %`;
}

function obtenerResultadosRadar() {
    if (
        typeof watchlist === "undefined" ||
        !Array.isArray(watchlist)
    ) {
        return [];
    }

    return watchlist
        .map(function(activo) {
            const puntuacion =
                calcularPuntuacionRadar(activo);

            return {
                ...activo,
                puntuacion,
                caidaMaximo:
                    caidaDesdeMaximoRadar(activo),
                estadoRadar:
                    estadoRadar(puntuacion)
            };
        })
        .sort(function(a, b) {
            return b.puntuacion - a.puntuacion;
        });
}

function tarjetaRadar(activo, posicion) {
    return `
        <article class="radar-card ${activo.estadoRadar.clase}">

            <div class="radar-cabecera">
                <div>
                    <span class="radar-posicion">#${posicion}</span>
                    <h3>${escaparRadar(activo.nombre)}</h3>
                    <p>
                        ${escaparRadar(activo.ticker)}
                        ${activo.exchange ? " · " + escaparRadar(activo.exchange) : ""}
                    </p>
                </div>

                <div class="radar-score">
                    <strong>${activo.puntuacion}</strong>
                    <span>/100</span>
                </div>
            </div>

            <div class="radar-datos">
                <div>
                    <span>Precio</span>
                    <strong>${formatoPrecioRadar(activo.precio, activo.moneda)}</strong>
                </div>

                <div>
                    <span>Cambio diario</span>
                    <strong>${formatoPorcentajeRadar(activo.variacion)}</strong>
                </div>

                <div>
                    <span>Desde máximo 52 sem.</span>
                    <strong>${formatoPorcentajeRadar(activo.caidaMaximo)}</strong>
                </div>

                <div>
                    <span>Señal</span>
                    <strong>${activo.estadoRadar.etiqueta}</strong>
                </div>
            </div>

            ${
                activo.error
                    ? `<p class="radar-error">${escaparRadar(activo.error)}</p>`
                    : ""
            }

        </article>
    `;
}

function pintarResumenRadar(resultados) {
    const total = resultados.length;
    const oportunidades =
        resultados.filter(
            item => item.puntuacion >= 75
        ).length;

    const vigilar =
        resultados.filter(
            item =>
                item.puntuacion >= 60 &&
                item.puntuacion < 75
        ).length;

    const mejor =
        resultados[0];

    const totalEl =
        document.getElementById("radarTotal");

    const oportunidadesEl =
        document.getElementById("radarOportunidades");

    const vigilarEl =
        document.getElementById("radarVigilar");

    const mejorEl =
        document.getElementById("radarMejor");

    if (totalEl) totalEl.textContent = total;
    if (oportunidadesEl) oportunidadesEl.textContent = oportunidades;
    if (vigilarEl) vigilarEl.textContent = vigilar;

    if (mejorEl) {
        mejorEl.textContent =
            mejor && mejor.precio > 0
                ? `${mejor.nombre} · ${mejor.puntuacion}/100`
                : "--";
    }
}

function pintarRadar() {
    const contenedor =
        document.getElementById("radarLista");

    if (!contenedor) {
        return;
    }

    const resultados =
        obtenerResultadosRadar();

    pintarResumenRadar(resultados);

    if (resultados.length === 0) {
        contenedor.innerHTML = `
            <div class="activo">
                <h3>Sin activos</h3>
                <p>Añade empresas o ETF a la Watchlist para analizarlos.</p>
            </div>
        `;
        return;
    }

    const conDatos =
        resultados.filter(
            activo => activo.precio > 0
        );

    if (conDatos.length === 0) {
        contenedor.innerHTML = `
            <div class="activo">
                <h3>Esperando cotizaciones</h3>
                <p>Pulsa «Analizar mercado» para actualizar la Watchlist y construir el ranking.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML =
        resultados
            .map(
                (activo, indice) =>
                    tarjetaRadar(
                        activo,
                        indice + 1
                    )
            )
            .join("");
}

async function actualizarRadar() {
    const boton =
        document.getElementById(
            "botonActualizarRadar"
        );

    if (boton) {
        boton.disabled = true;
        boton.textContent =
            "⏳ Analizando mercado...";
    }

    try {
        if (
            typeof actualizarWatchlist ===
            "function"
        ) {
            await actualizarWatchlist(false);
        }

        pintarRadar();

        const fecha =
            new Date()
                .toLocaleString(
                    "es-ES"
                );

        const elementoFecha =
            document.getElementById(
                "radarUltimaActualizacion"
            );

        if (elementoFecha) {
            elementoFecha.textContent =
                fecha;
        }

    } finally {
        if (boton) {
            boton.disabled = false;
            boton.textContent =
                "🔄 Analizar mercado";
        }
    }
}

document.addEventListener(
    "DOMContentLoaded",
    function() {
        pintarRadar();
    }
);
