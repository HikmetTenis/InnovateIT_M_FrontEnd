import axios from "axios";
axios.defaults.withCredentials = true
export const  reprocess = (stepNumber,messageID) => {
    return new Promise((resolve, reject) => {
        var config = {
            method: 'get',
            withCredentials:true,
            url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/monitoring/reprocess?step="+stepNumber+"&messageID="+messageID
          };
          axios(config).then(function (response) {
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
          axios(config).then(function (response) {
            resolve(response)
          }).catch(function (error) {
            reject(error)
          });
    });
}