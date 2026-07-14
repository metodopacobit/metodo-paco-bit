// ==========================
// Método Paco
// Versión 0.5
// ==========================

let cartera = JSON.parse(localStorage.getItem("cartera")) || [];

function ocultarTodo() {
    document.getElementById("inicio").classList.add("oculto");
    document.querySelectorAll(".pantalla").forEach(p => p.classList.add("oculto"));
}

function mostrar(id) {
    ocultarTodo();
    document.getElementById(id).classList.remove("oculto");
    pintarCartera();
}

function volver() {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.add("oculto"));
    document.getElementById("inicio").classList.remove("oculto");
}

function guardarDatos() {
    localStorage.setItem("cartera", JSON.stringify(cartera));
}

function guardarActivo() {

    const nombre = document.getElementById("nombre").value.trim();
    const ticker = document.getElementById("ticker").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);
    const cantidad = parseFloat(document.getElementById("cantidad").value);
    const actual = parseFloat(document.getElementById("actual").value);

    if (!nombre || isNaN(precio) || isNaN(cantidad)) {
        alert("Completa todos los campos.");
        return;
    }

    cartera.push({
        nombre,
        ticker,
        precio,
        actual,
        cantidad
    });

    guardarDatos();

    document.getElementById("nombre").value = "";
    document.getElementById("ticker").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("actual").value = "";
    document.getElementById("cantidad").value = "";

    pintarCartera();
}

function eliminarActivo(indice) {

    if (!confirm("¿Eliminar este activo?")) return;

    cartera.splice(indice,1);

    guardarDatos();

    pintarCartera();
}

function pintarResumen(totalInvertido, totalActual){

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
        `${beneficio.toFixed(2)} € (${porcentaje.toFixed(2)}%)`;
}

function pintarCartera(){

    const lista = document.getElementById("lista");

    if(!lista) return;

    lista.innerHTML="";

    let total=0;

    let totalActual = 0;

    cartera.forEach(function(activo,indice){

        const invertido = activo.precio * activo.cantidad;

        const valorActual = activo.actual * activo.cantidad;
const beneficio = valorActual - invertido;
const porcentaje = (beneficio / invertido) * 100;

        total += invertido;
        totalActual += valorActual;
        lista.innerHTML += `
        <div class="activo">

            <h3>${activo.nombre}</h3>

            <p><b>Ticker:</b> ${activo.ticker}</p>

            <p><b>Precio compra:</b> ${activo.precio.toFixed(2)} €</p>

            <p><b>Participaciones:</b> ${activo.cantidad}</p>

            <p><b>Invertido:</b> ${invertido.toFixed(2)} €</p>

<p><b>Valor actual:</b> ${valorActual.toFixed(2)} €</p>

<p style="color:${beneficio>=0?'lime':'red'}">

<b>Rentabilidad:</b>

${beneficio.toFixed(2)} €

(${porcentaje.toFixed(2)}%)

</p>

            <button onclick="eliminarActivo(${indice})">
            🗑 Eliminar
            </button>

        </div>
        `;
    });

    pintarResumen(total, totalActual);

}

document.addEventListener("DOMContentLoaded",function(){

    pintarCartera();

});