import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "../helpers/authcontext";
const RouteProtecter = ({ children }) => {
    const { isAuthenticated, checkAuthStatus, loading } = useAuth();

    React.useEffect(() => {
        checkAuthStatus(); // Validate auth when this component mounts
    }, [checkAuthStatus]);

    if (loading) {
        return <div>Loading...</div>; // Show a loading indicator while checking auth status
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default RouteProtecter;