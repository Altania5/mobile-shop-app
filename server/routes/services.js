const router = require('express').Router();
let Service = require('../models/service.model');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/services
// @desc    Get all services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/services/:id
// @desc    Get a single service by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/services
// @desc    Create a new service
// @access  Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;
    const newService = new Service({ name, description, price, duration });
    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   PUT /api/services/:id
// @desc    Update a service
// @access  Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedService) return res.status(404).json({ msg: 'Service not found' });
    res.json(updatedService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete a service
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService) return res.status(404).json({ msg: 'Service not found' });
    res.json({ msg: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;