import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ element, allowedUserType }) => {
    const token = localStorage.getItem('authToken');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/logout" state={{ from: location }} replace />;
    }

    const decoded = JSON.parse(atob(token.split('.')[1]));  // Decode JWT to get userType
    const userType = decoded.userType;

    if (userType !== allowedUserType) {
        return <Navigate to="/403" replace />;
    }

    return element;  // Render the component passed via the 'element' prop
};

export default PrivateRoute;
