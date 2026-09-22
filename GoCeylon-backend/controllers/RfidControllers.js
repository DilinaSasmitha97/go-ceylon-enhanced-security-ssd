const RfidModel = require('../models/RfidModel');

// Create a new RFID entry
exports.createRfid = async (req, res) => {
    try {
        const rfid = new RfidModel(req.body);
        await rfid.save();
        res.status(201).json({ success: true, data: rfid });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all RFID entries
exports.getAllRfids = async (req, res) => {
    try {
        const rfids = await RfidModel.find();
        res.status(200).json({ success: true, data: rfids });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single RFID entry by ID
exports.getRfidById = async (req, res) => {
    try {
        const rfid = await RfidModel.findById(req.params.id);
        if (!rfid) {
            return res.status(404).json({ success: false, message: 'RFID not found' });
        }
        res.status(200).json({ success: true, data: rfid });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update an RFID entry
exports.updateRfid = async (req, res) => {
    try {
        const rfid = await RfidModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!rfid) {
            return res.status(404).json({ success: false, message: 'RFID not found' });
        }
        res.status(200).json({ success: true, data: rfid });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete an RFID entry
exports.deleteRfid = async (req, res) => {
    try {
        const rfid = await RfidModel.findByIdAndDelete(req.params.id);
        if (!rfid) {
            return res.status(404).json({ success: false, message: 'RFID not found' });
        }
        res.status(200).json({ success: true, message: 'RFID deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
