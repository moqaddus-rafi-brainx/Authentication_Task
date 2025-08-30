const express = require('express');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const connectDB=require('./config/db');

const app = express();
const PORT = process.env.PORT;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);

//Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
