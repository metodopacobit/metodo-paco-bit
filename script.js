// Método Paco v0.3

let cartera = JSON.parse(localStorage.getItem("cartera")) || [];

function ocultarTodo() {
    document.getElementById("inicio").classList.add("oculto");

    document.querySelectorAll(".pantalla").forEach(function(pantalla) {
        pantalla.classList.add("oculto");
    });
}

function mostrar(id) {
    ocultarTodo();
    document.getElementById(id).classList.remove("oculto");
}

function volver() {
    document.querySelectorAll(".pantalla").forEach(function(pantalla) {
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

    localStorage.setItem("cartera", JSON.stringify(cartera));

    document.getElementById("nombre").value = "";
    document.getElementById("ticker").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("cantidad").value = "";

    pintarCartera();
}

function pintarCartera() {

    const lista = document.getElementById("lista");

    if (!lista) return;

    lista.innerHTML = "";

    let total = 0;

    cartera.forEach(function(activo) {

        total += activo.precio * activo.cantidad;

        lista.innerHTML += `
            <div class="activo">
                <h3>${activo.nombre}</h3>
                <p><strong>Ticker:</strong> ${activo.ticker}</p>
                <p><strong>Precio compra:</strong> ${activo.precio.toFixed(2)} €</p>
                <p><strong>Participaciones:</strong> ${activo.cantidad}</p>
                <p><strong>Invertido:</strong> ${(activo.precio * activo.cantidad).toFixed(2)} €</p>
            </div>
        `;
    });

    lista.innerHTML += `
        <div class="activo">
            <h3>Total invertido</h3>
            <p><strong>${total.toFixed(2)} €</strong></p>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", function () {
    pintarCartera();
});