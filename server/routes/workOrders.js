const express = require('express');
const router = express.Router();
const WorkOrder = require('../models/WorkOrder');
const Booking = require('../models/booking.model');
const ServiceHelpForm = require('../models/ServiceHelpForm');
const adminAuth = require('../middleware/adminAuth');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// @route   GET /api/workOrders
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
    
    // Debug logging for acknowledgment status
    workOrders.forEach(wo => {
      if (wo.acknowledgment?.isRequired || wo.acknowledgment?.isAcknowledged) {
        console.log(`WorkOrder ${wo.workOrderNumber} acknowledgment:`, {
          isRequired: wo.acknowledgment.isRequired,
          isAcknowledged: wo.acknowledgment.isAcknowledged,
          acknowledgmentDate: wo.acknowledgment.acknowledgmentDate,
          hasToken: !!wo.acknowledgment.acknowledgmentToken
        });
      }
    });
    
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

// @route   GET /api/workOrders/:id
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

// @route   POST /api/workOrders
// @desc    Create new work order
// @access  Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    console.log('Creating work order with data:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', req.user.id);
    
    const workOrder = new WorkOrder({
      ...req.body,
      createdBy: req.user.id
    });
    
    console.log('Work order before save:', JSON.stringify(workOrder.toObject(), null, 2));
    await workOrder.save();
    console.log('Work order saved successfully with number:', workOrder.workOrderNumber);
    
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

// @route   POST /api/workOrders/from-booking/:bookingId
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
    const transporter = nodemailer.createTransport({
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
    
    // Generate acknowledgment token and create acknowledgment link
    const acknowledgmentToken = workOrder.generateAcknowledgmentToken();
    await workOrder.save();
    
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL || 'https://hardworkmobile-0bf9805ba163.herokuapp.com'
      : 'http://localhost:3000';
    const acknowledgmentLink = `${baseUrl}/work-order/acknowledge/${acknowledgmentToken}`;
    const downloadLink = `${baseUrl}/api/workOrders/public/${workOrder.workOrderNumber}/pdf?email=${encodeURIComponent(workOrder.customer.email)}`;
    
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #ff8c42; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .work-order-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { font-weight: bold; color: #555; }
          .acknowledge-button { 
            display: inline-block; 
            padding: 15px 30px; 
            background-color: #28a745; 
            color: white; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 10px;
            font-weight: bold;
            font-size: 16px;
          }
          .download-button { 
            display: inline-block; 
            padding: 12px 25px; 
            background-color: #ff8c42; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 10px;
            font-weight: bold;
          }
          .footer { text-align: center; color: #777; font-size: 12px; margin-top: 30px; }
          .important { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
          .buttons-section { text-align: center; margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Mobile Shop</h1>
          <p>Professional Mobile Automotive Service</p>
        </div>
        
        <div class="content">
          <h2>Work Order: ${workOrder.workOrderNumber}</h2>
          <p>Dear <strong>${workOrder.customer.name}</strong>,</p>
          
          <p>Your work order has been completed and requires your acknowledgment. Please review the details below.</p>
          
          <div class="work-order-details">
            <h3>Service Details</h3>
            <div class="detail-row">
              <span class="label">Vehicle:</span>
              <span>${workOrder.vehicle.year} ${workOrder.vehicle.make} ${workOrder.vehicle.model}</span>
            </div>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span>${workOrder.serviceDetails.description}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span>${workOrder.status.replace('_', ' ').toUpperCase()}</span>
            </div>
            ${workOrder.pricing.totalAmount > 0 ? `
            <div class="detail-row">
              <span class="label">Total Amount:</span>
              <span style="font-size: 18px; font-weight: bold; color: #28a745;">$${workOrder.pricing.totalAmount.toFixed(2)}</span>
            </div>` : ''}
            ${workOrder.scheduledDate ? `
            <div class="detail-row">
              <span class="label">Scheduled Date:</span>
              <span>${new Date(workOrder.scheduledDate).toLocaleDateString()}</span>
            </div>` : ''}
            ${workOrder.completedDate ? `
            <div class="detail-row">
              <span class="label">Completed Date:</span>
              <span>${new Date(workOrder.completedDate).toLocaleDateString()}</span>
            </div>` : ''}
          </div>
          
          <div class="important">
            <strong>⚠️ Action Required:</strong> Please acknowledge receipt of this work order by clicking the button below. This confirms that you have received and reviewed the completed work.
          </div>
          
          <div class="buttons-section">
            <a href="${acknowledgmentLink}" class="acknowledge-button">📋 Acknowledge Work Order</a>
            <a href="${downloadLink}" class="download-button">📄 Download PDF</a>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Click "Acknowledge Work Order" to confirm receipt and review the details</li>
            <li>You can optionally add a digital signature during the acknowledgment process</li>
            <li>Download the PDF for your records at any time</li>
            <li>The acknowledgment link will expire in 30 days</li>
          </ul>
          
          <p>If you have any questions about this work order or need to schedule additional services, please don't hesitate to contact us:</p>
          <ul>
            <li>📞 Phone: (555) 123-4567</li>
            <li>📧 Email: contact@mobileshop.com</li>
          </ul>
          
          <p>Thank you for choosing Mobile Shop for your automotive needs!</p>
          
          <div class="footer">
            <p>Mobile Shop - Professional Mobile Automotive Service<br>
            This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
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

// @route   GET /api/work-orders/public/:workOrderNumber/pdf
// @desc    Generate and download work order PDF for customers (public access)
// @access  Public
router.get('/public/:workOrderNumber/pdf', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }
    
    const workOrder = await WorkOrder.findOne({ 
      workOrderNumber: req.params.workOrderNumber,
      'customer.email': email.toLowerCase()
    });
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found or email does not match' });
    }
    
    const pdfBuffer = await generateWorkOrderPDF(workOrder);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=WorkOrder-${workOrder.workOrderNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating customer PDF:', err);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

// @route   GET /api/workOrders/acknowledge/:token
// @desc    Get work order for acknowledgment by token
// @access  Public
router.get('/acknowledge/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const workOrder = await WorkOrder.findOne({
      'acknowledgment.acknowledgmentToken': token
    });
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found or token invalid' });
    }
    
    // Check if token is valid
    if (!workOrder.isAcknowledgmentTokenValid(token)) {
      return res.status(400).json({ 
        message: 'Acknowledgment token is invalid or expired',
        expired: workOrder.acknowledgment.tokenExpiresAt < new Date(),
        alreadyAcknowledged: workOrder.acknowledgment.isAcknowledged
      });
    }
    
    // Return work order data for acknowledgment (without sensitive admin data)
    const workOrderData = {
      _id: workOrder._id,
      workOrderNumber: workOrder.workOrderNumber,
      status: workOrder.status,
      customer: workOrder.customer,
      vehicle: workOrder.vehicle,
      serviceDetails: workOrder.serviceDetails,
      laborItems: workOrder.laborItems,
      partItems: workOrder.partItems,
      pricing: workOrder.pricing,
      scheduledDate: workOrder.scheduledDate,
      completedDate: workOrder.completedDate,
      createdAt: workOrder.createdAt,
      acknowledgment: {
        isRequired: workOrder.acknowledgment.isRequired,
        isAcknowledged: workOrder.acknowledgment.isAcknowledged
      }
    };
    
    res.json(workOrderData);
  } catch (err) {
    console.error('Error fetching work order for acknowledgment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/workOrders/acknowledge/:token
// @desc    Acknowledge work order
// @access  Public
router.post('/acknowledge/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { acknowledgedBy, signature, userAgent } = req.body;
    
    if (!acknowledgedBy || !acknowledgedBy.name || !acknowledgedBy.email) {
      return res.status(400).json({ message: 'Acknowledged by name and email are required' });
    }
    
    const workOrder = await WorkOrder.findOne({
      'acknowledgment.acknowledgmentToken': token
    });
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found or token invalid' });
    }
    
    // Check if token is valid
    if (!workOrder.isAcknowledgmentTokenValid(token)) {
      return res.status(400).json({ 
        message: 'Acknowledgment token is invalid or expired',
        expired: workOrder.acknowledgment.tokenExpiresAt < new Date(),
        alreadyAcknowledged: workOrder.acknowledgment.isAcknowledged
      });
    }
    
    // Verify the acknowledging person matches the customer
    const customerEmail = workOrder.customer.email.toLowerCase();
    const acknowledgingEmail = acknowledgedBy.email.toLowerCase();
    
    if (customerEmail !== acknowledgingEmail) {
      return res.status(403).json({ 
        message: 'Email does not match the work order customer' 
      });
    }
    
    // Get client IP address
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null);
    
    // Mark as acknowledged
    const acknowledgedByData = {
      ...acknowledgedBy,
      ipAddress: ipAddress,
      userAgent: userAgent
    };
    
    workOrder.markAsAcknowledged(acknowledgedByData, signature);
    await workOrder.save();
    
    res.json({ 
      message: 'Work order acknowledged successfully',
      acknowledgmentDate: workOrder.acknowledgment.acknowledgmentDate,
      workOrderNumber: workOrder.workOrderNumber
    });
  } catch (err) {
    console.error('Error acknowledging work order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/workOrders/:id/generate-acknowledgment
// @desc    Generate acknowledgment token and send email (Admin only)
// @access  Admin
router.post('/:id/generate-acknowledgment', adminAuth, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    // Check if already acknowledged
    if (workOrder.acknowledgment?.isAcknowledged) {
      return res.status(400).json({ 
        message: 'Work order has already been acknowledged',
        acknowledgedDate: workOrder.acknowledgment.acknowledgmentDate
      });
    }
    
    // Generate acknowledgment token
    const token = workOrder.generateAcknowledgmentToken();
    await workOrder.save();
    
    // Generate acknowledgment link
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL || 'https://hardworkmobile-0bf9805ba163.herokuapp.com'
      : 'http://localhost:3000';
    const acknowledgmentLink = `${baseUrl}/work-order/acknowledge/${token}`;
    
    // Send acknowledgment email
    await sendAcknowledgmentEmail(workOrder, acknowledgmentLink);
    
    res.json({ 
      message: 'Acknowledgment link generated and sent successfully',
      acknowledgmentLink,
      tokenExpiresAt: workOrder.acknowledgment.tokenExpiresAt
    });
  } catch (err) {
    console.error('Error generating acknowledgment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to send acknowledgment email
async function sendAcknowledgmentEmail(workOrder, acknowledgmentLink) {
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #ff8c42; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background-color: #f9f9f9; }
        .work-order-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .acknowledge-button { 
          display: inline-block; 
          padding: 15px 30px; 
          background-color: #28a745; 
          color: white; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 20px 0;
          font-weight: bold;
          font-size: 16px;
        }
        .footer { text-align: center; color: #777; font-size: 12px; margin-top: 30px; }
        .important { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Mobile Shop</h1>
        <p>Professional Mobile Automotive Service</p>
      </div>
      
      <div class="content">
        <h2>Work Order Acknowledgment Required</h2>
        <p>Dear <strong>${workOrder.customer.name}</strong>,</p>
        
        <p>Your work order <strong>${workOrder.workOrderNumber}</strong> requires your acknowledgment. Please review the details below and click the acknowledgment button to confirm receipt.</p>
        
        <div class="work-order-details">
          <h3>Service Details</h3>
          <div class="detail-row">
            <span class="label">Vehicle:</span>
            <span>${workOrder.vehicle.year} ${workOrder.vehicle.make} ${workOrder.vehicle.model}</span>
          </div>
          <div class="detail-row">
            <span class="label">Service:</span>
            <span>${workOrder.serviceDetails.description}</span>
          </div>
          <div class="detail-row">
            <span class="label">Status:</span>
            <span>${workOrder.status.replace('_', ' ').toUpperCase()}</span>
          </div>
          ${workOrder.pricing.totalAmount > 0 ? `
          <div class="detail-row">
            <span class="label">Total Amount:</span>
            <span style="font-size: 18px; font-weight: bold; color: #28a745;">$${workOrder.pricing.totalAmount.toFixed(2)}</span>
          </div>` : ''}
          ${workOrder.scheduledDate ? `
          <div class="detail-row">
            <span class="label">Scheduled Date:</span>
            <span>${new Date(workOrder.scheduledDate).toLocaleDateString()}</span>
          </div>` : ''}
        </div>
        
        <div class="important">
          <strong>⚠️ Important:</strong> By clicking the acknowledgment button below, you confirm that you have received and reviewed this work order.
        </div>
        
        <div style="text-align: center;">
          <a href="${acknowledgmentLink}" class="acknowledge-button">📋 Acknowledge Work Order</a>
        </div>
        
        <p><strong>Note:</strong> This acknowledgment link will expire in 30 days. If you have any questions about this work order, please contact us:</p>
        <ul>
          <li>📞 Phone: (555) 123-4567</li>
          <li>📧 Email: contact@mobileshop.com</li>
        </ul>
        
        <p>Thank you for choosing Mobile Shop!</p>
        
        <div class="footer">
          <p>Mobile Shop - Professional Mobile Automotive Service<br>
          This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: workOrder.customer.email,
    subject: `Work Order Acknowledgment Required - ${workOrder.workOrderNumber}`,
    html: emailContent
  });
}

// Helper function to generate PDF
async function generateWorkOrderPDF(workOrder) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Add orange header bar
      doc.rect(0, 0, doc.page.width, 90).fill('#0f172a');
      
      doc.fillColor('white')
         .fontSize(26)
         .font('Helvetica-Bold')
         .text('MOBILE SHOP', 50, 25);
      
      doc.fontSize(11)
         .font('Helvetica')
         .text('Professional Mobile Automotive Service', 50, 50);
      
      doc.fontSize(10)
         .text('📧 contact@mobileshop.com  |  📞 (555) 123-4567  |  🌐 www.mobileshop.com', 50, 65);
      
      doc.fillColor('#38bdf8')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('WORK ORDER', 0, 110, { align: 'center' })
         .fillColor('black');
      
      // Reset position after header
      doc.y = 130;
      
      // Company contact info
      doc.moveDown();
      
      // Work Order Details Box
      const detailsY = doc.y;
      doc.roundedRect(doc.page.width - 220, detailsY - 5, 200, 88, 8).lineWidth(1).strokeColor('#38bdf8').stroke();
      
      doc.fontSize(11).font('Helvetica-Bold')
         .text('Work Order #', doc.page.width - 205, detailsY + 5)
         .font('Helvetica-Bold')
         .fillColor('#38bdf8')
         .text(workOrder.workOrderNumber, doc.page.width - 205, detailsY + 20, { width: 180, align: 'left' })
         .fillColor('black');
      
      doc.font('Helvetica-Bold')
         .text('Date:', doc.page.width - 190, detailsY + 20)
         .font('Helvetica')
         .text(new Date(workOrder.createdAt).toLocaleDateString(), doc.page.width - 100, detailsY + 20);
      
      doc.font('Helvetica-Bold')
         .text('Status:', doc.page.width - 190, detailsY + 35)
         .font('Helvetica')
         .fillColor('#FF8C42')
         .text(workOrder.status.replace('_', ' ').toUpperCase(), doc.page.width - 100, detailsY + 35)
         .fillColor('black');
      
      doc.y = detailsY + 80;
      doc.moveDown();
      
      // Customer Information Section
      const customerY = doc.y;
      doc.fontSize(14).font('Helvetica-Bold')
         .fillColor('#FF8C42')
         .text('👤 CUSTOMER INFORMATION', 50, customerY)
         .fillColor('black');
      
      // Customer info box
      doc.roundedRect(50, customerY + 20, 260, 95, 10).strokeColor('#94a3b8').stroke();
      doc.fontSize(10).font('Helvetica');
      let customerInfoY = customerY + 30;
      
      doc.font('Helvetica-Bold').text('Name:', 60, customerInfoY)
         .font('Helvetica').text(workOrder.customer.name, 100, customerInfoY);
      customerInfoY += 15;
      
      doc.font('Helvetica-Bold').text('Email:', 60, customerInfoY)
         .font('Helvetica').text(workOrder.customer.email, 100, customerInfoY);
      customerInfoY += 15;
      
      doc.font('Helvetica-Bold').text('Phone:', 60, customerInfoY)
         .font('Helvetica').text(workOrder.customer.phone, 100, customerInfoY);
      
      if (workOrder.customer.address.street) {
        customerInfoY += 15;
        doc.font('Helvetica-Bold').text('Address:', 60, customerInfoY)
           .font('Helvetica').text(`${workOrder.customer.address.street}, ${workOrder.customer.address.city}, ${workOrder.customer.address.state} ${workOrder.customer.address.zipCode}`, 120, customerInfoY, { width: 170 });
      }
      
      // Vehicle Information Section
      const vehicleY = customerY;
      doc.fontSize(14).font('Helvetica-Bold')
         .fillColor('#FF8C42')
         .text('🚗 VEHICLE INFORMATION', 320, vehicleY)
         .fillColor('black');
      
      // Vehicle info box
      doc.roundedRect(320, vehicleY + 20, 260, 95, 10).strokeColor('#94a3b8').stroke();
      doc.fontSize(10).font('Helvetica');
      let vehicleInfoY = vehicleY + 30;
      
      doc.font('Helvetica-Bold').text('Vehicle:', 330, vehicleInfoY)
         .font('Helvetica').text(`${workOrder.vehicle.year} ${workOrder.vehicle.make} ${workOrder.vehicle.model}`, 380, vehicleInfoY);
      
      if (workOrder.vehicle.vin) {
        vehicleInfoY += 15;
        doc.font('Helvetica-Bold').text('VIN:', 330, vehicleInfoY)
           .font('Helvetica').text(workOrder.vehicle.vin, 380, vehicleInfoY);
      }
      
      if (workOrder.vehicle.licensePlate) {
        vehicleInfoY += 15;
        doc.font('Helvetica-Bold').text('License:', 330, vehicleInfoY)
           .font('Helvetica').text(workOrder.vehicle.licensePlate, 380, vehicleInfoY);
      }
      
      if (workOrder.vehicle.mileage) {
        vehicleInfoY += 15;
        doc.font('Helvetica-Bold').text('Mileage:', 330, vehicleInfoY)
           .font('Helvetica').text(workOrder.vehicle.mileage, 380, vehicleInfoY);
      }
      
      doc.y = Math.max(customerY + 110, vehicleY + 110);
      doc.moveDown();
      
      // Service Details Section
      doc.fontSize(14).font('Helvetica-Bold')
         .fillColor('#38bdf8')
         .text('🔧 SERVICE DETAILS', 50, doc.y)
         .fillColor('black');
      doc.moveDown(0.5);
      
      // Service details box
      const serviceDetailsY = doc.y;
      const serviceBoxHeight = 120;
      doc.roundedRect(50, serviceDetailsY, doc.page.width - 100, serviceBoxHeight, 12).strokeColor('#94a3b8').stroke();
      
      doc.fontSize(10).font('Helvetica');
      let serviceY = serviceDetailsY + 10;
      
      doc.font('Helvetica-Bold').text('Service Description:', 60, serviceY)
         .font('Helvetica').text(workOrder.serviceDetails.description, 160, serviceY, { width: doc.page.width - 220 });
      serviceY += 20;
      
      if (workOrder.serviceDetails.customerComplaints) {
        doc.font('Helvetica-Bold').text('Customer Complaints:', 60, serviceY)
           .font('Helvetica').text(workOrder.serviceDetails.customerComplaints, 180, serviceY, { width: doc.page.width - 240 });
        serviceY += 20;
      }
      
      if (workOrder.serviceDetails.diagnosis) {
        doc.font('Helvetica-Bold').text('Diagnosis:', 60, serviceY)
           .font('Helvetica').text(workOrder.serviceDetails.diagnosis, 120, serviceY, { width: doc.page.width - 180 });
        serviceY += 20;
      }
      
      if (workOrder.serviceDetails.workPerformed) {
        doc.font('Helvetica-Bold').text('Work Performed:', 60, serviceY)
           .font('Helvetica').text(workOrder.serviceDetails.workPerformed, 150, serviceY, { width: doc.page.width - 210 });
      }
      
      doc.y = serviceDetailsY + serviceBoxHeight + 10;
      doc.moveDown();
      
      // Labor Items
      if (workOrder.laborItems.length > 0) {
        doc.fontSize(14).fillColor('#38bdf8').text('LABOR').fillColor('black');
        doc.fontSize(10);
        workOrder.laborItems.forEach(item => {
          doc.text(`${item.description}: ${item.hours} hrs @ $${item.hourlyRate}/hr = $${item.total.toFixed(2)}`);
        });
        doc.moveDown();
      }
      
      // Parts Items
      if (workOrder.partItems.length > 0) {
        doc.fontSize(14).fillColor('#38bdf8').text('PARTS').fillColor('black');
        doc.fontSize(10);
        workOrder.partItems.forEach(item => {
          doc.text(`${item.description}: ${item.quantity} @ $${item.unitPrice.toFixed(2)} = $${item.total.toFixed(2)}`);
        });
        doc.moveDown();
      }
      
      // Totals
      if (workOrder.pricing.totalAmount > 0) {
        doc.fontSize(12).fillColor('#38bdf8').text('TOTALS').fillColor('black');
        doc.moveDown(0.3);
        doc.text(`Subtotal: $${workOrder.pricing.subtotal.toFixed(2)}`, doc.page.width - 220, doc.y, { width: 200, align: 'right' });
        doc.text(`Tax (${(workOrder.pricing.taxRate * 100).toFixed(1)}%): $${workOrder.pricing.taxAmount.toFixed(2)}`, doc.page.width - 220, doc.y, { width: 200, align: 'right' });
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#1f2937').text(`TOTAL: $${workOrder.pricing.totalAmount.toFixed(2)}`, doc.page.width - 220, doc.y + 10, { width: 200, align: 'right' }).fillColor('black');
      }
      
      const footerY = doc.page.height - 90;
      doc.rect(0, footerY, doc.page.width, 90).fill('#0f172a');
      
      doc.fillColor('#e2e8f0')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Thank you for choosing Mobile Shop!', 0, footerY + 18, { align: 'center' })
         .fontSize(9)
         .font('Helvetica')
         .text('Professional Mobile Automotive Service | contact@mobileshop.com | (555) 123-4567 | www.mobileshop.com', 0, footerY + 34, { align: 'center' })
         .fontSize(8)
         .fillColor('#94a3b8')
         .text(`Document generated on ${new Date().toLocaleString()}`, 0, footerY + 52, { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = router;
