function ocultarModulos() {
    document.querySelectorAll(".module").forEach(modulo => {
        modulo.classList.add("hidden");
    });

    const contenido = document.getElementById("content");
    if (contenido) {
        contenido.style.display = "none";
    }
}

function abrirModulo(id) {
    ocultarModulos();

    const modulo = document.getElementById(id);

    if (modulo) {
        modulo.classList.remove("hidden");
    }
}

function inicio() {
    document.querySelectorAll(".module").forEach(modulo => {
        modulo.classList.add("hidden");
    });

    document.getElementById("content").style.display = "block";
}

function mostrarFormulario() {
    document.getElementById("formularioActivo").classList.toggle("hidden");
}

function guardarActivo() {

    const nombre = document.getElementById("nombreActivo").value;
    const ticker = document.getElementById("tickerActivo").value;
    const precio = document.getElementById("precioCompra").value;
    const participaciones = document.getElementById("participaciones").value;

    if (nombre === "" || precio === "" || participaciones === "") {
        alert("Completa todos los campos.");
        return;
    }

    const lista = document.getElementById("listaActivos");

    lista.innerHTML += `
        <div class="activo">
            <strong>${nombre}</strong><br>
            ${ticker}<br>
            Compra: ${precio} €<br>
            Participaciones: ${participaciones}
        </div>
        <hr>
    `;

    document.getElementById("nombreActivo").value = "";
    document.getElementById("tickerActivo").value = "";
    document.getElementById("precioCompra").value = "";
    document.getElementById("participaciones").value = "";

    document.getElementById("formularioActivo").classList.add("hidden");
}

console.log("Método Paco iniciado");