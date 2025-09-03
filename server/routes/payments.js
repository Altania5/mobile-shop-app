const router = require('express').Router();
const { randomUUID } = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/user.model');
const { SquareClient, SquareEnvironment } = require('square');

if (!process.env.SQUARE_ACCESS_TOKEN) {
    throw new Error("FATAL: SQUARE_ACCESS_TOKEN is not defined in your .env file.");
}

// Initialize the client. This part is correct.
const client = new SquareClient({
    environment: process.env.NODE_ENV === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
});


router.post('/save-card', auth, async (req, res) => {
    const { sourceId } = req.body;
    const userId = req.user.id;

    if (!sourceId) {
        return res.status(400).json({ msg: 'A payment source ID is required.' });
    }

    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }
        
        let squareCustomerId = user.squareCustomerId;

        // Use the client directly instead of destructuring
        if (!squareCustomerId) {
            const { result: { customer } } = await client.customersApi.createCustomer({
                idempotencyKey: randomUUID(),
                givenName: user.username,
                emailAddress: user.email,
            });
            squareCustomerId = customer.id;
            user.squareCustomerId = squareCustomerId;
            await user.save();
        }

        const { result: { card } } = await client.cardsApi.createCard({
            idempotencyKey: randomUUID(),
            sourceId: sourceId,
            card: { customerId: squareCustomerId },
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
        console.error("--- Full Square API Error ---");
        console.error(error.result || error.body || error);
        console.error("-----------------------------");
        res.status(500).json({ msg: 'Failed to save card. Please try again.' });
    }
});

module.exports = router;