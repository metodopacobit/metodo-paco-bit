// ==========================
// Método Paco v0.7
// ==========================

let cartera = JSON.parse(localStorage.getItem("cartera")) || [];
let indiceEditar = -1;

// ==========================
// NAVEGACIÓN
// ==========================

function ocultarTodo() {
    document.querySelectorAll(".pantalla").forEach(p => {
        p.classList.add("oculto");
    });
}

function mostrar(id) {
    ocultarTodo();

    const pantalla = document.getElementById(id);

    if (pantalla) {
        pantalla.classList.remove("oculto");
    }

    if (id === "cartera") {
        pintarCartera();
    }
}

function volver() {
    ocultarTodo();
    document.getElementById("inicio").classList.remove("oculto");
}

// ==========================
// LOCAL STORAGE
// ==========================

function guardarDatos() {
    localStorage.setItem("cartera", JSON.stringify(cartera));
}

// ==========================
// GUARDAR ACTIVO
// ==========================

function guardarActivo() {

    const nombre = document.getElementById("nombre").value.trim();

    const ticker = document
        .getElementById("ticker")
        .value
        .trim()
        .toUpperCase();

    const precio = parseFloat(document.getElementById("precio").value);

    const actual = parseFloat(document.getElementById("actual").value);

    const cantidad = parseFloat(document.getElementById("cantidad").value);

    if (
        nombre === "" ||
        isNaN(precio) ||
        isNaN(actual) ||
        isNaN(cantidad)
    ) {
        alert("Completa todos los campos.");
        return;
    }

    const activo = {
        nombre,
        ticker,
        precio,
        actual,
        cantidad
    };

    if (indiceEditar === -1) {
        cartera.push(activo);
    } else {
        cartera[indiceEditar] = activo;
        indiceEditar = -1;
    }

    guardarDatos();

    document.getElementById("nombre").value = "";
    document.getElementById("ticker").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("actual").value = "";
    document.getElementById("cantidad").value = "";

    pintarCartera();
}
// ==========================
// EDITAR
// ==========================

function editarActivo(indice) {

    const activo = cartera[indice];

    document.getElementById("nombre").value = activo.nombre;
    document.getElementById("ticker").value = activo.ticker;
    document.getElementById("precio").value = activo.precio;
    document.getElementById("actual").value = activo.actual;
    document.getElementById("cantidad").value = activo.cantidad;

    indiceEditar = indice;
}

// ==========================
// ELIMINAR
// ==========================

function eliminarActivo(indice) {

    if (!confirm("¿Eliminar este activo?")) {
        return;
    }

    cartera.splice(indice, 1);

    guardarDatos();

    pintarCartera();
}

// ==========================
// RESUMEN
// ==========================

function pintarResumen(totalInvertido, totalActual) {

    const beneficio = totalActual - totalInvertido;

    const porcentaje =
        totalInvertido > 0
            ? (beneficio / totalInvertido) * 100
            : 0;

    document.getElementById("numActivos").textContent = cartera.length;

    document.getElementById("totalInvertido").textContent =
        totalInvertido.toFixed(2) + " €";

    document.getElementById("valorActual").textContent =
        totalActual.toFixed(2) + " €";

    document.getElementById("rentabilidad").textContent =
        beneficio.toFixed(2) + " € (" + porcentaje.toFixed(2) + "%)";
}
// ==========================
// PINTAR CARTERA
// ==========================

function pintarCartera() {

    const lista = document.getElementById("lista");

    if (!lista) return;

    lista.innerHTML = "";

    let totalInvertido = 0;
    let totalActual = 0;

    cartera.forEach((activo, indice) => {

        const invertido = activo.precio * activo.cantidad;
        const valorActual = activo.actual * activo.cantidad;
        const beneficio = valorActual - invertido;

        const porcentaje =
            invertido > 0
                ? (beneficio / invertido) * 100
                : 0;

        totalInvertido += invertido;
        totalActual += valorActual;

        const color = beneficio >= 0 ? "lime" : "red";

        lista.innerHTML += `
            <div class="activo">

                <h3>${activo.nombre}</h3>

                <p><strong>Ticker:</strong> ${activo.ticker}</p>

                <p><strong>Precio compra:</strong> ${activo.precio.toFixed(2)} €</p>

                <p><strong>Precio actual:</strong> ${activo.actual.toFixed(2)} €</p>

                <p><strong>Cantidad:</strong> ${activo.cantidad}</p>

                <p><strong>Invertido:</strong> ${invertido.toFixed(2)} €</p>

                <p><strong>Valor actual:</strong> ${valorActual.toFixed(2)} €</p>

                <p style="color:${color}">
                    <strong>Rentabilidad:</strong>
                    ${beneficio.toFixed(2)} €
                    (${porcentaje.toFixed(2)}%)
                </p>

                <button onclick="editarActivo(${indice})">
                    ✏️ Editar
                </button>

                <button onclick="eliminarActivo(${indice})">
                    🗑 Eliminar
                </button>

            </div>
        `;
    });

    pintarResumen(totalInvertido, totalActual);
}
// ==========================
// INICIO
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    // Mostrar pantalla inicial
    ocultarTodo();
    document.getElementById("inicio").classList.remove("oculto");

    // Cargar cartera guardada
    pintarCartera();

});