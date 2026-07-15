// ==========================
// apiBit.js v3.0
// Método Paco Bit
// ==========================

// --------------------------
// APIs
// --------------------------

const COINGECKO_API =
"https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false";

const FEAR_GREED_API =
"https://api.alternative.me/fng/?limit=1";

// ==========================
// BITCOIN
// ==========================

async function actualizarBitcoin(){

    try{

        const respuesta =
        await fetch(COINGECKO_API,{

            cache:"no-cache"

        });

        if(!respuesta.ok){

            throw new Error(
                "Error CoinGecko: "+
                respuesta.status
            );

        }

        const datos =
        await respuesta.json();

        actualizarActivoBit("bitcoin",{

            precio:
            datos.market_data.current_price.eur,

            variacion:
            datos.market_data.price_change_percentage_24h,

            ath:
            datos.market_data.ath.eur

        });

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
// FEAR & GREED
// ==========================

async function actualizarFearGreed(){

    try{

        const respuesta =
        await fetch(FEAR_GREED_API,{

            cache:"no-cache"

        });

        if(!respuesta.ok){

            return;

        }

        const datos =
        await respuesta.json();

        if(datos.data && datos.data.length>0){

            metodoPacoBit.bitcoin.fearGreed =
                datos.data[0].value;

        }

    }

    catch(error){

        console.log(
            "Fear & Greed no disponible"
        );

    }

}

// ==========================
// ACTUALIZAR TODO
// ==========================

async function actualizarBit(){

    await actualizarBitcoin();

}

// ==========================
// AUTOACTUALIZAR
// ==========================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        actualizarBit();

        setInterval(function(){

            actualizarBit();

        },300000);

    }
);