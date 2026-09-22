const Location = require('../models/LocationModel');
const fs = require('fs');
const path = require('path');

const getAllLocations = async (req, res) => {
    try {
        const { tag } = req.query;
        const query = tag ? { tags: tag } : {};
        const locations = await Location.find(query);

        res.status(200).json({ locations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching locations' });
    }
};

const getLocationById = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await Location.findById(id);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.status(200).json(location);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching location' });
    }
};

const createLocation = async (req, res) => {
    try {
        const { name, description, google_map_url } = req.body;

        // Ensure tags and points are properly parsed
        const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
        const points = req.body.points ? JSON.parse(req.body.points) : [];

        // Get uploaded image URLs
        const image_urls = req.files ? req.files.map(file => `https://goceylon-effhf6gxg5bqachv.westindia-01.azurewebsites.net/uploads/${file.filename}`) : [];

        const location = new Location({
            name,
            description,
            image_url: image_urls, // Store image URLs
            google_map_url,
            tags,
            points
        });

        await location.save();

        res.status(201).json({
            message: "Location created successfully",
            location
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating location" });
    }
};




const deleteLocation = async (req, res) => {
    try {
        const locationId = req.params.id;

        // Find the location to get the image paths
        const location = await Location.findById(locationId);
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        // Delete the images from the 'uploads' folder
        if (location.image_url && location.image_url.length > 0) {
            location.image_url.forEach(imagePath => {
                // Construct the full path to the image file
                const imagePathToDelete = path.join(__dirname, '..', 'uploads', imagePath);

                // Check if the file exists, then delete it
                if (fs.existsSync(imagePathToDelete)) {
                    fs.unlinkSync(imagePathToDelete); // Deletes the file
                }
            });
        }

        // Delete the location from the database
        await Location.findByIdAndDelete(locationId);

        res.status(200).json({ message: 'Location and associated images deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting location and images' });
    }
};


const updateLocation = async (req, res) => {
    try {
        const locationId = req.params.id;

        // Manually process the form data to extract the necessary fields
        let updatedData = {
            name: req.body.name,
            description: req.body.description,
            google_map_url: req.body.google_map_url,
            tags: JSON.parse(req.body.tags), // Assuming tags were stringified in the frontend
            points: JSON.parse(req.body.points), // Assuming points were stringified in the frontend
        };

        let existingImages = [];
        if (req.body.existingImages) {
            existingImages = JSON.parse(req.body.existingImages); // Parse the existing images if available
        }

        let newImages = [];
        if (req.files && req.files.length > 0) {
            newImages = req.files.map(file => `https://goceylon-effhf6gxg5bqachv.westindia-01.azurewebsites.net/uploads/${file.filename}`); // Handle the new image files
        }

        // Combine the existing and new images
        updatedData.image_url = [...existingImages, ...newImages];

        // Update the location using the new data
        const updatedLocation = await Location.findByIdAndUpdate(locationId, updatedData, { new: true });

        res.status(200).json({ message: "Location updated successfully", location: updatedLocation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating location" });
    }
};

const getAttractionReport = async (req, res) => {
    try {
        console.log('Fetching total attractions...');
        const totalAttractions = await Location.countDocuments();
        console.log('Total Attractions:', totalAttractions);

        console.log('Fetching attractions by tag...');
        const attractionsByTag = await Location.aggregate([
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } }
        ]);
        console.log('Attractions by Tag:', attractionsByTag);

        res.status(200).json({ totalAttractions, attractionsByTag });
    } catch (error) {
        console.error("Error in getAttractionReport:", error);
        res.status(500).json({ message: "Error fetching attraction report" });
    }
};






module.exports = {
    getAllLocations,
    createLocation,
    deleteLocation,
    updateLocation,
    getLocationById,
    getAttractionReport
};
