import axios from "axios";
export const  getArtifacts = async() => {
    return new Promise(async(resolve, reject) => {
      console.log(process.env)
        var config = {
            method: 'get',
            url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/articles/getArtifacts"
          };
          axios(config).then(function (response) {
            resolve(response)
          }).catch(function (error) {
            reject(error)
          });
    });
}
export const  getArtifact = async(artifactID) => {
  return new Promise(async(resolve, reject) => {
    var config = {
      method: 'get',
      url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/articles/getArtifact?artifactID="+artifactID
    };
    axios(config).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    });
  });
}
export const  getArtifactDetails = async(artifactID, version) => {
  return new Promise(async(resolve, reject) => {
    var config = {
      method: 'get',
      url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/articles/getArtifactDetails?version="+version+"&artifactID="+artifactID
    };
    axios(config).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    });
  });
}
export const  getArtifactRuntimeDetails = async(artifactID) => {
  return new Promise(async(resolve, reject) => {
    var config = {
      method: 'get',
      url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/articles/getArtifactRuntimeDetails?&artifactID="+artifactID
    };
    axios(config).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    });
  });
}