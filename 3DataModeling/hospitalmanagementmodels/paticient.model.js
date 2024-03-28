import mongoose from 'mongoose'

const paticietSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    diagonsewith : {
        type : String,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    age : {
        type : Number,
        required : true
    },
    bloodgroup : {
        type : String ,
        required : true
    },
    gender : {
        type : String,
        enum : ["M", "F", "O"],
        required : true
    },
    admittedIn : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Hospital"
    },
}, { timestamps : true })

export const  paticient = mongoose.model('Paticient', doctorSchema)  