import "@ui5/webcomponents-icons/dist/AllIcons.js";
import React, { useState,useEffect,useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import {getMessagesByDate,getMessagesBySearch} from '../services/s-messages'
import { Table, IllustratedMessage,Popover,List,Text,Link,ListItemStandard,DynamicPageHeader,Option,Switch,BusyIndicator,Button, Input,FilterGroupItem,FlexBox,Label,Title} from '@ui5/webcomponents-react';
import moment from 'moment';
import momentTZ from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import "@ui5/webcomponents-fiori/dist/illustrations/NoData.js"
const createWorker = () => new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
const MonitoringLane = ({details,laneType, updateData})=> {
    let totalEntries = useRef(null);
    let totalPages = useRef(null);
    let backOnePage = useRef(null);
    let forwardOnePage = useRef(null);
    let firstPage = useRef(null);
    let lastPage = useRef(null);
    let currentPage = useRef(null);
    let popoverBody2  = useRef(null);
    const [messagesLoaded, setMessagesLoaded] = useState(false);
    const [messages, setMessages] = useState([]);
    const [noData, setNoData] = useState(false)
    const [popoverRef2, setPopoverRef2] = useState(null);
    const [popoverIsOpen2, setPopoverIsOpen2] = useState(false);
    const [popoverRef1, setPopoverRef1] = useState(null);
    const [popoverIsOpen1, setPopoverIsOpen1] = useState(false);
    const [popoverBody1, setPopoverBody1] = useState([]);
    const [popoverRef3, setPopoverRef3] = useState(null);
    const [popoverIsOpen3, setPopoverIsOpen3] = useState(false);
    const [popoverBody3, setPopoverBody3] = useState([]);
    let worker = useRef(null);
    let limit = useRef(null);
    let skip = useRef(null);
    let rawMessageList = useRef([])
    const wrapperVariants = {
        hidden: {
          opacity: 0,
          x: '-5vw',
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
          x: '-5vh',
          transition: { ease: 'easeInOut' },
        },
    };
    useEffect(() => {
      limit.current = 10
      skip.current = 0
      let laneDetails = details
      totalEntries.current.innerText = laneType
      currentPage.current.value = 1
      laneDetails.skip = 0
      laneDetails.limit = 10
      let startDate = laneDetails.startDate
      let endDate = laneDetails.endDate
      if(laneDetails.startDate === null){
        const dateSelectedSplitted = laneDetails.dayFilter.split(":")
        let now = moment();
        endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
        let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
        startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
      }
      getMessages(startDate,endDate, 0, 10, laneType, laneDetails.customData, laneDetails.artifactSelection)
    }, [updateData])
    const getMessages  = (startDate,endDate, s, l, status,customData, artifactName) => {
      getMessagesByDate(startDate,endDate, s, l, status, customData,artifactName).then((res)=>{
        upateMessages(res)
        updateElements(res,l,s)
        // setTimer(10)
      })
    }
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
    const openID  = (url) => {
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        newWindow.focus();  // Ensures the new tab gains focus
      }
    }
    const showDetails = (message) => {
      setPopoverRef3("dt_"+message.messageId)
      setPopoverIsOpen3(true)  
      let listItems = []
      listItems.push(
        <ListItemStandard >
          <FlexBox alignItems="Center" justifyContent="SpaceBetween">
            <Text>Message ID</Text>
            <Link
              design="Default"
              onClick={() => openID(message.messageIdURL)}>
              {message.messageId}
            </Link>
          </FlexBox>
        </ListItemStandard>
      )
      listItems.push(
        <ListItemStandard >
          <FlexBox alignItems="Center" justifyContent="SpaceBetween">
            <Text>Correlation ID</Text>
            <Link
              design="Default"
              onClick={() => openID(message.correlationIDURL)}>
              {message.correlationID}
            </Link>
          </FlexBox>
        </ListItemStandard>
      )
      listItems.push(
        <ListItemStandard >
          <FlexBox alignItems="Center" justifyContent="SpaceBetween">
            <Text>Artifact ID</Text>
            <Text Title={message.integrationArtifact.id}>{message.integrationArtifact.id.length > 30?message.integrationArtifact.id.substring(0,30)+"...":message.integrationArtifact.id}</Text>
          </FlexBox>
        </ListItemStandard>
      )
      listItems.push(
        <ListItemStandard >
          <FlexBox alignItems="Center" justifyContent="SpaceBetween">
            <Text>Artifact Name</Text>
            <Text Title={message.integrationArtifact.name}>{message.integrationArtifact.name.length > 30?message.integrationArtifact.name.substring(0,30)+"...":message.integrationArtifact.name}</Text>
          </FlexBox>
        </ListItemStandard>
      )
      listItems.push(
        <ListItemStandard >
          <FlexBox alignItems="Center" justifyContent="SpaceBetween">
            <Text>Package Name</Text>
            <Text Title={message.integrationArtifact.packageName}>{message.integrationArtifact.packageName.length > 30?message.integrationArtifact.packageName.substring(0,30)+"...":message.integrationArtifact.packageName}</Text>
          </FlexBox>
        </ListItemStandard>
      )
      listItems.push(
        <ListItemStandard >
          <FlexBox alignItems="Center" justifyContent="SpaceBetween">
            <Text>Log Level</Text>
            <Text Title={message.logLevel}>{message.logLevel}</Text>
          </FlexBox>
        </ListItemStandard>
      )
      listItems.push(
        <ListItemStandard >
          <FlexBox alignItems="Center" justifyContent="SpaceBetween">
            <Text>Transaction Id</Text>
            <Text Title={message.transactionId}>{message.transactionId}</Text>
          </FlexBox>
        </ListItemStandard>
      )
      listItems.push(
        <ListItemStandard >
          <FlexBox alignItems="Center" justifyContent="SpaceBetween">
            <Text>Status</Text>
            <Text Title={message.status}>{message.status}</Text>
          </FlexBox>
        </ListItemStandard>
      )
      if(message.customStatus){
        listItems.push(
          <ListItemStandard >
            <FlexBox alignItems="Center" justifyContent="SpaceBetween">
              <Text>Custom Status</Text>
              <Text Title={message.customStatus}>{message.customStatus}</Text>
            </FlexBox>
          </ListItemStandard>
        )
      }
      setPopoverBody3(listItems)
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
    const updateElements  = (res,l,s)=>{
      totalPages.current.innerHTML = Math.ceil(parseInt(res.data.obj.total)/parseInt(l))
      setTimeout(() => {
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
        if(laneType === "SUCCESS"){
          totalEntries.current.style.color = "green";
        }else if(laneType === "FAILED"){
            totalEntries.current.style.color = "red";
        }else if(laneType === "PROCESSING"){
            totalEntries.current.style.color = "grey";
        }else if(laneType === "REPROCESSED"){
            totalEntries.current.style.color = "orange";
        }
        totalEntries.current.innerHTML = laneType+"("+res.data.obj.total+")"
        
      }, 2000);
    }
    const upateMessages  = (res)=>{
      let messageData = []
      setNoData(false)
      
      if(res.data.obj.list.length > 0){
        for(const e of res.data.obj.list){
          const isItExist = rawMessageList.current.filter(m => m.messageId === e.messageId);
          
          const d1 = moment.utc(e.logStart,"YYYY-MM-DD HH:mm:ss.SSS")
          const d2 = moment.utc(e.logEnd,"YYYY-MM-DD HH:mm:ss.SSS")
          const localTimeZone = moment.tz.guess();  // Automatically detects the local time zone
          const localStartDate = d1.tz(localTimeZone);
          const localEndDate = d2.tz(localTimeZone);
    
          let duration = moment.duration(d2.diff(d1))
          let durationText= ""
          let durationColor = "Positive"
          if(duration._data.days > 0)
            durationText = duration._data.days +" day "
          if(duration._data.hours > 0){
            durationColor = "Negative"
            durationText = durationText+duration._data.hours +" hour "
          }
          if(duration._data.minutes > 0){
            durationText = durationText+duration._data.minutes +" min "
            if(duration._data.minutes > 10){
              durationColor = "Critical"
            }
          }
          if(duration._data.seconds > 0)
            durationText = durationText+duration._data.seconds +" sec "
          if(duration._data.milliseconds > 0)
            durationText = durationText+duration._data.milliseconds +" ms "
          messageData.push(
            <ListItemStandard 
                    key={e.id}
                    additionalText={durationText} 
                    additionalTextState={durationColor}
                    tooltip={e.integrationArtifact.name}
                    className={isItExist.length === 0 ? 'flash-both' : ''}
                    description={localEndDate.format("MMMM DD YYYY, HH:mm:ss")}> 
                <FlexBox direction="Row" alignItems="Center" justifyContent="SpaceBetween" fitContainer="true">
                  <Text>{e.integrationArtifact.name.length > 46?e.integrationArtifact.name.substring(0,45)+"...":e.integrationArtifact.name}</Text>
                  <div>
                    <Button design="Transparent" id={"dt_"+e.messageId} icon="detail-view"  onClick={() => showDetails(e)}/>
                    <Button design="Transparent" id={"cp_"+e.messageId} style={{marginLeft:"3px"}} icon="filter-fields" disabled={e.customHeaderProperties.length === 0} onClick={() => showCustomProperties(e)}/>
                    <Button style={{ display: laneType === "FAILED" ? "" : "none",marginLeft:"3px" }} design="Transparent" id={"err_"+e.messageId} icon="display" disabled={e.errorInfo === null} onClick={() => showErrorDetails(e)}/>
                  </div>
                </FlexBox>
            </ListItemStandard>)
        }
        
        setMessages(messageData)
        rawMessageList.current = res.data.obj.list
        setTimeout(() => {
          setMessagesLoaded(true)
        }, 2000);
      }else{
        setTimeout(() => {
          setMessagesLoaded(true)
        }, 2000);
        setNoData(true)
      }
    }
    const changePage = (event) => {
        const laneDetails = details
        setMessagesLoaded(false)
        let startDate
        let endDate
        if(laneDetails.startDate == null){
          const dateSelectedSplitted = laneDetails.dayFilter.split(":")
          let now = moment();
          endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
          let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
          
          startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
        }
        let lSelection = 10
        let cPage = parseInt(currentPage.current.value)
        let totalPages1 = parseInt(totalPages.current.innerHTML)
        
        let customData = laneDetails.customData
        if(customData === '')
          customData = "NONE"
        if(customData.toString().indexOf("ALL") === -1){
          customData = details.customData.replaceAll(","," and ")
        }
        if(event === "BACK" && cPage > 1){
          cPage = cPage - 1
          let offset1 = cPage * lSelection
          skip.current = offset1 - lSelection
          limit.current = lSelection
          getMessages(startDate,endDate, offset1 - lSelection,lSelection, laneType, customData, laneDetails.artifactSelection)
          currentPage.current.value = cPage
        }else if(event === "FORWARD" && cPage <= totalPages1){
          let offset1 = cPage*lSelection
          skip.current = offset1
          limit.current = lSelection
          getMessages(startDate,endDate, offset1,lSelection, laneType, customData, laneDetails.artifactSelection)
          currentPage.current.value = cPage + 1
        }else if(event === "LAST" && cPage <= totalPages1){
          let offset1 = (parseInt(totalPages.current.innerHTML)-1) * lSelection
          skip.current = offset1
          limit.current = lSelection
          getMessages(startDate,endDate, offset1,lSelection, laneType, customData, laneDetails.artifactSelection)
          currentPage.current.value = parseInt(totalPages.current.innerHTML)
        }else if(event === "FIRST" && cPage <= totalPages1){
          let offset1 = 0
          skip.current = offset1
          limit.current = lSelection
          getMessages(startDate,endDate, offset1,lSelection, laneType, customData, laneDetails.artifactSelection)
          currentPage.current.value = 1
        }else if(event === "SPECIFIC"){
          const offset1 = cPage*lSelection
          getMessages(startDate,endDate, offset1,lSelection, laneType, customData,laneDetails.artifactSelection)
        }
    }
    return (
        <FlexBox direction="Column" alignItems="Start" justifyContent="Start" fitContainer="true" style={{padding:"5px"}}>
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
            <Popover
                className="footerPartNoPadding"
                header={<FlexBox direction="Row" alignItems="Center" style={{height:"40px"}} justifyContent="Center" fitContainer="true"><Text>Message Details</Text></FlexBox>}
                horizontalAlign="Start"
                onBeforeClose={function ks(){}}
                onBeforeOpen={function ks(){}}
                onOpen={function ks(){}}
                opener={popoverRef3}
                open={popoverIsOpen3}
                allowTargetOverlap="true"
                onClose={() => {
                  setPopoverIsOpen3(false);
                }}
                placement="Start"
                verticalAlign="Top">
                <List style={{minWidth:"400px"}}>
                  {popoverBody3}
                </List>
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
            {/* <div  style={{background:"var(--sapList_Background)",borderTopLeftRadius:"5px",borderTopRightRadius:"5px",flex:"0 0 50px"}} className="generic-shadow" > */}
            <FlexBox style={{background:"var(--sapList_Background)",borderBottom:"1px solid whitesmoke",borderTopLeftRadius:"5px",borderTopRightRadius:"5px",flex:"0 0 50px",width:"100%"}} direction="Row" alignItems="Center" justifyContent="SpaceBetween" >
                <div style={{marginLeft:"15px"}}>
                  {/* <FontAwesomeIcon style={{marginRight:"5px"}} icon="fa-solid fa-ellipsis-vertical" /> */}
                  <span style={{fontWeight:"600",marginLeft:"5px"}} ref={totalEntries}></span>
                </div>
                <div style={{marginRight:"15px"}}> 
                    <FlexBox direction="Row" alignItems="Center" justifyContent="SpaceBetween" fitContainer="true" >
                        <BusyIndicator active={!messagesLoaded} style={{marginRight:"5px"}} delay={1000} size="S">
                            <FlexBox direction="Row" alignItems="Center" justifyContent="Center" fitContainer="true" >
                                <FontAwesomeIcon ref={firstPage} style={{fontSize:"10px", cursor:"hand"}} icon={['fas', 'fa-angles-left']} onClick={(d) =>  changePage("FIRST")}/>
                                <FontAwesomeIcon ref={backOnePage} style={{width:"30px",fontSize:"10px", cursor:"hand"}} icon={['fas', 'fa-angle-left']} onClick={(d) =>  changePage("BACK")}/>
                                <Input onChange={(d) =>  changePage("SPECIFIC")} ref={currentPage} style={{width:"8px",height:"30px",textAlign:"Center"}} type="Text" valueState="None" value="1"></Input>
                                <Text style={{marginLeft:"5px",marginRight:"5px"}}> / </Text>
                                <Text ref={totalPages}></Text>
                                <FontAwesomeIcon ref={forwardOnePage} style={{width:"30px",fontSize:"10px", cursor:"hand"}} icon={['fas', 'fa-angle-right']} onClick={(d) =>  changePage("FORWARD")}/>
                                <FontAwesomeIcon ref={lastPage} style={{fontSize:"10px", cursor:"hand"}} icon={['fas', 'fa-angles-right']} onClick={(d) =>  changePage("LAST")}/>
                            </FlexBox>
                        </BusyIndicator>
                    </FlexBox>
                </div>
            </FlexBox>
            <List loading={!messagesLoaded} className="generic-shadow" loadingDelay="2000" style={{borderBottomLeftRadius:"5px",borderBottomRightRadius:"5px",overflow:"auto",height:"75%"}}
                growing="None" 
                header={<DynamicPageHeader style={{padding:"0px",display:"Block",height:"0px",width:"100%"}}/>}
                mode="SingleSelect"
                // noDataText="No Data"
                onItemClick={function Sa(){}}
                onItemClose={function Sa(){}}
                onItemDelete={function Sa(){}}
                onItemToggle={function Sa(){}}
                onLoadMore={function Sa(){}}
                onSelectionChange={function Sa(){}}
                separators="All">
                    {noData?<FlexBox direction="Row" alignItems="Center" justifyContent="Center" fitContainer="true" >
                      <IllustratedMessage name="NoData" /></FlexBox>:messages}
            </List>
        </FlexBox>
    )
}
export default MonitoringLane;