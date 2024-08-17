require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');
app.use(cors({
  origin: ["http://localhost:5173",
    "http://localhost:5174",
    "https://catalog-crafter.web.app",
    "https://catalog-crafter.firebaseapp.com"
    
    


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
    
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
app.get('/products', verifyToken, async (req, res) => {
  const page = parseInt(req.query.page);
  const size = parseInt(req.query.limit);
  const search = req.query.search || "";
  const brand = req.query.brand || "";
  const category = req.query.category || "";
  const priceRange = req.query.priceRange || "";
  const priceSort = req.query.priceSort || "";
  const dateSort = req.query.dateSort || "";

  // Parsing the price range
  let priceQuery = {};
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split('-').map(Number);
    priceQuery = { price: { $gte: minPrice, $lte: maxPrice } };
  }

  const query = {
    name: { $regex: search, $options: 'i' }, 
    ...(brand && { brand: { $regex: brand, $options: 'i' } }), 
    ...(category && { category: { $regex: category, $options: 'i' } }), 
    ...priceQuery 
  };

  // Sorting logic
  let sortQuery = {};
  if (priceSort) {
    sortQuery.price = priceSort === 'highToLow' ? -1 : 1;
  }
  
  if (dateSort) {
    sortQuery.createdAtDate = dateSort === 'newestFirst' ? -1 : 1;
    sortQuery.createdAtTime = dateSort === 'newestFirst' ? -1 : 1;
  }
  

  const products = await productsCollection
    .find(query)
    .sort(sortQuery)
    .skip((page - 1) * size)
    .limit(size)
    .toArray();

  res.send(products);
});



app.get('/productsCount', async (req, res) => {
  try {
      const count = await productsCollection.estimatedDocumentCount();
      res.send({ count });
  } catch (err) {
      console.error('Error fetching product count:', err);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/products/:id', async (req, res) => {
  const product = await productsCollection.findOne({ _id: req.params.id });
  res.send(product);
}
);