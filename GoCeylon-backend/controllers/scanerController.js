const ExcelJS = require('exceljs');
const RFIDRecord = require("../models/scanerModel");
const RfidModel = require('../models/RfidModel');

// Add a new RFID record
exports.addRFID = async (req, res) => {
    try {
        // Destructure required fields from request body
        const { rfidTagCode, scanLocation, transactionAmount } = req.body;

        // Validate required fields
        if (!rfidTagCode) return res.status(400).json({ error: "RFID Tag Code is required!" });
        if (!scanLocation) return res.status(400).json({ error: "Scan Location is required!" });
        if (transactionAmount === undefined) return res.status(400).json({ error: "Transaction Amount is required!" });

        // Check if the RFID Tag Code exists in RfidModel
        const existingRfid = await RfidModel.findOne({ rfidTagCode });

        if (!existingRfid) {
            return res.status(404).json({ error: "RFID Tag Code not found in RfidModel!" });
        }

        // Check if the wallet has enough balance
        if (existingRfid.walletAmount < transactionAmount) {
            return res.status(400).json({ error: "Insufficient wallet balance!" });
        }

        // Deduct the transaction amount from the wallet
        existingRfid.walletAmount -= transactionAmount;
        await existingRfid.save(); // Save the updated wallet balance

        // Create a new RFID record
        const newRecord = new RFIDRecord({
            rfidTagCode,
            scanLocation,
            transactionAmount
        });

        // Save the new RFID scan record
        await newRecord.save();

        // Respond with success message and updated wallet balance
        res.status(201).json({
            message: "RFID record saved, wallet updated.",
            data: newRecord,
            walletBalance: existingRfid.walletAmount
        });

    } catch (error) {
        // Handle errors
        res.status(500).json({ error: error.message });
    }
};


exports.getAllRFIDs = async (req, res) => {
    try {
        // Fetch all RFID scan records and join with RfidModel
        const records = await RFIDRecord.aggregate([
            {
                $lookup: {
                    from: "rfidmodels", // Collection name in MongoDB (should match your actual collection name)
                    localField: "rfidTagCode",
                    foreignField: "rfidTagCode",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails" // Convert the array result to an object
            },
            {
                $project: {
                    _id: 1,
                    rfidTagCode: 1,
                    scanLocation: 1,
                    transactionAmount: 1,
                    timestamp: 1,
                    passportNumber: "$userDetails.passportNumber",
                    nationality: "$userDetails.nationality"
                }
            }
        ]);

        // Send the response
        res.status(200).json({ message: "RFID Records Retrieved", data: records });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Function to export RFID records to an Excel file
exports.exportRFIDToExcel = async (req, res) => {
    try {
        // Fetch RFID records and join with RfidModel collection
        const records = await RFIDRecord.aggregate([
            {
                $lookup: {
                    from: "rfidmodels", // Collection name in MongoDB
                    localField: "rfidTagCode",
                    foreignField: "rfidTagCode",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" }, // Convert array result to an object
            {
                $project: {
                    _id: 0,
                    RFID_Tag_Code: "$rfidTagCode",
                    Scan_Location: "$scanLocation",
                    Transaction_Amount: "$transactionAmount",
                    Timestamp: "$timestamp",
                    Passport_Number: "$userDetails.passportNumber",
                    Nationality: "$userDetails.nationality"
                }
            }
        ]);

        console.log("Fetched records:", records); // Log fetched records to the console

        if (records.length === 0) {
            return res.status(404).json({ error: "No RFID records found!" });
        }

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('RFID_Records');

        // Define columns in Excel sheet
        worksheet.columns = [
            { header: 'RFID Tag Code', key: 'RFID_Tag_Code' },
            { header: 'Scan Location', key: 'Scan_Location' },
            { header: 'Transaction Amount', key: 'Transaction_Amount' },
            { header: 'Timestamp', key: 'Timestamp' },
            { header: 'Passport Number', key: 'Passport_Number' },
            { header: 'Nationality', key: 'Nationality' }
        ];

        // Add records to worksheet
        records.forEach(record => {
            // Ensure correct format of timestamp
            const formattedTimestamp = new Date(record.Timestamp).toLocaleString();

            worksheet.addRow({
                RFID_Tag_Code: record.RFID_Tag_Code,
                Scan_Location: record.Scan_Location,
                Transaction_Amount: record.Transaction_Amount,
                Timestamp: formattedTimestamp, // Format the timestamp before adding it
                Passport_Number: record.Passport_Number,
                Nationality: record.Nationality
            });
        });

        // Save the workbook to a file
        await workbook.xlsx.writeFile('RFID_Records.xlsx');

        // Send the file to the client
        res.download('RFID_Records.xlsx', 'RFID_Records.xlsx', (err) => {
            if (err) {
                res.status(500).json({ error: "Error downloading the file!" });
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};