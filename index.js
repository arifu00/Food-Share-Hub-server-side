const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

// middleware

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  // console.log("value of token ", token);
  if (!token) {
    return res.status(401).send({ message: "UnAuthorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "UnAuthorized" });
    }
    console.log("value in code ", decoded);
    req.user = decoded;
    next();
  });
};

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

    // auth related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 60 * 60 * 1000,
        })
        .send({ success: true });
    });

    // service api
    const foodsCollection = client.db("foodShareHub").collection("foods");
    const foodRequestCollection = client
      .db("foodShareHub")
      .collection("foodRequest");

    // foods collection api
    app.get("/foods", async (req, res) => {
      try {
        const cursor = foodsCollection.find();
        // console.log("token", req.cookies.token);
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
    app.get("/requestFood", verifyToken, async (req, res) => {
      try {
        console.log(req.query.email);
        if (req.query.email !== req.user.email) {
          return res.status(403).send({message: 'Forbidden Access'})
        }
        // console.log("token", req.cookies.token);
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
    app.post("/requestFood", verifyToken, async (req, res) => {
      try {
        const requestFood = req.body;
        // console.log(requestFood);
        const result = await foodRequestCollection.insertOne(requestFood);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.delete("/requestFood/:id", verifyToken, async (req, res) => {
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
    app.get("/manageMyFood", verifyToken, async (req, res) => {
      try {
        // console.log(req.query.email);
        if (req.query.email !== req.user.email) {
          return res.status(403).send({message: 'Forbidden Access'})
        }
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
    app.get("/manageMyFoodDetail", verifyToken, async (req, res) => {
      try {
        // console.log(req.query.email);
        console.log("user in the valid token ", req.user);
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

    app.patch("/myFoodDetail/:id", verifyToken, async (req, res) => {
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

    app.delete("/manageMyFood/:id", verifyToken, async (req, res) => {
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
    app.get("/update/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await foodsCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.patch("/update/:id", verifyToken, async (req, res) => {
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
