import getApiInstance from '../helpers/axios-custom';

export const  getIntegrationMap = () => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
      const config = {
          method: 'get',
          withCredentials:true,            
          url: "/integration/getParticipants"
      };
      api(config).then(function (response) {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      });
  });
}