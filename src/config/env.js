'use strict';

require ('dotenv').config();

const requeries = [
    'PG_HOST' , 'PG_PORT', 'PG_DATABASE','PG_USER','PG_PASSWORD',
    'MONGO_URI' ,'SIMULACRO_CSV_PATH'
];

for(const variable of requeridas){
    if (!process.env[variable]){
        throw new error (`falta la variable de entorno: ${variable}`);
    }
}

module.exports = {
    puerto: parseInt (process.env.PORT || '3000', 10),
    PG:{
        host: process.env.PG_HOST,
        port: parseInt(process.env.PG_PORT, 10),
        database: process.env.PG_DATABASE,
        user: process.env.PG_USER,
        password:process.env.PG_PASSWORD,
    },
    mongo:{
        uri:process.env.MONGO_URI
    },
    csv:{
        ruta:process.env.SIMULACRO_CSV_PATH,
    },
};