import mongoose from 'mongoose'

const medicalRecordSchema = new mongoose.Schema({
    paticient : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Paticient"
    },
    doctor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Doctor"
    },
    timeofcheck : {
        type : Date,
        required : true
    },
    fees : {
        type: Number
    },
}, { timestamps : true })

export const  MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema) 