const router = require('express').Router();
const axios = require('axios');

// @route   GET /api/google-reviews
// @desc    Get Google reviews for the business
// @access  Public
router.get('/', async (req, res) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return res.status(500).json({ msg: 'Google API key or Place ID is not configured on the server.' });
  }

  // THE FIX: Added '&reviews_sort=newest' to the end of the URL
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&reviews_sort=newest&key=${apiKey}`;

  try {
    const response = await axios.get(url);

    // ADDED: Detailed logging to see the raw response from Google
    console.log("--- Full Google API Response ---");
    console.log(JSON.stringify(response.data, null, 2));
    console.log("--------------------------------");

    if (response.data.result && response.data.result.reviews) {
      console.log(`Successfully fetched ${response.data.result.reviews.length} review(s).`);
      res.json(response.data.result.reviews);
    } else {
      console.log("No reviews found in the Google API response.");
      res.json([]);
    }
  } catch (err) {
    console.error("Google Reviews fetch error:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch Google reviews.' });
  }
});

module.exports = router;