// ==========================
// apiBit.js v3.1
// Método Paco Bit
// ==========================


// ==========================
// API COINGECKO
// ==========================

const COINGECKO_API =
"https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false";


// ==========================
// API FEAR & GREED
// ==========================

const FEAR_GREED_API =
"https://api.alternative.me/fng/?limit=1";


// ==========================
// ACTUALIZAR BITCOIN
// ==========================

async function actualizarBitcoin(){

    try{

        const respuesta =
        await fetch(

            COINGECKO_API,

            {
                cache:"no-cache"
            }

        );


        if(!respuesta.ok){

            throw new Error(

                "Error CoinGecko: "
                + respuesta.status

            );

        }


        const datos =
        await respuesta.json();


        const marketData =
        datos.market_data;


        if(

            !marketData ||
            !marketData.current_price ||
            !marketData.current_price.eur

        ){

            throw new Error(

                "Datos de Bitcoin incompletos"

            );

        }


        // ==========================
        // ACTUALIZAR DATOS DE MERCADO
        // ==========================

        actualizarActivoBit(

            "bitcoin",

            {

                precio:

                marketData.current_price.eur,


                variacion:

                marketData.price_change_percentage_24h
                || 0,


                ath:

                marketData.ath.eur
                || 0

            }

        );


        // ==========================
        // FEAR & GREED
        // ==========================

        await actualizarFearGreed();


        // ==========================
        // RECALCULAR POSICIÓN
        // ==========================

        actualizarPosicionBitcoin();


        // ==========================
        // MOSTRAR TODO
        // ==========================

        mostrarMetodoPacoBit();


        // ==========================
        // FECHA Y HORA
        // ==========================

        const fecha =
        new Date().toLocaleString(

            "es-ES",

            {

                dateStyle:"short",

                timeStyle:"medium"

            }

        );


        const elemento =
        document.getElementById(

            "bitcoinUltimaActualizacion"

        );


        if(elemento){

            elemento.textContent =
            fecha;

        }


        console.log(

            "Bitcoin actualizado:",
            fecha

        );

    }


    catch(error){

        console.error(

            "Error actualizando Bitcoin:",

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
        await fetch(

            FEAR_GREED_API,

            {

                cache:"no-cache"

            }

        );


        if(!respuesta.ok){

            console.warn(

                "Fear & Greed no disponible"

            );

            return;

        }


        const datos =
        await respuesta.json();


        if(

            datos.data &&
            datos.data.length > 0

        ){

            metodoPacoBit.bitcoin.fearGreed =

                datos.data[0].value;

        }

    }


    catch(error){

        console.warn(

            "Fear & Greed no disponible"

        );

    }

}


// ==========================
// ACTUALIZAR MÉTODO PACO BIT
// ==========================

async function actualizarBit(){

    await actualizarBitcoin();

}


// ==========================
// ACTUALIZACIÓN AUTOMÁTICA
// ==========================

document.addEventListener(

    "DOMContentLoaded",

    function(){

        actualizarBit();


        setInterval(

            function(){

                actualizarBit();

            },

            300000

        );

    }

);