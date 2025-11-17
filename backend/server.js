const exprees=require("express")
const mongoose=require("mongoose")
const env=require("dotenv")
const cors=require("cors")
const text=require("./model/usermodel")
env.config()
const app=exprees()
app.use(exprees.json())
app.use(cors())
const port=process.env.PORT ||5001
async function  connect(){
try{
    await mongoose.connect(process.env.MONOGO_URL)
    console.log("database connected succesfully")
}
catch(e){
    console.error("data base is not connected ",e.message);
    
}
}
connect();
app.get("/",async(req,res)=>{
    try{
    const data= await text.find()
    res.status(200).json(data)
    }
  
     catch (err) {
    res.status(500).json({ error: err.message })
    }
})
app.post('/', async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const result = await text.insertOne({ content });

    res.status(201).json({
      message: "Document saved",
      id: result.insertedId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.put("/:id", async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    await text.findByIdAndUpdate(id, { content });

    res.json({ msg: "updated" });
  } catch (e) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.listen(port,(req,res)=>{
    console.log("server is runing ",port)
})