// const express = require('express');
// const dotenv = require("dotenv");
// const cors = require("cors");
// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json());
// const port = process.env.PORT || 8000;



// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = "mongodb+srv://pet_adoption:IdcNoZdHK8d6JtGk@cluster0.2evd3jf.mongodb.net/?appName=Cluster0";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// async function run() {
//     try {
//         // Connect the client to the server	(optional starting in v4.7)
//         await client.connect();
//         // const db = client.db("pet_collection");
//         const db = client.db("pet_adoption");
//         // Send a ping to confirm a successful connection
//         // await client.db("admin").command({ ping: 1 });
//         const petsCollection = db.collection("pet_collection");
//         const adoptionRequestsCollection = db.collection("adoption_requests");
//         app.get("/pets", async (req, res) => {
//             const cursor = petsCollection.find();
//             const result = await cursor.toArray();
//             res.send(result);
//         });

//         app.get("/featured", async (req, res) => {
//             const cursor = petsCollection.find({ status: "available" }).limit(4);
//             const result = await cursor.toArray();
//             res.send(result);
//         });

//         app.get("/pets/:petId", async (req, res) => {
//             const { petId } = req.params;
//             const query = { _id: new ObjectId(petId) }
//             const result = await petsCollection.findOne(query)
//             res.send(result);
//         })
//         app.post("/pets", async (req, res) => {
//             const pet = req.body;
//             const result = await petsCollection.insertOne(pet);
//             res.send(result);
//         });
//         app.post("/adoption-requests", async (req, res) => {
//             const request = req.body;
//             const requestsCollection = db.collection("adoption_requests");
//             const result = await requestsCollection.insertOne(request);
//             res.send(result);
//         });
//         app.get("/adoption-requests", async (req, res) => {
//             const { email } = req.query;
//             const query = email ? { requesterEmail: email } : {};
//             const result = await adoptionRequestsCollection.find(query).toArray();
//             res.send(result);
//         });

//         // request cancel
//         app.delete("/adoption-requests/:id", async (req, res) => {
//             const { id } = req.params;
//             const query = { _id: new ObjectId(id) };
//             const result = await adoptionRequestsCollection.deleteOne(query);
//             res.send(result);
//         });


//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {
//         // Ensures that the client will close when you finish/error
//         // await client.close();
//     }
// }
// run().catch(console.dir);



// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`);
// });










const express = require('express');
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 8000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const petsCollection = db.collection("pet_collection");
        const adoptionRequestsCollection = db.collection("adoption_requests");

        // ── PETS ──────────────────────────────────────────

        // সব pets অথবা ownerEmail দিয়ে filter
        app.get("/pets", async (req, res) => {
            const { ownerEmail } = req.query;
            const query = ownerEmail ? { ownerEmail } : {};
            const result = await petsCollection.find(query).toArray();
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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});