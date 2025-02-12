import getApiInstance from '../helpers/axios-custom';

export const createAccount  = (reqData, type) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
    let url = "/account/createAccount?type="+type
    const config = {
      method: 'post',
      url: url,
      data:reqData 
    };
    api(config).then(function (response) {
      resolve(response.data)
    }).catch(function (error) {
      reject(error)
    });
  })
} 
export const getTrialPeriod  = (reqData, type) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
    let url = "/trial/getTrialPeriod"
    const config = {
      method: 'get',
      url: url 
    };
    api(config).then(function (response) {
      resolve(response.data)
    }).catch(function (error) {
      reject(error)
    });
  })
}
export const signIn  = (reqData) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
    let url = "/sso/login"
    const config = {
      method: 'post',
      url: url,
      data:reqData 
    };
    api(config).then(function (response) {
      resolve(response.data)
    }).catch(function (error) {
      reject(error)
    });
  })
}
export const resetPassword  = (reqData) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
    let url = "/account/resetPassword"
    const config = {
      method: 'post',
      url: url,
      data:reqData 
    };
    api(config).then(function (response) {
      resolve(response.data)
    }).catch(function (error) {
      reject(error)
    });
  })
}
export const checkPasswordLink = (link, username) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
    let url = "/account/checkPasswordLink?link="+link+"&username="+username
    const config = {
      method: 'get',
      url: url
    };
    api(config).then(function (response) {
      resolve(response.data)
    }).catch(function (error) {
      reject(error)
    });
  })
}
export const savePassword = (reqData) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
    let url = "/account/savePassword"
    const config = {
      method: 'post',
      url: url,
      data:reqData 
    };
    api(config).then(function (response) {
      resolve(response.data)
    }).catch(function (error) {
      reject(error)
    });
  })
}
export const changeInitialPassword = (reqData) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
    let url = "/account/changeInitialPassword"
    const config = {
      method: 'post',
      url: url,
      data:reqData 
    };
    api(config).then(function (response) {
      resolve(response.data)
    }).catch(function (error) {
      reject(error)
    });
  })
}
export const getAccount = (reqData) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
    let url = "/account/getAccount"
    const config = {
      method: 'get',
      url: url
    };
    api(config).then(function (response) {
      resolve(response.data)
    }).catch(function (error) {
      reject(error)
    });
  })
}
export const getService = (reqData) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
    let url = "/account/getService"
    const config = {
      method: 'get',
      url: url
    };
    api(config).then(function (response) {
      resolve(response.data)
    }).catch(function (error) {
      reject(error)
    });
  })
}