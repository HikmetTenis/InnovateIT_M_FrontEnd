import api from '../helpers/axios-custom';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
export const  getAvatar = (getAccessToken) => {
    return new Promise(async(resolve, reject) => {
        const token = await getAccessToken()
        const response = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // User has a profile photo
          const imageBlob = await response.blob();
          const imageObjectURL = URL.createObjectURL(imageBlob);
          resolve(imageObjectURL);
        } else if (response.status === 404) {
          // User does not have a profile photo
          console.warn('No profile photo found for the user.');
          resolve(null);
        } else {
          console.error('Error fetching profile photo:', response.statusText);
        }
    });
}

export const  getSystemInfo = () => {
    return new Promise((resolve, reject) => {
        var config = {
            method: 'get',
            withCredentials:true,
            url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/system/getSystemInfo"
          };
          api(config).then(function (response) {
            resolve(response)
          }).catch(function (error) {
            reject(error)
          });
    });
}