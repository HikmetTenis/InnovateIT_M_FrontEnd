import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import {getMessagesByDate,getAllArtifacts, getProcessDetails,getAllStatus,getMessagesBySearch} from '../services/s-messages'
import React, { useState,useEffect,useRef } from 'react';
import MonitoringLane from "./monitoring-lane"
import moment from 'moment';
import $ from 'jquery';
import momentTZ from 'moment-timezone';
import MonitoringTileDetailsConfigure from "./monitoring-tile-details-configure"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Panel,Icon,Link,Text,Bar,DateTimePicker,MultiComboBoxItem,Select,Option,Button, Input,FilterGroupItem,FlexBox,Label,Title} from '@ui5/webcomponents-react';
const generateRandomNumber = () => {
  const min = 10000;
  const max = 99999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
const MonitoringLanes = props => {
  let dateSelection = useRef(null);
  let statusSelection = useRef(null);
  let artifactSelection = useRef(null);
  let searchSelection = useRef(null);
  let customStepNumber = useRef(null);
  let customHeaderProperties = useRef(null);
  let [allArtifacts, setAllArtifacts] = useState([]);
  let [statusList, setStatusList] = useState([]);
  let [stepNumbers,setStepNumbers] = useState([]);
  let [lanes,setLanes] = useState([]);
  let stepStatus = useRef(null);
  let [updateLanes, setUpdateLanes] = useState(0);
  let [laneDedatils,setLaneDetails] = useState({
    startDate:null,
    endDate:null,
    search:null,
    dayFilter:"1:hours",
    customData:"NONE"
  });
  let customStartdate  = useRef(null);
  let customEnddate  = useRef(null);
  let customPanel  = useRef(null);
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
  useEffect(() => {
    setStepNumbers(options)
    // lanes.push(<MonitoringLane details={laneDedatils} laneType="SUCCESS" updateData={updateLanes}></MonitoringLane>)
    // lanes.push(<MonitoringLane details={laneDedatils} laneType="FAILED" updateData={updateLanes}></MonitoringLane>)
    // lanes.push(<MonitoringLane details={laneDedatils} laneType="PROCESSING" updateData={updateLanes}></MonitoringLane>)
    // lanes.push(<MonitoringLane details={laneDedatils} laneType="REPROCESSED" updateData={updateLanes}></MonitoringLane>)
    setLanes(lanes)
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
  const multiSelectionToggled = (event, id) => {
    let selectAllElement = document.getElementById( id );
    let isitSelected = selectAllElement.getAttribute( "data-selected" );
    if(isitSelected === 'true' && event.srcElement.selectedValues.length === 0){
      selectAllElement.selected = true
    }
  }
  const filterChanged = (event) => {
    const searchString = searchSelection.current.value
    const dateSelected = dateSelection.current.value
    let customData = customHeaderProperties.current.value
    if(customData === '')
      customData = "NONE"
    let startDate = null
    let endDate = null
    if(dateSelected === "Custom"){
      const customStart = moment(customStartdate.current.value, "MMM DD, YYYY, hh:mm:ss A")
      startDate = moment.utc(customStart).format("YYYY-MM-DD HH:mm:ss")
      const customEnd = moment(customEnddate.current.value, "MMM DD, YYYY, hh:mm:ss A")
      endDate = moment.utc(customEnd).format("YYYY-MM-DD HH:mm:ss")
    }
    let changedDetails ={
      startDate:startDate,
      endDate:endDate,
      artifactSelection:artifactSelection.current.value,
      searchString:searchString,
      dayFilter:dateSelected,
      customData:customData
    }
    
    setLaneDetails(changedDetails);
    setUpdateLanes(generateRandomNumber()); 
  };
  const dateChanged  = (event) => {
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
    if(searchSelection.current.value !== ""){
      artifactSelection.current.disabled = true
      statusSelection.current.disabled = true
      dateSelection.current.disabled = true
    }else{
      artifactSelection.current.disabled = false
      statusSelection.current.disabled = false
      dateSelection.current.disabled = false
    }
  }
  return (
    <FlexBox direction="Column" alignItems="Start" justifyContent="Start" fitContainer="true">
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
              {/* <FilterGroupItem groupName="Group 2" label="Status" style={{flex:"0 0 15%"}}>
                <MultiComboBox ref={statusSelection} className="generic-shadow" onOpenChange = {(d) =>  multiSelectionToggled(d, 'selecAllID1')} onSelectionChange={(d) =>  multiSelectionChanged(d, 'selecAllID1')}>
                  {statusList}
                </MultiComboBox>
              </FilterGroupItem> */}
              <FilterGroupItem groupName="Group 2" label="Time" style={{flex:"0 0 15%"}}>
                <Select ref={dateSelection} className="generic-shadow" onChange={(e) => dateChanged(e)}>
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
              <FilterGroupItem groupName="Group 3" label="Artifact Name" style={{flex:"0 0 25%"}}>
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
              {/* <FilterGroupItem groupName="Group 4" label="Step Number:" style={{flex:"1 1 5%"}}>
                <MultiComboBox ref={customStepNumber} className="generic-shadow" onOpenChange = {(d) =>  multiSelectionToggled(d, 'selecAllID')} onSelectionChange={(d) =>  multiSelectionChanged(d, 'selecAllID')}>
                    {stepNumbers}
                </MultiComboBox>
              </FilterGroupItem>
              <FilterGroupItem groupName="Group 4" label="Step Status:" style={{flex:"1 1 25%"}}>
                  <Input ref={stepStatus} className="generic-shadow"   type="Text" valueState="None" placeholder="SUCCESS or FAILED, etc.. (one status ONLY)"></Input>
              </FilterGroupItem> */}
              <FilterGroupItem groupName="Group 1" label="Start Date" style={{flex:"1 1 5%"}}>
                    <DateTimePicker  ref={customStartdate} onChange={function Sa(){}} primaryCalendarType="Gregorian" valueState="None"/>
                  </FilterGroupItem>
                  <FilterGroupItem groupName="Group 2" label="End Date" style={{flex:"1 1 5%"}}>
                    <DateTimePicker  ref={customEnddate} onChange={function Sa(){}} primaryCalendarType="Gregorian" valueState="None"/>
                  </FilterGroupItem>
              <FilterGroupItem groupName="Group 4" label="Custom Header Properties" style={{flex:"1 1 70%"}}>
                <FlexBox direction="Row" alignItems="Center" justifyContent="Start" fitContainer="true">
                  <Input ref={customHeaderProperties} className="generic-shadow" style={{width:"80%"}} type="Text" valueState="None" placeholder="Name = Value or/and Name=Value ..."></Input>
                  {/* <Switch checked="true"/>
                  <Label>Add Custom Header Properties to Table as columns</Label> */}
                </FlexBox>
              </FilterGroupItem>
            </FlexBox>
          </Panel>  
        </FlexBox>
        <FlexBox direction="Row" alignItems="Start" justifyContent="Start" fitContainer="true" >
          <MonitoringLane index={2} details={laneDedatils} laneType="SUCCESS" updateData={updateLanes}></MonitoringLane>
          <MonitoringLane index={1} details={laneDedatils} laneType="FAILED" updateData={updateLanes}></MonitoringLane>
          <MonitoringLane index={3} details={laneDedatils} laneType="PROCESSING" updateData={updateLanes}></MonitoringLane>
          <MonitoringLane index={4} details={laneDedatils} laneType="REPROCESSED" updateData={updateLanes}></MonitoringLane>
        </FlexBox>
      </FlexBox>
    </FlexBox>
  );
}
export default MonitoringLanes;