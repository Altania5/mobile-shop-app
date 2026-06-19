const router = require('express').Router();
const crypto = require('crypto');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'Hard Work Mobile <onboarding@resend.dev>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ── Cookie helper ─────────────────────────────────────────────────────────────

function setAuthCookie(res, user) {
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    });
}

// ── Email templates ───────────────────────────────────────────────────────────

function forgotPasswordHtml(firstName, resetUrl) {
    return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1e2833;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="color:#d4af37;margin:0;font-size:24px;">Hard Work Mobile</h1>
        <p style="color:#94a3b8;margin:8px 0 0;">Customer Portal</p>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:32px 24px;">
        <h2 style="color:#1e2833;margin-top:0;">Reset Your Password</h2>
        <p style="color:#475569;">Hi ${firstName}, we received a request to reset your password.</p>
        <p style="color:#475569;">Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#d4af37;color:#1e2833;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:16px;">Reset Password</a>
        </div>
        <p style="color:#64748b;font-size:14px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
        <p style="color:#94a3b8;font-size:13px;margin-top:32px;">Hard Work Mobile · Chester, Delaware &amp; Montgomery Counties, PA</p>
      </div>
    </div>`;
}

function portalSetupHtml(firstName, setupUrl) {
    return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1e2833;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="color:#d4af37;margin:0;font-size:24px;">Hard Work Mobile</h1>
        <p style="color:#94a3b8;margin:8px 0 0;">Your Customer Portal is Ready</p>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:32px 24px;">
        <h2 style="color:#1e2833;margin-top:0;">Hi ${firstName}!</h2>
        <p style="color:#475569;">Your service appointment has been confirmed. We've also created a customer portal account for you so you can track your booking status and service history.</p>
        <p style="color:#475569;">Click the button below to set your password and activate your account. This link expires in <strong>24 hours</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${setupUrl}" style="display:inline-block;background:#d4af37;color:#1e2833;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:16px;">Set Up My Account</a>
        </div>
        <p style="color:#64748b;font-size:14px;">Questions? Call us at <a href="tel:4845933875" style="color:#d4af37;">(484) 593-3875</a></p>
        <p style="color:#94a3b8;font-size:13px;margin-top:32px;">Hard Work Mobile · Chester, Delaware &amp; Montgomery Counties, PA</p>
      </div>
    </div>`;
}

// ── Auth routes ───────────────────────────────────────────────────────────────

// POST /api/users/register
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
        return res.status(400).json({ msg: 'All fields are required.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ msg: 'Password must be at least 8 characters.' });
    }

    try {
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ msg: 'An account with this email already exists.' });
        }

        const user = new User({ firstName: firstName.trim(), lastName: lastName.trim(), email, password, isEmailVerified: true });
        await user.save();

        setAuthCookie(res, user);
        res.status(201).json({
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
        });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ msg: 'An account with this email already exists.' });
        res.status(500).json({ msg: 'Server error during registration.' });
    }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Please enter all fields.' });

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ msg: 'Invalid email or password.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid email or password.' });

        setAuthCookie(res, user);
        res.json({
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
        });
    } catch {
        res.status(500).json({ msg: 'Server error.' });
    }
});

// POST /api/users/logout
router.post('/logout', (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
    });
    res.json({ msg: 'Logged out successfully.' });
});

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires');
        if (!user) return res.status(404).json({ msg: 'User not found.' });
        res.json(user);
    } catch {
        res.status(500).json({ msg: 'Server error.' });
    }
});

// POST /api/users/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email is required.' });

    // Always return the same message to prevent email enumeration
    const OK = { msg: 'If an account with that email exists, a reset link has been sent.' };

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.json(OK);

        const plainToken = user.generatePasswordResetToken();
        await user.save();

        const resetUrl = `${CLIENT_URL}/reset-password/${plainToken}`;
        resend.emails
            .send({ from: FROM, to: [user.email], subject: 'Reset Your Password — Hard Work Mobile', html: forgotPasswordHtml(user.firstName, resetUrl) })
            .catch(err => console.error('Forgot-password email failed:', err));

        res.json(OK);
    } catch {
        res.status(500).json({ msg: 'Server error.' });
    }
});

// POST /api/users/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 8) {
        return res.status(400).json({ msg: 'Password must be at least 8 characters.' });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });
        if (!user) return res.status(400).json({ msg: 'This reset link is invalid or has expired.' });

        user.password = password;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        user.needsPasswordReset = false;
        await user.save();

        setAuthCookie(res, user);
        res.json({
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
        });
    } catch {
        res.status(500).json({ msg: 'Server error.' });
    }
});

// POST /api/users/change-password  (protected)
router.post('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ msg: 'Both fields are required.' });
    if (newPassword.length < 8) return res.status(400).json({ msg: 'New password must be at least 8 characters.' });

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found.' });

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect.' });

        user.password = newPassword;
        await user.save();

        res.json({ msg: 'Password updated successfully.' });
    } catch {
        res.status(500).json({ msg: 'Server error.' });
    }
});

// ── Internal endpoint — called by the shop app on booking approval ─────────────

// POST /api/users/portal/auto-register
router.post('/portal/auto-register', async (req, res) => {
    if (req.headers['x-internal-secret'] !== process.env.PORTAL_INTERNAL_SECRET) {
        return res.status(403).json({ msg: 'Forbidden.' });
    }

    const { firstName, lastName, email, phone } = req.body;
    if (!email || !firstName) return res.status(400).json({ msg: 'firstName and email are required.' });

    try {
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.json({ created: false, userId: existing.id });

        // Create account with temp password; user must set their own via the reset link
        const tempPassword = crypto.randomBytes(20).toString('hex');
        const user = new User({
            firstName: firstName.trim(),
            lastName: (lastName || '').trim(),
            email: email.toLowerCase(),
            phone: phone || '',
            password: tempPassword,
            isEmailVerified: true,
            needsPasswordReset: true,
        });

        // Reset token expires in 24 hours (longer window for portal setup)
        const plainToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(plainToken).digest('hex');
        user.passwordResetExpires = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const setupUrl = `${CLIENT_URL}/reset-password/${plainToken}`;
        resend.emails
            .send({ from: FROM, to: [user.email], subject: 'Your Customer Portal Account — Hard Work Mobile', html: portalSetupHtml(firstName, setupUrl) })
            .catch(err => console.error('Portal setup email failed:', err));

        res.status(201).json({ created: true, userId: user.id });
    } catch (err) {
        console.error('Auto-register error:', err);
        res.status(500).json({ msg: 'Server error.' });
    }
});

// ── Legacy/email-verification routes (kept for backwards compat) ──────────────

router.get('/verify-email/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            emailVerificationToken: req.params.token,
            emailVerificationExpires: { $gt: Date.now() },
        });
        if (!user) return res.status(400).json({ msg: 'Invalid or expired verification token.' });
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();
        res.json({ msg: 'Email verified successfully.' });
    } catch {
        res.status(500).json({ msg: 'Server error.' });
    }
});

router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ msg: 'Email is required.' });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found.' });
        if (user.isEmailVerified) return res.status(400).json({ msg: 'Email is already verified.' });
        const token = user.generateEmailVerificationToken();
        await user.save();
        const { sendVerificationEmail } = require('../services/emailVerificationService');
        await sendVerificationEmail(user, token);
        res.json({ msg: 'Verification email sent.' });
    } catch {
        res.status(500).json({ msg: 'Server error.' });
    }
});

// GET /api/users  (admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch {
        res.status(500).json({ msg: 'Server error.' });
    }
});

module.exports = router;
