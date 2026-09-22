import React, { useEffect, useState } from 'react';
import axios from 'axios';  // Import axios
import TopNameBar from "../../components/TopNameBar";
import { useLocation } from 'react-router-dom';
import API_BASE_URL from "../../config/config";

export default function PointGuide() {

    const location = useLocation();
    const { attractionId, pointId } = location.state || {}; // Destructure the state

    const [guideData, setGuideData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('authToken');

    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSpeech = () => {
        const utterance = new SpeechSynthesisUtterance(guideData);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);

        utterance.onend = () => {
            setIsSpeaking(false); // Set the speaking state to false when speech ends
        };
    };

    const handleStop = () => {
        window.speechSynthesis.cancel(); // Stop any ongoing speech
        setIsSpeaking(false);
    };


    useEffect(() => {
        if (attractionId && pointId) {
            const fetchGuideData = async () => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/chat/ai-guide/${attractionId}/point/${pointId}`, {
                        headers: { "Authorization": `Bearer ${token}` },
                    });
                    setGuideData(response.data.guide);  // Set the guide data in state
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to fetch guide data');  // Handle error
                } finally {
                    setLoading(false);  // End loading state
                }
            };

            fetchGuideData();
        }
    }, [attractionId, pointId]);

    return (
        <div className="flex flex-col h-screen w-full bg-gray-100">
            <TopNameBar title="Point Guide" />
            <div className="flex items-center mt-[4rem] justify-center p-4">
                {loading && <p>Loading...</p>}  {/* Show loading state */}

                {error && !loading && <p className="text-red-500">{error}</p>}  {/* Show error state */}

                {guideData && !loading && (
                    <div>
                        <button onClick={handleSpeech} className="w-full mt-5 bg-[#007a55] text-white font-bold py-2 px-4 rounded-lg">Speak Text</button>
                        <button onClick={handleStop} className="w-full mt-5 mb-5 bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Stop Speech</button>
                        <p>{guideData}</p>  {/* Display the fetched guide content */}
                    </div>
                )}
            </div>
        </div>
    );
}
