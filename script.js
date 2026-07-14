// ==========================
// Método Paco v0.8
// ==========================

let cartera = JSON.parse(localStorage.getItem("cartera")) || [];
let indiceEditar = -1;

// ==========================
// NAVEGACIÓN
// ==========================

function ocultarTodo() {
    document.getElementById("inicio").classList.add("oculto");
    document.querySelectorAll(".pantalla").forEach(p => p.classList.add("oculto"));
}

function mostrar(id) {
    ocultarTodo();
    document.getElementById(id).classList.remove("oculto");

    if (id === "cartera") {
        pintarCartera();
    }
}

function volver() {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.add("oculto"));
    document.getElementById("inicio").classList.remove("oculto");
}

// ==========================
// LOCAL STORAGE
// ==========================

function guardarDatos() {
    localStorage.setItem("cartera", JSON.stringify(cartera));
}

// ==========================
// AÑADIR / EDITAR
// ==========================

function guardarActivo() {

    const nombre = document.getElementById("nombre").value.trim();
    const ticker = document.getElementById("ticker").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);
    const actual = parseFloat(document.getElementById("actual").value);
    const objetivo = parseFloat(document.getElementById("objetivo").value);
    const cantidad = parseFloat(document.getElementById("cantidad").value);

    if (
        !nombre ||
        isNaN(precio) ||
        isNaN(actual) ||
        isNaN(objetivo) ||
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
        objetivo,
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
    document.getElementById("objetivo").value = "";
    document.getElementById("cantidad").value = "";

    pintarCartera();
}

function eliminarActivo(indice){

    if(!confirm("¿Eliminar este activo?")) return;

    cartera.splice(indice,1);

    guardarDatos();

    pintarCartera();
}

function editarActivo(indice){

    const activo = cartera[indice];

    document.getElementById("nombre").value = activo.nombre;
    document.getElementById("ticker").value = activo.ticker;
    document.getElementById("precio").value = activo.precio;
    document.getElementById("actual").value = activo.actual;
    document.getElementById("objetivo").value = activo.objetivo;
    document.getElementById("cantidad").value = activo.cantidad;

    indiceEditar = indice;
}
// ==========================
// RESUMEN
// ==========================

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

// ==========================
// PINTAR CARTERA
// ==========================

function pintarCartera(){

    const lista = document.getElementById("lista");

    if(!lista) return;

    lista.innerHTML = "";

    let totalInvertido = 0;
    let totalActual = 0;

    cartera.forEach(function(activo,indice){

        const invertido = activo.precio * activo.cantidad;
        const valorActual = activo.actual * activo.cantidad;

        const beneficio = valorActual - invertido;

        const porcentaje =
            invertido > 0
            ? (beneficio / invertido) * 100
            : 0;

        const potencial =
            activo.objetivo > 0
            ? ((activo.objetivo - activo.actual) / activo.actual) * 100
            : 0;

        totalInvertido += invertido;
        totalActual += valorActual;

        lista.innerHTML += `
        <div class="activo">

            <h3>${activo.nombre}</h3>

            <p><b>Ticker:</b> ${activo.ticker}</p>

            <p><b>Precio compra:</b> ${activo.precio.toFixed(2)} €</p>

            <p><b>Precio actual:</b> ${activo.actual.toFixed(2)} €</p>

            <p><b>Precio objetivo:</b> ${activo.objetivo.toFixed(2)} €</p>

            <p><b>Participaciones:</b> ${activo.cantidad}</p>

            <p><b>Invertido:</b> ${invertido.toFixed(2)} €</p>

            <p><b>Valor actual:</b> ${valorActual.toFixed(2)} €</p>

            <p><b>Potencial:</b> ${potencial.toFixed(2)} %</p>

            <p style="color:${beneficio >= 0 ? 'lime' : 'red'}">

                <b>Rentabilidad:</b>

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

document.addEventListener("DOMContentLoaded",function(){

    pintarCartera();

});