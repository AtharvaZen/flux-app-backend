

import mongoose ,{Schema} from "mongoose";




const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, // subscribing one 
        ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId ,// subscribed to
        ref:"User"
    },
}, {timestamps: true})


export const Subscription = mongoose.model("Subscription",subscriptionSchema); 