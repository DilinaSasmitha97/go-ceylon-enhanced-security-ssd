import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import TopNameBar from "../../components/TopNameBar";
import API_BASE_URL from "../../config/config";
import { Calendar, Clock, MapPin, User, ChevronLeft, MessageSquare, Phone, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function BookingInfo() {
    const { id } = useParams(); // Get bookingId from URL
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null); // State for booking data
    const [loading, setLoading] = useState(true); // State for loading
    const [error, setError] = useState(null); // State for errors
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']); // State for verification code
    const [verificationError, setVerificationError] = useState(''); // State for verification error

    useEffect(() => {
        // Fetch the booking data using the booking ID from the URL
        axios
            .get(`${API_BASE_URL}/booking/${id}`)
            .then((response) => {
                console.log("API Response:", response.data); // Log the response to check the data
                setBooking(response.data); // Set booking directly with response.data
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching booking:', error);
                setError(error.message || 'Failed to fetch booking details');
                setLoading(false);
            });
    }, [id]);


    // Helper function to format date and time
    const formatDateTime = (timestamp) => {
        if (!timestamp || timestamp === 0) return "Not specified";
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Helper function to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-50 text-yellow-600";
            case "confirmed":
                return "bg-green-50 text-green-600";
            case "completed":
                return "bg-blue-50 text-blue-600";
            case "cancelled":
                return "bg-red-50 text-red-600";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    // Helper function to get status text
    const getStatusText = (status) => {
        switch (status) {
            case "pending":
                return "Pending";
            case "confirmed":
                return "Confirmed";
            case "completed":
                return "Completed";
            case "cancelled":
                return "Cancelled";
            default:
                return status;
        }
    };

    const handleCancel = () => {
        setShowCancelModal(true);
    };

    const confirmCancel = () => {
        // This would normally make an API call to cancel the booking
        axios
            .put(`${API_BASE_URL}/booking/cancel/${id}`)
            .then(() => {
                setShowCancelModal(false);
                setBooking({ ...booking, bookingStatus: "cancelled" });
            })
            .catch((error) => {
                console.error('Error cancelling booking:', error);
                alert("Failed to cancel booking");
            });
    };

    const handleCodeChange = (value, index) => {
        const newCode = [...verificationCode];
        newCode[index] = value.slice(-1); // limit to 1 char
        setVerificationCode(newCode);
        setVerificationError(''); // Clear error when user types

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`code-${index + 1}`)?.focus();
        }
    };

    const handleStartTour = async () => {
        const fullCode = verificationCode.join('');
        if (fullCode.length !== 6) {
            setVerificationError('Please enter all 6 digits');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`${API_BASE_URL}/booking/start/${id}`, { fullCode }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh booking data to update status
            const response = await axios.get(`${API_BASE_URL}/booking/${id}`);
            setBooking(response.data);
        } catch (error) {
            console.error('Error starting tour:', error);
            setVerificationError('Failed to start tour. Please try again.');
        }
    };



    const handleEndTour = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`${API_BASE_URL}/booking/finish/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh booking data to update status
            const response = await axios.get(`${API_BASE_URL}/booking/${id}`);
            setBooking(response.data);
        } catch (error) {
            console.error('Error starting tour:', error);
        }
    };

    const handleConfermTour = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`${API_BASE_URL}/booking/confirm/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh booking data to update status
            const response = await axios.get(`${API_BASE_URL}/booking/${id}`);
            setBooking(response.data);
        } catch (error) {
            console.error('Error starting tour:', error);
        }
    };



    // Render loading state
    if (loading) {
        return (
            <div className="container mx-auto p-6 mt-[4rem] bg-gray-50 min-h-screen">
                <TopNameBar title="Booking Details" />
                <div className="flex items-center justify-center h-full">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (error || !booking) {
        return (
            <div className="container mx-auto p-6 mt-[4rem] bg-gray-50 min-h-screen">
                <TopNameBar title="Booking Details" />
                <div className="flex items-center justify-center h-full">
                    <p>{error || "Error loading booking details. Please try again later."}</p>
                </div>
            </div>
        );
    }
    // WhatsApp and Dial URLs
    const phoneNumber = booking.userId.phone || '';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hello%20${encodeURIComponent(booking.guideId.g_name)},%20I%20have%20a%20question%20about%20my%20booking%20for%20${encodeURIComponent(booking.locationId.name)}%20Tour`;
    const dialUrl = `tel:${phoneNumber}`;


    return (
        <div className="container mx-auto p-6 mt-[4rem] bg-gray-100 min-h-screen">
            <TopNameBar title="Booking Details" />
            <div className="flex flex-col min-h-screen">
                {/* Scrollable Content */}
                <div className="flex-1 space-y-3 overflow-y-auto pb-[80px]">

                    {/* Status Banner */}
                    <div
                        className={`py-5 px-5 bg-white rounded-lg shadow-sm flex justify-between items-center`}
                    >
                        <div className="flex items-center">
                            {booking.bookingStatus === "cancelled" ? (
                                <AlertCircle className="h-5 w-5 mr-2" />
                            ) : (
                                <Calendar className="h-5 w-5 mr-2" />
                            )}
                            <span
                                className={`font-medium ${booking.bookingStatus === "cancelled"}`}
                            >
                                {booking.bookingStatus === "cancelled"
                                    ? "This booking has been cancelled"
                                    : `Booking is ${booking.bookingStatus}`}
                            </span>
                        </div>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                                booking.bookingStatus
                            )}`}
                        >
                            {getStatusText(booking.bookingStatus)}
                        </span>
                    </div>

                    {/* Client Info */}
                    <div className="mt-2 bg-white p-5 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-1">
                            Contact customer
                        </h2>
                        <div className="flex mt-3 space-x-2" >
                            <a
                                href={phoneNumber ? whatsappUrl : '#'}
                                onClick={(e) => !phoneNumber && e.preventDefault()}
                                className="flex-1 flex items-center justify-center py-2 border border-[#007a55] text-[#007a55] rounded-lg"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message
                            </a>

                            <a
                                href={phoneNumber ? dialUrl : '#'}
                                onClick={(e) => !phoneNumber && e.preventDefault()}
                                className="flex-1 flex items-center justify-center py-2 border border-[#007a55] text-[#007a55] rounded-lg"
                            >
                                <Phone className="h-4 w-4 mr-2" />
                                Call
                            </a>
                        </div>
                    </div>

                    {(booking.bookingStatus === "confirmed") && (
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-4">
                                <p className="text-gray-600 mb-2">Enter the 6-digit verification code to start the tour</p>
                                <div className="flex justify-between gap-2">
                                    {verificationCode.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`code-${index}`}
                                            type="number"
                                            value={digit}
                                            onChange={(e) => handleCodeChange(e.target.value, index)}
                                            maxLength={1}
                                            className="w-10 h-10 text-center border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    ))}
                                </div>
                                {verificationError && (
                                    <p className="text-red-500 text-sm mt-2">{verificationError}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Activity Info */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-4">
                            <h2 className="text-xl font-bold text-gray-800 mb-1">
                                {booking.locationId.name} Tour
                            </h2>

                            <div className="space-y-4 mt-4">


                                <div className="flex items-start">
                                    <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Client</p>
                                        <p className="font-medium">
                                            {booking.userId.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-medium">{booking.locationId.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Start At</p>
                                        <p className="font-medium">{formatDateTime(booking.startAt)}</p>
                                    </div>
                                </div>


                                <div className="flex items-start">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">End At</p>
                                        <p className="font-medium">{formatDateTime(booking.endAt)}</p>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="mt-2 bg-white p-5 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-3">Payment</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total paid</span>
                            <span className="font-bold">${booking.price}</span>
                        </div>
                    </div>

                </div>

                {/* Fixed bottom button - only show for pending or confirmed bookings */}
                {(booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed" || booking.bookingStatus === "active") && (
                    <div className="fixed bottom-0 left-0 right-0 px-5 py-4 border-t border-gray-200 bg-white shadow-lg z-10">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            className="w-full mb-3 py-3.5 rounded-lg font-medium shadow-sm border border-red-500 text-red-500 hover:bg-red-50 transition-colors"
                            onClick={handleCancel}
                        >
                            Cancel Booking
                        </motion.button>
                        {(booking.bookingStatus === "active") && (
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3.5 rounded-lg font-medium shadow-sm border border-[#007a55] bg-[#007a55] text-white hover:bg-[#006045] transition-colors"
                                onClick={handleEndTour}
                            >
                                End Tour
                            </motion.button>
                        )}
                        {(booking.bookingStatus === "confirmed") && (
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3.5 rounded-lg font-medium shadow-sm border border-[#007a55] bg-[#007a55] text-white hover:bg-[#006045] transition-colors"
                                onClick={handleStartTour}
                            >
                                Start Tour
                            </motion.button>
                        )}
                        {(booking.bookingStatus === "pending") && (
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3.5 rounded-lg font-medium shadow-sm border border-[#007a55] bg-[#007a55] text-white hover:bg-red-50 transition-colors"
                                onClick={handleConfermTour}
                            >
                                Confirm Booking
                            </motion.button>
                        )}
                    </div>
                )}



                {/* Cancel Confirmation Modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-[#000000cc] bg-opacity-50 flex items-center justify-center z-20 px-4">
                        <div className="bg-white rounded-lg p-5 w-full max-w-sm">
                            <h3 className="text-lg font-bold mb-2">Cancel Booking?</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to cancel this booking? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium"
                                    onClick={() => setShowCancelModal(false)}
                                >
                                    Keep Booking
                                </button>
                                <button
                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium"
                                    onClick={confirmCancel}
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}