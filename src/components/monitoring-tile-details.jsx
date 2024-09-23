import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import {getMessagesByDate,getAllArtifacts, getProcessDetails,getAllStatus,getMessagesBySearch} from '../services/s-messages'
import React, { useState,useEffect,useRef } from 'react';
import moment from 'moment';
import $ from 'jquery';
import momentTZ from 'moment-timezone';
import MonitoringTileDetailsConfigure from "./monitoring-tile-details-configure"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Table, TableHeaderRow,TableHeaderCell,TableRow,TableCell, DateTimePicker,Panel,Icon,Link,Text,Bar,MultiComboBox,MultiComboBoxItem,Select,Option,Switch,BusyIndicator,Button, Input,FilterGroupItem,FlexBox,Label,Title} from '@ui5/webcomponents-react';

const MonitoringPageDetails = props => {
  const [details, setDetails] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [showStepDiagram, setShowStepDiagram] = useState(false);
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
  let [stepNumbers,setStepNumbers] = useState([]);
  let [allArtifacts, setAllArtifacts] = useState([]);
  let [statusList, setStatusList] = useState([]);
  let [selectedEntry, setSelectedEntry] = useState(null);
  let stepStatus = useRef(null);
  let customStepNumber = useRef(null);
  const showDetails = (d) => {
      setDetails(d);
  };
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
      let allArtifacts = [<Option value="ALL" selected>All</Option>]
      for(const e of artifacts.data.obj){
        allArtifacts.push(<Option value={e}>{e}</Option>)
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
  const upateMessages  = (res,l,s)=>{
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
    
    for(const e of res.data.obj.list){
      let stat = "message-success"
      let iconColor = "green"
      if(e.customStatus === "FAILED" || e.customStatus === "ERROR" || e.customStatus === "ERRORED" || e.customStatus === "FAIL"){
        stat = "message-error"
        iconColor = "red"
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
      messageData.push(
      <TableRow key={`${e.messageId}`} className="messageRow">
        <TableCell id={`${e.messageId}`}>
          <FlexBox direction="Column" alignItems="Center" justifyContent="Center" fitContainer="true">
            <Icon style={{color:iconColor, borderLeft:"none", width:"24px",height:"24px"}} name={stat} />
          </FlexBox>
        </TableCell>
        <TableCell  id={`${e.messageId}`}>
          <FlexBox direction="Column" alignItems="Center" justifyContent="Center" fitContainer="true">
            <span>{e.steps.length}</span>
          </FlexBox>
        </TableCell>
        <TableCell id={`${e.messageId}`}>
            <span>{e.messageId}</span>
        </TableCell>
        <TableCell id={`${e.messageId}`}>
          <span>{e.correlationID}</span>
        </TableCell>
        <TableCell  id={`${e.messageId}`}>
          <span>{e.integrationArtifact.name}</span>
        </TableCell>
        <TableCell id={`${e.messageId}`}>
          <span>{localStartDate.format("LLL")}</span>
        </TableCell>
        <TableCell id={`${e.messageId}`}>
          <span>{localEndDate.format("LLL")}</span>
        </TableCell>
        <TableCell id={`${e.messageId}`}>
          <span>{durationText}</span>
        </TableCell>
        <TableCell id={`${e.messageId}`}>
            <Button design="Transparent" icon="slim-arrow-right" ui5-button="" icon-only="" has-icon="" onClick={() => loadArtifact(e)}></Button>
            {/* <Icon name="navigation-right-arrow" onClick={props.onClick} style={{border:"none"}}/> */}
        </TableCell>
      </TableRow>)
    }
    showDetails(true)
    setMessages(messageData)
    setTimeout(() => {
      setMessagesLoaded(true)
    }, 2000);
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
    //currentMessage.current.value = message
    const details = await getProcessDetails(message.integrationArtifact.id, message.messageId)
    //currentMetadata.current.value = details
    setSelectedEntry(<MonitoringTileDetailsConfigure messageData={message} metadata={details.data.obj} style={{width:"99.5%"}}></MonitoringTileDetailsConfigure>)
    setShowStepDiagram(!showStepDiagram)
  }
  const filterChanged = async(event) => {
    
    setMessagesLoaded(false)
    if(searchSelection.current.value !== ""){
      let s = 0
      let l = limitSelection.current.value
      const res = await getMessagesBySearch(searchSelection.current.value, l, s)
      upateMessages(res, l, s)
    }else{
      // let selectedStatus = []
      // for(const selectedValue of statusSelection.current.selectedValues){
      //   selectedStatus.push(selectedValue.innerHTML)
      // }
      let s = 0
      let l = limitSelection.current.value
      const dateSelected = dateSelection.current.value
      let customData = customHeaderProperties.current.value
      if(customData === '')
        customData = "NONE"
      const sStatus = stepStatus.current.value
      // let sNumbers = []
      // for(const stepNumber of customStepNumber.current.selectedValues){
      //   sNumbers.push("STEPS='"+stepNumber.innerHTML.trim()+":"+sStatus+"'")
      // }
      // if(sNumbers.length > 0 && sNumbers.toString().indexOf("ALL") === -1){
      //   let customDataS = sNumbers.toString()
      //   customData = customDataS.replaceAll(","," and ")
      // }else{
      //   stepStatus.current.value = ''
      // }
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
      getMessages(startDate,endDate, s, l, sStatus,customData,artifactSelection.current.value)
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
      customStepNumber.current.disabled = true
      stepStatus.current.disabled = true
      customHeaderProperties.current.disabled = true
    }else{
      artifactSelection.current.disabled = false
      statusSelection.current.disabled = false
      dateSelection.current.disabled = false
      customStepNumber.current.disabled = false
      stepStatus.current.disabled = false
      customHeaderProperties.current.disabled = false
      if(dateSelected === "Custom"){
        customStartdate.current.disabled = false
        customEnddate.current.disabled = false
      }
    }
  }
  const changePage = (event) => {
    setMessagesLoaded(false)
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
    // const dateSelectedSplitted = dateSelected.split(":")
    // let now = moment();
    // const endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
    // let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
    
    // const startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
    let lSelection = parseInt(limitSelection.current.value)
    let cPage = parseInt(currentPage.current.value)
    let totalPages1 = parseInt(totalPages.current.innerHTML)
    //startDate,endDate, s, l, status,customData, sNumbers, sStatus
    let customData = customHeaderProperties.current.value
    if(customData === '')
      customData = "NONE"
    // let selectedStatus = []
    // for(const selectedValue of statusSelection.current.selectedValues){
    //   selectedStatus.push(selectedValue.innerHTML)
    // }
    const sStatus = stepStatus.current.value
    // let sNumbers = []
    // for(const stepNumber of customStepNumber.current.selectedValues){
    //   sNumbers.push("STEPS='"+stepNumber.innerHTML.trim()+":"+sStatus+"'")
    // }
    // if(sNumbers.length > 0 && sNumbers.toString().indexOf("ALL") === -1){
    //   let customDataS = sNumbers.toString()
    //   customData = customDataS.replaceAll(","," and ")
    // }else{
    //   stepStatus.current.value = ''
    // }
    const artifactName = artifactSelection.current.value
    if(event === "BACK" && cPage > 1){
      cPage = cPage - 1
      let offset1 = cPage * lSelection
      offset.current.innerHTML = offset1 - lSelection
      limit.current.innerHTML = offset1
      getMessages(startDate,endDate, offset1 - lSelection,lSelection, sStatus, customData,artifactName)
      currentPage.current.value = cPage
    }else if(event === "FORWARD" && cPage <= totalPages1){
      let offset1 = cPage*lSelection
      offset.current.innerHTML = offset1
      if(parseInt(totalEntries.current.innerHTML) < offset1+lSelection){
        limit.current.innerHTML = totalEntries.current.innerHTML
      }else
        limit.current.innerHTML = offset1+lSelection
      getMessages(startDate,endDate, offset1,lSelection,sStatus,customData,artifactName)
      currentPage.current.value = cPage + 1
    }else if(event === "LAST" && cPage <= totalPages1){
      let offset1 = (parseInt(totalPages.current.innerHTML)-1) * lSelection
      offset.current.innerHTML = offset1
      limit.current.innerHTML = totalEntries.current.innerHTML
      getMessages(startDate,endDate, offset1,lSelection, sStatus, customData,artifactName)
      currentPage.current.value = parseInt(totalPages.current.innerHTML)
    }else if(event === "FIRST" && cPage <= totalPages1){
      let offset1 = 0
      offset.current.innerHTML = offset1
      limit.current.innerHTML = offset1+lSelection
      getMessages(startDate,endDate, offset1,lSelection, sStatus, customData,artifactName)
      currentPage.current.value = 1
    }
  }
  return (
      <FlexBox direction="Column" alignItems="Start" justifyContent="Start" fitContainer="true">
        <motion.div style={{width:'100%'}}
                            variants={wrapperVariants}
                            initial="visible"
                            animate={!showStepDiagram ? 'visible' : 'hidden'}
                            exit="exit">
          <FlexBox direction="Column" alignItems="Start" justifyContent="Start" fitContainer="true">
            {/* <Bar design="Header" style={{borderTopLeftRadius:"15px",borderTopRightRadius:"15px",width:"99.5%"}}>
              <Button design="Transparent" icon="slim-arrow-left" slot="startContent" ui5-button="" icon-only="" has-icon="" onClick={props.onClick}>Back</Button>
            </Bar> */}
            <FlexBox direction="Column" alignItems="Start" justifyContent="Start" style={{width:"99.5%", backgroundColor:"white",borderRadius:"15px"}}>
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
                    <Select ref={dateSelection} className="generic-shadow" onChange={(e) => dateSelectionChanged(e)}>
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
                    <MultiComboBox ref={statusSelection} className="generic-shadow" onOpenChange = {(d) =>  multiSelectionToggled(d, 'selecAllID1')} onSelectionChange={(d) =>  multiSelectionChanged(d, 'selecAllID1')}>
                      {statusList}
                    </MultiComboBox>
                  </FilterGroupItem>
                  <FilterGroupItem groupName="Group 7" label="Artifact Name" style={{flex:"0 0 25%"}}>
                    <Select ref={artifactSelection} className="generic-shadow">
                      {allArtifacts}
                    </Select>
                  </FilterGroupItem>
                  <Text style={{marginRight:"15px"}}>Or</Text>
                  <FilterGroupItem groupName="Group 4" label="Search" style={{flex:"0 0 30%"}}>
                    <Input className="generic-shadow" ref={searchSelection} onChange={(d) =>  searchChanged(d)} icon={<Icon name="search" />} onInput={(d) =>  searchChanged(d)}></Input>
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
                  <FilterGroupItem groupName="Group 3" label="Step Number:" style={{flex:"1 1 20%"}}>
                    <MultiComboBox ref={customStepNumber} className="generic-shadow" onOpenChange = {(d) =>  multiSelectionToggled(d, 'selecAllID')} onSelectionChange={(d) =>  multiSelectionChanged(d, 'selecAllID')}>
                        {stepNumbers}
                    </MultiComboBox>
                  </FilterGroupItem>
                  <FilterGroupItem groupName="Group 4" label="Step Status:" style={{flex:"1 1 30%"}}>
                      <Input ref={stepStatus} className="generic-shadow"   type="Text" valueState="None" placeholder="SUCCESS or FAILED, etc.. (one status ONLY)"></Input>
                  </FilterGroupItem>
                  <FilterGroupItem groupName="Group 5" label="Custom Header Properties" style={{flex:"1 1 40%"}}>
                    <Input ref={customHeaderProperties} className="generic-shadow" style={{width:"80%"}} type="Text" valueState="None" placeholder="Name = Value or/and Name=Value ..."></Input>
                  </FilterGroupItem>
                </FlexBox>
              </Panel>  

            </FlexBox>
            <FlexBox direction="Column" alignItems="Start" justifyContent="Start" fitContainer="true">
              <div style={{paddingTop:"10px", paddingBottom:"10px", backgroundColor:"#f5f6f7", width:"99%"}}>
              <Table  loading={!messagesLoaded} loadingDelay="2000" className="generic-shadow generic-border-radius" 
                       headerRow={<TableHeaderRow sticky>
                                    <TableHeaderCell style={{width:"30px"}}>
                                      <FlexBox direction="Column" alignItems="Center" justifyContent="Center" fitContainer="true"><span>Status</span></FlexBox>
                                    </TableHeaderCell>
                                    <TableHeaderCell style={{width:"80px"}}><span>Total Steps</span></TableHeaderCell>
                                    <TableHeaderCell style={{width:"260px"}}><span>Message ID</span></TableHeaderCell>
                                    <TableHeaderCell style={{width:"260px"}}><span>Correlation ID</span></TableHeaderCell>
                                    <TableHeaderCell style={{width:"400px"}} ><span>Artifact Name</span></TableHeaderCell>
                                    <TableHeaderCell style={{width:"200px"}} ><span>Start Time</span></TableHeaderCell>
                                    <TableHeaderCell style={{width:"200px"}} ><span>End Time</span></TableHeaderCell>
                                    <TableHeaderCell style={{width:"120px"}}><span>Duration</span></TableHeaderCell>
                                    <TableHeaderCell style={{width:"30px"}}><span></span></TableHeaderCell>
                                </TableHeaderRow>}
                      onPopinChange={function _a(){}}
                      onRowClick={function _a(){}}
                      onSelectionChange={function _a(){}}>
                          {messages}
              </Table>
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
                  <BusyIndicator active={!messagesLoaded} style={{marginRight:"20px"}} delay={1000} size="S">
                    <FlexBox direction="Row" alignItems="Center" justifyContent="Center" fitContainer="true" >
                      <FontAwesomeIcon ref={firstPage} style={{width:"30px", fontSize:"14px", cursor:"hand"}} icon={['fas', 'fa-angles-left']} onClick={(d) =>  changePage("FIRST")}/>
                      <FontAwesomeIcon ref={backOnePage} style={{width:"30px", marginRight:"10px", fontSize:"14px", cursor:"hand"}} icon={['fas', 'fa-angle-left']} onClick={(d) =>  changePage("BACK")}/>
                      <Input ref={currentPage} style={{width:"8px",height:"30px",textAlign:"Center"}} type="Text" valueState="None" value="1"></Input>
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
      
        <motion.div style={{width:'100%'}}
                    variants={wrapperVariants}
                    initial="visible"
                    animate={showStepDiagram ? 'visible' : 'hidden'}
                    exit="exit">
          <FlexBox direction="Column" alignItems="Start" justifyContent="Center" fitContainer="true" >
            <Bar design="Header" style={{borderTopLeftRadius:"15px",borderTopRightRadius:"15px",width:"99.5%"}}>
              <Button design="Transparent" icon="slim-arrow-left" slot="startContent" ui5-button="" icon-only="" has-icon="" onClick={(d) =>  setShowStepDiagram(!showStepDiagram)}>Back to List</Button>
            </Bar>
            {selectedEntry}
          </FlexBox>
        </motion.div>
      </FlexBox>
    );
}
export default MonitoringPageDetails;