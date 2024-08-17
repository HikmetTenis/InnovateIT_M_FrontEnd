import axios from "axios";
axios.defaults.withCredentials = true
export const  getMessagesByDate = async(startDate, endDate, skip, limit, status) => {
    return new Promise(async(resolve, reject) => {
        var config = {
            method: 'get',
            withCredentials:true,
            url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/messages/getMessagesByDate?status="+status+"&startDate='"+startDate+"'&endDate='"+endDate+"'&limit="+limit+"&skip="+skip
          };
          axios(config).then(function (response) {
            resolve(response)
          }).catch(function (error) {
            reject(error)
          });
    });
}