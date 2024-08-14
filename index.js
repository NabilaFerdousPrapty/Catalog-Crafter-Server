require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

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



app.get('/', (req, res) => {
  res.send('Catalog crafter server is running');
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});