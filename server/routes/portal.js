const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user.model');
const WorkOrder = require('../models/WorkOrder');

// GET /api/portal/dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email firstName lastName');
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    const workOrders = await WorkOrder.find({
      'customer.email': { $regex: new RegExp(`^${user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    }).sort({ createdAt: -1 }).lean();

    const STATUS_MAP = {
      draft: 'Pending',
      pending_approval: 'Awaiting Approval',
      approved: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Complete',
      billed: 'Complete',
      cancelled: 'Cancelled',
    };

    const jobs = workOrders
      .filter(wo => !['cancelled', 'draft'].includes(wo.status))
      .map(wo => ({
        _id: wo._id,
        workOrderNumber: wo.workOrderNumber,
        status: wo.status,
        displayStatus: STATUS_MAP[wo.status] || wo.status,
        service: wo.serviceDetails?.description || '',
        vehicle: `${wo.vehicle?.year || ''} ${wo.vehicle?.make || ''} ${wo.vehicle?.model || ''}`.trim(),
        scheduledDate: wo.scheduledDate,
        completedDate: wo.completedDate,
        createdAt: wo.createdAt,
      }));

    // Unique vehicles from all work orders
    const vehicleMap = new Map();
    workOrders.forEach(wo => {
      if (!wo.vehicle?.make) return;
      const key = `${wo.vehicle.year}-${wo.vehicle.make}-${wo.vehicle.model}-${wo.vehicle.vin || ''}`;
      const existing = vehicleMap.get(key);
      const woDate = wo.completedDate || wo.createdAt;
      if (!existing || new Date(woDate) > new Date(existing.lastServiceDate)) {
        vehicleMap.set(key, {
          year: wo.vehicle.year,
          make: wo.vehicle.make,
          model: wo.vehicle.model,
          vin: wo.vehicle.vin || null,
          color: wo.vehicle.color || null,
          jobCount: (existing?.jobCount || 0) + 1,
          lastServiceDate: woDate,
        });
      } else {
        existing.jobCount += 1;
      }
    });
    const vehicles = Array.from(vehicleMap.values());

    const invoices = workOrders
      .filter(wo => wo.invoice && wo.invoice.status !== 'none')
      .map(wo => ({
        _id: wo._id,
        workOrderNumber: wo.workOrderNumber,
        invoiceNumber: wo.invoice.number || wo.workOrderNumber,
        service: wo.serviceDetails?.description || '',
        vehicle: `${wo.vehicle?.year || ''} ${wo.vehicle?.make || ''} ${wo.vehicle?.model || ''}`.trim(),
        total: wo.invoice.total ?? wo.pricing?.totalAmount ?? 0,
        status: wo.invoice.status,
        squareInvoiceUrl: wo.invoice.squareInvoiceUrl || null,
        sentAt: wo.invoice.sentAt,
        paidAt: wo.invoice.paidAt,
      }));

    res.json({ jobs, vehicles, invoices });
  } catch (err) {
    console.error('Portal dashboard error:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

module.exports = router;
