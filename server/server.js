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
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// --- ROUTE SETUP ---
console.log('Loading routes...');
// THE FIX: Added 'comments' to the array of routes to be loaded by the server.
const routes = ['users', 'services', 'bookings', 'testimonials', 'posts', 'contact', 'vehicleData', 'googleReviews', 'comments'];
routes.forEach(route => {
    try {
        const router = require(`./routes/${route}`);
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
