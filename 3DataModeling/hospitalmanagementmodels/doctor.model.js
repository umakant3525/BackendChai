import mongoose from 'mongoose'

const doctorSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    salary : {
        type : String,
        reequired : true
    },
    qualification : {
        type : String 
    },
    experienceInYears : {
        type : Number,
        required : true,
        default : 0
    },
    worksINHospitals : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Hospital"
    }]
}, { timestamps : true })

export const  doctor = mongoose.model('Doctor', doctorSchema)  