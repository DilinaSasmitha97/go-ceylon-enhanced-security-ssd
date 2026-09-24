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

    useEffect(() => {
        // Fetch the booking data using the booking ID from the URL
        axios
            .get(`${API_BASE_URL}/booking/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            })
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
    const phoneNumber = booking.guideId.contact_number || '';
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

                    {/* Guide Info */}
                    <div className="mt-2 bg-white p-5 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-3">Your Guide</h3>

                        <div className="flex items-center">
                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                    src={`${API_BASE_URL}/${booking.guideId.image}`}
                                    alt={booking.guideId.g_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="ml-3">
                                <h4 className="font-semibold">{booking.guideId.g_name}</h4>
                                <p className="text-sm text-gray-500">
                                    Languages: {booking.guideId.language.join(", ")}
                                </p>
                            </div>
                        </div>

                        <div className="flex mt-4 space-x-2" >
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
                                <p>Only share this code with your guide when they meet you physically.</p>
                                <div className="flex justify-between mt-2">
                                    {booking.code.split('').map((char, index) => (
                                        <div
                                            key={index}
                                            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md text-lg font-semibold"
                                        >
                                            {char}
                                        </div>
                                    ))}
                                </div>
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

                                <div className="flex items-start">
                                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-medium">{booking.locationId.name}</p>
                                        <p className="text-sm text-gray-500">Meeting point: Not specified</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                        <div className="mt-2 bg-white p-5 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
                            <p className="text-gray-600">{booking.notes}</p>
                        </div>
                    )}

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
                {(booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") && (
                    <div className="fixed bottom-0 left-0 right-0 px-5 py-4 border-t border-gray-200 bg-white shadow-lg z-10">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3.5 rounded-lg font-medium shadow-sm border border-red-500 text-red-500 hover:bg-red-50 transition-colors"
                            onClick={handleCancel}
                        >
                            Cancel Booking
                        </motion.button>
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