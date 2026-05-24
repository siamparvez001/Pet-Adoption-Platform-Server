const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require('express');
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://pet-adoption-platform-a188.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;

let db;
let petsCollection;
let adoptionRequestsCollection;

const connectDB = async () => {
    if (db) return db;
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });
    await client.connect();
    db = client.db("pet_adoption");
    petsCollection = db.collection("pet_collection");
    adoptionRequestsCollection = db.collection("adoption_requests");
    console.log("Connected to MongoDB!");
    return db;
};

// PETS
app.get("/pets", async (req, res) => {
    try {
        await connectDB();
        const { ownerEmail, species, sortFee, searchTerm } = req.query;
        const query = {};
        if (ownerEmail) query.ownerEmail = ownerEmail;
        if (species) query.species = species;
        if (searchTerm) query.name = { $regex: searchTerm, $options: "i" };

        const sort = sortFee === "asc"
            ? { adoptionFee: 1 }
            : sortFee === "desc"
                ? { adoptionFee: -1 }
                : {};

        const result = await petsCollection.find(query).sort(sort).toArray();
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Server error" });
    }
});

app.get("/featured", async (req, res) => {
    try {
        await connectDB();
        const result = await petsCollection.find({ status: "available" }).limit(6).toArray();
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: "Server error" });
    }
});

app.get("/pets/:petId", async (req, res) => {
    try {
        await connectDB();
        const { petId } = req.params;
        const result = await petsCollection.findOne({ _id: new ObjectId(petId) });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: "Server error" });
    }
});

app.post("/pets", async (req, res) => {
    try {
        await connectDB();
        const result = await petsCollection.insertOne(req.body);
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: "Server error" });
    }
});

app.delete("/pets/:petId", async (req, res) => {
    try {
        await connectDB();
        const { petId } = req.params;
        const result = await petsCollection.deleteOne({ _id: new ObjectId(petId) });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: "Server error" });
    }
});

// ADOPTION REQUESTS
app.post("/adoption-requests", async (req, res) => {
    try {
        await connectDB();
        const result = await adoptionRequestsCollection.insertOne(req.body);
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: "Server error" });
    }
});

app.get("/adoption-requests", async (req, res) => {
    try {
        await connectDB();
        const { email } = req.query;
        const query = email ? { requesterEmail: email } : {};
        const result = await adoptionRequestsCollection.find(query).toArray();
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: "Server error" });
    }
});

app.delete("/adoption-requests/:id", async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;
        const result = await adoptionRequestsCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: "Server error" });
    }
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app; 