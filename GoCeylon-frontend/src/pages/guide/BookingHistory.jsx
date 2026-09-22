import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/config';
import TopAppBar from '../../components/TopAppBarGuide';
import BottomTabBar from '../../components/BottomTabBarGuide';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Extract userId from token
  let guideId;
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');
    const decoded = JSON.parse(atob(token.split('.')[1]));
    guideId = decoded.id;
  } catch (err) {
    setError(err);
    setLoading(false);
    return null;
  }

  // Fetch booking history
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/booking/guide/${guideId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setBookings(res.data);
      console.log(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Sort bookings by createdAt (newest first)
  const sortedBookings = [...bookings].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-600';
      case 'completed':
        return 'bg-blue-50 text-blue-600';
      case 'cancelled':
        return 'bg-red-50 text-red-600';
      case 'pending':
        return 'bg-yellow-50 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'Not specified';
    return new Date(timestamp).toLocaleString();
  };

  // Loading, error, or empty state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <TopAppBar />
        <div className="spinner"></div>
        <BottomTabBar />
      </div>
    );
  }
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-6 mt-[4rem] bg-gray-100 min-h-screen">
      <TopAppBar />
      {/* Bookings List - Scrollable */}
      {sortedBookings.length > 0 ? (
        <div className="space-y-3 pb-[5rem]">
          {sortedBookings.map((booking) => (
            <motion.div
              key={booking._id}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
              onClick={() => navigate(`../guide/booking/info/${booking._id}`)}
            >
              <div className="p-4">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800">{booking.userId.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                    {getStatusText(booking.bookingStatus)}
                  </span>
                </div>

                {/* Date and Time */}
                <div className="flex items-center mb-3">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600 mr-4">{formatDateTime(booking.startAt)}</span>
                </div>

                {/* Location */}
                <p className="text-sm text-gray-500 mb-3">Location: {booking.locationId.name}</p>

              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 px-4">
          <p className="text-gray-500 text-center">You don't have any bookings yet.</p>
        </div>
      )}
      <BottomTabBar />
    </div>
  );
}