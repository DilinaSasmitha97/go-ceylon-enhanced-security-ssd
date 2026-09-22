import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear the token from local storage or session storage
        localStorage.removeItem('authToken');  // Replace with your storage method

        // Redirect to the login page
        navigate('/login');
    }, [navigate]);

    return;
};

export default Logout;
