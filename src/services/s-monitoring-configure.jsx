import getApiInstance from '../helpers/axios-custom';
const alphabet = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];
export const  getPackages = async() => {
  const api = getApiInstance();
    return new Promise(async(resolve, reject) => {
        var config = {
            method: 'get',
            withCredentials:true,
            url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/artifacts/getPackages"
          };
          api(config).then(function (response) {
            resolve(response)
          }).catch(function (error) {
            reject(error)
          });
    });
}
export const  getArtifacts = async(artifactID) => {
  const api = getApiInstance();
  return new Promise(async(resolve, reject) => {
    var config = {
      method: 'get',
      withCredentials:true,
      url: "http://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/artifacts/getArtifacts?artifactID="+artifactID
    };
    api(config).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    });
  });
}
export const getElementType = (element) => { 
  const extentionElements = element.businessObject.extensionElements
  for(const e of extentionElements.values){
      const children = e.$children
      if(children[0].$type === "key" && children[0].$body === "activityType"){
          return children[1].$body
      }
  }  
  return null
}
export const processIntegrationProcesses = async(processName, processId,intProcessChildren, everyEvent, everyReceiverSenderAfter,everyReceiverSenderBefore, parentStepNumber, status,keepPayloadAsDefault,reprocessingAsDefault,stepLetter) => {
  let sequenceList = []
  let stepNumber = 1
  return new Promise(async(resolve, reject) => {
    if(parentStepNumber != null)
      stepNumber = parentStepNumber
    for(let child of intProcessChildren){
      if(everyEvent){
          if(child.type === "bpmn:StartEvent"  || child.$type === "bpmn:StartEvent"){
              let x = -25
              let y = -25
              let ll = []
              let ttype = child.type
              if(!ttype)
                ttype = child.$type
              for(let outgoing of child.outgoing){
                if(outgoing.id.indexOf("MessageFlow") === -1)
                  ll.push(outgoing.id)
              }
              let taskName = null
              if(child.name){
                taskName = child.name
              }else if(child.businessObject.name){
                taskName = child.businessObject.name
              }
              let isReprocessingpossible = true
              if(status === "FAILED"){
                isReprocessingpossible= false
              }
              const data = {
                  id:child.id,
                  id2:child.id,
                  sequences:ll,
                  keepPayload: keepPayloadAsDefault,
                  taskName:taskName,
                  reprocessing: reprocessingAsDefault,
                  reprocessingpossible: isReprocessingpossible,
                  stepType: "AUTO",
                  status:status,
                  type:ttype,
                  stepNumber:"Task_"+child.id,
                  parentName:processName,
                  parentID: processId,
                  name:"Task_"+child.id,
                  x:x,
                  y:y,
                  desc:"Task_"+child.id+" for "+processName, 
              }
              sequenceList.push(data)
              stepNumber++
          }
      }
    }
    for(let child of intProcessChildren){
        if(everyReceiverSenderBefore){
            if(child.type === "bpmn:ServiceTask"  || child.$type === "bpmn:ServiceTask"){
                const elementType = getElementType(child)
                if(elementType === "ExternalCall"){
                    let x = -25
                    let y = -25
                    let ll = []
                    let ttype = child.type
                    if(!ttype)
                      ttype = child.$type
                    for(let incoming of child.incoming){
                      if(incoming.id.indexOf("MessageFlow") === -1)
                        ll.push(incoming.id)
                    }
                    let taskName = null
                    if(child.name){
                      taskName = child.name
                    }else if(child.businessObject.name){
                      taskName = child.businessObject.name
                    }
                    const data = {
                        id:child.id,
                        id2:child.id,
                        stepType: "AUTO",
                        type:ttype,
                        keepPayload: keepPayloadAsDefault,
                        taskName:taskName,
                        stepNumber:"TaskB_"+child.id,
                        reprocessing: false,
                        reprocessingpossible: false,
                        status:status,
                        parentID: processId,
                        parentName:processName,
                        sequences:ll,
                        name:"TaskB_"+child.id,
                        x:x,
                        y:y,
                        desc:"TaskB_"+child.id+" for "+processName,
                    }
                    sequenceList.push(data)
                    stepNumber++
                }
            }
        }
        if(everyReceiverSenderAfter){
            if(child.type === "bpmn:ServiceTask"  || child.$type === "bpmn:ServiceTask"){
                const elementType = getElementType(child)
                if(elementType === "ExternalCall"){
                    let x = child.width-7
                    let y = child.height-7
                    let ll = []
                    let ttype = child.type
                    if(!ttype)
                      ttype = child.$type
                    for(let outgoing of child.outgoing){
                      if(outgoing.id.indexOf("MessageFlow") === -1)
                        ll.push(outgoing.id)
                    }
                    let taskName = null
                    if(child.name){
                      taskName = child.name
                    }else if(child.businessObject.name){
                      taskName = child.businessObject.name
                    }
                    const data = {
                        id:child.id,
                        id2:child.id,
                        type:ttype,
                        stepType: "AUTO",
                        taskName:taskName,
                        keepPayload: keepPayloadAsDefault,
                        stepNumber:"TaskA_"+child.id,
                        reprocessing: false,
                        reprocessingpossible: false,
                        status:status,
                        sequences:ll,
                        parentID: processId,
                        parentName:processName,
                        name:"TaskA_"+child.id,
                        x:x,
                        y:y,
                        desc:"TaskA_"+child.id+" for "+processName,
                    }
                    sequenceList.push(data)
                    stepNumber++
                }
            }
        }
    }
    for(let child of intProcessChildren){
        if(everyEvent){
            if(child.type === "bpmn:EndEvent" || child.$type === "bpmn:EndEvent"){
                let x = -25
                let y = -25
                let ll = []
                let ttype = child.type
                if(!ttype)
                  ttype = child.$type
                for(let incoming of child.incoming){
                  if(incoming.id.indexOf("MessageFlow") === -1)
                    ll.push(incoming.id)
                }
                let taskName = null
                if(child.name){
                  taskName = child.name
                }else if(child.businessObject.name){
                  taskName = child.businessObject.name
                }
                const data = {
                    id:child.id,
                    id2:child.id,
                    type:ttype,
                    stepType: "AUTO",
                    keepPayload: keepPayloadAsDefault,
                    taskName:taskName,
                    stepNumber:"Task_"+child.id,
                    status:status,
                    reprocessing: false,
                    reprocessingpossible: false,
                    parentName:processName,
                    sequences:ll,
                    parentID: processId,
                    name:"Task_"+child.id, 
                    x:x,
                    y:y,
                    desc:"Task_"+child.id+" for "+processName,
                } 
                sequenceList.push(data)
                stepNumber++
            }
        }
    }
    const subList = await processSubProcesses(processName, processId,intProcessChildren, everyEvent, everyReceiverSenderAfter,everyReceiverSenderBefore, stepNumber, status,keepPayloadAsDefault,reprocessingAsDefault,stepLetter) 
    sequenceList = [...sequenceList, ...subList] 
    resolve(sequenceList)
  })
}
export const processSubProcesses = async(processName, processId,intProcessChildren, everyEvent, everyReceiverSenderAfter,everyReceiverSenderBefore, parentStepNumber, status,keepPayloadAsDefault,reprocessingAsDefault,stepLetter) => {
  return new Promise(async(resolve, reject) => {
    for(let child of intProcessChildren){
      if(child.type === "bpmn:SubProcess"){
        const pType = await getProcessType(child.businessObject)
        if(pType === "EP")
          status = "FAILED"
        const subChildren = child.businessObject.flowElements
        const sequenceList = await processIntegrationProcesses(child.businessObject.name, child.businessObject.id,subChildren, everyEvent, everyReceiverSenderAfter,everyReceiverSenderBefore, parentStepNumber, status,keepPayloadAsDefault,reprocessingAsDefault,stepLetter)
        resolve(sequenceList)
      }
    }
    resolve([])
  })
}
export const modifyOverlays = async(modeler,everyEvent, everyReceiverSenderAfter,everyReceiverSenderBefore,keepPayloadAsDefault,reprocessingAsDefault) => {
  return new Promise(async(resolve, reject) => {
    const elementRegistry = modeler.get('elementRegistry');
    const elements = elementRegistry.getAll()
    const integrationProcesses = await getIntegrationProcesses(elements, "IP")
    let mergedArray = []
    let alphabetCounter = 0
    for(let integrationProcess of integrationProcesses){
        let stepLetter = alphabet[alphabetCounter]
        const intProcessChildren = integrationProcess.children
        const processName = integrationProcess.businessObject.name
        const processId = integrationProcess.businessObject.processRef.id
        let sequenceList = await processIntegrationProcesses(processName, processId,intProcessChildren, everyEvent, everyReceiverSenderAfter,everyReceiverSenderBefore, null, "SUCCESS",keepPayloadAsDefault,reprocessingAsDefault,stepLetter)
        mergedArray = [...sequenceList, ...mergedArray]
        integrationProcess.businessObject.processRef.stepNumber = sequenceList.length
        alphabetCounter++
    }
    const localIntegrationProcesses = await getIntegrationProcesses(elements, "LP")
    for(let integrationProcess of localIntegrationProcesses){
        let stepLetter = alphabet[alphabetCounter]
        const intProcessChildren = integrationProcess.children
        const processName = integrationProcess.businessObject.name
        const processId = integrationProcess.businessObject.processRef.id
        let sequenceList = await processIntegrationProcesses(processName, processId,intProcessChildren, everyEvent, everyReceiverSenderAfter,everyReceiverSenderBefore, null, "SUCCESS",keepPayloadAsDefault,reprocessingAsDefault,stepLetter)
        mergedArray = [...sequenceList, ...mergedArray]
        integrationProcess.businessObject.processRef.stepNumber = sequenceList.length
        alphabetCounter++
    }
    const exceptionIntegrationProcesses = await getIntegrationProcesses(elements, "EP")
    for(let integrationProcess of exceptionIntegrationProcesses){
      let stepLetter = alphabet[alphabetCounter]
        const intProcessChildren = integrationProcess.children
        const processName = integrationProcess.businessObject.name
        const processId = integrationProcess.businessObject.processRef.id
        let sequenceList = await processIntegrationProcesses(processName, processId,intProcessChildren, everyEvent, everyReceiverSenderAfter,everyReceiverSenderBefore,null, "FAILED",keepPayloadAsDefault,reprocessingAsDefault,stepLetter)
        mergedArray = [...sequenceList, ...mergedArray]
        integrationProcess.businessObject.processRef.stepNumber = sequenceList.length
        alphabetCounter++
    }
    resolve(mergedArray)
  })
}
export const getProcessType = async(pr) => {
  return new Promise(async(resolve, reject) => {
    const extentionElements = pr.extensionElements
    for(const extension of extentionElements.values){
        const children = extension.$children
        for(const c of children) {
            if(c.$body.indexOf("cname::IntegrationProcess") !== -1){
              resolve("IP")
            }else if(c.$body.indexOf("cname::LocalIntegrationProcess") !== -1){
              resolve("LP")
            }else if(c.$body.indexOf("cname::ErrorEventSubProcessTemplate") !== -1){
              resolve("EP")
            }
        }
    }
    resolve(null)
  })
}
export const  getIntegrationProcesses = async(elements, type) => {
  return new Promise(async(resolve, reject) => {
    let list = []
    for(const e of elements){
      if(e.type === "bpmn:Participant" && e.businessObject !== undefined && e.businessObject.processRef !== undefined){
          const extentionElements = e.businessObject.processRef.extensionElements
          for(const extension of extentionElements.values){
              const children = extension.$children
              for(const c of children) {
                if(c.$body.indexOf("cname::IntegrationProcess") !== -1 && type ==='IP'){
                  list.push(e)
                }else if(c.$body.indexOf("cname::LocalIntegrationProcess") !== -1 && type ==='LP'){
                  list.push(e)
                }else if(c.$body.indexOf("cname::ErrorEventSubProcessTemplate") !== -1 && type ==='EP'){
                  list.push(e)
                }
              }
          }
      }
    }
    resolve(list)
  })
}
export const  getArtifactDetails = async(artifactID, name,version) => {
  const api = getApiInstance();
  return new Promise(async(resolve, reject) => {
    const config = {
      method: 'get',
      withCredentials:true,
      url: "/artifacts/getArtifactDetails?name="+name+"&version="+version+"&artifactID="+artifactID
    };
    api(config).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    });
  });
}
export const  getArtifactRuntimeDetails = async(artifactID) => {
  const api = getApiInstance();
  return new Promise(async(resolve, reject) => {
    var config = {
      method: 'get',
      withCredentials:true,
      url: "/artifacts/getArtifactRuntimeDetails?&artifactID="+artifactID
    };
    api(config).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    });
  });
}
export const  saveArtifact = async(artifact) => {
  const api = getApiInstance();
  return new Promise(async(resolve, reject) => {
    var config = {
      method: 'post',
      withCredentials:true,
      url: "/artifacts/saveArtifact",
      data:artifact
    };
    api(config).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    });
  });
}
export const  modifyArtifact = (artifact) => {
  const api = getApiInstance();
  return new Promise((resolve, reject) => {
    var config = {
      method: 'post',
      maxBodyLength: Infinity,
      withCredentials:true,
      url: "/artifacts/modifyArtifact",
      data:artifact
    };
    api(config).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    });
  });
}