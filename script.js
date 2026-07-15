// ==========================
// MÉTODO PACO v1.0
// NAVEGACIÓN
// ==========================

function ocultarTodo() {

    document.getElementById("inicio").classList.add("oculto");

    document.querySelectorAll(".pantalla").forEach(function(pantalla) {
        pantalla.classList.add("oculto");
    });

}

// ==========================

function mostrar(id) {

    ocultarTodo();

    document.getElementById(id).classList.remove("oculto");

    // Si abrimos la cartera, actualizamos precios
    if (id === "cartera") {

        pintarCartera();

        if (typeof actualizarTodaLaCartera === "function") {

            actualizarTodaLaCartera();

        }

    }

}

// ==========================

function volver() {

    document.querySelectorAll(".pantalla").forEach(function(pantalla) {

        pantalla.classList.add("oculto");

    });

    document.getElementById("inicio").classList.remove("oculto");

}

// ==========================
// INICIO
// ==========================

document.addEventListener("DOMContentLoaded", function () {

    volver();

});