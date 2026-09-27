const Tourist = require('../models/UserModel');
const Guide = require('../models/GuideModel');
const Business = require('../models/BusinessModel');
const Location = require('../models/LocationModel');
const Booking = require('../models/BookingModel');

exports.getOverview = async (req, res) => {
    try {
        const [travelers, guides, businesses, locations] = await Promise.all([
            Tourist.countDocuments(),
            Guide.countDocuments(),
            Business.countDocuments(),
            Location.countDocuments(),
        ]);

        res.status(200).json({
            data: {
                travelers: { total: travelers },
                guides: { total: guides },
                businesses: { total: businesses },
                locations: { total: locations },
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load overview report', error: error.message });
    }
};

exports.getLocationCategories = async (req, res) => {
    try {
        const categories = await Location.aggregate([
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $project: { _id: 0, name: '$_id', count: 1 } },
        ]);

        res.status(200).json({ data: categories });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load location categories', error: error.message });
    }
};

exports.getGenderDiversity = async (req, res) => {
    try {
        const genders = await Guide.aggregate([
            { $group: { _id: '$gender', value: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, name: '$_id', value: 1 } },
        ]);

        res.status(200).json({ data: genders });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load guide gender report', error: error.message });
    }
};

exports.getTopLocations = async (req, res) => {
    try {
        const locations = await Booking.aggregate([
            { $group: { _id: '$b_location', bookings: { $sum: 1 } } },
            { $sort: { bookings: -1, _id: 1 } },
            { $limit: 10 },
            { $project: { _id: 0, name: '$_id', bookings: 1 } },
        ]);

        res.status(200).json({ data: locations });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load top locations', error: error.message });
    }
};
