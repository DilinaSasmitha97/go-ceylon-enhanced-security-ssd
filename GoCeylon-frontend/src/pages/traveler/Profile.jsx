import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopAppBar from '../../components/TopAppBar';
import BottomTabBar from '../../components/BottomTabBar';
import API_BASE_URL from "../../config/config";

export default function Profile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const token = localStorage.getItem('authToken');
  const decoded = JSON.parse(atob(token.split('.')[1]));
  const defaultId = decoded.id;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${defaultId}`);
        setUser(response.data);
        setFormData(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError('Error fetching user details');
      }
    };

    console.log(user);

    fetchUserDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${defaultId}`, formData, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      setUser(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating user details:", err);
      setError('Error updating user details');
    }
  };

  if (error) {
    return <div className="text-center text-xl text-red-500">{error}</div>;
  }

  return (
    <div className='container mx-auto p-6 mt-[4rem] bg-gray-100 min-h-screen'>
      <TopAppBar />
      <div>
        {isEditing ? (
          <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  disabled
                  className="mt-1 p-2 w-full border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-gray-700">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700">Destination:</label>
                <select
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-lg"
                >
                  <option value="Beach">Beach</option>
                  <option value="Mountains">Mountains</option>
                  <option value="City">City</option>
                  <option value="Countryside">Countryside</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Traveling With:</label>
                <select
                  name="traveling_with"
                  value={formData.traveling_with}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-lg"
                >
                  <option value="Solo">Solo</option>
                  <option value="Family">Family</option>
                  <option value="Partner">Partner</option>
                  <option value="Friends">Friends</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Accommodations:</label>
                <input
                  type="checkbox"
                  name="accommodations"
                  checked={formData.accommodations}
                  onChange={() => setFormData(prevData => ({
                    ...prevData,
                    accommodations: !prevData.accommodations
                  }))}
                  className="mr-2"
                />
                <span className="text-gray-600">Need Accommodation</span>
              </div>
              <div>
                <label className="block text-gray-700">Tour Guide:</label>
                <input
                  type="checkbox"
                  name="tour_guide"
                  checked={formData.tour_guide}
                  onChange={() => setFormData(prevData => ({
                    ...prevData,
                    tour_guide: !prevData.tour_guide
                  }))}
                  className="mr-2"
                />
                <span className="text-gray-600">Require a Guide</span>
              </div>
              <div class="flex flex-col gap-4 mt-6">
                <button type="submit" className="w-full px-6 py-2 bg-[#007a55] text-white rounded-lg">
                  Update Profile
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="w-full px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          user && (
            <div className="ss">
              <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Hi, {user.name}</h2>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Destination:</strong> {user.destination}</p>
                    <p><strong>Traveling With:</strong> {user.traveling_with}</p>
                    <p><strong>Accommodations:</strong> {user.accommodations ? 'Required' : 'Not Required'}</p>
                    <p><strong>Tour Guide:</strong> {user.tour_guide ? 'Required' : 'Not Required'}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full mt-6 bg-[#007a55] text-white font-bold py-2 px-4 rounded-lg"
              >
                Edit Profile
              </button>

              <button
                onClick={handleLogout}
                className='w-full mt-6 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700'>
                Logout
              </button>
            </div>
          )
        )}
      </div>

      <BottomTabBar />
    </div >
  );
}
