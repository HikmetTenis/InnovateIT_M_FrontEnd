import { motion } from 'framer-motion';
import {LineChart}  from '@ui5/webcomponents-react-charts';
import React, { useState,useEffect,useRef } from 'react';
import moment from 'moment'; 
import {getGraphData} from '../services/s-monitoring'
import momentTZ from 'moment-timezone';
function MonitoringTileGraph({ item, isExpanded, handleRangeChange}) {
  const boxVariants = {
    hidden: {
      width: "100%",
      height: "290px",
      opacity: 0.5,
    },
    visible: {
      width: "100%",
      height: "290px",
      opacity: 1,
      transition: {
        duration: 1,
        ease: 'easeInOut',
      },
    },
  };
  const [messagesLoaded, setMessagesLoaded] = useState(true);
  const [graphData, setGraphData] = useState(true);
  const [activeRange, setActiveRange] = useState('1 hour'); // Set initial active button

  const timeRanges = [{id:'1:hours',desc:'1 hour'},{id:'6:hours',desc:'6 hours'},{id:'12:hours',desc:'12 hours'},{id:'1:days',desc:'1 day'},{id:'7:days',desc:'7 days'},{id:'30:days',desc:'30 days'}];

  const handleRangeClick = (range) => {
    setMessagesLoaded(true)
    let now = moment();
    const dateSelectedSplitted = range.id.split(':')
    let endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
    let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
    
    let startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
    setActiveRange(range.desc); // Update the active state when a button is clicked
    getGraphData(startDate,endDate,item.type,range.desc).then((res)=>{
        if(res.data.obj.length > 0){
            const localTimezone = moment.tz.guess();
            let gData = []
            //2024-09-21T01:46:31.000Z
            for(const e of res.data.obj){
                const utcDate = moment.utc(e.time_interval_utc);
                let intervalFormat = 'HH:mm'
                if(range.id !== "1:hours")
                    intervalFormat = 'MMM DD, HH:mm'
                const convertedLocalTime = utcDate.tz(localTimezone).format(intervalFormat);
                gData.push({name:convertedLocalTime, messages:parseInt(e.total_message)})
            }
            setGraphData(gData)
        }
        setMessagesLoaded(false)
    })
    handleRangeChange(range)
  };
  useEffect(() => {
    let now = moment();
    const endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
    let past = now.subtract("1", "hours");
    const startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
    getGraphData(startDate,endDate,item.type,activeRange).then((res)=>{
        if(res.data.obj.length > 0){
            const localTimezone = moment.tz.guess();
            console.log(localTimezone)
            let gData = []
            //2024-09-21T01:46:31.000Z
            for(const e of res.data.obj){
                const utcDate = moment.utc(e.time_interval_utc);
                const convertedLocalTime = utcDate.tz(localTimezone).format('HH:mm');
                gData.push({name:convertedLocalTime, messages:parseInt(e.total_message)})
            }
            setGraphData(gData)
        }
        setMessagesLoaded(false)
    })
  }, [item])
  return (
    <motion.div 
      className="box"
      variants={boxVariants}
      initial="hidden"
      animate={isExpanded ? 'visible' : 'hidden'}
      style={{
        originX: 0,
        originY: 0,
        width:"90%"
      }}
      
    ><LineChart loading={messagesLoaded} loadingDelay={2000} style={{height:"90%"}}
    dataset={graphData}
    dimensions={[
      {
        accessor: 'name'
      }
    ]}
    measures={[
      {
        accessor: 'messages',
        label: 'Messages',
      }
    ]}
    onClick={function Sa(){}}
    onDataPointClick={function Sa(){}}
    onLegendClick={function Sa(){}}
  />
  <div className="time-range-container">
    <div className="time-range-selector">
        {timeRanges.map((range) => (
        <button
        key={range.desc}
        className={range.desc === activeRange ? 'active' : ''}
        onClick={() => handleRangeClick(range)}
        >
        {range.desc}
        </button>
    ))}
    </div>
    </div>
    </motion.div>
  );
}

export default MonitoringTileGraph;
