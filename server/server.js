const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
const uri = process.env.ATLAS_URI;
mongoose.connect(uri)
  .then(() => {
    console.log("MongoDB database connection established successfully");
  })
  .catch(err => {
    console.error("!!! MongoDB connection error:", err);
    process.exit(1);
  });

// API Routes
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

const servicesRouter = require('./routes/services');
app.use('/api/services', servicesRouter);

const bookingsRouter = require('./routes/bookings');
app.use('/api/bookings', bookingsRouter);

const testimonialsRouter = require('./routes/testimonials');
app.use('/api/testimonials', testimonialsRouter);

const postsRouter = require('./routes/posts');
app.use('/api/posts', postsRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});