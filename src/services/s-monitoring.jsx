import getApiInstance from '../helpers/axios-custom';
export const  reprocess = (stepNumber,messageID) => {
  const api = getApiInstance();
    return new Promise((resolve, reject) => {
        const config = {
            method: 'get',
            withCredentials:true,
            url: "/monitoring/reprocess?step="+stepNumber+"&messageID="+messageID
          };
          api(config).then(function (response) {
            resolve(response)
          }).catch(function (error) {
            reject(error)
          });
    });
}
export const  getGraphAllData = (startDate, endDate, period) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
      const config = {
        method: 'get',
        withCredentials:true,            
        url: "/monitoring/getGraphAllData?period="+period+"&startDate='"+startDate+"'&endDate='"+endDate+"'"
      };
      api(config).then(function (response) {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      });
  });
}
export const  getGraphData = (startDate, endDate, status, period) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
      const config = {
          method: 'get',
          withCredentials:true,            
          url: "/monitoring/getGraphData?period="+period+"&status="+status+"&startDate='"+startDate+"'&endDate='"+endDate+"'"
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const  getJMSGraphData = (startDate, endDate, period) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
      const config = {
          method: 'get',
          withCredentials:true,            
          url: "/monitoring/getJMSGraphData?period="+period+"&startDate='"+startDate+"'&endDate='"+endDate+"'"
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const getJMSStats = (broker) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
      const config = {
          method: 'get',
          withCredentials:true,
          url: "/monitoring/getJMSStats?broker='"+broker+"'"
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const getJMSStatsQueueNamesHigh = (broker) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
      const config = {
          method: 'get',
          withCredentials:true,
          url: "/monitoring/getJMSStatsInactiveQueues?broker='"+broker+"'"
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const  getPayload = (stepNumber,messageID) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
      const config = {
          method: 'get',
          withCredentials:true,
          url: "/monitoring/getPayload?step="+stepNumber+"&messageID="+messageID
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const  getNotifications = (accessToken,startDate,endDate) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${accessToken}`,  // Attach the token to the request
        'Content-Type': 'application/json'
      },
      method: 'get',
      withCredentials:true,
      url: "/monitoring/getNotifications?startDate="+startDate+"&endDate="+endDate
    };
    api(config).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    });
  });
}