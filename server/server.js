const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');


require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('../uploads', express.static(path.join(__dirname, 'uploads')));

// --- DATABASE CONNECTION ---
const uri = process.env.ATLAS_URI;
mongoose.connect(uri)
  .then(() => {
    console.log("MongoDB database connection established successfully");
  })
  .catch(err => {
    console.error("!!! MongoDB connection error:", err);
    process.exit(1);
  });

// --- ROUTE SETUP ---
console.log('Loading routes...');
const routes = [
    'users', 
    'services', 
    'bookings', 
    'testimonials', 
    'posts', 
    'contact', 
    'vehicleData', 
    'googleReviews', 
    'comments',
    'service-request',
    'payments',
    'workOrders',
    'timeSlots',
    'admin'
];
routes.forEach(route => {
    try {
        console.log(`Attempting to load route: ./routes/${route}`);
        const router = require(`./routes/${route}`);
        app.use(`/api/${route}`, router);
        console.log(`✓ Successfully loaded route: /api/${route}`);
    } catch (error) {
        console.error(`✗ Error loading router for ${route}:`, error.message);
        console.error(`Full error:`, error);
    }
});

app.use('/api/google-reviews', require('./routes/googleReviews'));



// --- SERVE FRONTEND IN PRODUCTION ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// --- START SERVER ---
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});