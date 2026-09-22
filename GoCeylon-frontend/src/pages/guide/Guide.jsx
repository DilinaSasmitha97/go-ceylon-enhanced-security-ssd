import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/config';
import TopAppBar from '../../components/TopAppBarGuide';
import BottomTabBarGuide from '../../components/BottomTabBarGuide';
import { Link } from 'react-router-dom';

export default function Guide() {

    const [businesses, setBusinesses] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);


    return (
        <>
            <TopAppBar />
            <div className="container mx-auto p-6 mt-[4rem] mb-[5rem] bg-gray-100 min-h-screen">
                {loading && <p className="text-center">Loading...</p>}
                {errorMessage && (
                    <p className="text-center text-red-600">{errorMessage}</p>
                )}

            </div>
            <BottomTabBarGuide />
        </>
    )
}
