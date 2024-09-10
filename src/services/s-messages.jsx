import axios from "axios";
axios.defaults.withCredentials = true
export const  getMessagesByDate = (startDate, endDate, skip, limit, status, customData) => {
    return new Promise((resolve, reject) => {
        var config = {
            method: 'get',
            withCredentials:true,
            url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/messages/getMessagesByDate?customData=\""+customData+"\"&status="+status+"&startDate='"+startDate+"'&endDate='"+endDate+"'&limit="+limit+"&skip="+skip
          };
          axios(config).then(function (response) {
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
        axios(config).then(function (response) {
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
        axios(config).then(function (response) {
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
        axios(config).then(function (response) {
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
        axios(config).then(function (response) {
          resolve(response)
        }).catch(function (error) {
          reject(error)
        });
  });
}
