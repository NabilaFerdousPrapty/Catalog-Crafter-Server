require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');
app.use(cors({
  origin: ["http://localhost:5173",
    "http://localhost:5174",
    


  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
 ///middleware
app.use(express.json());
app.use(cors());

const verifyToken = (req, res, next) => {
  if (!req?.headers?.authorization) {
      return res.status(401).send({ message: 'Unauthorized Access' });
  }
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
      if (error) {
          return res.status(401).send({ message: 'Unauthorized Access' });
      }
      req.decoded = decoded
      next();
  })

}
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pflyccd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const CatalogDB = client.db("CatalogCrafter");
const productsCollection = CatalogDB.collection("products");
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Catalog crafter server is running');
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
app.post('/jwt', async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d'
  })
  res.send({ token });

})
app.get('/products', async (req, res) => {
  const products = await productsCollection.find({}).toArray();
  res.send(products);
});
app.get('/products/:id', async (req, res) => {
  const product = await productsCollection.findOne({ _id: req.params.id });
  res.send(product);
}
);