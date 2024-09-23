import "@ui5/webcomponents-icons/dist/AllIcons.js";
import React, { useState,useEffect,useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import {getMessagesByDate,getMessagesBySearch} from '../services/s-messages'
import { Table, IllustratedMessage,TableRow,TableCell, Toolbar,Icon,List,ToolbarSpacer,Text,Bar,ListItemStandard,DynamicPageHeader,Select,Option,Switch,BusyIndicator,Button, Input,FilterGroupItem,FlexBox,Label,Title} from '@ui5/webcomponents-react';
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
    const [messagesLoaded, setMessagesLoaded] = useState(false);
    const [messages, setMessages] = useState([]);
    const [noData, setNoData] = useState(false)
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
      // const dateSelectedSplitted = laneDetails.dayFilter.split(":")
      // let now = moment();
      // const endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
      // let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
      
      // const startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
      getMessages(startDate,endDate, 0, 10, laneType, laneDetails.customData, laneDetails.artifactSelection)
      // Create and initialize two worker instances
      
      // if(worker.current == null){
      //   worker.current = createWorker();
      //   // Send an initial message to each worker to start
      //   worker.current.postMessage({ taskName: 'Worker 1', action:'start', type:laneType,period:"10000",jobDetails:laneDetails });
      // }else{
      //   worker.current.postMessage({ taskName: 'Worker 1', action:'update', type:laneType,period:"10000",jobDetails:laneDetails });
      // }
      // // Setup message handling for each worker
      // worker.current.onmessage = (res) => {
      //   const result = {
      //     data:res.data
      //   }
      //   upateMessages(result, limit.current, skip.current)
      // };
      
    }, [updateData])
    const getMessages  = (startDate,endDate, s, l, status,customData, artifactName) => {
      getMessagesByDate(startDate,endDate, s, l, status, customData,artifactName).then((res)=>{
        upateMessages(res, 10, 0)
        updateElements(res,10,0)
        // setTimer(10)
      })
    }
    const stopWorker  = () => {
      worker.current.postMessage({ taskName: 'Worker 1', action:'stop' });
    }
    const updateElements  = (res,l,s)=>{
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
        totalPages.current.innerHTML = Math.ceil(parseInt(res.data.obj.total)/parseInt(l))
      }, 2000);
    }
    const upateMessages  = (res,l,s)=>{
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
          if(duration._data.days > 0)
            durationText = duration._data.days +" day "
          if(duration._data.hours > 0)
            durationText = durationText+duration._data.hours +" hour "
          if(duration._data.minutes > 0)
            durationText = durationText+duration._data.minutes +" min "
          if(duration._data.minutes > 0)
            durationText = durationText+duration._data.minutes +" min "
          if(duration._data.seconds > 0)
            durationText = durationText+duration._data.seconds +" sec "
          if(duration._data.milliseconds > 0)
            durationText = durationText+duration._data.milliseconds +" ms "
          messageData.push(<ListItemStandard 
                    key={e.id}
                    additionalText={durationText} 
                    additionalTextState="Success" 
                    tooltip={e.integrationArtifact.name}
                    className={isItExist.length === 0 ? 'flash-both' : ''}
                    description={localEndDate.format("MMMM DD YYYY, HH:mm:ss")}> 
                {e.integrationArtifact.name.substring(0,30)+"..."}
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
        }
    }
    return (
        <FlexBox direction="Column" alignItems="Start" justifyContent="Start" fitContainer="true" style={{padding:"5px"}}>
            {/* <div  style={{background:"var(--sapList_Background)",borderTopLeftRadius:"5px",borderTopRightRadius:"5px",flex:"0 0 50px"}} className="generic-shadow" > */}
            <FlexBox style={{background:"var(--sapList_Background)",borderTopLeftRadius:"5px",borderTopRightRadius:"5px",flex:"0 0 50px",width:"100%"}} direction="Row" alignItems="Center" justifyContent="SpaceBetween" >
                <div style={{marginLeft:"15px"}}>
                  <FontAwesomeIcon style={{marginRight:"5px"}} icon="fa-solid fa-ellipsis-vertical" />
                  <span style={{fontWeight:"600",marginLeft:"5px"}} ref={totalEntries}></span>
                </div>
                <div style={{marginRight:"15px"}}> 
                    <FlexBox direction="Row" alignItems="Center" justifyContent="SpaceBetween" fitContainer="true" >
                        <BusyIndicator active={!messagesLoaded} style={{marginRight:"5px"}} delay={1000} size="S">
                            <FlexBox direction="Row" alignItems="Center" justifyContent="Center" fitContainer="true" >
                                <FontAwesomeIcon ref={firstPage} style={{fontSize:"10px", cursor:"hand"}} icon={['fas', 'fa-angles-left']} onClick={(d) =>  changePage("FIRST")}/>
                                <FontAwesomeIcon ref={backOnePage} style={{width:"30px",fontSize:"10px", cursor:"hand"}} icon={['fas', 'fa-angle-left']} onClick={(d) =>  changePage("BACK")}/>
                                <Input ref={currentPage} style={{width:"8px",height:"30px",textAlign:"Center"}} type="Text" valueState="None" value="1"></Input>
                                <Text style={{marginLeft:"5px",marginRight:"5px"}}> / </Text>
                                <Text ref={totalPages}></Text>
                                <FontAwesomeIcon ref={forwardOnePage} style={{width:"30px",fontSize:"10px", cursor:"hand"}} icon={['fas', 'fa-angle-right']} onClick={(d) =>  changePage("FORWARD")}/>
                                <FontAwesomeIcon ref={lastPage} style={{fontSize:"10px", cursor:"hand"}} icon={['fas', 'fa-angles-right']} onClick={(d) =>  changePage("LAST")}/>
                            </FlexBox>
                        </BusyIndicator>
                    </FlexBox>
                </div>
            </FlexBox>
            <List loading={!messagesLoaded} className="generic-shadow" loadingDelay="2000" style={{borderBottomLeftRadius:"5px",borderBottomRightRadius:"5px",overflow:"auto",height:"70%"}}
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