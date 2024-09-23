import axios from 'axios';
import { AuthContext } from './authcontext';

const api = axios.create({
  baseURL: 'http://'+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT,
  headers: {
    'Content-Type': 'application/json',
  },
});

let interceptorsConfigured = false;

export const setupAxiosInterceptors = (getAccessToken) => {
  if (!interceptorsConfigured) {
    // Request interceptor
    api.interceptors.request.use(
      async (config) => {
        const token = await getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const token = await getAccessToken();
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    interceptorsConfigured = true;
  }
};

export default api;

// // // Create an MSAL instance
// // const msalInstance = new PublicClientApplication(msalConfig);

// // Function to get an access token using MSAL
// const getAccessToken = async (msalInstance) => {
//   try {
//     const accounts = msalInstance.getAllAccounts();

//     if (accounts.length > 0) {
//       const response = await msalInstance.acquireTokenSilent({
//         ...loginRequest,
//         account: accounts[0],
//       });
//       return response.accessToken;
//     } else {
//       throw new Error('No accounts found in MSAL.');
//     }
//   } catch (error) {
//     // Fallback to interactive login if silent token acquisition fails
//     console.log('Silent token acquisition failed, acquiring token interactively...');
//     const response = await msalInstance.loginRedirect(loginRequest);
//     return response.accessToken;
//   }
// };
// export const setupAxiosInterceptors = async (msalInstance, accounts, loginRequest) => {
//   // Asynchronous Request Interceptor
//   api.interceptors.request.use(
//     async (config) => {
//       if (accounts.length > 0) {
//         try {
//           // Acquire token silently
//           const tokenResponse = await msalInstance.acquireTokenSilent({
//             ...loginRequest,
//             account: accounts[0],
//           });
//           config.headers.Authorization = `Bearer ${tokenResponse.accessToken}`;
//         } catch (error) {
//           console.error('Silent token acquisition failed:', error);

//           // Fallback to interactive login if silent token acquisition fails
//           try {
//             const tokenResponse = await msalInstance.acquireTokenPopup(loginRequest);
//             config.headers.Authorization = `Bearer ${tokenResponse.accessToken}`;
//           } catch (popupError) {
//             console.error('Popup token acquisition failed:', popupError);
//             // Handle the error as needed, possibly by redirecting to login
//           }
//         }
//       }
//       return config;
//     },
//     async (error) => {
//       // Handle request error
//       return Promise.reject(error);
//     }
//   );

//   // Asynchronous Response Interceptor
//   api.interceptors.response.use(
//     async (response) => {
//       // You can process the response here if needed
//       return response;
//     },
//     async (error) => {
//       if (error.response) {
//         // Check for specific status codes
//         if (error.response.status === 401) {
//           console.warn('Received 401 error, attempting to refresh token...');

//           try {
//             // Attempt to acquire a new token silently
//             const tokenResponse = await msalInstance.acquireTokenSilent({
//               ...loginRequest,
//               account: accounts[0],
//               forceRefresh: true, // Force a refresh of the token
//             });

//             // Update the failed request with the new token and retry
//             error.config.headers.Authorization = `Bearer ${tokenResponse.accessToken}`;
//             return api.request(error.config);
//           } catch (tokenRefreshError) {
//             console.error('Token refresh failed:', tokenRefreshError);

//             // Optionally, redirect to login if token refresh fails
//             try {
//               await msalInstance.loginRedirect(loginRequest);
//               // After login, retry the original request
//               return api.request(error.config);
//             } catch (loginError) {
//               console.error('Login after token refresh failed:', loginError);
//               // Redirect to a login page or show an error message
//               // For example: window.location.href = '/login';
//             }
//           }
//         }
//       }
//       // Reject the error if it cannot be handled
//       return Promise.reject(error);
//     }
//   );
// };
// // export const setupAxiosInterceptors = (msalInstance, accounts, loginRequest) => {
// //   // Axios Request Interceptor to add access token to the headers
// //   api.interceptors.request.use(
// //     async (config) => {
// //       const token = await getAccessToken(msalInstance); // Get the access token from MSAL
// //       if (token) {
// //         config.headers.Authorization = `Bearer ${token}`; // Add the token to the Authorization header
// //       }
// //       return config;
// //     },
// //     (error) => {
// //       return Promise.reject(error); // Handle request error
// //     }
// //   );

// //   // Axios Response Interceptor (Optional: Handle specific response errors globally)
// //   api.interceptors.response.use(
// //     (response) => {
// //       return response; // Return the response if successful
// //     },
// //     (error) => {
// //       if (error.response && error.response.status === 401) {
// //         // Handle unauthorized access (token might be expired or invalid)
// //         //window.location.href = '/login'; // Redirect to login if 401 is encountered
// //         msalInstance.loginRedirect(loginRequest);
// //       }
// //       return Promise.reject(error); // Return the error so individual requests can handle it
// //     }
// //   );
// // }
// export default api;
