import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Button, Panel,FlexBox,Title,Text,Label} from '@ui5/webcomponents-react';
import {LineChart}  from '@ui5/webcomponents-react-charts';
import MonitoringTile from './monitoring-tile';
import GridContainer from './monitoring-tile-container';
import JMSTile from "./monitoring-jms-stats";
import React, { useState,useEffect} from 'react';
import { LayoutGroup  } from 'framer-motion';
import moment from 'moment'; 
import {getGraphAllData} from '../services/s-monitoring'
import momentTZ from 'moment-timezone';
import { motion} from "framer-motion"
export default function MonitoringPageHeader({tileClicked}) {
    const [refreshMessages, setRefreshMessages] = useState(false);
    const [refreshQueues, setRefreshQueues] = useState(false);
    const [refreshTime1, setRefreshtime1] = useState(moment().format("LLL"));
    const [refreshTime2, setRefreshtime2] = useState(moment().format("LLL"));

    const [graphLoaded, setGraphLoaded] = useState(true);
    const [queuesLoaded, setQueuesLoaded] = useState(true);
    const [messagesLoaded, setMessagesLoaded] = useState(true);
    const [graphData, setGraphData] = useState(true);
    const timeRanges = [{id:'1:hours',desc:'1 hour'},{id:'6:hours',desc:'6 hours'},{id:'12:hours',desc:'12 hours'},{id:'1:days',desc:'1 day'},{id:'7:days',desc:'7 days'},{id:'30:days',desc:'30 days'}];
    const [activeRange, setActiveRange] = useState('1 hour');
    const [items] = useState([
        { id: 1, color: 'green', type:"SUCCESS"},
        { id: 2, color: 'red', type:"FAILED"},
        { id: 3, color: 'grey', type:"PROCESSING" }
      ]);
    const [expandedId, setExpandedId] = useState(null);
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
    const handleExpand = (id) => {
        setExpandedId((prevId) => (prevId === id ? null : id));
    };
    const handleRefreshTiles = (rangeDesc) => {
        const filteredTimeRange = timeRanges.filter(range => range.desc === rangeDesc);
        handleRangeClick(filteredTimeRange[0])
        setRefreshMessages(!refreshMessages)
        setRefreshtime1(moment().format("LLL"))
    }
    const handleRefreshQueues = () => {
        setRefreshQueues(!refreshQueues)
        setRefreshtime2(moment().format("LLL"))
    }
    const handleRangeClick = (range) => {
        setGraphLoaded(true)
        let now = moment();
        const dateSelectedSplitted = range.id.split(':')
        let endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
        let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
        
        let startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
        setActiveRange(range.desc); // Update the active state when a button is clicked
        getGraphAllData(startDate,endDate,range.desc).then((res)=>{
            let gData = []
            if(res.data.obj.length > 0){
                const localTimezone = moment.tz.guess();
                
                for(const e of res.data.obj){
                    const utcDate = moment.utc(e.time_interval_utc);
                    let intervalFormat = 'HH:mm'
                    if(range.id !== "1:hours")
                        intervalFormat = 'MMM DD, HH:mm'
                    const convertedLocalTime = utcDate.tz(localTimezone).format(intervalFormat);
                    gData.push({name:convertedLocalTime, SUCCESS:parseInt(e.SUCCESS), FAILED:parseInt(e.FAILED), PROCESSED:parseInt(e.PROCESSED)})
                }
                
            }else{
                gData.push({name:moment(), SUCCESS:0, FAILED:0, PROCESSED:0})
            }
            setGraphData(gData)
            setGraphLoaded(false)
        })
    };
    useEffect(() => {
        let now = moment();
        const endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
        let past = now.subtract("1", "hours");
        const startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
        getGraphAllData(startDate,endDate,"1 hour").then((res)=>{
            let gData = []
            if(res.data.obj.length > 0){
                const localTimezone = moment.tz.guess();
                
                for(const e of res.data.obj){
                    const utcDate = moment.utc(e.time_interval_utc);
                    const convertedLocalTime = utcDate.tz(localTimezone).format('HH:mm');
                    gData.push({name:convertedLocalTime, SUCCESS:parseInt(e.SUCCESS), FAILED:parseInt(e.FAILED), PROCESSED:parseInt(e.PROCESSED)})
                }
                
            }else{
                gData.push({name:moment(), SUCCESS:0, FAILED:0, PROCESSED:0})
            }
            setGraphData(gData)
            setGraphLoaded(false)
        })
    }, []);
       
    const handleRefreshForMessages = (newValue) => {
        setMessagesLoaded(newValue);
    };
    const handleRefreshForQueues = (newValue) => {
        setQueuesLoaded(newValue)
    };
    const handleTileClick = (id) => {
        tileClicked(id)
        // Add logic for when the tile is clicked
    };
    return (
        <FlexBox direction="Column" alignItems="Stretch" justifyContent="Stretch" fitContainer="true" style={{gap:"10px"}}>
            <Panel className='monitoring-panel'
                accessibleRole="Form"
                headerLevel="H2"
                headerText="Messages"
                header={<FlexBox alignItems="Center" justifyContent="SpaceBetween" fitContainer ><Title level="H2">Messages</Title><FlexBox alignItems="Center" justifyContent="SpaceBetween" ><Label showColon="true" style={{fontSize:"12px"}}>Last Refresh</Label><Text style={{fontSize:"12px"}}>{refreshTime1}</Text><Button  design="Transparent" onClick={(e) => handleRefreshTiles(activeRange)} icon="refresh"/></FlexBox></FlexBox>}
                onToggle={function _a(){}}>
                    <motion.div style={{width:"100%", display:"flex", flexDirection:"column"}}
                        variants={wrapperVariants}
                        initial="visible"
                        animate={!messagesLoaded ? 'visible' : 'hidden'}
                        exit="exit">
                            <LayoutGroup >
                                <GridContainer>
                                    {items.map((item) => (
                                        // <div onClick={() => handleTileClick(item.type)}>
                                        <MonitoringTile
                                            key={item.id}
                                            item={item}
                                            onDetails={() => handleTileClick(item.type)}
                                            handleRefresh={handleRefreshForMessages}
                                            refresh={refreshMessages}
                                            isExpanded={expandedId === item.id}
                                            onExpand={handleExpand}/>
                                        // </div>
                                    ))}
                                </GridContainer>
                            </LayoutGroup >
                            <LineChart loading={graphLoaded} loadingDelay={2000} style={{height:"300px",width:"100%"}} dataset={graphData} 
                                dimensions={[{accessor: 'name'}]} 
                                axisOptions={{
                                    yAxis: {
                                    min: 0,  // Minimum value
                                    max: 30000 // Maximum value
                                    }
                                }}
                                measures={[
                                    {accessor: 'SUCCESS',label: 'SUCCESS', color:"green"},
                                    {accessor: 'FAILED',label: 'FAILED', color:"red"},
                                    {accessor: 'PROCESSING',label: 'PROCESSING', color:"orange"}]}
                                onClick={function Sa(){}}
                                onDataPointClick={function Sa(){}}
                                onLegendClick={function Sa(){}}
                            />
                            <div className="time-range-container">
                                <div className="time-range-selector">
                                    {timeRanges.map((range) => (
                                        <button key={range.desc} className={range.desc === activeRange ? 'active' : ''} onClick={() => handleRangeClick(range)}>
                                            {range.desc}
                                        </button>
                                    ))}
                                </div>
                            </div>
                    </motion.div>
            </Panel>
            <Panel className='monitoring-panel'
                accessibleRole="Form"
                headerLevel="H2"
                headerText="Queues"
                header={<FlexBox alignItems="Center" justifyContent="SpaceBetween" fitContainer ><Title level="H2">Queues</Title><FlexBox alignItems="Center" justifyContent="SpaceBetween" ><Label showColon="true" style={{fontSize:"12px"}}>Last Refresh</Label><Text style={{fontSize:"12px"}}>{refreshTime2}</Text><Button  design="Transparent" onClick={(e) =>handleRefreshQueues()}icon="refresh"/></FlexBox></FlexBox>}
                onToggle={function _a(){}}>
                    <motion.div style={{width:"100%"}}
                        variants={wrapperVariants}
                        initial="visible"
                        animate={queuesLoaded ? 'visible' : 'hidden'}
                        exit="exit">
                            <GridContainer>
                                <JMSTile name="Broker1" refresh={refreshQueues} handleRefresh={handleRefreshForQueues}></JMSTile>
                            </GridContainer>
                    </motion.div>
            </Panel>
        </FlexBox>
    );
}