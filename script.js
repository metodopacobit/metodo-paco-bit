// ==========================
// Método Paco
// Versión 0.4.1
// ==========================

let cartera = JSON.parse(localStorage.getItem("cartera")) || [];

function ocultarTodo() {
    document.getElementById("inicio").classList.add("oculto");

    document.querySelectorAll(".pantalla").forEach(function (pantalla) {
        pantalla.classList.add("oculto");
    });
}

function mostrar(id) {
    ocultarTodo();
    document.getElementById(id).classList.remove("oculto");
    pintarCartera();
}

function volver() {
    document.querySelectorAll(".pantalla").forEach(function (pantalla) {
        pantalla.classList.add("oculto");
    });

    document.getElementById("inicio").classList.remove("oculto");
}

function guardarActivo() {

    const nombre = document.getElementById("nombre").value.trim();
    const ticker = document.getElementById("ticker").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);
    const cantidad = parseFloat(document.getElementById("cantidad").value);

    if (!nombre || isNaN(precio) || isNaN(cantidad)) {
        alert("Completa todos los campos.");
        return;
    }

    cartera.push({
        nombre,
        ticker,
        precio,
        cantidad
    });

    guardarDatos();

    document.getElementById("nombre").value = "";
    document.getElementById("ticker").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("cantidad").value = "";

    pintarCartera();
}

function eliminarActivo(indice) {

    if (!confirm("¿Eliminar este activo?")) return;

    cartera.splice(indice, 1);

    guardarDatos();

    pintarCartera();
}

function guardarDatos() {
    localStorage.setItem("cartera", JSON.stringify(cartera));
}

function pintarCartera() {

    const lista = document.getElementById("lista");

    if (!lista) return;

    lista.innerHTML = "";

    let total = 0;

    cartera.forEach(function (activo, indice) {

        const invertido = activo.precio * activo.cantidad;

        total += invertido;

        lista.innerHTML += `
        <div class="activo">

            <h3>${activo.nombre}</h3>

            <p><strong>Ticker:</strong> ${activo.ticker}</p>

            <p><strong>Precio compra:</strong> ${activo.precio.toFixed(2)} €</p>

            <p><strong>Participaciones:</strong> ${activo.cantidad}</p>

            <p><strong>Invertido:</strong> ${invertido.toFixed(2)} €</p>

            <button onclick="eliminarActivo(${indice})">
            🗑 Eliminar
            </button>

        </div>
        `;
    });

    lista.innerHTML += `
    <div class="activo">

        <h3>📊 Resumen</h3>

        <p><strong>Activos:</strong> ${cartera.length}</p>

        <p><strong>Total invertido:</strong> ${total.toFixed(2)} €</p>

    </div>
    `;
}

document.addEventListener("DOMContentLoaded", function () {
    pintarCartera();
});