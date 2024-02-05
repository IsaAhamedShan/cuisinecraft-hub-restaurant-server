const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const axios = require("axios");
const jwt = require('jsonwebtoken');
app.use(cors());
app.use(express.json());
// const helmet = require("helmet");
// var jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
// const cookieParser = require("cookie-parser");
const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jeu0kz0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();
    const cuisineCraftHub = await client.db("cuisineCraftHub");
    const menu_collection = cuisineCraftHub.collection("menu");
    const review_collection = cuisineCraftHub.collection("review");
    const chef_recommendation_collection =
      cuisineCraftHub.collection("chefRecommend");
    const cart_data = cuisineCraftHub.collection("cart");
    const userCollection = cuisineCraftHub.collection("user");

    app.get("/menu", async (req, res) => {
      const response = menu_collection.find();
      const result = await response.toArray();
      res.send(result);
    });
    app.get("/review", async (req, res) => {
      const response = review_collection.find();
      const result = await response.toArray();
      res.send(result);
    });
    app.get("/chef_recommendation", async (req, res) => {
      const response = chef_recommendation_collection.find();
      const result = await response.toArray();
      // console.log(result)
      res.send(result);
    });
    app.get("/cartList", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const dataFromDb = await cart_data.find(query).toArray();
      res.send(dataFromDb);
    });
    //cartList finished
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/verifyRecaptcha", async (req, res) => {
      const { recaptchaValue } = req.body;
      console.log(req.body);
      try {
        const response = await axios.post(
          "https://www.google.com/recaptcha/api/siteverify?secret=6Lfv_lgpAAAAAGL__eKMi8YiOg4Dv5klSx_Xt1J7&response=" +
            recaptchaValue
        );

        // Check response.success and take appropriate action
        if (response.data.success) {
          // reCAPTCHA verification successful
          console.log("success recaptcha");
          res.status(200).json({ success: true });
        } else {
          // reCAPTCHA verification failed
          console.log("failed recaptcha", response);
          res
            .status(400)
            .json({ success: false, error: "reCAPTCHA verification failed" });
        }
      } catch (error) {
        console.error("Error verifying reCAPTCHA:", error);
        res
          .status(500)
          .json({ success: false, error: "Internal server error" });
      }
    });
    //verify recaptcha finished
    app.post("/addToCart", async (req, res) => {
      console.log("data in post.addToCart: ", req.body);
      const cartItem = req.body;
      const dataFromDb = await cart_data.insertOne(cartItem);
      res.send("data inserted successfully");
    });
    app.post("/users", async (req, res) => {
      const { email, username } = req.body;
      const userData = {
        email,
        username,
      };


      console.log("userdata at /users is ", userData);
      try {
        const query = { email: email };
        const userAlreadyExists = await userCollection.findOne(query);
        if (!userAlreadyExists) {
          console.log("Updating user details:", email, username);

          const result = await userCollection.insertOne(userData);
          if (result.insertedCount === 1) {
            res.status(201).send("User details inserted successfully.");
          } else {
            res.status(200).send("Error while inserting user");
          }
        }
        res.status(200).send("User exists already.");
      } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send("An error occurred while updating user details.");
      }
    });
    app.post('/jwt', async(req,res)=>{
      const user = req.body
      jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:'1hr'
      },(err,token)=>{
        if(err){
          res.status(500).send({message:"error while creating token"})
        }
        else if(token){
          res.status(200).send({token})
        }
      })
      
    })
    app.patch('/users/admin/:id', async (req,res)=>{
      const id = req.params.id;
      console.log("🚀 ~ app.patch ~ id:", id)
      
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set:{
          role:'admin'
        }
      }
      const response = await userCollection.updateOne(filter,updateDoc)
      res.send(response)
    })
    app.delete("/deleteCartItem/:id", async (req, res) => {
      const id = req.params.id;
      // console.log("have to delete cart item id: ", id);
      const query = { _id: new ObjectId(id) };
      const response = await cart_data.deleteOne(query);
      // console.log("response deleted successfully.", response);
      res.send(response);
    });

    app.delete('/deleteUser/:id', async (req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const response = await userCollection.deleteOne(query);
      res.send(response)
    })

    //add to cart finished
  } catch (err) {
    console.log("error is run function of index.js : ", err);
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("server is running!!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
