const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const BusinessUserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        select: false
    },
    business_name: {
        type: String,
        required: [true, 'Business name is required']
    },
    business_category: {
        type: String,
        required: [true, 'Business category is required']
    },
    dob: {
        type: Date,
        required: [true, 'Date of Birth is required']
    },
    contact_number: {
        type: String,
        required: [true, 'Contact number is required'],
        unique: true
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    }
}, { timestamps: true });

// *Middleware to hash password before saving*
BusinessUserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// *Middleware to hash password before updating*
BusinessUserSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            update.password = await bcrypt.hash(update.password, salt);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

module.exports = mongoose.model('BusinessUser', BusinessUserSchema);