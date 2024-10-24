import {getNotifications} from "../services/s-monitoring"
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
    console.log(startDate,endDate)
    const response = await getNotifications(accessToken,startDate,endDate)
    postMessage(response.data.obj);  // Send back notifications to the main thread
  } catch (error) {
    console.log(error)
  }
}
fetchNotifications()
// Periodically fetch notifications every 10 seconds
setInterval(fetchNotifications, 30000);
  
  // To trigger the fetch manually (if needed)
onmessage = function (e) {

        accessToken = e.data.token;  // Store the access token in the worker
        fetchNotifications();

};
  