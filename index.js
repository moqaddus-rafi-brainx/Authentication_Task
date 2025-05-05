const express = require('express');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);

const uri = process.env.CONNECTION_STRING;

// Connect to MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB via Mongoose'))
.catch(err => console.error('MongoDB connection error:', err));


app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
