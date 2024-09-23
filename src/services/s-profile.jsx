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
// const getAccessToken = (accounts,instance) => {
//     return new Promise(async(resolve, reject) => {
//         if (accounts.length > 0) {
//             const request = {
//                 scopes: 'User.Read',
//                 account: accounts[0],
//                 forceRefresh: true,
//             };

//             try {
//                 const response = await instance.acquireTokenSilent(request);
//                 resolve(response.accessToken)
//             } catch (error) {
//                 if (error instanceof InteractionRequiredAuthError) {
//                     try {
//                         const response = await instance.acquireTokenPopup(request);
//                         resolve(response.accessToken)
//                     } catch (popupError) {
//                         console.error('Failed to acquire token via popup', popupError);
//                     }
//                 }
//                 resolve(null);
//             }
//         }
//         resolve(null);
//     })
// };