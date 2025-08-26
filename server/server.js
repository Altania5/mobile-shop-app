const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- The wildcard route fix you already have ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

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

// --- DEBUGGING LOGS START HERE ---

// API Routes
console.log("Loading router: ./routes/users");
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

console.log("Loading router: ./routes/services");
const servicesRouter = require('./routes/services');
app.use('/api/services', servicesRouter);

console.log("Loading router: ./routes/bookings");
const bookingsRouter = require('./routes/bookings');
app.use('/api/bookings', bookingsRouter);

console.log("Loading router: ./routes/testimonials");
const testimonialsRouter = require('./routes/testimonials');
app.use('/api/testimonials', testimonialsRouter);

console.log("Loading router: ./routes/posts");
const postsRouter = require('./routes/posts');
app.use('/api/posts', postsRouter);

console.log("Loading router: ./routes/googleReviews");
const googleReviewsRouter = require('./routes/googleReviews');
app.use('/api/google-reviews', googleReviewsRouter);

console.log("Loading router: ./routes/contact");
const contactRouter = require('./routes/contact');
app.use('/api/contact', contactRouter);

console.log("Loading router: ./routes/vehicleData");
const vehicleDataRouter = require('./routes/vehicleData');
app.use('/api/vehicles', vehicleDataRouter);

console.log("--- All routers loaded successfully. Starting server... ---");

// --- DEBUGGING LOGS END HERE ---


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});