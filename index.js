

const express = require('express');
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 8000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = process.env.MONGODB_URI;
const uri = "mongodb+srv://pet_adoption:IdcNoZdHK8d6JtGk@cluster0.2evd3jf.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const db = client.db("pet_adoption");
        const petsCollection = db.collection("pets");
        // const petsCollection = db.collection("pet_collection");
        const adoptionRequestsCollection = db.collection("adoption_requests");

        // ── PETS ──────────────────────────────────────────

        // সব pets — search, filter, sort support সহ
        app.get("/pets", async (req, res) => {
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
        });

        // featured pets
        app.get("/featured", async (req, res) => {
            const result = await petsCollection.find({ status: "available" }).limit(4).toArray();
            res.send(result);
        });

        // single pet
        app.get("/pets/:petId", async (req, res) => {
            const { petId } = req.params;
            const result = await petsCollection.findOne({ _id: new ObjectId(petId) });
            res.send(result);
        });

        // নতুন pet add
        app.post("/pets", async (req, res) => {
            const result = await petsCollection.insertOne(req.body);
            res.send(result);
        });

        // pet delete
        app.delete("/pets/:petId", async (req, res) => {
            const { petId } = req.params;
            const result = await petsCollection.deleteOne({ _id: new ObjectId(petId) });
            res.send(result);
        });

        // ── ADOPTION REQUESTS ─────────────────────────────

        // নতুন request submit
        app.post("/adoption-requests", async (req, res) => {
            const result = await adoptionRequestsCollection.insertOne(req.body);
            res.send(result);
        });

        // user এর সব requests
        app.get("/adoption-requests", async (req, res) => {
            const { email } = req.query;
            const query = email ? { requesterEmail: email } : {};
            const result = await adoptionRequestsCollection.find(query).toArray();
            res.send(result);
        });

        // request cancel
        app.delete("/adoption-requests/:id", async (req, res) => {
            const { id } = req.params;
            const result = await adoptionRequestsCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`);
// });
module.exports = app;