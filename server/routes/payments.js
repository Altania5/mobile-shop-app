const router = require('express').Router();
const { Client, Environment } = require('square');
const { randomUUID } = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/user.model');

let squareClient;
try {
    const { Client, Environment } = require('square');
    
    // Check if the Environment variable exists before using it
    if (!Environment) {
        throw new Error("Square SDK's Environment object is undefined. Please check your installation.");
    }

    squareClient = new Client({
        environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
    });

} catch (e) {
    console.error("FATAL: Failed to initialize Square Client.", e.message);
    console.error("Please ensure the 'square' package is installed correctly in the '/server' directory by running 'npm install square'.");
    // We will not proceed to define routes if the client fails to load.
    module.exports = router; 
    return; // Stop execution of this file
}

// // Initialize Square Client
// const squareClient = new Client({
//     environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
//     accessToken: process.env.SQUARE_ACCESS_TOKEN,
// });

// @route   POST /api/payments/save-card
// @desc    Create a Square customer and save a card on file
// @access  Private
router.post('/save-card', auth, async (req, res) => {
    const { sourceId } = req.body; // This is the nonce from the client
    const userId = req.user.id;

    if (!sourceId) {
        return res.status(400).json({ msg: 'A payment source ID is required.' });
    }

    try {
        let user = await User.findById(userId);
        let squareCustomerId = user.squareCustomerId;

        // 1. Create a Square Customer if one doesn't exist
        if (!squareCustomerId) {
            const { result: { customer } } = await squareClient.customersApi.createCustomer({
                idempotencyKey: randomUUID(),
                givenName: user.username,
                emailAddress: user.email,
            });
            squareCustomerId = customer.id;

            // Save the new Square Customer ID to our database
            user.squareCustomerId = squareCustomerId;
            await user.save();
        }

        // 2. Save the card on file for the customer
        const { result: { card } } = await squareClient.cardsApi.createCard({
            idempotencyKey: randomUUID(),
            sourceId: sourceId,
            card: {
                customerId: squareCustomerId,
            },
        });

        res.status(200).json({
            msg: `Card ending in ${card.last4} saved successfully.`,
            card: {
                id: card.id,
                brand: card.cardBrand,
                last4: card.last4,
            }
        });

    } catch (error) {
        console.error("Square API Error:", error);
        res.status(500).json({ msg: 'Failed to save card. Please try again.' });
    }
});

module.exports = router;