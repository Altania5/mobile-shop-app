const router = require('express').Router();
const axios = require('axios');

const NHTSA_API_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

// @route   GET /api/vehicles/makes
// @desc    Get all car makes from NHTSA
// @access  Public
router.get('/makes', async (req, res) => {
    try {
        const response = await axios.get(`${NHTSA_API_BASE_URL}/GetAllMakes?format=json`);
        const makes = response.data.Results.map(make => make.Make_Name);
        res.json(makes);
    } catch (error) {
        res.status(500).json({ msg: 'Error fetching vehicle makes.' });
    }
});

// @route   GET /api/vehicles/models/:make
// @desc    Get models for a specific make
// @access  Public
router.get('/models/:make', async (req, res) => {
    try {
        const make = req.params.make;
        const response = await axios.get(`${NHTSA_API_BASE_URL}/GetModelsForMake/${make}?format=json`);
        const models = response.data.Results.map(model => model.Model_Name);
        res.json(models);
    } catch (error) {
        res.status(500).json({ msg: 'Error fetching vehicle models.' });
    }
});

module.exports = router;