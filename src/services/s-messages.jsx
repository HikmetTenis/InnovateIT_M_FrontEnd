import getApiInstance from '../helpers/axios-custom';

export const  getMessagesByDate = (startDate, endDate, skip, limit, status, customData,artifactName) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
      const config = {
          method: 'get',
          withCredentials:true,            
          url: "/messages/getMessagesByDate?artifactName="+artifactName+"&customData=\""+customData+"\"&status="+status+"&startDate='"+startDate+"'&endDate='"+endDate+"'&limit="+limit+"&skip="+skip
      };
      api(config).then(function (response) {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      });
  });
}
export const  getCountByStatus = (startDate, endDate,status) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
    const config = {
        method: 'get',
        withCredentials:true,            
        url: "/messages/getStatusCount?status="+status+"&startDate='"+startDate+"'&endDate='"+endDate+"'"
    };
    api(config).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    });
  });
}
export const getMessagesBySearch = (searchString, l, s) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
      const config = {
          method: 'get',
          withCredentials:true,
          url: "/messages/getMessagesBySearch?searchString='"+searchString+"'&limit="+l+"&skip="+s
      };
      api(config).then(function (response) {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      });
  });
}
export const  getAllStatus = () => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
      const config = {
          method: 'get',
          withCredentials:true,
          url: "/messages/getAllStatus"
      };
      api(config).then(function (response) {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      });
  });
}
export const  getAllArtifacts = () => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
      const config = {
          method: 'get',
          withCredentials:true,
          url: "/messages/getAllArtifacts"
      };
      api(config).then(function (response) {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      });
  });
}
export const  getProcessDetails = (id, messageID) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
      const config = {
          method: 'get',
          withCredentials:true,
          url: "/messages/getProcessDetails?id="+id+"&messageID="+messageID
      };
      api(config).then(function (response) {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      });
  });
}
