// ==========================
// bit.js v4.3
// Método Paco Bit
// ==========================

const BIT_STORAGE_KEY = "metodoPacoBitV4";
const BIT_OZ_TROY_POR_KG = 32.1507465686;

const DEFINICIONES_BIT = {

    bitcoin: {
        nombre: "Bitcoin",
        simbolo: "₿",
        ticker: "BTC",
        unidadPrecio: "EUR/BTC",
        etiquetaCantidad: "Cantidad de BTC",
        unidadCantidad: "BTC",
        decimalesCantidad: 8
    },

    brent: {
        nombre: "Petróleo Brent",
        simbolo: "🛢️",
        ticker: "BZ=F",
        unidadPrecio: "USD/barril",
        etiquetaCantidad: "Cantidad de barriles",
        unidadCantidad: "barriles",
        decimalesCantidad: 4,
        monedaPrecio: "USD"
    },

    oro: {
        nombre: "Oro",
        simbolo: "🥇",
        ticker: "XAU",
        unidadPrecio: "EUR/kg",
        etiquetaCantidad: "Cantidad en kilogramos",
        unidadCantidad: "kg",
        decimalesCantidad: 6
    },

    plata: {
        nombre: "Plata",
        simbolo: "🥈",
        ticker: "XAG",
        unidadPrecio: "EUR/kg",
        etiquetaCantidad: "Cantidad en kilogramos",
        unidadCantidad: "kg",
        decimalesCantidad: 6
    },

    platino: {
        nombre: "Platino",
        simbolo: "⚪",
        ticker: "XPT",
        unidadPrecio: "EUR/kg",
        etiquetaCantidad: "Cantidad en kilogramos",
        unidadCantidad: "kg",
        decimalesCantidad: 6
    },

    paladio: {
        nombre: "Paladio",
        simbolo: "🟠",
        ticker: "XPD",
        unidadPrecio: "EUR/kg",
        etiquetaCantidad: "Cantidad en kilogramos",
        unidadCantidad: "kg",
        decimalesCantidad: 6
    }

};


const metodoPacoBit = {};


Object.keys(
    DEFINICIONES_BIT
).forEach(function(clave) {

    metodoPacoBit[clave] = {

        ...DEFINICIONES_BIT[clave],

        precio: 0,

        variacion: 0,

        maximoRegistrado: 0,

        caidaMaximo: 0,

        fearGreed:
            clave === "bitcoin"
                ? "--"
                : null,

        indice: 50,

        estado: "Sin datos",

        accion: "Esperar",

        precioCompra: 0,

        cantidad: 0,

        invertido: 0,

        valorActual: 0,

        ganancia: 0,

        rentabilidad: 0,

        factorEur: 1,

        invertidoEur: 0,

        valorActualEur: 0,

        gananciaEur: 0,

        ultimaRevision: "--",

        error: ""

    };

});


let activoEditando = null;


// ==========================
// ESCRIBIR EN PANTALLA
// ==========================

function escribir(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.textContent =
            valor;

    }

}


// ==========================
// FORMATOS
// ==========================

function formatoEuro(
    valor
) {

    const numero =
        Number(valor);

    if (!Number.isFinite(numero)) {
        return "--";
    }

    return numero.toLocaleString(
        "es-ES",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + " €";

}


function formatoDolar(
    valor
) {

    const numero =
        Number(valor);

    if (!Number.isFinite(numero)) {
        return "--";
    }

    return numero.toLocaleString(
        "es-ES",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + " USD";

}


function formatoDineroActivo(
    clave,
    valor
) {

    return clave === "brent"
        ? formatoDolar(valor)
        : formatoEuro(valor);

}


function formatoPorcentaje(
    valor
) {

    const numero =
        Number(valor);

    if (!Number.isFinite(numero)) {
        return "--";
    }

    return numero.toFixed(2) +
        " %";

}


function formatoCantidad(
    activo
) {

    return Number(
        activo.cantidad
    ).toLocaleString(
        "es-ES",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits:
                activo.decimalesCantidad
        }
    ) +
    " " +
    activo.unidadCantidad;

}


// ==========================
// ÍNDICE MÉTODO PACO BIT
// ==========================

function calcularIndiceBit(
    clave
) {

    const activo =
        metodoPacoBit[clave];

    const variacion =
        Number(
            activo.variacion
        ) || 0;

    let indice = 50;


    if (variacion <= -10) {

        indice = 90;

    } else if (
        variacion <= -5
    ) {

        indice = 80;

    } else if (
        variacion <= -2
    ) {

        indice = 70;

    } else if (
        variacion >= 10
    ) {

        indice = 30;

    } else if (
        variacion >= 5
    ) {

        indice = 40;

    }


    activo.indice =
        indice;

}


// ==========================
// ESTADO
// ==========================

function actualizarEstadoBit(
    clave
) {

    const activo =
        metodoPacoBit[clave];


    if (
        activo.indice >= 80
    ) {

        activo.estado =
            "🟢 Comprar";

        activo.accion =
            "Comprar";

    } else if (
        activo.indice >= 60
    ) {

        activo.estado =
            "🟡 Mantener";

        activo.accion =
            "Mantener";

    } else if (
        activo.indice >= 40
    ) {

        activo.estado =
            "🟠 Esperar";

        activo.accion =
            "Esperar";

    } else {

        activo.estado =
            "🔴 No comprar";

        activo.accion =
            "No comprar";

    }

}


// ==========================
// RECALCULAR ACTIVO
// ==========================

function recalcularActivo(
    clave
) {

    const activo =
        metodoPacoBit[clave];


    activo.invertido =
        activo.precioCompra *
        activo.cantidad;


    activo.valorActual =
        activo.precio *
        activo.cantidad;


    activo.ganancia =
        activo.valorActual -
        activo.invertido;


    activo.rentabilidad =
        activo.invertido > 0

            ? (
                activo.ganancia /
                activo.invertido
            ) * 100

            : 0;


    const factorEur =
        clave === "brent"

            ? (
                Number(
                    activo.factorEur
                ) > 0

                    ? Number(
                        activo.factorEur
                    )

                    : 0
            )

            : 1;


    activo.invertidoEur =
        activo.invertido *
        factorEur;


    activo.valorActualEur =
        activo.valorActual *
        factorEur;


    activo.gananciaEur =
        activo.ganancia *
        factorEur;


    if (
        activo.precio >
        activo.maximoRegistrado
    ) {

        activo.maximoRegistrado =
            activo.precio;

    }


    activo.caidaMaximo =

        activo.maximoRegistrado > 0

            ? (
                (
                    activo.precio -
                    activo.maximoRegistrado
                ) /
                activo.maximoRegistrado
            ) * 100

            : 0;


    calcularIndiceBit(
        clave
    );


    actualizarEstadoBit(
        clave
    );

}


// ==========================
// ACTUALIZAR DATOS ACTIVO
// ==========================

function actualizarActivoBit(
    clave,
    datos
) {

    const activo =
        metodoPacoBit[clave];

    if (!activo) return;


    Object.assign(
        activo,
        datos
    );


    activo.ultimaRevision =
        new Date()
            .toLocaleString(
                "es-ES"
            );


    activo.error = "";


    recalcularActivo(
        clave
    );

}


// ==========================
// GUARDAR
// ==========================

function guardarDatosBit() {

    const datos = {

        ultimaActualizacion:
            document.getElementById(
                "bitUltimaActualizacion"
            )?.textContent ||
            "--",

        activos: {}

    };


    Object.keys(
        metodoPacoBit
    ).forEach(function(clave) {

        const activo =
            metodoPacoBit[clave];


        datos.activos[clave] = {

            precioCompra:
                activo.precioCompra,

            cantidad:
                activo.cantidad,

            maximoRegistrado:
                activo.maximoRegistrado,

            factorEur:
                activo.factorEur

        };

    });


    localStorage.setItem(
        BIT_STORAGE_KEY,
        JSON.stringify(datos)
    );

}


// ==========================
// CARGAR
// ==========================

function cargarDatosBit() {

    try {

        const datos =
            JSON.parse(
                localStorage.getItem(
                    BIT_STORAGE_KEY
                )
            );


        if (!datos?.activos) {
            return;
        }


        Object.keys(
            metodoPacoBit
        ).forEach(function(clave) {

            const guardado =
                datos.activos[clave];


            if (!guardado) {
                return;
            }


            metodoPacoBit[clave]
                .precioCompra =
                Number(
                    guardado.precioCompra
                ) || 0;


            metodoPacoBit[clave]
                .cantidad =
                Number(
                    guardado.cantidad
                ) || 0;


            metodoPacoBit[clave]
                .maximoRegistrado =
                Number(
                    guardado.maximoRegistrado
                ) || 0;


            metodoPacoBit[clave]
                .factorEur =

                clave === "brent"

                    ? (
                        Number(
                            guardado.factorEur
                        ) || 0
                    )

                    : 1;


            recalcularActivo(
                clave
            );

        });


        if (
            datos.ultimaActualizacion
        ) {

            escribir(
                "bitUltimaActualizacion",
                datos.ultimaActualizacion
            );

        }

    } catch (error) {

        console.warn(
            "No se pudieron cargar los datos de Método Paco Bit:",
            error
        );

    }

}


// ==========================
// FILA PANEL
// ==========================

function crearFilaBit(
    etiqueta,
    id
) {

    return `
        <div class="bitRow">
            <span class="bitLabel">${etiqueta}</span>
            <strong id="${id}">--</strong>
        </div>
    `;

}


// ==========================
// PANEL ACTIVO
// ==========================

function crearPanelActivo(
    clave
) {

    const activo =
        metodoPacoBit[clave];

    const esBitcoin =
        clave === "bitcoin";

    const esBrent =
        clave === "brent";


    return `
        <section class="bit-activo" id="panel-${clave}">

            <h2 class="bit-activo-titulo">
                ${activo.simbolo} ${activo.nombre}
                <span class="bit-activo-unidad">${activo.unidadPrecio}</span>
            </h2>

            <div class="bitDashboard">

                <div class="bitCard">

                    <h3>📊 Mercado</h3>

                    ${crearFilaBit(
                        esBrent
                            ? "💵 Precio actual"
                            : "💶 Precio actual",
                        `${clave}Precio`
                    )}

                    ${crearFilaBit(
                        "📈 Cambio 24 h",
                        `${clave}Variacion`
                    )}

                    ${crearFilaBit(
                        esBitcoin
                            ? "🏆 Máximo histórico"
                            : "🏆 Máximo registrado",
                        `${clave}Maximo`
                    )}

                    ${crearFilaBit(
                        "📉 Caída desde máximo",
                        `${clave}CaidaMaximo`
                    )}

                    ${
                        esBitcoin
                            ? crearFilaBit(
                                "😨 Fear & Greed",
                                `${clave}FearGreed`
                            )
                            : ""
                    }

                    ${crearFilaBit(
                        "🎯 Índice Método Paco Bit",
                        `${clave}Indice`
                    )}

                    ${crearFilaBit(
                        "📌 Estado",
                        `${clave}Estado`
                    )}

                </div>

                <div class="bitCard">

                    <h3>💼 Tu posición</h3>

                    ${crearFilaBit(
                        "💰 Precio compra",
                        `${clave}Compra`
                    )}

                    ${crearFilaBit(

                        esBitcoin

                            ? "₿ Cantidad BTC"

                            : esBrent

                                ? "🛢️ Cantidad (barriles)"

                                : `⚖️ Cantidad (${activo.unidadCantidad})`,

                        `${clave}Cantidad`

                    )}

                    ${crearFilaBit(
                        "💵 Invertido",
                        `${clave}Invertido`
                    )}

                    ${crearFilaBit(
                        "💎 Valor actual",
                        `${clave}ValorActual`
                    )}

                    ${crearFilaBit(
                        "📊 Ganancia / Pérdida",
                        `${clave}Ganancia`
                    )}

                    ${crearFilaBit(
                        "📈 Rentabilidad",
                        `${clave}Rentabilidad`
                    )}

                </div>

            </div>

            <button
                class="bit-editar"
                onclick="abrirEditorPosicionActivo('${clave}')"
            >
                ✏️ Editar posición
            </button>

            <p
                class="estado-api"
                id="${clave}Error"
            ></p>

        </section>
    `;

}


// ==========================
// PINTAR PANELES
// ==========================

function pintarPanelesBit() {

    const contenedor =
        document.getElementById(
            "activosBit"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML =

        Object.keys(
            metodoPacoBit
        )
        .map(
            crearPanelActivo
        )
        .join("");


    mostrarMetodoPacoBit();

}


// ==========================
// MOSTRAR ACTIVO
// ==========================

function mostrarActivoBit(
    clave
) {

    const activo =
        metodoPacoBit[clave];


    escribir(
        `${clave}Precio`,

        activo.precio > 0
            ? formatoDineroActivo(
                clave,
                activo.precio
            )
            : "--"
    );


    escribir(
        `${clave}Variacion`,
        formatoPorcentaje(
            activo.variacion
        )
    );


    escribir(
        `${clave}Maximo`,

        activo.maximoRegistrado > 0

            ? formatoDineroActivo(
                clave,
                activo.maximoRegistrado
            )

            : "--"
    );


    escribir(
        `${clave}CaidaMaximo`,
        formatoPorcentaje(
            activo.caidaMaximo
        )
    );


    escribir(
        `${clave}FearGreed`,
        activo.fearGreed ||
        "--"
    );


    escribir(
        `${clave}Indice`,
        activo.indice
    );


    escribir(
        `${clave}Estado`,
        activo.estado
    );


    escribir(
        `${clave}Compra`,

        activo.precioCompra > 0

            ? formatoDineroActivo(
                clave,
                activo.precioCompra
            )

            : "--"
    );


    escribir(
        `${clave}Cantidad`,
        formatoCantidad(
            activo
        )
    );


    escribir(
        `${clave}Invertido`,
        formatoDineroActivo(
            clave,
            activo.invertido
        )
    );


    escribir(
        `${clave}ValorActual`,
        formatoDineroActivo(
            clave,
            activo.valorActual
        )
    );


    escribir(
        `${clave}Ganancia`,
        formatoDineroActivo(
            clave,
            activo.ganancia
        )
    );


    escribir(
        `${clave}Rentabilidad`,
        formatoPorcentaje(
            activo.rentabilidad
        )
    );


    escribir(
        `${clave}Error`,
        activo.error || ""
    );

}


// ==========================
// RESUMEN
// ==========================

function actualizarResumenBit() {

    const activos =
        Object.values(
            metodoPacoBit
        );


    const invertido =
        activos.reduce(

            function(
                total,
                activo
            ) {

                return total +
                    (
                        Number(
                            activo.invertidoEur
                        ) || 0
                    );

            },

            0

        );


    const valor =
        activos.reduce(

            function(
                total,
                activo
            ) {

                return total +
                    (
                        Number(
                            activo.valorActualEur
                        ) || 0
                    );

            },

            0

        );


    const ganancia =
        valor -
        invertido;


    const rentabilidad =

        invertido > 0

            ? (
                ganancia /
                invertido
            ) * 100

            : 0;


    escribir(
        "bitResumenInvertido",
        formatoEuro(
            invertido
        )
    );


    escribir(
        "bitResumenValor",
        formatoEuro(
            valor
        )
    );


    escribir(
        "bitResumenGanancia",
        formatoEuro(
            ganancia
        )
    );


    escribir(
        "bitResumenRentabilidad",
        formatoPorcentaje(
            rentabilidad
        )
    );

}


// ==========================
// MOSTRAR TODO
// ==========================

function mostrarMetodoPacoBit() {

    Object.keys(
        metodoPacoBit
    ).forEach(
        mostrarActivoBit
    );


    actualizarResumenBit();

}


// ==========================
// EDITOR POSICIÓN
// ==========================

function abrirEditorPosicionActivo(
    clave
) {

    const activo =
        metodoPacoBit[clave];


    if (!activo) {
        return;
    }


    activoEditando =
        clave;


    escribir(
        "tituloModalActivo",
        `💼 Editar posición: ${activo.simbolo} ${activo.nombre}`
    );


    const compra =
        document.getElementById(
            "posicionPrecioCompra"
        );


    const cantidad =
        document.getElementById(
            "posicionCantidad"
        );


    const ayuda =
        document.getElementById(
            "ayudaUnidadPosicion"
        );


    const modal =
        document.getElementById(
            "modalPosicionActivo"
        );


    if (compra) {

        compra.value =
            activo.precioCompra > 0
                ? activo.precioCompra
                : "";

    }


    if (cantidad) {

        cantidad.value =
            activo.cantidad > 0
                ? activo.cantidad
                : "";

    }


    if (ayuda) {

        ayuda.textContent =
            `Precio en ${activo.unidadPrecio}. Introduce la cantidad en ${activo.unidadCantidad}.`;

    }


    if (modal) {

        modal.classList.remove(
            "oculto"
        );

    }

}


// ==========================
// CERRAR EDITOR
// ==========================

function cerrarEditorPosicionActivo() {

    activoEditando =
        null;


    document
        .getElementById(
            "modalPosicionActivo"
        )
        ?.classList
        .add(
            "oculto"
        );

}


// ==========================
// GUARDAR POSICIÓN
// ==========================

function guardarPosicionActivo() {

    if (!activoEditando) {
        return;
    }


    const precioCompra =
        Number(
            document.getElementById(
                "posicionPrecioCompra"
            )?.value
        );


    const cantidad =
        Number(
            document.getElementById(
                "posicionCantidad"
            )?.value
        );


    if (
        !(precioCompra > 0) ||
        !(cantidad > 0)
    ) {

        alert(
            "Introduce un precio de compra y una cantidad válidos."
        );

        return;

    }


    const activo =
        metodoPacoBit[
            activoEditando
        ];


    activo.precioCompra =
        precioCompra;


    activo.cantidad =
        cantidad;


    recalcularActivo(
        activoEditando
    );


    guardarDatosBit();


    mostrarMetodoPacoBit();


    cerrarEditorPosicionActivo();

}


// ==========================
// ERROR
// ==========================

function marcarErrorBit(
    clave,
    mensaje
) {

    const activo =
        metodoPacoBit[clave];


    if (!activo) {
        return;
    }


    activo.error =
        mensaje;


    mostrarActivoBit(
        clave
    );

}


// ==========================
// OBTENER ACTIVO
// ==========================

function obtenerActivoBit(
    clave
) {

    return metodoPacoBit[
        clave
    ];

}


// ==========================
// OBTENER TODOS
// ==========================

function obtenerTodosBit() {

    return metodoPacoBit;

}


// ==========================
// INICIO
// ==========================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        cargarDatosBit();

        pintarPanelesBit();

    }
);