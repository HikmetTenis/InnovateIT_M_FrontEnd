import api from '../helpers/axios-custom';
export const  reprocess = (stepNumber,messageID) => {
    return new Promise((resolve, reject) => {
        var config = {
            method: 'get',
            withCredentials:true,
            url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/monitoring/reprocess?step="+stepNumber+"&messageID="+messageID
          };
          api(config).then(function (response) {
            resolve(response)
          }).catch(function (error) {
            reject(error)
          });
    });
}
export const  getGraphAllData = (startDate, endDate, period) => {
  return new Promise((resolve, reject) => {
      var config = {
          method: 'get',
          withCredentials:true,            
          url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/monitoring/getGraphAllData?period="+period+"&startDate='"+startDate+"'&endDate='"+endDate+"'"
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const  getGraphData = (startDate, endDate, status, period) => {
  return new Promise((resolve, reject) => {
      var config = {
          method: 'get',
          withCredentials:true,            
          url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/monitoring/getGraphData?period="+period+"&status="+status+"&startDate='"+startDate+"'&endDate='"+endDate+"'"
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const  getJMSGraphData = (startDate, endDate, period) => {
  return new Promise((resolve, reject) => {
      var config = {
          method: 'get',
          withCredentials:true,            
          url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/monitoring/getJMSGraphData?period="+period+"&startDate='"+startDate+"'&endDate='"+endDate+"'"
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const getJMSStats = (broker) => {
  return new Promise((resolve, reject) => {
      var config = {
          method: 'get',
          withCredentials:true,
          url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/monitoring/getJMSStats?broker='"+broker+"'"
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const getJMSStatsQueueNamesHigh = (broker) => {
  return new Promise((resolve, reject) => {
      var config = {
          method: 'get',
          withCredentials:true,
          url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/monitoring/getJMSStatsInactiveQueues?broker='"+broker+"'"
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const  getPayload = (stepNumber,messageID) => {
    return new Promise((resolve, reject) => {
        var config = {
            method: 'get',
            withCredentials:true,
            url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/monitoring/getPayload?step="+stepNumber+"&messageID="+messageID
          };
          api(config).then(function (response) {
            resolve(response)
          }).catch(function (error) {
            reject(error)
          });
    });
}
export const  getNotifications = (accessToken,startDate,endDate) => {
  return new Promise((resolve, reject) => {
      var config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`,  // Attach the token to the request
            'Content-Type': 'application/json'
          },
          method: 'get',
          withCredentials:true,
          url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/monitoring/getNotifications?startDate="+startDate+"&endDate="+endDate
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}