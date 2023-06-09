const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3uy5gri.mongodb.net/?retryWrites=true&w=majority`;

async function run() {
  try {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('summer_camp_db');
    const usersCollection = db.collection('users');
    const classesCollection = db.collection('classes');

    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log('New user:', user);

      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: 'User already exists' });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get('/popular_classes', async (req, res) => {
      try {
        const popularClasses = await classesCollection
          .find()
          .sort({ studentsCount: -1 })
          .limit(6)
          .toArray();

        res.json(popularClasses);
      } catch (error) {
        console.error('Error retrieving popular classes:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

run().catch(console.dir);
