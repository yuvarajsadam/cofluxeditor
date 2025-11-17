const mongoose=require("mongoose")
const  Textschema=new mongoose.Schema({

    content:{type:String,required:true}
})
module.exports =mongoose.model("Textcontent",Textschema)