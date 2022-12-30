const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const bcrypt = require('bcrypt');


const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yxjl2sj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const usersCollection = client.db('celloscope').collection('users');

        // users

        app.post('/users', async (req, res) => {
            const password = req.body.password;
            bcrypt.hash(password, 10, async function (err, hash) {
                if (err) {
                    res.status(400).json({
                        msg: "Something Wrong, Try Later!",
                        results: err
                    });
                }
                const { userId, mobileNo } = req.body;
                const user = { userId, mobileNo, hash };
                const result = await usersCollection.insertOne(user);
                res.send(result);
            });

        })

        app.patch('/login/:id', async (req, res) => {
            const id = req.params.id;
            const currentUser = await usersCollection.findOne({ userId: id });
            const password = req.body.password;
            bcrypt.compare(password, currentUser.hash, function (err, result) {
                res.send(result)
            });
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.patch('/user/:id', async (req, res) => {
            const id = req.params.id;
            const password = req.body.password;
            bcrypt.hash(password, 10, async function (err, hash) {
                if (err) {
                    res.status(400).json({
                        msg: "Something Wrong, Try Later!",
                        results: err
                    });
                }
                const query = { userId: id }
                const updatedDoc = {
                    $set: {
                        hash
                    }
                }
                const result = await usersCollection.updateOne(query, updatedDoc);
                res.send(result);
            });

        })


    }
    finally {

    }
}

run().catch(e => console.error(e));


app.get('/', async (req, res) => {
    res.send('celloscope server is running');
})

app.listen(port, () => console.log(`celloscope server running on ${port}`))