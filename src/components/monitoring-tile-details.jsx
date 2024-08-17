import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import {getMessagesByDate} from '../services/s-messages'
import React, { useState,useEffect,useRef } from 'react';
import moment from 'moment';
import momentTZ from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faBackwardFast,faForwardFast } from '@fortawesome/free-solid-svg-icons'
import { Table, TableColumn,TableRow,TableCell, Panel,TabContainer, Tab,BarDesign,Icon,Link,Bar,ToolbarButton,ObjectPage,DateRangePicker, ComboBox,ComboBoxItem,MultiComboBox,MultiComboBoxItem,Select,Option,Switch,Token,DynamicPageTitle, BusyIndicator,Button, MultiInput,StepInput, Input,FilterGroupItem,FilterBar,VariantManagement,VariantItem,Text,FlexBox,Label,DynamicSideContent, MessageStrip,Title,Badge,ObjectStatus,Breadcrumbs,BreadcrumbsItem} from '@ui5/webcomponents-react';

const MonitoringPageDetails = props => {
  const [details, setDetails] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  let offset = useRef(null);
  let limit = useRef(null);
  let totalEntries = useRef(null);
  let totalPages = useRef(null);
  let dateSelection = useRef(null);
  let statusSelection = useRef(null);
  let artifactSelection = useRef(null);
  let backOnePage = useRef(null);
  let forwardOnePage = useRef(null);
  let firstPage = useRef(null);
  let lastPage = useRef(null);
  let currentPage = useRef(null);
  let limitSelection = useRef(null);
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
    useEffect(() => {
      let s = 0
      let l = 10
      offset.current.innerHTML = s
      limit.current.innerHTML = l
      currentPage.current.value = 1
      limitSelection.current.value = 10

      let now = moment();
      const endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
      let past = now.subtract(60, 'minutes');
      
      const startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
      getMessages(startDate,endDate, s, l, "ALL")
    }, [])
    const getMessages  = (startDate,endDate, s, l, status) => {
      getMessagesByDate(startDate,endDate, s, l, status).then((res)=>{
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
          if(e.customStatus === "FAILED"){
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
          <TableRow key={`${e.messageId}`}>
            <TableCell>
              <FlexBox direction="Column" alignItems="Center" justifyContent="Center" fitContainer="true">
                <Icon style={{color:iconColor, borderLeft:"none", width:"24px",height:"24px"}} name={stat} />
              </FlexBox>
            </TableCell>
            <TableCell>
                <span>{e.messageId}</span>
            </TableCell>
            <TableCell>
              <span>{e.correlationID}</span>
            </TableCell>
            <TableCell >
              <span>{e.integrationArtifact.name}</span>
            </TableCell>
            <TableCell>
              <span>{localStartDate.format("LLL")}</span>
            </TableCell>
            <TableCell>
              <span>{localEndDate.format("LLL")}</span>
            </TableCell>
            <TableCell>
              <span>{durationText}</span>
            </TableCell>
          </TableRow>)
        }
        showDetails(true)
        setMessages(messageData)
        setTimeout(() => {
          setMessagesLoaded(true)
        }, 2000);
      })
    }
    const filterChanged = (event) => {
      setMessagesLoaded(false)
      let selectedStatus = []
      for(const selectedValue of statusSelection.current.selectedValues){
        selectedStatus.push(selectedValue.innerHTML)
      }
      let s = 0
      let l = limitSelection.current.value
      const dateSelected = dateSelection.current.value
      currentPage.current.value = 1
      limit.current.innerHTML = limitSelection.current.value
      offset.current.innerHTML = 0
      const dateSelectedSplitted = dateSelected.split(":")
      let now = moment();
      const endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
      let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
      
      const startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
      getMessages(startDate,endDate, s, l, selectedStatus)
    };
    const changePage = (event) => {
      setMessagesLoaded(false)
      const value = statusSelection.current.value
      const dateSelected = dateSelection.current.value
      const dateSelectedSplitted = dateSelected.split(":")
      let now = moment();
      const endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
      let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
      
      const startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
      let lSelection = parseInt(limitSelection.current.value)
      let cPage = parseInt(currentPage.current.value)
      let totalPages1 = parseInt(totalPages.current.innerHTML)

      if(event === "BACK" && cPage > 1){
        cPage = cPage - 1
        let offset1 = cPage * lSelection
        offset.current.innerHTML = offset1 - lSelection
        limit.current.innerHTML = offset1
        getMessages(startDate,endDate, offset1 - lSelection,lSelection, value)
        currentPage.current.value = cPage
      }else if(event === "FORWARD" && cPage <= totalPages1){
        let offset1 = cPage*lSelection
        offset.current.innerHTML = offset1
        if(parseInt(totalEntries.current.innerHTML) < offset1+lSelection){
          limit.current.innerHTML = totalEntries.current.innerHTML
        }else
          limit.current.innerHTML = offset1+lSelection
        getMessages(startDate,endDate, offset1,lSelection, value)
        currentPage.current.value = cPage + 1
      }else if(event === "LAST" && cPage <= totalPages1){
        let offset1 = (parseInt(totalPages.current.innerHTML)-1) * lSelection
        offset.current.innerHTML = offset1
        limit.current.innerHTML = totalEntries.current.innerHTML
        getMessages(startDate,endDate, offset1,lSelection, value)
        currentPage.current.value = parseInt(totalPages.current.innerHTML)
      }else if(event === "FIRST" && cPage <= totalPages1){
        let offset1 = 0
        offset.current.innerHTML = offset1
        limit.current.innerHTML = offset1+lSelection
        getMessages(startDate,endDate, offset1,lSelection, value)
        currentPage.current.value = 1
      }
    }
    return (
      <FlexBox direction="Column" alignItems="Start" justifyContent="Start" fitContainer="true">
        <FlexBox direction="Column" alignItems="Start" justifyContent="Start" fitContainer="true">
        <Bar design="Header" style={{borderTopLeftRadius:"15px",borderTopRightRadius:"15px"}}>
          <Button design="Transparent" icon="slim-arrow-left" slot="startContent" ui5-button="" icon-only="" has-icon="" onClick={props.onClick}>Back</Button>
        </Bar>
        <FlexBox direction="Column" alignItems="Start" justifyContent="Start" style={{width:"100%", backgroundColor:"white",borderBottomLeftRadius:"15px",borderBottomRightRadius:"15px"}}>
          <Title level="H4" style={{marginBottom:"20px",marginTop:"10px", backgroundColor:"white", paddingLeft:"60px"}}>Monitor Message Processing</Title>
          <Panel accessibleRole="Form" onToggle={function _a(){}} collapsed style={{width:"100%"}}
            header={<FlexBox direction="Row" style={{marginLeft:"10px"}} alignItems="Center" justifyContent="SpaceBetween" fitContainer="true">
            <FlexBox direction="Row" alignItems="Center" justifyContent="Start" fitContainer="true">
              <FilterGroupItem groupName="Group 2" label="Status" style={{flex:"0 0 20%"}}>
                <MultiComboBox ref={statusSelection} className="generic-shadow">
                  <MultiComboBoxItem text="ALL" selected>ALL</MultiComboBoxItem>
                  <MultiComboBoxItem text="SUCCESS" >SUCCESS</MultiComboBoxItem>
                  <MultiComboBoxItem text="FAILED" >FAILED</MultiComboBoxItem>
                  <MultiComboBoxItem text="IGNORED" >IGNORED</MultiComboBoxItem>
                  <MultiComboBoxItem text="PROCESSING" ></MultiComboBoxItem>
                  <MultiComboBoxItem text="PROCESSED" ></MultiComboBoxItem>
                </MultiComboBox>
              </FilterGroupItem>
              <FilterGroupItem groupName="Group 2" label="Time" style={{flex:"0 0 20%"}}>
                <Select ref={dateSelection} className="generic-shadow">
                  <Option value="1:hours" selected>Past Hour</Option>
                  <Option value="2:hours" >Past 2 Hours</Option>
                  <Option value="3:hours" >Past 3 Hours</Option>
                  <Option value="4:hours" >Past 4 Hours</Option>
                  <Option value="5:hours" >Past 5 Hours</Option>
                  <Option value="8:hours" >Past 8 Hours</Option>
                  <Option value="24:hours" >Past 24 Hours</Option>
                  <Option value="1:weeks" >Past Week</Option>
                  <Option value="1:months" >Past Month</Option>
                </Select>
              </FilterGroupItem>
              <FilterGroupItem groupName="Group 3" label="Artifact Name" style={{flex:"0 0 40%"}}>
                <Select ref={artifactSelection} className="generic-shadow">
                  <Option additionalText="" selected>All</Option>
                </Select>
              </FilterGroupItem>
              <Link design="Emphasized" onClick={(d) =>  filterChanged(d)}>Filter</Link>
            </FlexBox>
          </FlexBox>}>
            <FilterGroupItem groupName="Group 4" label="Custom Header Properties">
              <Input className="generic-shadow" style={{width:"100%"}} icon={<Icon name="flag-2" />} type="Text" valueState="None" placeholder="Name = Value or/and Name=Value ..."></Input>
            </FilterGroupItem>
          </Panel>  

        </FlexBox>
          <FlexBox direction="Column" alignItems="Start" justifyContent="Start" fitContainer="true">
            <div style={{padding:"10px", backgroundColor:"#f5f6f7", width:"100%"}}>
            <Table  columns={<><TableColumn style={{width:"30px"}}><FlexBox direction="Column" alignItems="Center" justifyContent="Center" fitContainer="true"><span>Status</span></FlexBox></TableColumn>
                                <TableColumn style={{width:"260px"}}><span>Message ID</span></TableColumn>
                                <TableColumn style={{width:"260px"}}><span>Correlation ID</span></TableColumn>
                                <TableColumn style={{width:"400px"}} ><span>Artifact Name</span></TableColumn>
                                <TableColumn style={{width:"200px"}} ><span>Start Time</span></TableColumn>
                                <TableColumn style={{width:"200px"}} ><span>End Time</span></TableColumn>
                                <TableColumn style={{width:"120px"}}><span>Duration</span></TableColumn></>}
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
                <BusyIndicator active={!messagesLoaded} style={{marginRight:"20px"}} size="Small">
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
        </FlexBox> 
      );
}
export default MonitoringPageDetails;