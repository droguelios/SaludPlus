'use strict';

const mongoose = require('mongoose');
const env = require('./env');

// Estructura de cada cita dentro del historial del paciente
const esquemaCita = new mongoose.Schema(
  {
    appointmentId:        { type: String, required: true },
    date:                 { type: Date,   required: true },
    doctorName:           { type: String, required: true },
    doctorEmail:          { type: String, required: true },
    specialty:            { type: String, required: true },
    treatmentCode:        { type: String, required: true },
    treatmentDescription: { type: String, required: true },
    treatmentCost:        { type: Number, required: true },
    insuranceProvider:    { type: String, required: true },
    coveragePercentage:   { type: Number, required: true },
    amountPaid:           { type: Number, required: true },
  },
  { _id: false } // las citas no necesitan su propio ID en Mongo
);

// Estructura del documento principal — un documento por paciente
const esquemaHistorial = new mongoose.Schema(
  {
    patientEmail: { type: String, required: true, unique: true, index: true },
    patientName:  { type: String, required: true },
    appointments: [esquemaCita], // todas las citas embebidas aquí
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: 'patient_histories',
  }
);

const PatientHistory = mongoose.model('PatientHistory', esquemaHistorial);

// Conecta a MongoDB
async function connectMongo() {
  await mongoose.connect(env.mongo.uri);
  console.log('[MongoDB] Conectado.');
}

module.exports = { connectMongo, PatientHistory };
