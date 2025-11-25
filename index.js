const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kpocggx.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true },
});

app.use(cors());
app.use(express.json());


async function run() {
  console.log("MongoDB connecting...");
  try {
    await client.connect();
    const db = client.db("ai_model_db");
    const modelsCollection = db.collection("models");
    const userCollection = db.collection("users");

    app.get("/", (req, res) => {
      res.send("AI Model Inventory Manager Server Running");
    });

    app.get("/models", async (req, res) => {
      const models = await modelsCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.send(models);
    });

    app.get("/models/:id", async (req, res) => {
      const id = req.params.id;
      const model = await modelsCollection.findOne({ _id: new ObjectId(id) });
      res.send(model);
    });

    app.post("/models", async (req, res) => {
      const model = req.body;
      model.createdAt = new Date();
      model.purchased = model.purchased || 0;
      model.view = model.view || 0;
      const result = await modelsCollection.insertOne(model);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const existingUser = await userCollection.findOne({ email: user.email });
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email });
      if (user) {
        res.json(user);
      } else {
        res.json({});
      }
    });


    app.put("/models/:id", async (req, res) => {
      const { id } = req.params;
      const updatedModel = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: updatedModel };
      const result = await modelsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/models/:id", async (req, res) => {
        const { id } = req.params;
        const result = await modelsCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
    });


    app.get("/my-models/:email", async (req, res) => {
      const email = req.params.email;
      const models = await modelsCollection
        .find({ createdBy: email })
        .toArray();
      res.send(models);
    });


    app.patch("/models/view/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await modelsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { views: 1 } }
        );

        res.send(result);
      } catch (error) {
        res.send({ error: "Failed to increase view count" });
      }
    });


    app.post("/search-models", async (req, res) => {
    const search = req.body.search || "";
    const result = await modelsCollection
      .find({ name: { $regex: search, $options: "i" } })
      .sort({ createdAt: -1 })
      .toArray();
    res.send(result);
  });

  


    console.log("MongoDB connected successfully");
  } finally {
    console.log("MongoDB setup done");
  }
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


run().catch(console.dir);