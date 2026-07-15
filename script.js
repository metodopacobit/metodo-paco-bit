// ==========================
// Método Paco v1.0
// NAVEGACIÓN
// ==========================

function ocultarTodo() {

    document.getElementById("inicio").classList.add("oculto");

    document.querySelectorAll(".pantalla").forEach(p => {
        p.classList.add("oculto");
    });

}

function mostrar(id) {

    ocultarTodo();

    document.getElementById(id).classList.remove("oculto");

    if (id === "cartera") {
        pintarCartera();
    }

}

function volver() {

    document.querySelectorAll(".pantalla").forEach(p => {
        p.classList.add("oculto");
    });

    document.getElementById("inicio").classList.remove("oculto");

}

document.addEventListener("DOMContentLoaded", () => {

    volver();

});