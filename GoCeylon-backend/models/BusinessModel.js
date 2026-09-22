const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BusinessModelSchema = new Schema({
    business_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessUser',  // Linking BusinessModel to BusinessUserModel
        required: true
    },
    business_name: {
        type: String,
        required: [true, 'Business name is required']
    },
    business_category: {
        type: String,
        required: [true, 'Business category is required']
    },
    contact_number: {
        type: String,
        required: [true, 'Contact number is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    description: {
        type: String,
        required: false
    },
    ownerPhoto: {
        type: String,
        required: false
    },
    images: [{
        type: String
    }],
    openingHours: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Business', BusinessModelSchema);