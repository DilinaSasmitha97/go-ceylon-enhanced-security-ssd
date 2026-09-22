import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/config';
import TopAppBar from '../../components/TobAppBarBusiness';
import BottomTabBar from '../../components/BottomTabBarBusiness';
import { Link } from 'react-router-dom';

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
                const response = await axios.get(`${API_BASE_URL}/businessuser/${defaultId}`);
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
            const response = await axios.put(`${API_BASE_URL}/businessuser/${defaultId}`, formData, {
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
                                <label className="block text-gray-700">Address:</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">Contact No:</label>
                                <input
                                    type="text"
                                    name="contact_number"
                                    value={formData.contact_number}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-lg"
                                />
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
                                        <p><strong>Contact:</strong> {user.contact_number}</p>
                                        <p><strong>Address:</strong> {user.address}</p>
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
