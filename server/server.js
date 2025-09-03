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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    'payments'
];
routes.forEach(route => {
    try {
        const router = require(`./routes/${route}`);
        // This makes the API endpoint match the file name, e.g., /api/service-request
        app.use(`/api/${route}`, router);
        console.log(`Loading router: ./routes/${route}`);
    } catch (error) {
        console.error(`Error loading router for ${route}:`, error);
    }
});


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