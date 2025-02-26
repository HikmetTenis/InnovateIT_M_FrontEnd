import axios from 'axios';

let apiInstance = null; // Singleton instance
let interceptorsConfigured = false;
let protocol = "https"
if(process.env.REACT_APP_SERVER_URL == "localhost")
  protocol = "http"
const createApiInstance = () => {
  return axios.create({
    baseURL: `${protocol}://${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}`,
    headers: {
      'Content-Type': 'application/json',
    },
    //withCredentials: true
  });
};

export const getApiInstance = () => {
  if (!apiInstance) {
    apiInstance = createApiInstance();

    if (!interceptorsConfigured) {
      // Request Interceptor
      apiInstance.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem('jwtToken');
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Response Interceptor
      apiInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;

          if (originalRequest) {
            // Ensure `_retryCount` is initialized
            if (!originalRequest._retryCount) {
              originalRequest._retryCount = 0;
            }

            // Retry logic for server errors (status >= 500)
            if (error.response && error.response.status >= 500 && originalRequest._retryCount < 3) {
              originalRequest._retryCount += 1; // Increment retry counter
              return apiInstance(originalRequest); // Retry request
            }
          }

          // Handle unauthorized or forbidden errors
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (window.location.pathname !== '/login') {
              if(process.env.REACT_APP_AUTHTYPE === "SAML"){
                window.location.href = protocol+"://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/loginSAML"
              }else{
                window.location.href ="/login"
              }
            }
          }

          return Promise.reject(error); // Reject for other errors
        }
      );

      interceptorsConfigured = true;
    }
  }

  return apiInstance;
};

export default getApiInstance;
