import React, { useState } from "react";
import TopAppBar from "../../components/TopAppBar";
import BottomTabBar from "../../components/BottomTabBar";
import { FaPaperPlane } from "react-icons/fa";
import API_BASE_URL from "../../config/config";

export default function AiGuide() {
    const [messages, setMessages] = useState([
        { role: "bot", text: "Hello! How can I assist you today?" },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    /*
        const handleSend = async () => {
            if (!input.trim()) return;
    
            const userMessage = { role: "user", text: input };
    
            // Create an updated history that includes the new message
            const updatedHistory = [...messages, userMessage];
    
            // Update UI immediately
            setMessages(updatedHistory);
            setInput("");
    
            try {
                const response = await fetch("http://localhost:3000/api/chat/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: input,
                        history: updatedHistory.map(msg => ({
                            role: msg.role === "user" ? "user" : "model",
                            parts: msg.text,
                        }))
                    }),
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                const data = await response.json();
    
                // Update messages with bot response
                setMessages(prevMessages => [
                    ...prevMessages,
                    { role: "bot", text: data.response }
                ]);
    
            } catch (error) {
                console.error("Error fetching AI response:", error);
            }
        };*/

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", text: input };

        // Create an updated history that includes the new user message
        const updatedHistory = [...messages, userMessage];

        // Update UI immediately
        setMessages(updatedHistory);
        setInput("");
        setLoading(true);  // Set loading state to true when sending the message

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: input,
                    history: updatedHistory.map(msg => ({
                        role: msg.role === "user" ? "user" : "model",
                        parts: msg.text,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            // Update messages with bot response
            setMessages(prevMessages => [
                ...prevMessages,
                { role: "bot", text: data.response }
            ]);
        } catch (error) {
            console.error("Error fetching AI response:", error);
        } finally {
            setLoading(false);  // Reset loading state when the request is complete
        }
    };


    return (
        <>
            <TopAppBar />
            <div className="container mx-auto p-6 mt-[4rem] bg-gray-100 min-h-screen">
                <div className="flex-1 overflow-y-auto space-y-2 mb-[8rem]">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-2 rounded-lg w-fit max-w-[90%] ${msg.role === "user" ? "ml-auto bg-gray-500 text-white" : "bg-gray-200"
                                }`}
                        >
                            {msg.text}
                        </div>
                    ))}
                    {loading && <div className="p-2 rounded-lg w-fit max-w-[90%] bg-gray-200">Typing...</div>}
                </div>
            </div>
            <div className="flex bg-white p-4 w-full bottom-[4.7rem] fixed items-center justify-between">
                <input
                    className="flex-1 border border-gray-300 p-3 rounded-lg mr-4 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                    onClick={handleSend}
                    className="bg-[#007a55] p-3 rounded-full text-white shadow-md transition-colors duration-200 ease-in-out"
                    disabled={loading}
                >
                    <FaPaperPlane className="text-xl" />
                </button>
            </div>
            <BottomTabBar />
        </>
    );
}
