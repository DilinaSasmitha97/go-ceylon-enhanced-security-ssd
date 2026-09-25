import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import API_BASE_URL from '../../config/config';
import { Calendar, Clock, MapPin, CalendarPlus, CheckCircle, AlertCircle } from 'lucide-react';
import TopAppBar from '../../components/TopAppBar';
import BottomTabBar from '../../components/BottomTabBar';

/**
 * "Add booking to Google Calendar" page.
 *
 * Lists the logged-in tourist's bookings and lets them add any one to their
 * Google Calendar. Clicking a button starts the incremental-authorization flow
 * on the backend (GET /api/calendar/google?bookingId=...), which asks Google for
 * the calendar scope only at that moment, creates the event, and redirects back
 * here with ?calendar=success|error|denied|notfound.
 */
export default function CalendarBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const calendarStatus = searchParams.get('calendar');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('You must be logged in to view bookings.');
      setLoading(false);
      return;
    }

    let userId;
    try {
      userId = JSON.parse(atob(token.split('.')[1])).id;
    } catch (e) {
      setError('Invalid session. Please log in again.');
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE_URL}/booking/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        // Backend returns { bookings: [...] }; fall back to an array just in case.
        const list = Array.isArray(res.data) ? res.data : res.data.bookings || [];
        setBookings(list);
      })
      .catch((err) => {
        console.error('Failed to load bookings:', err);
        setError('Could not load your bookings.');
      })
      .finally(() => setLoading(false));
  }, []);

  const addToCalendar = (bookingId) => {
    // Full-page redirect to the backend, which starts incremental Google consent.
    window.location.href = `${API_BASE_URL}/api/calendar/google?bookingId=${bookingId}`;
  };

  return (
    <div className="container mx-auto p-6 mt-[4rem] pb-[5rem] min-h-screen bg-gray-100">
      <TopAppBar />
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">My Bookings</h1>
      <p className="text-sm text-gray-500 mb-5">Add any booking to your Google Calendar.</p>

      {/* Result banner after the Google redirect returns */}
      {calendarStatus === 'success' && (
        <div className="mb-4 py-3 px-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Booking added to your Google Calendar.</span>
        </div>
      )}
      {calendarStatus && calendarStatus !== 'success' && (
        <div className="mb-4 py-3 px-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">
            {calendarStatus === 'denied'
              ? 'Google Calendar access was denied.'
              : calendarStatus === 'notfound'
                ? 'That booking could not be found.'
                : 'Could not add the booking to Google Calendar. Please try again.'}
          </span>
        </div>
      )}

      {loading && <p className="text-gray-500">Loading your bookings…</p>}
      {error && !loading && <p className="text-red-600">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p className="text-gray-500">You don't have any bookings yet.</p>
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b._id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center text-gray-800 font-semibold mb-2">
              <MapPin className="h-4 w-4 mr-2 text-[#007a55]" />
              {b.b_location}
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {b.b_date}
              <Clock className="h-4 w-4 ml-4 mr-2 text-gray-400" />
              {b.b_time}
            </div>
            <div className="text-sm text-gray-500 mb-3">
              Price: LKR {b.price} · Status: {b.status}
            </div>
            <button
              onClick={() => addToCalendar(b._id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#007a55] text-[#007a55] rounded-lg hover:bg-[#007a55] hover:text-white transition duration-300"
            >
              <CalendarPlus className="h-5 w-5" />
              <span className="font-medium">Add to Google Calendar</span>
            </button>
          </div>
        ))}
      </div>

      <BottomTabBar />
    </div>
  );
}
