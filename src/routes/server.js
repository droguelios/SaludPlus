'use strict';

const env = require('../config/env');
const {initSchema} = require('../config/postgres');
const {connectMongo} = require ('../config/mongodb');
const app = require ('./app.js');

async function iniciar(){
    await connectMongo();
    await initSchema();

    app.listen(env.puerto,() => {
        console.log(`[Servidor] SaludPlus API corriendo en el puerto ${env.puerto}`);
    });
}

iniciar().catch((err)=>{
    console.error('[Servidor] Error fatal al iniciar:', err.message);
    process.exit(1);
});