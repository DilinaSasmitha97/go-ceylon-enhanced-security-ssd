const Location = require('../models/LocationModel');
//const { GoogleGenAI } = require("@google/genai");
//const ai = new GoogleGenAI({ apiKey: "AIzaSyAu7_I_t-W5KwqGIDn1DL0RxTYE9lUQjls" });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyAu7_I_t-W5KwqGIDn1DL0RxTYE9lUQjls");

let chatHistory = [];

exports.getCatResponse = async (req, res) => {
    try {
        const userMessage = req.body.message;

        // Append user message to history
        chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

        // Create chat session with history
        const chat = ai.chats.create({
            model: "gemini-2.0-flash",
            history: chatHistory,
        });

        // Send user message to AI
        const response = await chat.sendMessage({ message: userMessage });

        // Append bot response to history
        chatHistory.push({ role: "model", parts: [{ text: response.text }] });

        res.json({ reply: response.text || "Meow?" });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong." });
    }
};

exports.getTravelGuide = async (req, res) => {
    try {
        // Expect the QR code data to be provided in the request body.
        //const qrData = req.body.qrData;

        const qrData = "This is the 1500th step of Adam's Peak (Sri Pada). You have 4000 steps left to climb. There are shops a hundred meters ahead where you can rest.";

        if (!qrData) {
            return res.status(400).json({ error: "QR code data is missing." });
        }

        // Use the description from the QR code data.
        //const placeDescription = qrData.description;

        const placeDescription = "This is the 1500th step of Adam's Peak (Sri Pada). You have 4000 steps left to climb. There are shops a hundred meters ahead where you can rest.";

        if (!placeDescription) {
            return res.status(400).json({ error: "QR code does not contain a valid description." });
        }

        // Build a query that instructs the AI to generate a friendly, detailed travel guide.
        const baseQuery = `Provide a detailed travel guide for a tourist attraction with the following description: "${placeDescription}". Please include:
        - A brief historical or cultural background.
        - Useful tips (best time to visit, weather, precautions).
        - Information on nearby facilities (restaurants, hotels, rest stops).
        - Encouraging and safety advice, all in a friendly and engaging tone.`;

        // Optionally, add any additional guidance to ensure a human-like output.
        const humanGuidance = "Present the guide as if you are a knowledgeable local friend sharing insider tips.";
        const fullQuery = `${baseQuery}\n\n${humanGuidance}`;

        // Initialize the Google Gemini API model.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Generate the travel guide based on the full query.
        const result = await model.generateContent(fullQuery);
        const responseText = result.response.text() || "I couldn't process your request, please try again.";

        // Send the final guide back as JSON.
        res.json({
            guide: responseText,
        });

    } catch (error) {
        console.error("Error fetching AI response:", error);
        res.status(500).json({ error: "Something went wrong while processing your request." });
    }
};


exports.chat = async (req, res) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const userMessage = req.body.message;
    let history = req.body.history || [];

    if (!userMessage) {
        return res.status(400).send({ error: "Message is required" });
    }

    // Ensure the first message is always from a user
    if (history.length > 0 && history[0].role !== "user") {
        history = []; // Reset history if it starts with a bot message
    }

    // Format user message with instructions
    const enhancedUserMessage = `
    You are a professional Sri Lankan travel guide. 
    Respond only with information related to Sri Lanka travel. If the user asks about something outside of that domain output = "Sorry I am professional tour guide. I don't know that information."
    User: ${userMessage}
    `;

    try {
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 300, // Increased max tokens for more detailed responses.
            },
        });

        const result = await chat.sendMessage(enhancedUserMessage);
        const response = await result.response;
        const text = response.text();

        // Append new messages to history
        history.push({ role: "user", parts: userMessage });
        history.push({ role: "model", parts: text });

        res.send({ response: text, history: history });
    } catch (error) {
        console.error("Error generating response:", error);
        res.status(500).send({ error: "Failed to generate response" });
    }
};




exports.getPointText = async (req, res) => {
    const { attractionId, pointId } = req.params; // Assuming attractionId and pointId are passed as params

    try {
        // Find the location by attractionId
        const location = await Location.findOne({ 'points.point': pointId, '_id': attractionId });

        // If location is not found
        if (!location) {
            return res.status(404).json({ message: 'Location or point not found' });
        }

        // Find the point by pointId within the points array
        const point = location.points.find(p => p.point === pointId);

        // If point is not found
        if (!point) {
            return res.status(404).json({ message: 'Point not found' });
        }

        try {

            const qrData = point.text;

            // Build a query that instructs the AI to generate a friendly, detailed travel guide.
            const baseQuery = `Provide a detailed travel guide for a tourist attraction with the following description: "${qrData}". Please include:
            - A brief historical or cultural background.
            - Useful tips (best time to visit, weather, precautions).
            - Information on nearby facilities (restaurants, hotels, rest stops).
            - Encouraging and safety advice, all in a friendly and engaging tone.`;

            // Optionally, add any additional guidance to ensure a human-like output.
            const humanGuidance = "Present the guide as if you are a knowledgeable local friend sharing insider tips.";
            const fullQuery = `${baseQuery}\n\n${humanGuidance}`;

            // Initialize the Google Gemini API model.
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Generate the travel guide based on the full query.
            const result = await model.generateContent(fullQuery);
            const responseText = result.response.text() || "I couldn't process your request, please try again.";

            // Send the final guide back as JSON.
            res.json({
                guide: responseText,
            });

        } catch (error) {
            console.error("Error fetching AI response:", error);
            res.status(500).json({ error: "Something went wrong while processing your request." });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};



/*
exports.chat = async (req, res) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const userMessage = req.body.message;
    let history = req.body.history || [];
    console.log("-------------------------------------------------------------------------");
    console.log(userMessage);
    console.log(history);

    if (!userMessage) {
        return res.status(400).send({ error: "Message is required" });
    }

    // Ensure the first message is always from a user
    if (history.length > 0 && history[0].role !== "user") {
        history = []; // Reset history if it starts with a bot message
    }

    // Format user message with instructions
    const enhancedUserMessage = `
    You are a professional Sri Lankan travel guide. 
    Please consider the following conversation history: ${history}.
    Respond to the user's latest message, maintaining context from the previous exchange.
    Respond only with information related to Sri Lanka travel. If the user asks about something outside of that domain, politely say you can only provide information related to Sri Lanka and suggest consulting a general knowledge resource.
    User: ${userMessage}
    `;

    try {
        // Start a new chat or continue the current chat
        const chat = model.startChat({
            history: history, // Send the full history for context
            generationConfig: {
                maxOutputTokens: 300, // Max tokens to generate detailed responses
            },
        });

        const result = await chat.sendMessage(enhancedUserMessage);
        const response = await result.response;
        const text = response.text();

        // Append new messages to history
        history.push({ role: "user", parts: userMessage });
        history.push({ role: "model", parts: text });

        // Return the response and updated history
        res.send({ response: text, history: history });
    } catch (error) {
        console.error("Error generating response:", error);
        res.status(500).send({ error: "Failed to generate response" });
    }
};*/


/*
exports.getPointText = async (req, res) => {
    const { attractionId, pointId } = req.params; // Assuming attractionId and pointId are passed as params

    try {
        // Find the location by attractionId
        const location = await Location.findOne({ 'points.point': pointId, '_id': attractionId });

        // If location is not found
        if (!location) {
            return res.status(404).json({ message: 'Location or point not found' });
        }

        // Find the point by pointId within the points array
        const point = location.points.find(p => p.point === pointId);

        // If point is not found
        if (!point) {
            return res.status(404).json({ message: 'Point not found' });
        }

        // Return the related point text
        //return res.status(200).json({ text: point.text });

        try {

            const qrData = point.text;
            //const qrData = "This is the 1500th step of Adam's Peak (Sri Pada). You have 4000 steps left to climb. There are shops a hundred meters ahead where you can rest.";

            // Use the description from the QR code data.
            //const placeDescription = qrData.description;

            const placeDescription = "This is the 1500th step of Adam's Peak (Sri Pada). You have 4000 steps left to climb. There are shops a hundred meters ahead where you can rest.";

            if (!placeDescription) {
                return res.status(400).json({ error: "QR code does not contain a valid description." });
            }

            // Build a query that instructs the AI to generate a friendly, detailed travel guide.
            const baseQuery = `Provide a detailed travel guide for a tourist attraction with the following description: "${qrData}". Please include:
            - A brief historical or cultural background.
            - Useful tips (best time to visit, weather, precautions).
            - Information on nearby facilities (restaurants, hotels, rest stops).
            - Encouraging and safety advice, all in a friendly and engaging tone.`;

            // Optionally, add any additional guidance to ensure a human-like output.
            const humanGuidance = "Present the guide as if you are a knowledgeable local friend sharing insider tips.";
            const fullQuery = `${baseQuery}\n\n${humanGuidance}`;

            // Initialize the Google Gemini API model.
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Generate the travel guide based on the full query.
            const result = await model.generateContent(fullQuery);
            const responseText = result.response.text() || "I couldn't process your request, please try again.";

            // Send the final guide back as JSON.
            res.json({
                guide: responseText,
            });

        } catch (error) {
            console.error("Error fetching AI response:", error);
            res.status(500).json({ error: "Something went wrong while processing your request." });
        }


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};*/