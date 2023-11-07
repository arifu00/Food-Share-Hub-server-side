const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kalsdro.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const foodsCollection = client.db("foodShareHub").collection("foods");
    const foodRequestCollection = client
      .db("foodShareHub")
      .collection("foodRequest");

    // foods collection api
    app.get("/foods", async (req, res) => {
      try {
        const cursor = foodsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
      }
    });

    app.get("/food/:id", async (req, res) => {
      try {
        const id = req.params.id;
        // console.log(id);
        const query = { _id: new ObjectId(id) };
        const result = await foodsCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.post("/foods", async (req, res) => {
      try {
        const foods = req.body;
        // console.log(foods);
        const result = await foodsCollection.insertOne(foods);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // food request api
    app.get("/requestFood", async (req, res) => {
      try {
        const cursor = foodRequestCollection.find();
        const result = await cursor.toArray();
        res.send(result)
      } catch (error) {
        console.log(error);
      }
    });
    app.post("/requestFood", async (req, res) => {
      try {
        const requestFood = req.body;
        // console.log(requestFood);
        const result = await foodRequestCollection.insertOne(requestFood);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Food Share Hub Server Is Running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
