import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "../helpers/authcontext";
const RouteProtecter = ({ children }) => {
    // const [isAuthenticated, setIsAuthenticated] = useState(null);
  
    // useEffect(() => {
    //   const token = localStorage.getItem('token');
  
    //   if (token) {
    //     try {
    //       // Decode the token to check expiration
    //       const decodedToken = jwtDecode(token);
    //       const currentTime = Date.now() / 1000; // Current time in seconds
  
    //       // Check if the token has expired
    //       if (decodedToken.exp > currentTime) {
    //         setIsAuthenticated(true);
    //       } else {
    //         // Token expired, clear token and set auth to false
    //         localStorage.removeItem('token');
    //         setIsAuthenticated(false);
    //       }
    //     } catch (error) {
    //       console.error("Invalid token:", error);
    //       setIsAuthenticated(false);
    //     }
    //   } else {
    //     setIsAuthenticated(false);
    //   }
    // }, []);
  
    // // Show a loading screen while checking authentication
    // if (isAuthenticated === null) {
    //   return <div>Loading...</div>;
    // }
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