import axios from 'axios'
const moment = require('moment');
let accessToken = null;

// Function to fetch notifications from the backend
async function fetchNotifications() {
  if (!accessToken) {
    postMessage({ error: 'No access token provided' });
    return;
  }

  try {
    const endDate = moment().toISOString();;
    // Get the time exactly one hour ago (start date)
    const startDate = moment().subtract(1, 'hours').toISOString();;
    const config = {
      headers: {
        'Authorization': `Bearer ${accessToken}`,  // Attach the token to the request
        'Content-Type': 'application/json'
      },
      method: 'get',
      withCredentials:true,
      url: `https://${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/monitoring/getNotifications?startDate=${startDate}&endDate=${endDate}`
    };
    const response = await axios(config)
    postMessage(response.data.obj);  // Send back notifications to the main thread
  } catch (error) {
    if(accessToken && (error.response.status === 401 || error.response.status === 403))
      postMessage({error:{status:error.response.status}});
    console.log(error)
  }
}
fetchNotifications()
// Periodically fetch notifications every 10 seconds
setInterval(fetchNotifications, 10000);
  
  // To trigger the fetch manually (if needed)
onmessage = function (e) {
  accessToken = e.data.token;  
  // Store the access token in the worker
  fetchNotifications();
};
  