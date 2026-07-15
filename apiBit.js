// ==========================
// API BITCOIN
// Método Paco v2.1
// ==========================

const COINGECKO_API =
"https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false";

const FEAR_GREED_API =
"https://api.alternative.me/fng/?limit=1";

// ==========================
// BITCOIN
// ==========================

async function actualizarBitcoin(){

    try{

        const respuesta=await fetch(COINGECKO_API);

        if(!respuesta.ok){

            throw new Error("Error obteniendo Bitcoin");

        }

        const datos=await respuesta.json();

        actualizarActivoBit("bitcoin",{

            precio:datos.market_data.current_price.eur,

            variacion:datos.market_data.price_change_percentage_24h,

            ath:datos.market_data.ath.eur

        });

        await actualizarFearGreed();

        mostrarMetodoPacoBit();

    }

    catch(error){

        console.error(error);

    }

}

// ==========================
// FEAR & GREED
// ==========================

async function actualizarFearGreed(){

    try{

        const respuesta=await fetch(FEAR_GREED_API);

        if(!respuesta.ok){

            return;

        }

        const datos=await respuesta.json();

        metodoPacoBit.bitcoin.fearGreed=
        datos.data[0].value;

    }

    catch(error){

        console.error(error);

    }

}

// ==========================
// ACTUALIZAR TODO
// ==========================

async function actualizarBit(){

    await actualizarBitcoin();

}

// ==========================
// REFRESCO AUTOMÁTICO
// ==========================

function iniciarActualizacionAutomatica(){

    actualizarBit();

    setInterval(function(){

        actualizarBit();

    },300000);

}

// ==========================
// BOTÓN ACTUALIZAR
// ==========================

function refrescarMetodoPacoBit(){

    actualizarBit();

}

// ==========================
// INICIO
// ==========================

document.addEventListener("DOMContentLoaded",function(){

    iniciarActualizacionAutomatica();

});