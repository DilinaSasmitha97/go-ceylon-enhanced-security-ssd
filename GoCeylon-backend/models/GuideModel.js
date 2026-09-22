const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const guideSchema = new Schema({
    g_name: { type: String, required: true },
    g_dob: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // Hide password from queries
    language: { type: [String], required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    price: { type: Number, required: true },
    location: [{ type: Schema.Types.ObjectId, ref: 'Location', required: true }],
    availability: { type: Boolean, default: true },
    contact_number: { type: String, required: true, unique: true },
    image: { type: String, required: true }, // Change from array to single string
}, { timestamps: true });

// *Hash password before saving*
guideSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Only hash if password is new/changed
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// *Compare entered password with hashed password*
guideSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Guide', guideSchema);