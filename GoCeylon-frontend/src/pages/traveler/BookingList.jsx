import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import TopNameBar from "../../components/TopNameBar";
import API_BASE_URL from "../../config/config";
import { Search, Globe } from "lucide-react"
import { motion } from "framer-motion"


export default function BookingList() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [guides, setGuides] = useState([]);
    const [filteredGuides, setFilteredGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        axios.get(`${API_BASE_URL}/guides/location/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        }).then(response => {
            const guideList = Array.isArray(response.data) ? response.data : response.data.guides;
            setGuides(guideList);
            setFilteredGuides(guideList);
            setLoading(false);
        }).catch(error => {
            console.error('Error fetching guides:', error);
            setError(error);
            setLoading(false);
        });
    }, []);

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = guides.filter(guide => {
            const nameMatch = guide.g_name?.toLowerCase().includes(query);
            const languageMatch = Array.isArray(guide.language)
                ? guide.language.join(', ').toLowerCase().includes(query)
                : guide.language?.toLowerCase().includes(query);
            const locationMatch = Array.isArray(guide.location)
                ? guide.location.map(loc => loc.name?.toLowerCase()).join(', ').includes(query)
                : guide.location?.name?.toLowerCase().includes(query);
            return nameMatch || languageMatch || locationMatch;
        });

        setFilteredGuides(filtered);
    };

    const handleGuideClick = (guide, id) => {
        const updatedGuide = { ...guide, id }; // Add locationId to guide
        navigate('/user/booking', { state: { guide: updatedGuide } });
    };

    if (error) return <div className='text-red-500 font-semibold'>Error: {error.message}</div>;

    return (
        <div className="max-w-md mx-auto px-4 pt-[4rem] pb-8 bg-gray-50 min-h-screen">
            <TopNameBar title="Guides" />
            {/* Search Bar - Fixed below header */}
            <div className="fixed top-[60px] left-0 right-0 bg-white z-10 px-4 py-3 border-b border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search guides or languages..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#007a55] focus:border-transparent"
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {/* Display Guides */}
            <div className="mt-[5rem]">
                {filteredGuides.length > 0 ? (
                    filteredGuides.map((guide) => (
                        <motion.div
                            key={guide.id}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white rounded-lg shadow-sm overflow-hidden mb-3"
                            onClick={() => handleGuideClick(guide, id)}
                        >
                            <div className="p-3 flex items-center">
                                {/* Guide Image */}
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={guide.image ? `${API_BASE_URL}/${guide.image}` : '/default-profile.png'}
                                        alt={guide.g_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Guide Info */}
                                <div className="ml-3 flex-1">
                                    <h3 className="font-semibold text-gray-800">{guide.g_name}</h3>

                                    {/* Languages */}
                                    <div className="flex items-center mt-1">
                                        <Globe className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                                        <span className="text-xs text-gray-600">{guide.language.join(", ")}</span>
                                    </div>

                                    {/* Availability Badge */}
                                    <div className="mt-1.5">
                                        {guide.availability ? (
                                            <span className="inline-block text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                                                Available
                                            </span>
                                        ) : (
                                            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                Unavailable
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 mt-10">No guides found...</p>
                )}
            </div>
        </div>
    );
}
