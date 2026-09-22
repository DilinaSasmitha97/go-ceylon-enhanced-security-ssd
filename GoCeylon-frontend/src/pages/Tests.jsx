import React, { useState } from 'react';

export default function Test() {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!message.trim()) return;
        setLoading(true);

        const userMessage = { sender: "user", text: message };
        setChat([...chat, userMessage]);
        setMessage("");

        try {
            const response = await fetch("http://localhost:3000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            const data = await response.json();

            const botMessage = { sender: "bot", text: data.reply || "Meow?" };
            setChat([...chat, userMessage, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
        }

        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-gray-900 text-white rounded-xl shadow-lg">
            <h1 className="text-xl font-bold mb-4">🐱 CatBot</h1>
            <div className="h-60 overflow-y-auto bg-gray-800 p-3 rounded-lg">
                {chat.map((msg, index) => (
                    <div
                        key={index}
                        className={`p-2 my-1 rounded-lg ${msg.sender === "user" ? "bg-blue-600 text-right" : "bg-gray-700"}`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="flex mt-4">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-grow p-2 text-black rounded-l-lg"
                    placeholder="Ask the CatBot..."
                    disabled={loading}
                />
                <button
                    onClick={sendMessage}
                    className="p-2 bg-red-500 text-white rounded-r-lg"
                    disabled={loading}
                >
                    {loading ? "Meowing..." : "Send"}
                </button>
            </div>
        </div>
    );
}
