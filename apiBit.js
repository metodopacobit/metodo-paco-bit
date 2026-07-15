// ==========================
// API BITCOIN - COINGECKO
// Método Paco v2.0
// ==========================

const COINGECKO_API =
"https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur&include_24hr_change=true";

async function actualizarBitcoin(){

    try{

        const respuesta = await fetch(COINGECKO_API);

        if(!respuesta.ok){

            throw new Error("Error al obtener Bitcoin");

        }

        const datos = await respuesta.json();

        actualizarActivoBit("bitcoin",{

            precio: datos.bitcoin.eur,

            variacion: datos.bitcoin.eur_24h_change

        });

        mostrarMetodoPacoBit();

    }

    catch(error){

        console.error(error);

    }

}

function actualizarBit(){

    actualizarBitcoin();

}

document.addEventListener("DOMContentLoaded",function(){

    actualizarBitcoin();

});