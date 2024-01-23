const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const axios = require('axios');
app.use(
  cors()
);
app.use(express.json());
// const helmet = require("helmet");
// var jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
// const cookieParser = require("cookie-parser");
const port = 5000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jeu0kz0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run(){
  try{
await client.connect()
const cuisineCraftHub = await client.db("cuisineCraftHub")
const menu_collection = cuisineCraftHub.collection("menu")
const review_collection = cuisineCraftHub.collection("review")
const chef_recommendation_collection = cuisineCraftHub.collection("chefRecommend")

app.get('/menu', async(req,res)=>{
  const response =menu_collection.find()
  const result = await response.toArray()
  res.send(result)
})
app.get('/review', async(req,res)=>{
  const response =review_collection.find()
  const result = await response.toArray()
  res.send(result)
})
app.get('/chef_recommendation', async(req,res)=>{
  const response = chef_recommendation_collection.find()
  const result = await response.toArray()
  // console.log(result)
  res.send(result)
})
app.post('/verify-recaptcha', async (req, res) => {
  const { recaptchaValue } = req.body;
console.log(req.body)
  try {
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', {
      secret: '6Lfv_lgpAAAAAGL__eKMi8YiOg4Dv5klSx_Xt1J7',
      response: recaptchaValue,
    });

    // Check response.success and take appropriate action
    if (response.data.success) {
      // reCAPTCHA verification successful
      res.status(200).json({ success: true });
    } else {
      // reCAPTCHA verification failed
      res.status(400).json({ success: false, error: 'reCAPTCHA verification failed' });
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
  }
catch(err){
  console.log("error is run function of index.js : ",err)
}
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('server is running!!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})