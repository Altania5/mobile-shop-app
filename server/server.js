const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const uri = process.env.ATLAS_URI;
mongoose.connect(uri)
  .then(() => {
    console.log("MongoDB database connection established successfully");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process if we can't connect to the DB
  });

// API Routes
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});