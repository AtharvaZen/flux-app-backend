import "dotenv/config"


import connectDB from "./db/index.js";
import app from "./app.js"




 connectDB()
    .then(()=>{
        app.listen(process.env.PORT || 8000 , ()=>{
            console.log(`app running on ${process.env.PORT}`)
        })
        app.on("error" ,(error)=>{
            console.log("ERRR:",error);
        })
    })
    .catch((err)=>console.error(err))










// ( async ()=>{
//     try {
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     } catch (error) {
//         console.error(error)
//     }
// })()