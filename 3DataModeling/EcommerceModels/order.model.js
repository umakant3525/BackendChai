import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    orderPrice: {
        type: Number,
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    orderItems: {
        type: [orderItemSchema],
        required: true
    },
    address : {
        type : String , 
        required : true
    },
    status : {
       Types : String,
       enum : ["PENDING","CANCELLLED","DELIVERED"] ,
       default : "PENDING"
    }
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
