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

app.get("/", (req, res) => {
  res.send("AI Model Inventory Manager Server Running");
});


async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully");
  } finally {
    console.log("MongoDB setup done");
  }
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


run().catch(console.dir);