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
    // Create download link based on environment
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://hardworkmobile-0bf9805ba163.herokuapp.com'
      : 'http://localhost:3000';
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
          .download-button { 
            display: inline-block; 
            padding: 12px 25px; 
            background-color: #ff8c42; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
            font-weight: bold;
          }
          .footer { text-align: center; color: #777; font-size: 12px; margin-top: 30px; }
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
          
          <p>We're pleased to provide you with your work order for the automotive services. Please review the details below and keep this for your records.</p>
          
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
          
          <div style="text-align: center;">
            <a href="${downloadLink}" class="download-button">📄 Download Work Order PDF</a>
          </div>
          
          <p><strong>Important:</strong> The attached PDF contains the complete work order with all details. You can also download it anytime using the link above.</p>
          
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

// Helper function to generate PDF
async function generateWorkOrderPDF(workOrder) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Add orange header bar
      doc.rect(0, 0, doc.page.width, 80).fill('#FF8C42');
      
      // Header with company info
      doc.fillColor('white')
         .fontSize(24)
         .text('MOBILE SHOP', 50, 20, { align: 'left' });
      
      doc.fontSize(12)
         .text('Professional Mobile Automotive Service', 50, 45);
      
      // Work Order title
      doc.fillColor('black')
         .fontSize(20)
         .text('WORK ORDER', 0, 100, { align: 'center' });
      
      // Reset position after header
      doc.y = 130;
      
      // Company contact info
      doc.fontSize(10)
         .text('📧 contact@mobileshop.com  |  📞 (555) 123-4567  |  🌐 www.mobileshop.com', { align: 'center' });
      doc.moveDown(2);
      
      // Work Order Details Box
      const detailsY = doc.y;
      doc.rect(doc.page.width - 200, detailsY - 5, 180, 70).stroke();
      
      doc.fontSize(12).font('Helvetica-Bold')
         .text('Work Order #:', doc.page.width - 190, detailsY + 5)
         .font('Helvetica')
         .text(workOrder.workOrderNumber, doc.page.width - 100, detailsY + 5);
      
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
      doc.rect(50, customerY + 20, 250, 80).stroke();
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
      doc.rect(320, vehicleY + 20, 250, 80).stroke();
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
         .fillColor('#FF8C42')
         .text('🔧 SERVICE DETAILS', 50, doc.y)
         .fillColor('black');
      doc.moveDown(0.5);
      
      // Service details box
      const serviceDetailsY = doc.y;
      const serviceBoxHeight = 120;
      doc.rect(50, serviceDetailsY, doc.page.width - 100, serviceBoxHeight).stroke();
      
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
      
      // Professional Footer
      const footerY = doc.page.height - 80;
      doc.rect(0, footerY, doc.page.width, 80).fill('#F5F5F5');
      
      doc.fillColor('#666')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Thank you for choosing Mobile Shop!', 0, footerY + 15, { align: 'center' })
         .fontSize(8)
         .font('Helvetica')
         .text('Professional Mobile Automotive Service - Bringing quality service to your location', 0, footerY + 30, { align: 'center' })
         .text('📧 contact@mobileshop.com  |  📞 (555) 123-4567  |  🌐 www.mobileshop.com', 0, footerY + 45, { align: 'center' })
         .fontSize(7)
         .fillColor('#999')
         .text(`Document generated on ${new Date().toLocaleString()}`, 0, footerY + 60, { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = router;
