const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image_url: { type: [String], required: true }, // Array of image URLs
    google_map_url: { type: String, required: true }, // Google Map URL
    tags: { type: [String], required: true }, // Array of tags
    points: [
        {
            point: { type: String, required: true },
            text: { type: String, required: true }
        }
    ]
});

// Create and export the model based on the schema
module.exports = mongoose.model('Location', LocationSchema);
