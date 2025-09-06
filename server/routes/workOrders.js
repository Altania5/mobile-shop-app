const express = require('express');
const router = express.Router();
const WorkOrder = require('../models/WorkOrder');
const Booking = require('../models/Booking');
const ServiceHelpForm = require('../models/ServiceHelpForm');
const adminAuth = require('../middleware/adminAuth');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// @route   GET /api/work-orders
// @desc    Get all work orders
// @access  Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, search, limit = 20, skip = 0 } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { workOrderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'vehicle.make': { $regex: search, $options: 'i' } },
        { 'vehicle.model': { $regex: search, $options: 'i' } }
      ];
    }
    
    const workOrders = await WorkOrder.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('relatedBooking')
      .populate('relatedServiceHelp')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await WorkOrder.countDocuments(query);
    
    res.json({
      workOrders,
      total,
      hasMore: (parseInt(skip) + parseInt(limit)) < total
    });
  } catch (err) {
    console.error('Error fetching work orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/work-orders/:id
// @desc    Get work order by ID
// @access  Admin
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('relatedBooking')
      .populate('relatedServiceHelp');
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    res.json(workOrder);
  } catch (err) {
    console.error('Error fetching work order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/work-orders
// @desc    Create new work order
// @access  Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    const workOrder = new WorkOrder({
      ...req.body,
      createdBy: req.user.id
    });
    
    await workOrder.save();
    
    const populatedWorkOrder = await WorkOrder.findById(workOrder._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('relatedBooking')
      .populate('relatedServiceHelp');
    
    res.status(201).json(populatedWorkOrder);
  } catch (err) {
    console.error('Error creating work order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/work-orders/from-booking/:bookingId
// @desc    Create work order from booking
// @access  Admin
router.post('/from-booking/:bookingId', adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const workOrder = new WorkOrder({
      customer: {
        name: `${booking.firstName} ${booking.lastName}`,
        email: booking.email,
        phone: booking.phone,
        address: {
          street: booking.address || '',
          city: booking.city || '',
          state: booking.state || '',
          zipCode: booking.zipCode || ''
        }
      },
      vehicle: {
        year: booking.vehicleYear || '',
        make: booking.vehicleMake || '',
        model: booking.vehicleModel || '',
        vin: booking.vehicleVin || '',
        licensePlate: booking.vehicleLicense || '',
        mileage: booking.vehicleMileage || '',
        color: booking.vehicleColor || ''
      },
      serviceDetails: {
        description: booking.service || 'Professional Service',
        customerComplaints: booking.notes || '',
        diagnosis: '',
        workPerformed: '',
        recommendations: ''
      },
      scheduledDate: booking.date,
      relatedBooking: booking._id,
      createdBy: req.user.id,
      ...req.body // Allow overriding any fields
    });
    
    await workOrder.save();
    
    const populatedWorkOrder = await WorkOrder.findById(workOrder._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('relatedBooking')
      .populate('relatedServiceHelp');
    
    res.status(201).json(populatedWorkOrder);
  } catch (err) {
    console.error('Error creating work order from booking:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/work-orders/from-service-help/:serviceHelpId
// @desc    Create work order from service help form
// @access  Admin
router.post('/from-service-help/:serviceHelpId', adminAuth, async (req, res) => {
  try {
    const serviceHelp = await ServiceHelpForm.findById(req.params.serviceHelpId);
    if (!serviceHelp) {
      return res.status(404).json({ message: 'Service help form not found' });
    }
    
    const workOrder = new WorkOrder({
      customer: {
        name: serviceHelp.name,
        email: serviceHelp.email,
        phone: serviceHelp.phone,
        address: {
          street: serviceHelp.address || '',
          city: '',
          state: '',
          zipCode: ''
        }
      },
      vehicle: {
        year: serviceHelp.vehicleYear || '',
        make: serviceHelp.vehicleMake || '',
        model: serviceHelp.vehicleModel || '',
        vin: '',
        licensePlate: '',
        mileage: '',
        color: ''
      },
      serviceDetails: {
        description: 'Custom Service Request',
        customerComplaints: serviceHelp.issue || '',
        diagnosis: '',
        workPerformed: '',
        recommendations: ''
      },
      relatedServiceHelp: serviceHelp._id,
      createdBy: req.user.id,
      ...req.body // Allow overriding any fields
    });
    
    await workOrder.save();
    
    const populatedWorkOrder = await WorkOrder.findById(workOrder._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('relatedBooking')
      .populate('relatedServiceHelp');
    
    res.status(201).json(populatedWorkOrder);
  } catch (err) {
    console.error('Error creating work order from service help:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/work-orders/:id
// @desc    Update work order
// @access  Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('relatedBooking')
      .populate('relatedServiceHelp');
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    res.json(workOrder);
  } catch (err) {
    console.error('Error updating work order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/work-orders/:id
// @desc    Delete work order
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByIdAndDelete(req.params.id);
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    res.json({ message: 'Work order deleted successfully' });
  } catch (err) {
    console.error('Error deleting work order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/work-orders/:id/send-email
// @desc    Send work order via email
// @access  Admin
router.post('/:id/send-email', adminAuth, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Generate PDF
    const pdfBuffer = await generateWorkOrderPDF(workOrder);
    
    // Email content
    const emailContent = `
      <h2>Work Order: ${workOrder.workOrderNumber}</h2>
      <p>Dear ${workOrder.customer.name},</p>
      <p>Please find attached your work order for the automotive services requested.</p>
      <p><strong>Vehicle:</strong> ${workOrder.vehicle.year} ${workOrder.vehicle.make} ${workOrder.vehicle.model}</p>
      <p><strong>Service Description:</strong> ${workOrder.serviceDetails.description}</p>
      <p><strong>Status:</strong> ${workOrder.status.replace('_', ' ').toUpperCase()}</p>
      ${workOrder.pricing.totalAmount > 0 ? `<p><strong>Total Amount:</strong> $${workOrder.pricing.totalAmount.toFixed(2)}</p>` : ''}
      <br>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>Mobile Shop Team</p>
    `;
    
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: workOrder.customer.email,
      subject: `Work Order ${workOrder.workOrderNumber} - Mobile Shop`,
      html: emailContent,
      attachments: [
        {
          filename: `WorkOrder-${workOrder.workOrderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
    
    // Update work order
    workOrder.emailSent = true;
    workOrder.emailSentDate = new Date();
    await workOrder.save();
    
    res.json({ message: 'Work order sent successfully' });
  } catch (err) {
    console.error('Error sending work order email:', err);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// @route   GET /api/work-orders/:id/pdf
// @desc    Generate and download work order PDF
// @access  Admin
router.get('/:id/pdf', adminAuth, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    const pdfBuffer = await generateWorkOrderPDF(workOrder);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=WorkOrder-${workOrder.workOrderNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

// Helper function to generate PDF
async function generateWorkOrderPDF(workOrder) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Header
      doc.fontSize(20).text('WORK ORDER', { align: 'center' });
      doc.moveDown();
      
      // Company Info
      doc.fontSize(14).text('Mobile Shop', { align: 'left' });
      doc.fontSize(10).text('Professional Mobile Automotive Service');
      doc.text('Email: contact@mobileshop.com | Phone: (555) 123-4567');
      doc.moveDown();
      
      // Work Order Details
      doc.fontSize(12).text(`Work Order #: ${workOrder.workOrderNumber}`, { align: 'right' });
      doc.text(`Date: ${new Date(workOrder.createdAt).toLocaleDateString()}`, { align: 'right' });
      doc.text(`Status: ${workOrder.status.replace('_', ' ').toUpperCase()}`, { align: 'right' });
      doc.moveDown();
      
      // Customer Information
      doc.fontSize(14).text('CUSTOMER INFORMATION', { underline: true });
      doc.fontSize(10);
      doc.text(`Name: ${workOrder.customer.name}`);
      doc.text(`Email: ${workOrder.customer.email}`);
      doc.text(`Phone: ${workOrder.customer.phone}`);
      if (workOrder.customer.address.street) {
        doc.text(`Address: ${workOrder.customer.address.street}`);
        doc.text(`${workOrder.customer.address.city}, ${workOrder.customer.address.state} ${workOrder.customer.address.zipCode}`);
      }
      doc.moveDown();
      
      // Vehicle Information
      doc.fontSize(14).text('VEHICLE INFORMATION', { underline: true });
      doc.fontSize(10);
      doc.text(`Vehicle: ${workOrder.vehicle.year} ${workOrder.vehicle.make} ${workOrder.vehicle.model}`);
      if (workOrder.vehicle.vin) doc.text(`VIN: ${workOrder.vehicle.vin}`);
      if (workOrder.vehicle.licensePlate) doc.text(`License Plate: ${workOrder.vehicle.licensePlate}`);
      if (workOrder.vehicle.mileage) doc.text(`Mileage: ${workOrder.vehicle.mileage}`);
      doc.moveDown();
      
      // Service Details
      doc.fontSize(14).text('SERVICE DETAILS', { underline: true });
      doc.fontSize(10);
      doc.text(`Description: ${workOrder.serviceDetails.description}`);
      if (workOrder.serviceDetails.customerComplaints) {
        doc.text(`Customer Complaints: ${workOrder.serviceDetails.customerComplaints}`);
      }
      if (workOrder.serviceDetails.diagnosis) {
        doc.text(`Diagnosis: ${workOrder.serviceDetails.diagnosis}`);
      }
      if (workOrder.serviceDetails.workPerformed) {
        doc.text(`Work Performed: ${workOrder.serviceDetails.workPerformed}`);
      }
      doc.moveDown();
      
      // Labor Items
      if (workOrder.laborItems.length > 0) {
        doc.fontSize(14).text('LABOR', { underline: true });
        doc.fontSize(10);
        workOrder.laborItems.forEach(item => {
          doc.text(`${item.description}: ${item.hours} hrs @ $${item.hourlyRate}/hr = $${item.total.toFixed(2)}`);
        });
        doc.moveDown();
      }
      
      // Parts Items
      if (workOrder.partItems.length > 0) {
        doc.fontSize(14).text('PARTS', { underline: true });
        doc.fontSize(10);
        workOrder.partItems.forEach(item => {
          doc.text(`${item.description}: ${item.quantity} @ $${item.unitPrice.toFixed(2)} = $${item.total.toFixed(2)}`);
        });
        doc.moveDown();
      }
      
      // Totals
      if (workOrder.pricing.totalAmount > 0) {
        doc.fontSize(12).text('TOTALS', { underline: true });
        doc.text(`Subtotal: $${workOrder.pricing.subtotal.toFixed(2)}`, { align: 'right' });
        doc.text(`Tax (${(workOrder.pricing.taxRate * 100).toFixed(1)}%): $${workOrder.pricing.taxAmount.toFixed(2)}`, { align: 'right' });
        doc.fontSize(14).text(`TOTAL: $${workOrder.pricing.totalAmount.toFixed(2)}`, { align: 'right' });
      }
      
      // Footer
      doc.fontSize(8).text('Thank you for choosing Mobile Shop for your automotive needs!', 50, doc.page.height - 50);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = router;
