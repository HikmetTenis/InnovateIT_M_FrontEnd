import api from '../helpers/axios-custom';

export const  getMessagesByDate = (startDate, endDate, skip, limit, status, customData,artifactName) => {
    return new Promise((resolve, reject) => {
        var config = {
            method: 'get',
            withCredentials:true,            
            url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/messages/getMessagesByDate?artifactName="+artifactName+"&customData=\""+customData+"\"&status="+status+"&startDate='"+startDate+"'&endDate='"+endDate+"'&limit="+limit+"&skip="+skip
          };
          api(config).then(function (response) {
            resolve(response)
          }).catch(function (error) {
            reject(error)
          });
    });
}
export const  getCountByStatus = (startDate, endDate,status) => {
  return new Promise((resolve, reject) => {
      var config = {
          method: 'get',
          withCredentials:true,            
          url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/messages/getStatusCount?status="+status+"&startDate='"+startDate+"'&endDate='"+endDate+"'"
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const getMessagesBySearch = (searchString, l, s) => {
  return new Promise((resolve, reject) => {
      var config = {
          method: 'get',
          withCredentials:true,
          url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/messages/getMessagesBySearch?searchString='"+searchString+"'&limit="+l+"&skip="+s
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const  getAllStatus = () => {
  return new Promise((resolve, reject) => {
      var config = {
          method: 'get',
          withCredentials:true,
          url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/messages/getAllStatus"
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const  getAllArtifacts = () => {
  return new Promise((resolve, reject) => {
      var config = {
          method: 'get',
          withCredentials:true,
          url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/messages/getAllArtifacts"
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
export const  getProcessDetails = (id, messageID) => {
  return new Promise((resolve, reject) => {
      var config = {
          method: 'get',
          withCredentials:true,
          url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/messages/getProcessDetails?id="+id+"&messageID="+messageID
        };
        api(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
