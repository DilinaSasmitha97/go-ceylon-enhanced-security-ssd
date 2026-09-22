const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    b_date: { type: String, required: true },
    b_time: { type: String, required: true },
    b_location: { type: String, required: true },
    b_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    b_guide: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);



