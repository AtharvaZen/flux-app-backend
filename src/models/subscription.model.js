

import mongoose ,{Schema} from "mongoose";
import { timeStamp } from "node:console";



const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, // subscribing one 
        ref: "User"
    },
    channel:{
        types: Schema.Types.ObjectId ,// subscribed to
        ref:"User"
    },
}, {timeStamp: true})


export const Subscription = mongoose.model("Subscription",subscriptionSchema); 