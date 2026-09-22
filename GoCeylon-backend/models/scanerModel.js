const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RFIDRecordSchema = new Schema({
    rfidTagCode: {
        type: String,
        required: true,
        ref: "RfidModel" // Linking to RfidModel
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    scanLocation: {
        type: String,
        required: true
    },
    transactionAmount: {
        type: Number,
        default: 0, // Default to 0 if no transaction occurs
        min: [0, "Transaction amount cannot be negative"]
    }
}, { timestamps: true });

module.exports = mongoose.model("RFIDRecord", RFIDRecordSchema);
