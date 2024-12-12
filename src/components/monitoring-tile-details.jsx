import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import {getMessagesByDate,getAllArtifacts, getProcessDetails,getAllStatus,getMessagesBySearch} from '../services/s-messages'
import React, { useState,useEffect,useRef, useContext } from 'react';
import moment from 'moment';
import $ from 'jquery';
import momentTZ from 'moment-timezone';
import MessageContext from "../helpers/message-context";
import MonitoringTileDetailsConfigure from "./monitoring-tile-details-configure"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {getPayload} from '../services/s-monitoring'
import { ListItemStandard ,List,Popover,Timeline,TimelineItem,AnalyticalTable,AnalyticalTableSubComponentsBehavior,TimelineGroupItem, DateTimePicker,Panel,Icon,Link,Text,Bar,MultiComboBox,MultiComboBoxItem,Select,Option,Switch,BusyIndicator,Button, Input,FilterGroupItem,FlexBox,Label,Title} from '@ui5/webcomponents-react';

const MonitoringPageDetails = props => {
  const [details, setDetails] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [showStepDiagram, setShowStepDiagram] = useState(false);
  const {message,setMessage} = useContext(MessageContext);
  const [currentMessage,setCurrentMessage] = useState(null);
  let offset = useRef(null);
  let limit = useRef(null);
  let totalEntries = useRef(null);
  let totalPages = useRef(null);
  let dateSelection = useRef(null);
  let statusSelection = useRef(null);
  let artifactSelection = useRef(null);
  let searchSelection = useRef(null);
  let backOnePage = useRef(null);
  let forwardOnePage = useRef(null);
  let firstPage = useRef(null);
  let lastPage = useRef(null);
  let currentPage = useRef(null);
  let limitSelection = useRef(null);
  let customHeaderProperties = useRef(null);
  let customStartdate  = useRef(null);
  let customEnddate  = useRef(null);
  let customPanel  = useRef(null);
  let popoverHeader  = useRef(null);
  let popoverBody  = useRef(null);
  let popoverBody2  = useRef(null);
  let [stepNumbers,setStepNumbers] = useState([]);
  let [allArtifacts, setAllArtifacts] = useState([]);
  let [statusList, setStatusList] = useState([]);
  let [payloadLoaded, setPayloadLoaded] = useState(false);
  const [popoverRef, setPopoverRef] = useState(null);
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const [popoverRef1, setPopoverRef1] = useState(null);
  const [popoverIsOpen1, setPopoverIsOpen1] = useState(false);
  const [popoverBody1, setPopoverBody1] = useState([]);
  const [popoverRef2, setPopoverRef2] = useState(null);
  const [popoverIsOpen2, setPopoverIsOpen2] = useState(false);
  const showDetails = (d) => {
      setDetails(d);
  };
  const wrapperVariants = {
    hidden: {
      opacity: 0,
      x: '5vw',
      transition: { ease: 'easeInOut', delay: 0.1 },
      display: "none"
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { ease: 'easeInOut', delay: 0.4 },
      display: "flex"
    },
    exit: {
      x: '5vh',
      transition: { ease: 'easeInOut' },
    },
  };
  
  let options = [<MultiComboBoxItem key={0} text="ALL" selected id="selecAllID" data-selected='true'>ALL</MultiComboBoxItem>]
  for (let i = 1; i <= 100; i++) {
    options.push(<MultiComboBoxItem key={i} text={i}>{i}  </MultiComboBoxItem>)
  }
  $( ".messageRow" ).hover(
    function(e) {
      const id = e.target.id
      if(id && id !== null && id !== ""){
        let cells = document.querySelectorAll("#"+id);

        for(let cell of cells){
          $(cell).css("background-color", "whitesmoke"); 
        }
      }
    }, function(e) {
      const id = e.target.id
      if(id && id !== null && id !== ""){
        let cells = document.querySelectorAll("#"+id);
        for(let cell of cells){
          $(cell).css("background-color", "white"); 
        }
      }
    }
  );
  useEffect(() => {
    let s = 0
    let l = 10
    const dateSelected = dateSelection.current.value
    if(dateSelected !== "Custom"){
      customStartdate.current.disabled = true
      customEnddate.current.disabled = true
      customStartdate.current.value = ""
      customEnddate.current.value = ""
    }else{
      customStartdate.current.disabled = false
      customEnddate.current.disabled = false
    }
    offset.current.innerHTML = s
    limit.current.innerHTML = l
    currentPage.current.value = 1
    limitSelection.current.value = 10
    setStepNumbers(options)
    let now = moment();
    const endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
    let past = now.subtract(60, 'minutes');
    
    const startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
    getMessages(startDate,endDate, s, l, "ALL", "NONE", "ALL")
    const fetchData = async () => {
      const artifacts = await getAllArtifacts()
      let allArtifacts = [<Option key='0' value="ALL" selected>All</Option>]
      let c = 1
      for(const e of artifacts.data.obj){
        allArtifacts.push(<Option key={c} value={e}>{e}</Option>)
        c++
      }
      const statuses = await getAllStatus()
      let allStatus = [<MultiComboBoxItem text="ALL" key={0} selected id="selecAllID1" data-selected='true'>ALL</MultiComboBoxItem>]
      for (let i = 1; i < statuses.data.obj.length; i++) {
        if(statuses.data.obj[i] !== "DISCARDED")
          allStatus.push(<MultiComboBoxItem key = {i} text={statuses.data.obj[i]}>{statuses.data.obj[i]}</MultiComboBoxItem>)
      }
      setAllArtifacts(allArtifacts)
      setStatusList(allStatus)
    }
    fetchData();
  }, [])
  const handleExpandChange = (row) => {
    setTimeout(() => {
      // Select all elements with class 'customPositive' (which contains multiple ui5-icons)
      const customPositiveElements = document.querySelectorAll('.customPositive');
      
      customPositiveElements.forEach((customPositiveElement) => {
        if (customPositiveElement.shadowRoot) {
          // Find all ui5-icons inside the shadow DOM
          const iconElements = customPositiveElement.shadowRoot.querySelectorAll('ui5-icon');
          
          iconElements.forEach((iconElement) => {
            if (iconElement.shadowRoot) {
              const svgElement = iconElement.shadowRoot.querySelector('svg');
              if (svgElement) {
                svgElement.style.fill = 'green';  // Change the color for each icon
              }
            }
          });
        }
      });
      const customNegativeElements = document.querySelectorAll('.customNegative');
      
      customNegativeElements.forEach((customPositiveElement) => {
        if (customPositiveElement.shadowRoot) {
          // Find all ui5-icons inside the shadow DOM
          const iconElements = customPositiveElement.shadowRoot.querySelectorAll('ui5-icon');
          
          iconElements.forEach((iconElement) => {
            if (iconElement.shadowRoot) {
              const svgElement = iconElement.shadowRoot.querySelector('svg');
              if (svgElement) {
                svgElement.style.fill = 'red';  // Change the color for each icon
              }
            }
          });
        }
      });
    }, 0);
  };
  const showErrorDetails = (message)=>{
    setPopoverRef2("err_"+message.messageId)
    const binaryString = window.atob(message.errorInfo);
    let formattedOutput = binaryString
    if(isJsonString(binaryString)){
      // Parse the JSON string into an object
      const jsonObject = JSON.parse(binaryString);

      // Format the JSON object into a readable string with indentation
      formattedOutput = JSON.stringify(jsonObject, null, 2);
    }else if(isXmlString(binaryString)){
      // Parse the XML string
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(binaryString, "application/xml");

      // Serialize the XML back into a string with formatting
      const serializer = new XMLSerializer();
      formattedOutput = serializer.serializeToString(xmlDoc);
    }
    popoverBody2.current.innerText=formattedOutput
    setPopoverIsOpen2(true)  
  }
  const upateMessages  = async (res,l,s)=>{
    totalEntries.current.innerHTML =  res.data.obj.total
    totalPages.current.innerHTML = Math.ceil(parseInt(res.data.obj.total)/parseInt(l))
    
    if(parseInt(res.data.obj.total) > 0 && parseInt(s) > 0 && parseInt(currentPage.current.value) > 1){
      firstPage.current.style.cursor = "hand"
      firstPage.current.style.color = "black"
      backOnePage.current.style.cursor = "hand"
      backOnePage.current.style.color = "black"
    }else{
      firstPage.current.style.cursor = "not-allowed"
      firstPage.current.style.color = "lightgrey"
      backOnePage.current.style.cursor = "not-allowed"
      backOnePage.current.style.color = "lightgrey"
    }
    if(parseInt(totalPages.current.innerHTML) > parseInt(currentPage.current.value)){
      lastPage.current.style.cursor = "hand"
      lastPage.current.style.color = "black"
      forwardOnePage.current.style.cursor = "hand"
      forwardOnePage.current.style.color = "black"
    }else{
      lastPage.current.style.cursor = "not-allowed"
      lastPage.current.style.color = "lightgrey"
      forwardOnePage.current.style.cursor = "not-allowed"
      forwardOnePage.current.style.color = "lightgrey"
    }
    let messageData = []
        
    for(const runtime of res.data.obj.list){
      const metadatas = await getProcessDetails(runtime.integrationArtifact.id, runtime.messageId)
      let stepsWithDetails = []
      let totalSteps = runtime.steps.length+"/"
      if(metadatas.data.obj != null){
        
        totalSteps += runtime.steps.length
        for(const runtimeStep of runtime.steps){
          const idSplit = runtimeStep.stepID.split(":")
          let metadata = metadatas.data.obj.steps.filter(m => m.stepNumber === idSplit[1]);
          metadata = metadata[0]
          let runtimeStatus = ""
          let executionTime = 'N/A'
          let iconColor = null
          let stepStatus = "N/A"
          let isItClickable = 'false'
          if(runtimeStep.stepStatus === "SUCCESS"){
            runtimeStatus = 'message-success'
            iconColor = 'customPositive'
            stepStatus = "SUCCESS"
            isItClickable = 'true'
          }else if(runtimeStep.stepStatus === "FAILED" || runtimeStep.stepStatus === "ERROR" || runtimeStep.stepStatus === "ERRORED" || runtimeStep.stepStatus === "FAIL"){
            runtimeStatus = 'message-error'
            iconColor = 'customNegative'
            stepStatus = "FAILED"
            isItClickable = 'true'
          }else{
            runtimeStatus = 'cancel'
          }
          if(runtimeStep.executionTime !== undefined)
            executionTime = runtimeStep.executionTime
          let exTime = 'N/A'
          if(executionTime != 'N/A' )
            exTime = moment(executionTime).format('MMM Do YYYY, h:mm:ss A')
          stepsWithDetails.push(
            {
              id:metadata.id,
              stepID:runtimeStep.stepID,
              messageId:runtime.messageId,
              keepPayload:metadata.keepPayload,
              stepType:metadata.stepType, 
              loopIndex:runtimeStep.loopIndex,
              type:metadata.type,
              stepNumber:runtimeStep.stepNumber,
              parentName:metadata.parentName,
              parentID:metadata.parentID,
              taskName:metadata.taskName,
              name:metadata.name,
              desc:metadata.desc,
              executionTime:exTime,
              iconColor:iconColor,
              stepStatus: stepStatus,
              isItClickable:isItClickable,
              runtimeStatus:runtimeStatus,
              x:metadata.x,
              y:metadata.y
            })
        }
        stepsWithDetails = stepsWithDetails.sort((a, b) => {
          // Split each element into parts based on the underscore
          const [partA1, partA2] = a.stepNumber.split('_');
          const [partB1, partB2] = b.stepNumber.split('_');
        
          // Compare the alphabetical part first
          if (partA1 < partB1) return -1;
          if (partA1 > partB1) return 1;
        
          // If alphabetical parts are the same, compare the numeric part
          return parseInt(partA2, 10) - parseInt(partB2, 10);
        });
        
      }else{
        totalSteps += "0"
      }
      let stat = "Positive"
      if(runtime.customStatus === "FAILED" || runtime.customStatus === "ERROR" || runtime.customStatus === "ERRORED" || runtime.customStatus === "FAIL"){
        stat = "Negative"
      }
      const d1 = moment.utc(runtime.logStart,"YYYY-MM-DD HH:mm:ss.SSS")
      const d2 = moment.utc(runtime.logEnd,"YYYY-MM-DD HH:mm:ss.SSS")
      const localTimeZone = moment.tz.guess();  // Automatically detects the local time zone
      const localStartDate = d1.tz(localTimeZone);
      const localEndDate = d2.tz(localTimeZone);

      let duration = moment.duration(d2.diff(d1))
      let durationText= ""
      let durationColor = "green"
      if(duration._data.days > 0)
        durationText = duration._data.days +" day "
      if(duration._data.hours > 0){
        durationColor = "red"
        durationText = durationText+duration._data.hours +" hour "
      }
      if(duration._data.minutes > 0){
        durationText = durationText+duration._data.minutes +" min "
        if(duration._data.minutes > 10){
          durationColor = "orange"
        }
      }
      if(duration._data.seconds > 0)
        durationText = durationText+duration._data.seconds +" sec "
      if(duration._data.milliseconds > 0)
        durationText = durationText+duration._data.milliseconds +" ms "
      let packageID = null
      let version = null
      let updatedAt = null 
      let updatedBy = null 
      let diagramData = null
      let desc = null
      
      if(metadatas.data.obj != null){
        const meta = metadatas.data.obj
        packageID = meta.packageID
        version = meta.version
        updatedBy = meta.updatedBy
        updatedAt = meta.updatedAt
        diagramData = meta.diagramData
        desc = meta.description
      }
      let everyEvent = false
      let everyReceiverSenderAfter = false
      let everyReceiverSenderBefore = false
      let keepPayloadAsDefault = false
      if(metadatas.data.obj != null){
        everyEvent=metadatas.data.obj.everyEvent
        everyReceiverSenderAfter=metadatas.data.obj.everyReceiverSenderAfter
        everyReceiverSenderBefore=metadatas.data.obj.everyReceiverSenderBefore
        keepPayloadAsDefault=metadatas.data.obj.keepPayloadAsDefault
      }
      messageData.push({
        messageId:runtime.messageId,
        messageIdURL:runtime.messageIdURL,
        totalSteps:totalSteps,
        correlationId:runtime.correlationID,
        customHeaderProperties:runtime.customHeaderProperties,
        correlationIdURL:runtime.correlationIDURL,
        artifactName:runtime.integrationArtifact.name,
        startTime:localStartDate.format('MMM Do YYYY, h:mm:ss A'),
        endTime:localEndDate.format('MMM Do YYYY, h:mm:ss A'),
        duration:durationText,
        packageID:packageID,
        diagramData:diagramData,
        artifactid:runtime.integrationArtifact.id,
        steps:stepsWithDetails,
        durationColor:durationColor,
        errorInfo:runtime.errorInfo,
        version:version,
        everyEvent:everyEvent,
        everyReceiverSenderAfter:everyReceiverSenderAfter,
        everyReceiverSenderBefore:everyReceiverSenderBefore,
        keepPayloadAsDefault:keepPayloadAsDefault,
        description:desc,
        updatedAt:updatedAt,
        updatedBy:updatedBy,
        customStatus:runtime.customStatus,
        status: stat
      })
    }
    const iconElement = document.querySelector('.customPositive ui5-icon');

    // Check if the icon element exists
    if (iconElement && iconElement.shadowRoot) {
      // Access the shadow DOM and set the color using the CSS variable
      iconElement.shadowRoot.querySelector('svg').style.fill = 'green';  // Change 'green' to your desired color
    }
    showDetails(true)
    setMessages(messageData)
    setTimeout(() => {
      setMessagesLoaded(true)
    }, 2000);
  }
  const renderRowSubComponent = (row) => {
    if(row.original.steps.length > 0){
      let timelines = []
      let previousIndex = "-1"
      for(const e of row.original.steps){
        if(e.loopIndex !== "null" && e.loopIndex !== null && e.loopIndex !== ""){
          if(e.loopIndex !== previousIndex){
            let groupItems = []
            for(const e1 of row.original.steps){
              if(e1.loopIndex === e.loopIndex){
                groupItems.push(
                  <TimelineItem key={e1.stepNumber}
                    id={e1.stepID}
                    icon={e1.runtimeStatus}
                    nameClickable={e.isItClickable}
                    onNameClick={(d) =>  showPayload(e1.stepID,e1.messageId, e1.stepNumber)}
                    name={e1.stepNumber}
                    className={e1.iconColor}
                    subtitleText={e1.executionTime}>
                    <div>
                      {e1.taskName}
                    </div>
                  </TimelineItem>)
              }
            }
            previousIndex = e.loopIndex
            timelines.push(<TimelineGroupItem collapsed groupName={e.parentName+"-"+e.loopIndex}>{groupItems}</TimelineGroupItem>)
          }
        }else{
          timelines.push(
          <TimelineItem key={e.stepNumber}
            id={e.stepID}
            icon={e.runtimeStatus}
            nameClickable={e.isItClickable}
            onNameClick={(d) =>  showPayload(e.stepID,e.messageId, e.stepNumber)}
            name={e.stepNumber}
            className={e.iconColor}
            subtitleText={e.executionTime}>
            <div>
              {e.taskName}<br></br>
              {e.parentName}
            </div>
          </TimelineItem>)
        }
      }
      return( 
        <motion.div style={{width:"100%"}} 
                variants={wrapperVariants}
                initial="hidden"
                animate='visible'
                exit="exit">
          <Timeline layout="Horizontal" style={{overflow:"auto"}}>
            {timelines}
          </Timeline>
        </motion.div>
      )
    }else{
      return null
    }
  };
  function isJsonString(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
  function isXmlString(str) {
    // Create a new DOM parser
    const parser = new DOMParser();
    
    // Parse the string into an XML document
    const xmlDoc = parser.parseFromString(str, "application/xml");
    
    // Check for parsing errors
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      return false; // Invalid XML
    }
    
    return true; // Valid XML
  }
  
  const showPayload = (id,messageid, stepNumber) => {
    setPopoverRef(id)
    popoverHeader.current.innerText="STEP "+stepNumber+" Details"  
    setPopoverIsOpen(true)  
    getPayload(id,messageid).then((res)=>{
      if(res.data.obj != null && res.status === 200){
        const binaryString = window.atob(res.data.obj);
        let formattedOutput = binaryString
        if(isJsonString(binaryString)){
          // Parse the JSON string into an object
          const jsonObject = JSON.parse(binaryString);

          // Format the JSON object into a readable string with indentation
          formattedOutput = JSON.stringify(jsonObject, null, 2);
        }else if(isXmlString(binaryString)){
          // Parse the XML string
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(binaryString, "application/xml");

          // Serialize the XML back into a string with formatting
          const serializer = new XMLSerializer();
          formattedOutput = serializer.serializeToString(xmlDoc);
        }
        popoverBody.current.innerText=formattedOutput
        setPayloadLoaded(true)
        
      }else{
        popoverBody.current.innerText="No PAYLOAD."
        setPayloadLoaded(true)
        setPopoverIsOpen(false)  
        setMessage({open:false, toastMessage:"This STEP doesnt have payload..", result:null, callback:null, toast:true})
      }
    })
  }
  const getMessages  = (startDate,endDate, s, l, status,customData, artifactName) => {
    getMessagesByDate(startDate,endDate, s, l, status, customData, artifactName).then((res)=>{
      upateMessages(res, l, s)
    })
  }
  const dateSelectionChanged  = (event) => {
    const dateSelected = event.target.value
    if(dateSelected === "Custom"){
      customStartdate.current.disabled = false
      customEnddate.current.disabled = false
      customPanel.current.collapsed = false
      let now = moment();
      const startDate = moment(now).format("MMM DD, YYYY, hh:mm:ss A")
      customEnddate.current.value = startDate
      let past = now.subtract(60, 'minutes');
      const hourBefore = moment(past).format("MMM DD, YYYY, hh:mm:ss A")
      customStartdate.current.value = hourBefore
    }else{
      customStartdate.current.disabled = true
      customEnddate.current.disabled = true
      customStartdate.current.value = ""
      customEnddate.current.value = ""
    }
  }
  const loadArtifact = async(message) => {
    
    if(message.steps.length > 0){
      //setSelectedEntry(<MonitoringTileDetailsConfigure messageData={message} metadata={details.data.obj} style={{flex:"1 1 auto",height:"100%"}}></MonitoringTileDetailsConfigure>)
      setCurrentMessage(message)
      setShowStepDiagram(!showStepDiagram)
    }else{
      setMessage({open:false, toastMessage:"Monitoring is not enabled for "+message.artifactName, result:null, callback:null, toast:true})
    }
  }
  const filterChanged = async(event) => {
    
    setMessagesLoaded(false)
    if(searchSelection.current.value !== ""){
      let s = 0
      let l = limitSelection.current.value
      const res = await getMessagesBySearch(searchSelection.current.value, l, s)
      upateMessages(res, l, s)
    }else{
      let statusSelectionArr = []
      for(const selection of statusSelection.current.selectedValues){
        statusSelectionArr.push(selection.innerText)
      }
      let s = 0
      let l = limitSelection.current.value
      const dateSelected = dateSelection.current.value
      let customData = customHeaderProperties.current.value
      if(customData === '')
        customData = "NONE"

      currentPage.current.value = 1
      limit.current.innerHTML = limitSelection.current.value
      offset.current.innerHTML = 0
      let startDate
      let endDate
      if(dateSelected === "Custom"){
        const customStart = moment(customStartdate.current.value, "MMM DD, YYYY, hh:mm:ss A")
        startDate = moment.utc(customStart).format("YYYY-MM-DD HH:mm:ss")
        const customEnd = moment(customEnddate.current.value, "MMM DD, YYYY, hh:mm:ss A")
        endDate = moment.utc(customEnd).format("YYYY-MM-DD HH:mm:ss")
      }else{
        const dateSelectedSplitted = dateSelected.split(":")
        let now = moment();
        endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
        let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
        startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
      }
      getMessages(startDate,endDate, s, l, statusSelectionArr.toString(),customData,artifactSelection.current.value)
    }
  };
  const multiSelectionToggled = (event, id) => {
    let selectAllElement = document.getElementById( id );
    let isitSelected = selectAllElement.getAttribute( "data-selected" );
    if(isitSelected === 'true' && event.srcElement.selectedValues.length === 0){
      selectAllElement.selected = true
    }
  }
  const multiSelectionChanged= (event, id) => {
    let selectAllElement = document.getElementById( id );
    let isitSelected = selectAllElement.getAttribute( "data-selected" );
    if(isitSelected === 'true' && event.srcElement.selectedValues.length > 1){
      for(const selectedValue of event.detail.items){
        if(selectedValue.innerHTML.trim() !== "ALL"){
          selectAllElement.setAttribute( "data-selected", 'false');
          selectAllElement.selected = false
        }
      }
    }else{
      if(isitSelected === 'false'){
        let isAllSelected = false
        for(const selectedValue of event.detail.items){
          if(selectedValue.innerHTML.trim() === "ALL"){
            isAllSelected = true
          }
        }
        if(isAllSelected){
          selectAllElement.setAttribute( "data-selected", 'true');
          for(const selectedValue of event.detail.items){
            if(selectedValue.innerHTML.trim() !== "ALL"){
              selectedValue.selected = false
            }
          }
        }
      }
    }
  }
  const openID = (url) => {
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.focus();  // Ensures the new tab gains focus
    }
  }
  const searchChanged = (event) => {
    const dateSelected = dateSelection.current.value
    if(searchSelection.current.value !== ""){
      artifactSelection.current.disabled = true
      statusSelection.current.disabled = true
      dateSelection.current.disabled = true
      customStartdate.current.disabled = true
      customEnddate.current.disabled = true
      if(dateSelected !== "Custom"){
        customStartdate.current.value = ""
        customEnddate.current.value = ""
      }
      // customStepNumber.current.disabled = true
      // stepStatus.current.disabled = true
      customHeaderProperties.current.disabled = true
    }else{
      artifactSelection.current.disabled = false
      statusSelection.current.disabled = false
      dateSelection.current.disabled = false
      // customStepNumber.current.disabled = false
      // stepStatus.current.disabled = false
      customHeaderProperties.current.disabled = false
      if(dateSelected === "Custom"){
        customStartdate.current.disabled = false
        customEnddate.current.disabled = false
      }
    }
  }
  const showCustomProperties = (message) => {
    setPopoverRef1("cp_"+message.messageId)
    setPopoverIsOpen1(true)  
    let listItems = []
    for(const customHeaderProperty of message.customHeaderProperties){
      listItems.push(
        <ListItemStandard additionalText={customHeaderProperty.value}>
          {customHeaderProperty.name}
        </ListItemStandard>
      )
    }
    setPopoverBody1(listItems)
  }
  const changePage = (event) => {
    setMessagesLoaded(false)
    let statusSelectionArr = []
    for(const selection of statusSelection.current.selectedValues){
      statusSelectionArr.push(selection.innerText)
    }
    const dateSelected = dateSelection.current.value
    let startDate
    let endDate
    if(dateSelected === "Custom"){
      const customStart = moment(customStartdate.current.value, "MMM DD, YYYY, hh:mm:ss A")
      startDate = moment.utc(customStart).format("YYYY-MM-DD HH:mm:ss")
      const customEnd = moment(customEnddate.current.value, "MMM DD, YYYY, hh:mm:ss A")
      endDate = moment.utc(customEnd).format("YYYY-MM-DD HH:mm:ss")
    }else{
      const dateSelectedSplitted = dateSelected.split(":")
      let now = moment();
      endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
      let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
      startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
    }
    let lSelection = parseInt(limitSelection.current.value)
    let cPage = parseInt(currentPage.current.value)
    let totalPages1 = parseInt(totalPages.current.innerHTML)
    let customData = customHeaderProperties.current.value
    if(customData === '')
      customData = "NONE"
    let artifactName = artifactSelection.current.value
    if(artifactName === "" || artifactName == null)
      artifactName = "ALL"
    if(event === "BACK" && cPage > 1){
      cPage = cPage - 1
      let offset1 = cPage * lSelection
      offset.current.innerHTML = offset1 - lSelection
      limit.current.innerHTML = offset1
      getMessages(startDate,endDate, offset1 - lSelection,lSelection, statusSelectionArr.toString(), customData,artifactName)
      currentPage.current.value = cPage
    }else if(event === "FORWARD" && cPage <= totalPages1){
      let offset1 = cPage*lSelection
      offset.current.innerHTML = offset1
      if(parseInt(totalEntries.current.innerHTML) < offset1+lSelection){
        limit.current.innerHTML = totalEntries.current.innerHTML
      }else
        limit.current.innerHTML = offset1+lSelection
      getMessages(startDate,endDate, offset1,lSelection,statusSelectionArr.toString(),customData,artifactName)
      currentPage.current.value = cPage + 1
    }else if(event === "LAST" && cPage <= totalPages1){
      let offset1 = (parseInt(totalPages.current.innerHTML)-1) * lSelection
      offset.current.innerHTML = offset1
      limit.current.innerHTML = totalEntries.current.innerHTML
      getMessages(startDate,endDate, offset1,lSelection, statusSelectionArr.toString(), customData,artifactName)
      currentPage.current.value = parseInt(totalPages.current.innerHTML)
    }else if(event === "FIRST" && cPage <= totalPages1){
      let offset1 = 0
      offset.current.innerHTML = offset1
      limit.current.innerHTML = offset1+lSelection
      getMessages(startDate,endDate, offset1,lSelection, statusSelectionArr.toString(), customData,artifactName)
      currentPage.current.value = 1
    }else if(event === "SPECIFIC"){
      const offset1 = cPage*lSelection
      getMessages(startDate,endDate, offset1,lSelection, statusSelectionArr.toString(), customData,artifactName)
    }
  }
  return (
      <FlexBox direction="Row" alignItems="Stretch" fitContainer="true">
        <motion.div style={{flex:"1 1 auto"}}
              variants={wrapperVariants}
              initial="visible"
              animate={!showStepDiagram ? 'visible' : 'hidden'}
              exit="exit">
                <Popover
                  className="footerPartNoPadding"
                  header={<FlexBox direction="Row" alignItems="Center" style={{height:"40px"}} justifyContent="Center" fitContainer="true"><Text ref={popoverHeader}></Text></FlexBox>}
                  horizontalAlign="Start"
                  onBeforeClose={function ks(){}}
                  onBeforeOpen={function ks(){}}
                  onOpen={function ks(){}}
                  opener={popoverRef}
                  open={popoverIsOpen}
                  allowTargetOverlap="true"
                  onClose={() => {
                    setPopoverIsOpen(false);
                  }}
                  placement="Start"
                  verticalAlign="Top">
                    <FlexBox direction="Column" alignItems="Stretch" justifyContent="Center" fitContainer="true" style={{minHeight:"200px", minWidth:"150px"}}>
                      <BusyIndicator active={!payloadLoaded} size="M" style={{height:"100%"}} text="Loading">
                        <Text style={{maxWidth:"300px"}} ref={popoverBody}></Text>
                      </BusyIndicator>
                    </FlexBox>
                </Popover>
                <Popover
                  className="footerPartNoPadding"
                  header={<FlexBox direction="Row" alignItems="Center" style={{height:"40px"}} justifyContent="Center" fitContainer="true"><Text>Custom Header Properties</Text></FlexBox>}
                  horizontalAlign="Start"
                  onBeforeClose={function ks(){}}
                  onBeforeOpen={function ks(){}}
                  onOpen={function ks(){}}
                  opener={popoverRef1}
                  open={popoverIsOpen1}
                  allowTargetOverlap="true"
                  onClose={() => {
                    setPopoverIsOpen1(false);
                  }}
                  placement="Start"
                  verticalAlign="Top">
                    <List style={{minWidth:"400px"}}>
                      {popoverBody1}
                    </List>
                </Popover>
                <Popover
                  className="footerPartNoPadding"
                  header={<FlexBox direction="Row" alignItems="Center" style={{height:"40px"}} justifyContent="Center" fitContainer="true"><Text>Error Details</Text></FlexBox>}
                  horizontalAlign="Start"
                  onBeforeClose={function ks(){}}
                  onBeforeOpen={function ks(){}}
                  onOpen={function ks(){}}
                  opener={popoverRef2}
                  open={popoverIsOpen2}
                  allowTargetOverlap="true"
                  onClose={() => {
                    setPopoverIsOpen2(false);
                  }}
                  placement="Start"
                  verticalAlign="Top">
                    <FlexBox direction="Column" alignItems="Stretch" justifyContent="Center" fitContainer="true">
                        <Text style={{maxWidth:"300px"}} ref={popoverBody2}></Text>
                    </FlexBox>
                </Popover>
          <FlexBox direction="Column" alignItems="Stretch" justifyContent="Stretch" fitContainer="true">
            {/* <Bar design="Header" style={{borderTopLeftRadius:"15px",borderTopRightRadius:"15px",width:"99.5%"}}>
              <Button design="Transparent" icon="slim-arrow-left" slot="startContent" ui5-button="" icon-only="" has-icon="" onClick={props.onClick}>Back</Button>
            </Bar> */}
            <FlexBox direction="Column" alignItems="Start" justifyContent="Start" style={{width:"100%", backgroundColor:"white",borderRadius:"15px"}}>
              <FlexBox direction="Row" alignItems="Start" justifyContent="SpaceBetween" fitContainer="true">
                <Title level="H4" style={{marginBottom:"20px",marginTop:"20px", backgroundColor:"white", paddingLeft:"30px"}}>Monitor Message Processing</Title>
                <FlexBox direction="Row" alignItems="Start" justifyContent="Start">
                  <Button design="Transparent" onClick={(e) => filterChanged(e)} icon="refresh"/>
                  <Button design="Transparent" onClick={(e) => filterChanged(e)} icon="action-settings"/>
                </FlexBox>
              </FlexBox>
              <Panel accessibleRole="Form" ref={customPanel} onToggle={function _a(){}} collapsed style={{width:"100%"}}
                header={<FlexBox direction="Row" style={{marginLeft:"10px"}} alignItems="Center" justifyContent="SpaceBetween" fitContainer="true">
                <FlexBox direction="Row" alignItems="Center" justifyContent="Start" fitContainer="true">
                  <FilterGroupItem groupName="Group 2" label="Time" style={{flex:"0 0 15%"}}>
                    <Select ref={dateSelection}  onChange={(e) => dateSelectionChanged(e)}>
                      <Option value="1:hours" selected>Past Hour</Option>
                      <Option value="2:hours" >Past 2 Hours</Option>
                      <Option value="3:hours" >Past 3 Hours</Option>
                      <Option value="4:hours" >Past 4 Hours</Option>
                      <Option value="5:hours" >Past 5 Hours</Option>
                      <Option value="8:hours" >Past 8 Hours</Option>
                      <Option value="24:hours" >Past 24 Hours</Option>
                      <Option value="1:weeks" >Past Week</Option>
                      <Option value="1:months" >Past Month</Option>
                      <Option value="Custom" >Custom</Option>
                    </Select>
                  </FilterGroupItem>
                  <FilterGroupItem groupName="Group 6" label="Status" style={{flex:"0 0 15%"}}>
                    <MultiComboBox ref={statusSelection}  onOpenChange = {(d) =>  multiSelectionToggled(d, 'selecAllID1')} onSelectionChange={(d) =>  multiSelectionChanged(d, 'selecAllID1')}>
                      {statusList}
                    </MultiComboBox>
                  </FilterGroupItem>
                  <FilterGroupItem groupName="Group 7" label="Artifact Name" style={{flex:"0 0 25%"}}>
                    <Select ref={artifactSelection} >
                      {allArtifacts}
                    </Select>
                  </FilterGroupItem>
                  <Text style={{marginRight:"15px"}}>Or</Text>
                  <FilterGroupItem groupName="Group 4" label="Search" style={{flex:"0 0 30%"}}>
                    <Input ref={searchSelection} onChange={(d) =>  searchChanged(d)} icon={<Icon name="search" />} onInput={(d) =>  searchChanged(d)}></Input>
                  </FilterGroupItem>
                  <Link design="Emphasized" onClick={(d) =>  filterChanged(d)}>Filter</Link>
                </FlexBox>
                </FlexBox>}>
                <FlexBox direction="Row" alignItems="Center" justifyContent="Start" fitContainer="true">
                  <FilterGroupItem groupName="Group 1" label="Start Date" style={{flex:"1 1 5%"}}>
                    <DateTimePicker  ref={customStartdate} onChange={function Sa(){}} primaryCalendarType="Gregorian" valueState="None"/>
                  </FilterGroupItem>
                  <FilterGroupItem groupName="Group 2" label="End Date" style={{flex:"1 1 5%"}}>
                    <DateTimePicker  ref={customEnddate} onChange={function Sa(){}} primaryCalendarType="Gregorian" valueState="None"/>
                  </FilterGroupItem>
                  {/* <FilterGroupItem groupName="Group 3" label="Step Number:" style={{flex:"1 1 20%"}}>
                    <MultiComboBox ref={customStepNumber}  onOpenChange = {(d) =>  multiSelectionToggled(d, 'selecAllID')} onSelectionChange={(d) =>  multiSelectionChanged(d, 'selecAllID')}>
                        {stepNumbers}
                    </MultiComboBox>
                  </FilterGroupItem> */}
                  {/* <FilterGroupItem groupName="Group 4" label="Step Status:" style={{flex:"1 1 30%"}}>
                      <Input ref={stepStatus}    type="Text" valueState="None" placeholder="SUCCESS or FAILED, etc.. (one status ONLY)"></Input>
                  </FilterGroupItem> */}
                  <FilterGroupItem groupName="Group 5" label="Custom Header Properties" style={{flex:"1 1 40%"}}>
                    <Input ref={customHeaderProperties}  style={{width:"80%"}} type="Text" valueState="None" placeholder="Name = Value or/and Name=Value ..."></Input>
                  </FilterGroupItem>
                </FlexBox>
              </Panel>  

            </FlexBox>
            <FlexBox direction="Column" alignItems="Stretch" justifyContent="Start" fitContainer="true">
              <div style={{paddingTop:"10px", paddingBottom:"10px", backgroundColor:"#f5f6f7", flex:"1 1 auto", display:"flex", alignItems:"Start",justifyContent:"Start"}}>
               <AnalyticalTable style={{flex:"1 1 auto"}}
                  filterable
                  data={messages}
                  rowHeight={44}
                  columns={[
                    {
                      Header: '',
                      accessor: '.',
                      autoResizable: false,
                      hAlign: 'Center',
                      headerTooltip: 'Expand',
                      width: 20
                    },
                    {
                      Header: 'Total Steps',
                      accessor: 'totalSteps',
                      autoResizable: false,
                      hAlign: 'Center',
                      headerTooltip: 'Total Steps',
                      width: 80
                    },
                    {
                      Header: 'Message ID',
                      accessor: 'messageId',
                      autoResizable: false,
                      hAlign: 'Left',
                      headerTooltip: 'Message ID',
                      width: 270,
                      Cell: (instance) => {
                        const { cell, row, webComponentsReactProperties } = instance;
                        return(
                        <Link
                          design="Default"
                          onClick={() => openID(row.original.messageIdURL)}
                        >
                          {row.original.messageId}
                        </Link>)
                      }
                    },
                    {
                      Header: 'Correlation ID',
                      accessor: 'correlationId',
                      autoResizable: false,
                      hAlign: 'Left',
                      headerTooltip: 'Correlation ID',
                      width: 270,
                      Cell: (instance) => {
                        const { cell, row, webComponentsReactProperties } = instance;
                        return(
                        <Link
                          design="Default"
                          onClick={() => openID(row.original.correlationIdURL)}
                        >
                          {row.original.correlationId}
                        </Link>)
                      }
                    },
                    {
                      Header: 'Artifact Name',
                      accessor: 'artifactName',
                      autoResizable: false,
                      hAlign: 'Left',
                      headerTooltip: 'Artifact Name'
                    },
                    {
                      Header: 'Start Time',
                      accessor: 'startTime',
                      autoResizable: false,
                      hAlign: 'Left',
                      headerTooltip: 'Start Time',
                      width: 200
                    },
                    {
                      Header: 'End Time',
                      accessor: 'endTime',
                      autoResizable: false,
                      hAlign: 'Left',
                      headerTooltip: 'End Time',
                      width: 200
                    },
                    {
                      Header: 'Duration',
                      accessor: 'duration',
                      autoResizable: false,
                      hAlign: 'Left',
                      headerTooltip: 'Duration',
                      width: 100,
                      Cell: (instance) => {
                        const { cell, row, webComponentsReactProperties } = instance;
                        const isOverlay = webComponentsReactProperties.showOverlay;

                        return (
                          <FlexBox>
                            <Text title={row.original.duration} maxLines="1" disabled={isOverlay} style={{ color: row.original.durationColor}}>{row.original.duration}</Text>
                          </FlexBox>
                        );
                      }
                    },
                    {
                      Cell: (instance) => {
                        const { cell, row, webComponentsReactProperties } = instance;
                        // disable buttons if overlay is active to prevent focus
                        const isOverlay = webComponentsReactProperties.showOverlay;
                        let isCustomProperties = false
                        let isError = true
                        if(row.original.customHeaderProperties.length === 0)
                          isCustomProperties = true
                        if(row.original.errorInfo != null)
                          isError = false
                        const csID = "cp_"+row.original.messageId
                        const errID = "err_"+row.original.messageId

                        return (
                          <FlexBox>
                            <Button icon="detail-view" disabled={isOverlay} onClick={() => loadArtifact(row.original)}/>
                            <Button id={csID} style={{marginLeft:"3px"}} icon="filter-fields" disabled={isOverlay||isCustomProperties} onClick={() => showCustomProperties(row.original)}/>
                            <Button id={errID} style={{marginLeft:"3px"}} icon="display" disabled={isOverlay||isError} onClick={() => showErrorDetails(row.original)}/>
                          </FlexBox>
                        );
                      },
                      cellLabel: ({ cell }) => {
                        // `cell.cellLabel` contains the internal `aria-label` of the respective cell
                        return `${cell.cellLabel} press TAB to focus active elements inside this cell`;
                      },
                      Header: 'Actions',
                      accessor: '.',
                      disableFilters: true,
                      disableGroupBy: true,
                      disableResizing: true,
                      disableSortBy: true,
                      id: 'actions',
                      width: 140
                      
                      
                    }
                  ]}
                  onRowExpandChange={handleExpandChange}
                  loading={!messagesLoaded}
                  withRowHighlight
                  highlightField={(row) => row.status}
                  alternateRowColor="true"
                  renderRowSubComponent={renderRowSubComponent}
                  minRows="10" 
                  subComponentsBehavior={AnalyticalTableSubComponentsBehavior.Expandable} //default value
                />
              </div>
              <div className="pagiation"> 
                <FlexBox direction="Row" alignItems="Center" justifyContent="SpaceBetween" fitContainer="true" >
                  <FlexBox direction="Row" alignItems="Center" justifyContent="Start" style={{marginLeft:"20px"}}>
                    <Select style={{width:"20px"}} onChange={(d) =>  filterChanged(d)} ref={limitSelection}>
                      <Option value="10" selected>10</Option>
                      <Option value="20" >20</Option>
                      <Option value="30" >30</Option>
                      <Option value="40" >40</Option>
                      <Option value="50" >50</Option>
                      <Option value="100" >100</Option>
                    </Select>
                    <div style={{marginLeft:"20px"}}>Showing <span ref={offset}></span> to <span ref={limit}></span> of <span ref={totalEntries}></span> entries</div>
                  </FlexBox>
                  <BusyIndicator active={!messagesLoaded} style={{marginRight:"20px"}} size="S">
                    <FlexBox direction="Row" alignItems="Center" justifyContent="Center" fitContainer="true" >
                      <FontAwesomeIcon ref={firstPage} style={{width:"30px", fontSize:"14px", cursor:"hand"}} icon={['fas', 'fa-angles-left']} onClick={(d) =>  changePage("FIRST")}/>
                      <FontAwesomeIcon ref={backOnePage} style={{width:"30px", marginRight:"10px", fontSize:"14px", cursor:"hand"}} icon={['fas', 'fa-angle-left']} onClick={(d) =>  changePage("BACK")}/>
                      <Input onChange={(d) =>  changePage("SPECIFIC")} ref={currentPage} style={{width:"8px",height:"30px",textAlign:"Center"}} type="Text" valueState="None" value="1"></Input>
                      <Text style={{marginLeft:"5px",marginRight:"5px"}}> / </Text>
                      <Text ref={totalPages}></Text>
                      <FontAwesomeIcon ref={forwardOnePage} style={{width:"30px", marginLeft:"10px", fontSize:"14px", cursor:"hand"}} icon={['fas', 'fa-angle-right']} onClick={(d) =>  changePage("FORWARD")}/>
                      <FontAwesomeIcon ref={lastPage} style={{width:"30px", fontSize:"14px", cursor:"hand"}} icon={['fas', 'fa-angles-right']} onClick={(d) =>  changePage("LAST")}/>
                    </FlexBox>
                  </BusyIndicator>
                </FlexBox>
              </div>
            </FlexBox>
          </FlexBox>
        </motion.div>
        <motion.div style={{flex:"1 1 auto", height:"100%", display:"flex", flexDirection:"column"}}
                    variants={wrapperVariants}
                    initial="visible"
                    animate={showStepDiagram ? 'visible' : 'hidden'}
                    exit="exit">
            {showStepDiagram?<MonitoringTileDetailsConfigure onClick={() => setShowStepDiagram(!showStepDiagram)} messageData={currentMessage} style={{flex:"1 1 auto",height:"100%"}}></MonitoringTileDetailsConfigure>:""}
        </motion.div>
      </FlexBox>
    );
}
export default MonitoringPageDetails;