'use strict';

const mongooose= required('mongoose');
const env = required('./env');

const esquemaCita = new mongooose.Schema({
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
{_id:false}
);

const esquemaHistorial = new mongose.Schema({
    patientEmail: {type: String, required: true, unique: true , index:true},
    patientName: {type :String,required:true},
    appointments:[esquemaCita],
},{
    timetamps:{createdAt:'createdAt', update: 'updateAt'},
    collection:'patient_histories',
}
);

const patienthistories = mongoose.model('PatientHistory',esquemaHistorial);
async function connectMongo (){
await mongoose.connect(env.mongo.url);
console.log('[MongoDB] Conectado.');
}
module.exports = {connectMongo,PatientHistory};
