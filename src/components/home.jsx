import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Button, Panel,FlexBox,Title,Text,Label} from '@ui5/webcomponents-react';
import {LineChart}  from '@ui5/webcomponents-react-charts';
import MonitoringTile from './monitoring-tile';
import GridContainer from './monitoring-tile-container';
import JMSTile from "./monitoring-jms-stats";
import React, { useState,useEffect } from 'react';
import { LayoutGroup  } from 'framer-motion';
import moment from 'moment'; 
import {getGraphAllData} from '../services/s-monitoring'
import momentTZ from 'moment-timezone';
export default function MonitoringPageHeader() {
    const [isRefreshed, setIsRefreshed] = useState(false);
    const [refreshQueues, setRefreshQueues] = useState(false);
    const [refreshTime1, setRefreshtime1] = useState(moment().format("LLL"));
    const [refreshTime2, setRefreshtime2] = useState(moment().format("LLL"));
    const [messagesLoaded, setMessagesLoaded] = useState(true);
    const [graphData, setGraphData] = useState(true);
    const timeRanges = [{id:'1:hours',desc:'1 hour'},{id:'6:hours',desc:'6 hours'},{id:'12:hours',desc:'12 hours'},{id:'1:days',desc:'1 day'},{id:'7:days',desc:'7 days'},{id:'30:days',desc:'30 days'}];
    const [activeRange, setActiveRange] = useState('1 hour');
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
    const handleRefreshTiles = (rangeDesc) => {
        const filteredTimeRange = timeRanges.filter(range => range.desc === rangeDesc);
        handleRangeClick(filteredTimeRange[0])
        setIsRefreshed(!isRefreshed)
        setRefreshtime1(moment().format("LLL"))
    }
    const handleRefreshQueues = () => {
        setRefreshQueues(!refreshQueues)
        setRefreshtime2(moment().format("LLL"))
    }
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
                header={<FlexBox alignItems="Center" justifyContent="SpaceBetween" fitContainer ><Title level="H2">Messages</Title><FlexBox alignItems="Center" justifyContent="SpaceBetween" ><Label showColon="true" style={{fontSize:"12px"}}>Last Refresh</Label><Text style={{fontSize:"12px"}}>{refreshTime1}</Text><Button  design="Transparent" onClick={(e) => handleRefreshTiles(activeRange)} icon="refresh"/></FlexBox></FlexBox>}
                onToggle={function _a(){}}>
                    <LayoutGroup >
                        <GridContainer>
                            {items.map((item) => (
                                <MonitoringTile
                                    key={item.id}
                                    item={item}
                                    refresh={isRefreshed}
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
                header={<FlexBox alignItems="Center" justifyContent="SpaceBetween" fitContainer ><Title level="H2">Queues</Title><FlexBox alignItems="Center" justifyContent="SpaceBetween" ><Label showColon="true" style={{fontSize:"12px"}}>Last Refresh</Label><Text style={{fontSize:"12px"}}>{refreshTime2}</Text><Button  design="Transparent" onClick={(e) =>handleRefreshQueues()}icon="refresh"/></FlexBox></FlexBox>}
                onToggle={function _a(){}}>
                    <GridContainer>
                        <JMSTile name="Broker1" refresh={refreshQueues}></JMSTile>
                    </GridContainer>
            </Panel>
        </FlexBox>
    );
}