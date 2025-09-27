const router = require('express').Router();
const { randomUUID } = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/user.model');
const https = require('https');

const SQUARE_ENVIRONMENT = (process.env.SQUARE_ENVIRONMENT || 'sandbox').toLowerCase();
const SQUARE_API_HOST = SQUARE_ENVIRONMENT === 'production' ? 'connect.squareup.com' : 'connect.squareupsandbox.com';
const SQUARE_API_VERSION = process.env.SQUARE_API_VERSION || '2025-08-20';
const SQUARE_APPLICATION_ID = process.env.SQUARE_APPLICATION_ID || process.env.SQUARE_SANDBOX_APPLICATION_ID;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || process.env.SQUARE_SANDBOX_LOCATION_ID;

const SQUARE_ACCESS_TOKEN =
    process.env.SQUARE_ACCESS_TOKEN ||
    (SQUARE_ENVIRONMENT === 'production' ? process.env.SQUARE_PRODUCTION_ACCESS_TOKEN : process.env.SQUARE_SANDBOX_ACCESS_TOKEN);

if (!SQUARE_ACCESS_TOKEN) {
    throw new Error("FATAL: Square access token is not defined for the current environment.");
}

if (!SQUARE_APPLICATION_ID || !SQUARE_LOCATION_ID) {
    console.warn('WARNING: Square configuration missing - SQUARE_APPLICATION_ID and SQUARE_LOCATION_ID are required for the client integration. The /api/payments/config endpoint will return 503 until they are set.');
}

// Square API helper function
function makeSquareRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SQUARE_API_HOST,
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Square-Version': SQUARE_API_VERSION
            }
        };

        if (body) {
            const bodyString = JSON.stringify(body);
            options.headers['Content-Length'] = Buffer.byteLength(bodyString);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ result: response });
                    } else {
                        reject({ statusCode: res.statusCode, result: response });
                    }
                } catch (error) {
                    reject({ error: 'Failed to parse response', data });
                }
            });
        });

        req.on('error', (error) => {
            reject({ error });
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

// Verify Square API connection
console.log('Square API initialized with token length:', SQUARE_ACCESS_TOKEN?.length);
console.log('Square API environment:', SQUARE_ENVIRONMENT);
console.log('Square API host:', SQUARE_API_HOST);

// Test Square API connection
(async () => {
    try {
        console.log('Testing Square API connection...');
        
        // Test locations endpoint
        const { result } = await makeSquareRequest('/v2/locations');
        console.log('✓ Square API connection successful');
        console.log('Available locations:', result.locations?.length || 0);
        if (result.locations?.[0]) {
            console.log('First location ID:', result.locations[0].id);
            console.log('Location name:', result.locations[0].name);
        }
    } catch (error) {
        console.error('✗ Square API connection failed:');
        console.error('Error details:', error.result || error.error || error.message);
        console.error('Status code:', error.statusCode);
    }
})();


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

        // Create Square customer if needed
        if (!squareCustomerId) {
            const { result: { customer } } = await makeSquareRequest('/v2/customers', 'POST', {
                idempotency_key: randomUUID(),
                given_name: user.username,
                email_address: user.email,
            });
            squareCustomerId = customer.id;
            user.squareCustomerId = squareCustomerId;
            await user.save();
        }

        const { result: { card } } = await makeSquareRequest('/v2/cards', 'POST', {
            idempotency_key: randomUUID(),
            source_id: sourceId,
            card: { customer_id: squareCustomerId },
        });

        // Update user's hasCardOnFile flag
        user.hasCardOnFile = true;
        await user.save();

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

router.get('/config', auth, (req, res) => {
    if (!SQUARE_APPLICATION_ID || !SQUARE_LOCATION_ID) {
        return res.status(503).json({ msg: 'Square configuration is not available. Please contact support.' });
    }

    res.json({
        environment: SQUARE_ENVIRONMENT,
        appId: SQUARE_APPLICATION_ID,
        locationId: SQUARE_LOCATION_ID,
    });
});

module.exports = router;