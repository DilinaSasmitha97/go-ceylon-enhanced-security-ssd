require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/AdminModel');
const Tourist = require('./models/UserModel');
const Guide = require('./models/GuideModel');
const Location = require('./models/LocationModel');

const seedDatabase = async () => {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
        console.error("Error: MONGO_URI is not defined in .env file");
        process.exit(1);
    }

    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(mongoURI);
        console.log("Connected successfully.\n");

        // 1. Clear existing seed collections
        console.log("Clearing existing documents from Admin, Tourist, Guide, Location...");
        await Admin.deleteMany({});
        await Tourist.deleteMany({});
        await Guide.deleteMany({});
        await Location.deleteMany({});
        console.log("Collections cleared.\n");

        // 2. Seed Admin
        console.log("Seeding Admin account...");
        const admin = new Admin({
            email: "admin@goceylon.com",
            password: "AdminPass123!",
        });
        await admin.save();
        console.log("  [+] Admin created: admin@goceylon.com / AdminPass123!");

        // 3. Seed Tourists
        console.log("Seeding Tourist accounts...");
        const tourist1 = new Tourist({
            name: "Alice Smith",
            email: "tourist1@gmail.com",
            password: "TouristPass123!",
            destination: "Beach",
            traveling_with: "Solo",
            accommodations: true,
            tour_guide: false,
        });
        await tourist1.save();
        console.log("  [+] Tourist 1 created: tourist1@gmail.com / TouristPass123!");

        const tourist2 = new Tourist({
            name: "Bob Johnson",
            email: "tourist2@gmail.com",
            password: "TouristPass123!",
            destination: "Mountains",
            traveling_with: "Friends",
            accommodations: true,
            tour_guide: true,
        });
        await tourist2.save();
        console.log("  [+] Tourist 2 created: tourist2@gmail.com / TouristPass123!");

        // 4. Seed Locations
        console.log("Seeding Locations...");
        const location1 = await Location.create({
            name: "Sigiriya Ancient Rock Fortress",
            description: "Ancient palace and fortress complex with towering granite monolith and frescoes.",
            image_url: ["https://images.unsplash.com/photo-1586861635167-e5223aadc9fe"],
            google_map_url: "https://maps.google.com/?q=Sigiriya",
            tags: ["Historical", "UNESCO", "Adventure"],
            points: [
                { point: "Mirror Wall", text: "Ancient polished wall with graffiti verses" },
                { point: "Lion Gate", text: "Colossal lion paws framing the summit staircase" }
            ]
        });

        const location2 = await Location.create({
            name: "Galle Dutch Fort",
            description: "16th-century coastal fortress founded by Portuguese and fortified by Dutch settlers.",
            image_url: ["https://images.unsplash.com/photo-1588598198321-9735fd52455b"],
            google_map_url: "https://maps.google.com/?q=Galle+Fort",
            tags: ["Coastal", "Historical", "Architecture"],
            points: [
                { point: "Lighthouse", text: "Iconic 1939 coastal lighthouse at the bastion point" }
            ]
        });

        const location3 = await Location.create({
            name: "Ella Rock & Nine Arch Bridge",
            description: "Scenic highland trek offering panoramic views of tea plantations and railway bridges.",
            image_url: ["https://images.unsplash.com/photo-1546708973-b339540b5162"],
            google_map_url: "https://maps.google.com/?q=Ella+Rock",
            tags: ["Hiking", "Highlands", "Nature"],
            points: [
                { point: "Nine Arch Bridge", text: "British colonial stone railway viaduct in dense jungle" }
            ]
        });
        console.log("  [+] 3 Locations created (Sigiriya, Galle Fort, Ella Rock)");

        // 5. Seed Guide
        console.log("Seeding Tour Guide account...");
        const guide = new Guide({
            g_name: "Kasun Perera",
            g_dob: new Date("1992-06-15"),
            email: "guide@goceylon.com",
            password: "GuidePass123!",
            language: ["English", "Sinhala", "German"],
            gender: "Male",
            price: 5000,
            location: [location1._id, location2._id, location3._id],
            availability: true,
            contact_number: "+94771234567",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        });
        await guide.save();
        console.log("  [+] Guide created: guide@goceylon.com / GuidePass123!\n");

        console.log("========================================");
        console.log(" DATABASE SEEDING COMPLETED SUCCESSFULLY");
        console.log("========================================");
        console.log("Admin:    admin@goceylon.com / AdminPass123!");
        console.log("Tourist 1: tourist1@gmail.com / TouristPass123!");
        console.log("Tourist 2: tourist2@gmail.com / TouristPass123!");
        console.log("Guide:    guide@goceylon.com / GuidePass123!");
        console.log("Locations: 3 locations inserted");

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Database seeding failed:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seedDatabase();
