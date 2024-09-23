import {getMessagesByDate,getMessagesBySearch} from '../services/s-messages'
import moment from 'moment';
import momentTZ from 'moment-timezone';
let interval = null
onmessage =  async function (e) {
    const { taskName,action,type,period,jobDetails} = e.data;
    if (action === "start") {
        const result = await getMessages(jobDetails, type)
        postMessage(result);
      // Run a task every 10 seconds
      interval = setInterval(async() => {
        const result = await getMessages(jobDetails, type)
        postMessage(result);
      }, period);
    }else if(action === 'stop' && interval != null){
        clearInterval(interval)
    }else if(action === 'update' && interval != null){
        clearInterval(interval)
        const result = await getMessages(jobDetails, type)
        postMessage(result);
      // Run a task every 10 seconds
      interval = setInterval(async() => {
        const result = await getMessages(jobDetails, type)
        postMessage(result);
      }, period);
    }
};
async function getMessages(jobDetails, type) {
    return new Promise((resolve, reject) => {
        const dateSelectedSplitted = jobDetails.dayFilter.split(":")
        let now = moment();
        const endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
        let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
        
        const startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
        getMessagesByDate(startDate,endDate, jobDetails.skip, jobDetails.limit, type, jobDetails.customData,jobDetails.artifactSelection).then((res)=>{
            resolve(res.data);
        })
    })
}