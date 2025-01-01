import React, { createContext, useContext, useState,useCallback,useEffect} from "react";
import getApiInstance from './axios-custom';
import CustomError from './custom-error';
import { useLocation,useMatch } from "react-router-dom";
// Create the AuthContext
const AuthContext = createContext();

// Environment variable to determine authentication type
const AUTHTYPE = process.env.REACT_APP_AUTHTYPE;

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const matchLogin = useMatch('/login');
    const matchResetPassword = useMatch('/reset-password/:userId/:link');
    const location = useLocation();
    const api = getApiInstance();
    useEffect(() => {
      if (matchLogin || matchResetPassword) {
        return children;
      }
      const verifyToken = async () => {
        try {
          const config = {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
            url: "https://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/user"
          };
          const response = await api(config)
          setUser(response.data.user.email);
          localStorage.setItem("fullname",response.data.user.name)
          setIsAuthenticated(true);
          setLoading(false)
        } catch (error) {
          console.error("Token verification failed:", error);
          if(error.response && (error.response.status === 401 || error.response.status === 403)){
            if(AUTHTYPE === "SAML"){
              window.location.href ="https://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/loginSAML"
            }else if(window.location.pathname !== "/login"){
                window.location.href ="/login"
            }
          }
        }
      };
      if(AUTHTYPE === "SAML"){
        const queryParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = queryParams.get("token");
        if(tokenFromUrl){
          localStorage.setItem("jwtToken",tokenFromUrl);
          setToken(tokenFromUrl)
          const fullname = queryParams.get("fullname");
          const email = queryParams.get("email");
          setUser({fullname:fullname, email: email});
          localStorage.setItem("fullname",fullname);
          localStorage.setItem("email",email);
          setIsAuthenticated(true);
        }else{
          verifyToken();
        }
      }else{
        verifyToken();
      }
    }, []);
    // JWT Login
    const jwtLogin = async (credentials) => {
        try {
          const config = {
              method: 'post',
              url: "/sso/login",
              data:credentials
          };
            const response = await api(config);
            const token = response.data.obj;

            // Save JWT to local storage
            
            localStorage.setItem("jwtToken", token);
            setToken(token)
            // Decode user information (optional, if provided in token)
            const decodedUser = JSON.parse(atob(token.split(".")[1])); // Decode payload
            
            setUser(decodedUser.signature.username);
            setIsAuthenticated(true);
            return response
        } catch (error) {
            console.error("JWT login failed", error);
            if(error.response.status === 403){
              throw new CustomError("No permission for Monitoring Tool, contact your admin and make sure that you are given access for Monitoring Tool.", 403);
            }else
              throw new Error("JWT login failed");
        }
    };

    // SAML Login
    const samlLogin = () => {
        // Redirect to SAML login endpoint
        window.location.href = "https://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/loginSAML"
    };

    // Logout (both methods)
    const logout = () => {
        localStorage.removeItem("jwtToken");
        setUser(null);
        setIsAuthenticated(false);
        if(AUTHTYPE === "SAML"){
          window.location.href = "https://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/loginSAML"
        }else{
          window.location.href = "/login"
        }
    };

    // Check Authentication Status
    const checkAuthStatus = useCallback(async () => {
      setLoading(true);
      if (AUTHTYPE === "JWT") {
        try {
            const token = localStorage.getItem("jwtToken");
            if (token) {
                // Simulate a network request
                const response = await api("https://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/user");
                setUser(response.data.email);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
      } else if (AUTHTYPE === "SAML") {
        // In a real application, you'd validate SAML session on the server side.
        setIsAuthenticated(true); // Assume session is valid after SAML login.
      }
    }, []);
   

    // Expose the authentication methods and state to the context
    return (
        <AuthContext.Provider
            value={{
              user,
              isAuthenticated,
              loading,
              token,
              checkAuthStatus,
              login: process.env.REACT_APP_AUTHTYPE === "JWT" ? jwtLogin : samlLogin,
              logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// useAuth Hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};


