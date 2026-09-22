const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RfidSchema = new Schema({
    rfidTagCode: {
        type: String,
        required: [true, 'RFID Tag Code is required'],
        unique: true,
        index: true
    },
    fullName: {
        type: String,
        required: [true, 'Full Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone Number is required'],
        match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number']
    },
    nationality: {
        type: String,
        required: [true, 'Nationality is required']
    },
    passportNumber: {
        type: String,
        required: [true, 'Passport Number is required'],
        unique: true,
        index: true
    },
    walletAmount: {
        type: Number,
        default: 0,
        min: [0, 'Wallet amount cannot be negative']
    },
    birthday: {
        type: Date,
        required: [true, 'Birthday is required']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Other'
    },
    address: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('RfidModel', RfidSchema);
