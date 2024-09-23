import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Button, Panel,FlexBox} from '@ui5/webcomponents-react';
import {LineChart}  from '@ui5/webcomponents-react-charts';
import MonitoringTile from './monitoring-tile';
import GridContainer from './monitoring-tile-container';
import JMSTile from "./monitoring-jms-stats";
import { Container, Row, Col } from 'react-bootstrap';
import React, { useState,useEffect } from 'react';
import { LayoutGroup  } from 'framer-motion';
import { motion} from "framer-motion";
import moment from 'moment'; 
import {getGraphAllData} from '../services/s-monitoring'
import momentTZ from 'moment-timezone';
export default function MonitoringPageHeader() {
    const [loading, setLoading] = useState(false);
    const [messagesLoaded, setMessagesLoaded] = useState(true);
    const [graphData, setGraphData] = useState(true);
    const timeRanges = [{id:'1:hours',desc:'1 hour'},{id:'6:hours',desc:'6 hours'},{id:'12:hours',desc:'12 hours'},{id:'1:days',desc:'1 day'},{id:'7:days',desc:'7 days'},{id:'30:days',desc:'30 days'}];
    const [activeRange, setActiveRange] = useState('1 hour');
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
    const [items] = useState([
        { id: 1, color: 'green', type:"SUCCESS"},
        { id: 2, color: 'red', type:"FAILED"},
        { id: 3, color: 'grey', type:"PROCESSING" },
        { id: 4, color: 'orange', type:"REPROCESSED" },
      ]);
    
    const [expandedId, setExpandedId] = useState(null);

    const handleExpand = (id) => {
        setExpandedId((prevId) => (prevId === id ? null : id));
    };
    const handleRangeClick = (range) => {
        setMessagesLoaded(true)
        let now = moment();
        const dateSelectedSplitted = range.id.split(':')
        let endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
        let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
        
        let startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
        setActiveRange(range.desc); // Update the active state when a button is clicked
        getGraphAllData(startDate,endDate,range.desc).then((res)=>{
            if(res.data.obj.length > 0){
                const localTimezone = moment.tz.guess();
                let gData = []
                for(const e of res.data.obj){
                    const utcDate = moment.utc(e.time_interval_utc);
                    let intervalFormat = 'HH:mm'
                    if(range.id !== "1:hours")
                        intervalFormat = 'MMM DD, HH:mm'
                    const convertedLocalTime = utcDate.tz(localTimezone).format(intervalFormat);
                    gData.push({name:convertedLocalTime, SUCCESS:parseInt(e.SUCCESS), FAILED:parseInt(e.FAILED), PROCESSED:parseInt(e.PROCESSED)})
                }
                setGraphData(gData)
            }
            setMessagesLoaded(false)
        })
      };
    useEffect(() => {
        let now = moment();
        const endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
        let past = now.subtract("1", "hours");
        const startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
        getGraphAllData(startDate,endDate,"1 hour").then((res)=>{
            if(res.data.obj.length > 0){
                const localTimezone = moment.tz.guess();
                let gData = []
                for(const e of res.data.obj){
                    const utcDate = moment.utc(e.time_interval_utc);
                    const convertedLocalTime = utcDate.tz(localTimezone).format('HH:mm');
                    gData.push({name:convertedLocalTime, SUCCESS:parseInt(e.SUCCESS), FAILED:parseInt(e.FAILED), PROCESSED:parseInt(e.PROCESSED)})
                }
                setGraphData(gData)
            }
            setMessagesLoaded(false)
        })
      }, [])
    return (
        <FlexBox direction="Column" alignItems="Stretch" justifyContent="Stretch" fitContainer="true" style={{gap:"10px"}}>
            <Panel className='monitoring-panel'
                accessibleRole="Form"
                headerLevel="H2"
                headerText="Messages"
                onToggle={function _a(){}}>
                    <LayoutGroup >
                        <GridContainer>
                            {items.map((item) => (
                                <MonitoringTile
                                    key={item.id}
                                    item={item}
                                    isExpanded={expandedId === item.id}
                                    onExpand={handleExpand}/>
                            ))}
                        </GridContainer>
                    </LayoutGroup >
                    <LineChart loading={messagesLoaded} loadingDelay={2000} style={{height:"300px",width:"100%"}} dataset={graphData} 
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
                            {accessor: 'PROCESSED',label: 'PROCESSED', color:"orange"}]}
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
            </Panel>
            <Panel className='monitoring-panel'
                accessibleRole="Form"
                headerLevel="H2"
                headerText="Queues"
                onToggle={function _a(){}}>
                    <JMSTile></JMSTile>
            </Panel>
        </FlexBox>
    );
}