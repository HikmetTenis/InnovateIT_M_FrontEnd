import "@ui5/webcomponents-icons/dist/AllIcons.js";
import React, { useState,useEffect,useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import {getMessagesByDate,getMessagesBySearch} from '../services/s-messages'
import { Table, TableColumn,TableRow,TableCell, Toolbar,Icon,List,ToolbarSpacer,Text,Bar,StandardListItem,DynamicPageHeader,Select,Option,Switch,BusyIndicator,Button, Input,FilterGroupItem,FlexBox,Label,Title} from '@ui5/webcomponents-react';
import moment from 'moment';
import $ from 'jquery';
import momentTZ from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
const MonitoringLane = props => {
    let totalEntries = useRef(null);
    let totalPages = useRef(null);
    let backOnePage = useRef(null);
    let forwardOnePage = useRef(null);
    let firstPage = useRef(null);
    let lastPage = useRef(null);
    let currentPage = useRef(null);
    const [messagesLoaded, setMessagesLoaded] = useState(false);
    const [messages, setMessages] = useState([]);
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
        const laneDetails = props.details
        totalEntries.current.innerText = laneDetails.status
        currentPage.current.value = 1
        getMessages(laneDetails.startDate,laneDetails.endDate, 0, 10, laneDetails.status, laneDetails.customData)
        
    }, [])
    const getMessages  = (startDate,endDate, s, l, status,customData) => {
        getMessagesByDate(startDate,endDate, s, l, status, customData).then((res)=>{
            upateMessages(res, l, s)
        })
    }
    const upateMessages  = (res,l,s)=>{
        totalEntries.current.innerText = props.details.status+"("+res.data.obj.total+")"
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
        
        for(const e of res.data.obj.list){
          let stat = "Success"
          if(e.customStatus === "FAILED" || e.customStatus === "ERROR" || e.customStatus === "ERRORED" || e.customStatus === "FAIL"){
            stat = "Error"
          }
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
          messageData.push(<StandardListItem 
                    additionalText={durationText} 
                    additionalTextState="Success" 
                    description={localEndDate.format("LLL")}> 
                {e.integrationArtifact.name}
            </StandardListItem>)
        }
        if(props.details.status === "SUCCESS"){
            totalEntries.current.style.color = "green";
        }else if(props.details.status === "FAILED"){
            totalEntries.current.style.color = "red";
        }else if(props.details.status === "PROCESSING"){
            totalEntries.current.style.color = "grey";
        }else if(props.details.status === "REPROCESSED"){
            totalEntries.current.style.color = "orange";
        }
        setMessages(messageData)
        setTimeout(() => {
          setMessagesLoaded(true)
        }, 2000);
    }
    const changePage = (event) => {
        const laneDetails = props.details
        setMessagesLoaded(false)
        
        let lSelection = 10
        let cPage = parseInt(currentPage.current.value)
        let totalPages1 = parseInt(totalPages.current.innerHTML)
        //startDate,endDate, s, l, status,customData, sNumbers, sStatus
        let customData = laneDetails.customData
        if(customData === '')
          customData = "NONE"
        if(customData.toString().indexOf("ALL") === -1){
          customData = props.details.customData.replaceAll(","," and ")
        }
        if(event === "BACK" && cPage > 1){
          cPage = cPage - 1
          let offset1 = cPage * lSelection
          getMessages(laneDetails.startDate,laneDetails.endDate, offset1 - lSelection,lSelection, laneDetails.status, customData)
          currentPage.current.value = cPage
        }else if(event === "FORWARD" && cPage <= totalPages1){
          let offset1 = cPage*lSelection
          getMessages(laneDetails.startDate,laneDetails.endDate, offset1,lSelection, laneDetails.status, customData)
          currentPage.current.value = cPage + 1
        }else if(event === "LAST" && cPage <= totalPages1){
          let offset1 = (parseInt(totalPages.current.innerHTML)-1) * lSelection
          getMessages(laneDetails.startDate,laneDetails.endDate, offset1,lSelection, laneDetails.status, customData)
          currentPage.current.value = parseInt(totalPages.current.innerHTML)
        }else if(event === "FIRST" && cPage <= totalPages1){
          let offset1 = 0
          getMessages(laneDetails.startDate,laneDetails.endDate, offset1,lSelection, laneDetails.status, customData)
          currentPage.current.value = 1
        }
    }
    return (
        <FlexBox direction="Column" alignItems="Start" justifyContent="Start" fitContainer="true" style={{padding:"5px"}}>
            <Toolbar  style={{background:"var(--sapList_Background)",borderTopLeftRadius:"5px",borderTopRightRadius:"5px",flex:"0 0 50px"}} className="generic-shadow" >
                <span style={{marginLeft:"10px",fontWeight:"600"}} ref={totalEntries}></span>
                <ToolbarSpacer />
                <div> 
                    <FlexBox direction="Row" alignItems="Center" justifyContent="SpaceBetween" fitContainer="true" >
                        <BusyIndicator active={!messagesLoaded} style={{marginRight:"5px"}} size="Small">
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
            </Toolbar>
            <List busy={!messagesLoaded} className="generic-shadow" busyDelay="2000" style={{borderBottomLeftRadius:"5px",borderBottomRightRadius:"5px",overflow:"auto",height:"70%"}}
                growing="None" 
                header={<DynamicPageHeader style={{padding:"0px",display:"Block",height:"0px",width:"100%"}}/>}
                mode="SingleSelect"
                noDataText="No Data"
                onItemClick={function Sa(){}}
                onItemClose={function Sa(){}}
                onItemDelete={function Sa(){}}
                onItemToggle={function Sa(){}}
                onLoadMore={function Sa(){}}
                onSelectionChange={function Sa(){}}
                separators="All">
                    {messages}
            </List>
        </FlexBox>
    )
}
export default MonitoringLane;