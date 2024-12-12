import React, { createContext, useContext, useState,useCallback,useEffect} from "react";
import getApiInstance from './axios-custom';
import { useLocation } from "react-router-dom";
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
    const location = useLocation();
    const api = getApiInstance();
    useEffect(() => {
      if (location.pathname === "/login") {
        return children;
      }
      const verifyToken = async () => {
        try {
          const config = {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              // 'Access-Control-Allow-Headers': 'content-type',
              // 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
              // 'Access-Control-Allow-Origin': 'http://localhost:5000', // Explicitly set the Origin header
            },
            withCredentials: true,
            url: "https://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/user"
          };
          const response = await api(config)
            // Assuming the backend sends user details
          setIsAuthenticated(true);
          setLoading(false)
        } catch (error) {
          console.error("Token verification failed:", error);
          if(error.response && (error.response.status === 401 || error.response.status === 403)){
            if(AUTHTYPE === "SAML"){
              window.location.href ="https://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/loginSAML"
            }else{
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
            setUser(decodedUser);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("JWT login failed", error);
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
                setUser(response.data.user);
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

// import React, { createContext, useState,useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import api from './axios-custom';
// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem("token") || null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const location = useLocation();
//   useEffect(() => {
//     if (location.pathname === "/login") {
//       return children;
//     }
//     const verifyToken = async () => {
//       try {
//         const config = {
//           method: 'get',
//           withCredentials:true,
//           url: "https://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/user"
//         };
//         const response = await api(config)
//          // Assuming the backend sends user details
//         setIsAuthenticated(true);
//       } catch (error) {
//         console.error("Token verification failed:", error);
//         if(error.response.status === 401 || error.response.status === 403){
//           if(process.env.AUTHTYPE === "SAML"){
//             window.location.href ="https://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/login"
//           }else{
//             window.location.href ="/login"
//           }
//         }
//       }
//     };
//     if(process.env.AUTHTYPE === "SAML"){
//       const queryParams = new URLSearchParams(window.location.search);
//       const tokenFromUrl = queryParams.get("token");
//       if(tokenFromUrl){
//         localStorage.setItem("token",tokenFromUrl);
//         const fullname = queryParams.get("fullname");
//         const email = queryParams.get("email");
//         setUser({fullname:fullname, email: email});
//         localStorage.setItem("fullname",fullname);
//         localStorage.setItem("email",email);
//         setToken(tokenFromUrl)
//         setIsAuthenticated(true);
//         window.location.href = "/dashboard"
//       }else{
//         verifyToken();
//       }
//     }else{
//       verifyToken();
//     }
//   }, [token]);
//   const login = () => {
//     window.location.href = "https://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/login"
//   };

//   const logout = () => {
//     setToken(null);
//     setUser(null);
//     localStorage.removeItem("token");

//     window.location.href = "https://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/logout"
//   };

//   // const isAuthenticated = async () => {
//   //   try {
//   //     const config = {
//   //       method: 'get',
//   //       withCredentials:true,
//   //       url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/user"
//   //     };
//   //     const response = await api(config)
//   //     // const response = await axios.post(
//   //     //   "https://your-backend.com/api/auth/verify-token",
//   //     //   {},
//   //     //   {
//   //     //     headers: {
//   //     //       Authorization: `Bearer ${token}`,
//   //     //     },
//   //     //   }
//   //     // );

//   //     setUser(response.data.user); // Assuming the backend sends user details

//   //   } catch (error) {
//   //     console.error("Token verification failed:", error);
//   //     login(); // Clear invalid token
//   //   } 
//   // }

//   return (
//     <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = React.useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };
