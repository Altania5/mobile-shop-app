const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: false, // Make optional since we'll use firstName + lastName
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        // Basic email validation
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    squareCustomerId: {
        type: String,
        default: null
    },
    hasCardOnFile: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    emailVerificationExpires: {
        type: Date,
        default: null
    },
    phone: {
        type: String,
        trim: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    needsPasswordReset: {
        type: Boolean,
        default: false
    },
    createdByAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

// This function runs before saving a user to hash the password and generate username
userSchema.pre('save', async function(next) {
    // Generate username from firstName and lastName if not provided
    if (!this.username) {
        const baseUsername = (this.firstName + this.lastName).toLowerCase().replace(/[^a-z0-9]/g, '');
        let username = baseUsername;
        let counter = 1;
        
        // Ensure username is unique
        while (await mongoose.models.User.findOne({ username: username })) {
            username = baseUsername + counter;
            counter++;
        }
        
        this.username = username;
    }
    
    // Hash password if modified
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// This method is used by the login route to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    this.emailVerificationToken = token;
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return token;
};


const User = mongoose.model('User', userSchema);

module.exports = User;