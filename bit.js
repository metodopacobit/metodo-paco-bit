// ==========================
// MÉTODO PACO BIT
// v2.0
// ==========================

const metodoPacoBit = {

    bitcoin:{
        nombre:"Bitcoin",
        simbolo:"₿",
        ticker:"BTC",
        precio:0,
        precioAnterior:0,
        variacion:0,
        indice:0,
        estado:"Sin datos",
        accion:"Esperar",
        ultimaRevision:""
    },

    oro:{
        nombre:"Oro",
        simbolo:"🥇",
        ticker:"XAU",
        precio:0,
        precioAnterior:0,
        variacion:0,
        indice:0,
        estado:"Sin datos",
        accion:"Esperar",
        ultimaRevision:""
    },

    plata:{
        nombre:"Plata",
        simbolo:"🥈",
        ticker:"XAG",
        precio:0,
        precioAnterior:0,
        variacion:0,
        indice:0,
        estado:"Sin datos",
        accion:"Esperar",
        ultimaRevision:""
    },

    platino:{
        nombre:"Platino",
        simbolo:"⚪",
        ticker:"XPT",
        precio:0,
        precioAnterior:0,
        variacion:0,
        indice:0,
        estado:"Sin datos",
        accion:"Esperar",
        ultimaRevision:""
    },

    paladio:{
        nombre:"Paladio",
        simbolo:"🟠",
        ticker:"XPD",
        precio:0,
        precioAnterior:0,
        variacion:0,
        indice:0,
        estado:"Sin datos",
        accion:"Esperar",
        ultimaRevision:""
    }

};

// ==========================
// ACTUALIZAR ACTIVO
// ==========================

function actualizarActivoBit(nombre,datos){

    if(!metodoPacoBit[nombre]) return;

    metodoPacoBit[nombre].precioAnterior=
        metodoPacoBit[nombre].precio;

    Object.assign(
        metodoPacoBit[nombre],
        datos
    );

    metodoPacoBit[nombre].ultimaRevision=
        new Date().toLocaleString();

    actualizarIndicadoresBit(nombre);

}

// ==========================
// ÍNDICE
// ==========================

function calcularIndiceBit(nombre){

    const activo=metodoPacoBit[nombre];

    if(!activo) return;

    let indice=50;

    if(activo.variacion<=-10){

        indice=90;

    }else if(activo.variacion<=-5){

        indice=80;

    }else if(activo.variacion<=-2){

        indice=70;

    }else if(activo.variacion>=10){

        indice=30;

    }else if(activo.variacion>=5){

        indice=40;

    }

    activo.indice=indice;

}

// ==========================
// ESTADO
// ==========================

function actualizarEstadoBit(nombre){

    const activo=metodoPacoBit[nombre];

    if(!activo) return;

    if(activo.indice>=80){

        activo.estado="🟢 Comprar";
        activo.accion="Comprar";

    }else if(activo.indice>=60){

        activo.estado="🟡 Mantener";
        activo.accion="Mantener";

    }else if(activo.indice>=40){

        activo.estado="🟠 Esperar";
        activo.accion="Esperar";

    }else{

        activo.estado="🔴 No comprar";
        activo.accion="No comprar";

    }

}

function actualizarIndicadoresBit(nombre){

    calcularIndiceBit(nombre);

    actualizarEstadoBit(nombre);

}

// ==========================
// MOSTRAR MÉTODO PACO BIT
// ==========================

function mostrarMetodoPacoBit(){

    Object.keys(metodoPacoBit).forEach(function(nombre){

        const activo = metodoPacoBit[nombre];

        const precio = document.getElementById(nombre + "Precio");
        const variacion = document.getElementById(nombre + "Variacion");
        const indice = document.getElementById(nombre + "Indice");
        const estado = document.getElementById(nombre + "Estado");
        const accion = document.getElementById(nombre + "Accion");
        const revision = document.getElementById(nombre + "Revision");

        if(precio){

            precio.textContent =
                activo.precio.toLocaleString("es-ES",{
                    minimumFractionDigits:2,
                    maximumFractionDigits:2
                });

        }

        if(variacion){

            variacion.textContent =
                activo.variacion.toFixed(2) + " %";

            variacion.style.color =
                activo.variacion >= 0 ? "#00c853" : "#ff5252";

        }

        if(indice){

            indice.textContent = activo.indice;

        }

        if(estado){

            estado.textContent = activo.estado;

        }

        if(accion){

            accion.textContent = activo.accion;

        }

        if(revision){

            revision.textContent =
                activo.ultimaRevision || "--";

        }

    });

}

// ==========================
// OBTENER DATOS
// ==========================

function obtenerActivoBit(nombre){

    return metodoPacoBit[nombre];

}

function obtenerTodosBit(){

    return metodoPacoBit;

}

// ==========================
// INFORME
// ==========================

function generarInformeMetodoPacoBit(){

    console.table(metodoPacoBit);

}

// ==========================
// INICIO
// ==========================

document.addEventListener("DOMContentLoaded",function(){

    mostrarMetodoPacoBit();

});