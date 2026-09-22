import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/config';
import TopAppBar from '../../components/TobAppBarBusiness';
import BottomTabBar from '../../components/BottomTabBarBusiness';
import { Link } from 'react-router-dom';

export default function Home() {
    const [businesses, setBusinesses] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBusinesses = async () => {
            setLoading(true);
            try {
                // Get logged in user ID from token
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setErrorMessage('Authentication token not found. Please log in.');
                    setLoading(false);
                    return;
                }
                const decoded = JSON.parse(atob(token.split('.')[1]));
                const user_id = decoded.id;

                // Fetch all businesses using axios
                const { data } = await axios.get(`${API_BASE_URL}/api/business/`);

                // Filter businesses for the current user safely
                const userBusinesses = data.filter((business) => {
                    if (!business.business_user) return false;
                    return typeof business.business_user === 'object'
                        ? business.business_user._id === user_id
                        : business.business_user === user_id;
                });
                setBusinesses(userBusinesses);
            } catch (error) {
                console.error("Error fetching businesses:", error);
                setErrorMessage(
                    error.response?.data?.error || 'Failed to fetch businesses.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, []);


    return (
        <>
            <TopAppBar />
            <div className="container mx-auto p-6 mt-[4rem] mb-[5rem] bg-gray-100 min-h-screen">
                {loading && <p className="text-center">Loading...</p>}
                {errorMessage && (
                    <p className="text-center text-red-600">{errorMessage}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businesses.map((business) => (
                        <Link
                            key={business._id}
                            to={`/business/info/${business._id}`}
                            className="bg-white rounded-xl shadow-md p-4 flex flex-col"
                        >
                            {business.images && (
                                <img
                                    src={`${API_BASE_URL}/${business.images[0]}`}
                                    alt={business.business_name}
                                    className="rounded-lg h-40 w-full object-cover mb-4"
                                />
                            )}
                            <h3 className="text-xl font-semibold mb-2">
                                {business.business_name}
                            </h3>
                            <p className="text-gray-600 mb-1">
                                <span className="font-medium">Category:</span>{' '}
                                {business.business_category}
                            </p>
                            <p className="text-gray-600 mb-1">
                                <span className="font-medium">Contact:</span>{' '}
                                {business.contact_number}
                            </p>
                            <p className="text-gray-600 mb-1">
                                <span className="font-medium">Address:</span> {business.address}
                            </p>
                            {business.description && (
                                <p className="text-gray-600 mt-2">{business.description}</p>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
            <BottomTabBar />
        </>
    );
}
