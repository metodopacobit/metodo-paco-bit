// ==========================
// apiBit.js
// Método Paco v2.2
// ==========================

// ---------- APIs ----------

const COINGECKO_API =
"https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false";

const FEAR_GREED_API =
"https://api.alternative.me/fng/?limit=1";

// ==========================
// BITCOIN
// ==========================

async function actualizarBitcoin(){

    try{

        const respuesta = await fetch(COINGECKO_API,{
            cache:"no-cache"
        });

        if(!respuesta.ok){

            throw new Error(
                "CoinGecko: "+respuesta.status
            );

        }

        const datos = await respuesta.json();

        // Guardar datos de mercado

        actualizarActivoBit("bitcoin",{

            precio:
                datos.market_data.current_price.eur || 0,

            variacion:
                datos.market_data.price_change_percentage_24h || 0,

            ath:
                datos.market_data.ath.eur || 0

        });

        // Calcular caída desde ATH

        if(
            metodoPacoBit.bitcoin.ath>0
        ){

            metodoPacoBit.bitcoin.caidaATH=

            (
                (
                    metodoPacoBit.bitcoin.precio-
                    metodoPacoBit.bitcoin.ath
                )
                /
                metodoPacoBit.bitcoin.ath
            )*100;

        }

        // Fear & Greed NO debe romper
        // toda la actualización

        await actualizarFearGreed();

        mostrarMetodoPacoBit();

    }

    catch(error){

        console.error(
            "Bitcoin:",
            error
        );

    }

}

// ==========================
// ACTUALIZAR PANTALLA
// ==========================

function mostrarMetodoPacoBit(){

    const btc = metodoPacoBit.bitcoin;

    if(document.getElementById("btcPrecio")){
        document.getElementById("btcPrecio").textContent =
            btc.precio.toLocaleString("es-ES",{
                minimumFractionDigits:2,
                maximumFractionDigits:2
            }) + " €";
    }

    if(document.getElementById("btcCambio")){
        document.getElementById("btcCambio").textContent =
            btc.variacion.toFixed(2) + " %";
    }

    if(document.getElementById("btcIndice")){
        document.getElementById("btcIndice").textContent =
            btc.indice;
    }

    if(document.getElementById("btcEstado")){
        document.getElementById("btcEstado").textContent =
            btc.estado;
    }

    if(document.getElementById("btcRevision")){
        document.getElementById("btcRevision").textContent =
            btc.ultimaRevision || "--";
    }

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