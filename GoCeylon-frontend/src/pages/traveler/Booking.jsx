import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopNameBar from '../../components/TopNameBar';
import API_BASE_URL from '../../config/config';
import { useModal } from '../../context/ModalContext';
import { motion } from "framer-motion"
import { MapPin, Globe, User, Calendar } from "lucide-react"



export default function Booking() {
    const { state } = useLocation();

    const navigate = useNavigate();
    const { guide } = state || {};
    const locationId = guide?.id;

    const [expectedDuration, setExpectedDuration] = useState('');
    const [numberOfMembers, setNumberOfMembers] = useState(1);
    const [loading, setLoading] = useState(false);
    const { showModal, closeModal } = useModal();

    // pull userId from JWT
    const token = localStorage.getItem('authToken');
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const userid = decoded.id;

    useEffect(() => {
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#007a55");
    }, []);


    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleBooking = async () => {

        const payload = {
            userId: userid,
            guideId: guide._id,
            locationId: locationId,
            expectedDuration: 1,
            numberOfMembers: 1,
            startAt: 0,
            endAt: 0,
            price: 0,
        };

        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE_URL}/booking`, payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showModal({
                type: 'success',
                title: 'Requested!',
                content: 'Your booking is pending confirmation.',
                buttons: [
                    {
                        label: 'OK',
                        onClick: () => {
                            closeModal();
                            navigate('/user/bookinghistory', { state: { booking: res.data } });
                        },
                        className: 'w-full py-2 bg-green-600 text-white rounded'
                    }
                ]
            });
        } catch (err) {
            console.error('Booking Error:', err.response?.data || err.message);
            alert(`Booking failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <TopNameBar title="Guide Profile" />

            {/* Guide Image */}
            <div className="w-full aspect-square bg-gray-200">
                <img
                    src={guide.image ? `${API_BASE_URL}/${guide.image}` : '/default-profile.png'}
                    alt={`${guide.g_name}, Tour Guide`}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Guide Basic Info */}
            <div className="bg-white p-5 pb-[7rem]">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{guide.g_name}</h2>
                <p className="text-[#007a55] font-medium mb-4">Professional Tour Guide</p>

                <div className="space-y-5">
                    {/* Age & Gender */}
                    <div className="flex items-center">
                        <div className="bg-[#e6f5f0] p-2 rounded-full mr-4">
                            <User className="h-5 w-5 text-[#007a55]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-0.5">Age & Gender</p>
                            <p className="font-medium">
                                {/*{guide.age} years • {guide.gender}*/}
                                {calculateAge(guide.g_dob)} years • {guide.gender}
                            </p>
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="flex items-center">
                        <div className="bg-[#e6f5f0] p-2 rounded-full mr-4">
                            <Globe className="h-5 w-5 text-[#007a55]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-0.5">Languages</p>
                            <p className="font-medium">{guide.language.join(", ")}</p>
                        </div>
                    </div>

                    {/* Support Locations */}
                    <div className="flex">
                        <div className="bg-[#e6f5f0] p-2 rounded-full mr-4 mt-0.5">
                            <MapPin className="h-5 w-5 text-[#007a55]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-0.5">Support Locations</p>
                            <ul className="space-y-1">
                                {guide.location.map((location, index) => (
                                    <li key={index} className="font-medium flex items-center">
                                        <span className="w-1.5 h-1.5 bg-[#007a55] rounded-full mr-2"></span>
                                        {location.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed bottom button */}
            <div className="fixed bottom-0 left-0 right-0 px-5 py-4 border-t border-gray-200 bg-white shadow-lg">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBooking}
                    disabled={loading}
                    className="w-full bg-[#007a55] text-white py-3.5 rounded-lg font-medium shadow-sm hover:bg-[#006045] transition-colors"
                >
                    {loading ? 'Requesting…' : 'Request Booking'}
                </motion.button>
            </div>
        </div>
    );
}
