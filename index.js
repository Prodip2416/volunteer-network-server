const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.bbk7z.mongodb.net:27017,cluster0-shard-00-01.bbk7z.mongodb.net:27017,cluster0-shard-00-02.bbk7z.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-1227kd-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const eventCollections = client.db(process.env.DB_NAME).collection("events");
    const volunteerCollections = client.db(process.env.DB_NAME).collection("volunteers");

    app.get('/events', (req, res) => { // get all events
        eventCollections.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/addEvent', (req, res) => { // add single event
        eventCollections.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.get('/events/:key', (req, res) => { // get single event     
        eventCollections.find({ _id: ObjectID(req.params.key) })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    });

    app.get('/getVolunteers', (req, res) => { // get all volunteers
        volunteerCollections.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/addVolunteer', (req, res) => {
        volunteerCollections.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.get('/getEventsByUser', (req, res) => { // get all events ny user
        const userEmail = req.query.email;
        volunteerCollections.find({ email: userEmail })
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.delete('/delete/:id', (req, res) => {
        volunteerCollections.deleteOne({ _id: ObjectID(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
    })

});

app.listen(process.env.PORT || 5000);
