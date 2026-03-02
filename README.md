# SaludPlus — Guía para el Examen

## ⚠️ Problema actual
El archivo `src/config/env.js` tiene un error. Reemplaza todo su contenido con esto:

```js
'use strict';

require('dotenv').config();

const requeridas = [
  'PG_HOST', 'PG_PORT', 'PG_DATABASE', 'PG_USER', 'PG_PASSWORD',
  'MONGO_URI', 'SIMULACRO_CSV_PATH'
];

for (const variable of requeridas) {
  if (!process.env[variable]) {
    throw new Error(`Falta la variable de entorno: ${variable}`);
  }
}

module.exports = {
  puerto: parseInt(process.env.PORT || '3000', 10),
  pg: {
    host:     process.env.PG_HOST,
    port:     parseInt(process.env.PG_PORT, 10),
    database: process.env.PG_DATABASE,
    user:     process.env.PG_USER,
    password: process.env.PG_PASSWORD,
  },
  mongo: {
    uri: process.env.MONGO_URI,
  },
  csv: {
    ruta: process.env.SIMULACRO_CSV_PATH,
  },
};
```

---

## 📂 Estructura correcta del proyecto
```
salud_plus/
├── src/
│   ├── config/
│   │   ├── env.js
│   │   ├── postgres.js
│   │   └── mongodb.js
│   ├── services/
│   │   ├── migrationService.js
│   │   ├── doctorService.js
│   │   ├── reportService.js
│   │   └── patientService.js
│   ├── routes/
│   │   ├── doctors.js
│   │   ├── reports.js
│   │   ├── patients.js
│   │   └── simulacro.js
│   ├── app.js
│   └── server.js
├── scripts/
│   └── run-migration.js
├── data/
│   └── simulacro_saludplus_data.csv
├── public/
│   ├── index.html
│   ├── css/
│   │   └── estilos.css
│   └── js/
│       ├── navegacion.js
│       ├── inicio.js
│       ├── medicos.js
│       ├── historial.js
│       ├── reporte.js
│       └── migracion.js
├── .env
├── .env.example
├── .gitignore
└── package.json
```

---

## ⚙️ Archivo .env
Crear el archivo `.env` en la raíz con esto:
```
PORT=3000
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=saludplus
PG_USER=postgres
PG_PASSWORD=tu_contraseña_aqui
MONGO_URI=mongodb://localhost:27017/saludplus
SIMULACRO_CSV_PATH=./data/simulacro_saludplus_data.csv
```

---

## 🚀 Pasos para correrlo
```bash
# 1. Instalar dependencias
npm install

# 2. Correr el servidor
npm start

# 3. Abrir en el navegador
http://localhost:3000

# 4. Migrar el CSV (desde la interfaz o desde terminal)
curl -X POST http://localhost:3000/api/simulacro/migrate
```

---

## 🌐 Endpoints disponibles
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/simulacro/migrate` | Migra el CSV a PostgreSQL y MongoDB |
| GET | `/api/doctors` | Lista todos los médicos |
| GET | `/api/doctors?specialty=Cardiologia` | Filtra por especialidad |
| GET | `/api/doctors/:id` | Obtiene un médico por ID |
| PUT | `/api/doctors/:id` | Actualiza un médico |
| GET | `/api/reports/revenue` | Reporte de ingresos |
| GET | `/api/reports/revenue?startDate=2024-01-01&endDate=2024-12-31` | Reporte con fechas |
| GET | `/api/patients/:email/history` | Historial de un paciente |

---

## 🗄️ Bases de datos necesarias
- **PostgreSQL** corriendo en `localhost:5432`
- **MongoDB** corriendo en `localhost:27017`

## ✅ Orden de prueba en el examen
1. Correr `npm start`
2. Abrir `http://localhost:3000`
3. Ir a **Migrar CSV** y ejecutar la migración
4. Ir a **Médicos** para ver la lista
5. Ir a **Historial** y buscar `maria.garcia@example.com`
6. Ir a **Reporte** y generar el reporte
