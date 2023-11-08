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
        console.log(req.query.email);
        let query = {};
        if (req.query?.email) {
          query = { requesterEmail: req.query.email };
        }
        const cursor = foodRequestCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
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
    app.delete("/requestFood/:id", async (req, res) => {
      try {
        const id = req.params.id;
        // console.log(id);
        const query = { _id: new ObjectId(id) };
        const result = await foodRequestCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // manage my food api
    app.get("/manageMyFood", async (req, res) => {
      try {
        console.log(req.query.email);
        let query = {};
        if (req.query?.email) {
          query = { donatorEmail: req.query.email };
        }
        const result = await foodsCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/manageMyFoodDetail", async (req, res) => {
      try {
        console.log(req.query.email);
        let query = {};
        if (req.query?.email) {
          query = { donatorEmail: req.query.email };
        }
        const result = await foodRequestCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.patch("/myFoodDetail/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateStatus = req.body;
        console.log(updateStatus);
        const updateDoc = {
          $set: {
            foodStatus: updateStatus.foodStatus,
          },
        };
        const result = await foodRequestCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.delete("/manageMyFood/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);
        const query = { _id: new ObjectId(id) };
        const result = await foodsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // update api
    app.get("/update/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await foodsCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.patch("/update/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedFood = req.body;
        console.log(updatedFood);
        const updateDoc = {
          $set: {
            foodName: updatedFood.foodName,
            foodImage: updatedFood.foodImage,
            pickupLocation: updatedFood.pickupLocation,
            expiredDate: updatedFood.expiredDate,
            additionalNotes: updatedFood.additionalNotes,
          },
        };
        const result = await foodsCollection.updateOne(filter, updateDoc);
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
