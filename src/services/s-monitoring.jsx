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
export const getJMSStats = () => {
  return new Promise((resolve, reject) => {
      var config = {
          method: 'get',
          withCredentials:true,
          url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/monitoring/getJMSStats"
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