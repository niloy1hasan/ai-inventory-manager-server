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



    console.log("MongoDB connected successfully");
  } finally {
    console.log("MongoDB setup done");
  }
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


run().catch(console.dir);