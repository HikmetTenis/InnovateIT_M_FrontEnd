import { motion } from 'framer-motion';
import {LineChart,}  from '@ui5/webcomponents-react-charts';
import { IllustratedMessage,FlexBox} from '@ui5/webcomponents-react';
import React, { useState,useEffect,useRef } from 'react';
import moment from 'moment'; 
import {getJMSGraphData} from '../services/s-monitoring'
import momentTZ from 'moment-timezone';
import "@ui5/webcomponents-fiori/dist/illustrations/NoFilterResults.js"
function MonitoringJMSGraph({ refresh,isExpanded}) {
  const boxVariants = {
    hidden: {
      width: "100%",
      height: "290px",
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

  const handleRangeClick = (range,e) => {
    e.stopPropagation();
    setMessagesLoaded(true)
    let now = moment();
    const dateSelectedSplitted = range.id.split(':')
    let endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
    let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
    
    let startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
    setActiveRange(range.desc); // Update the active state when a button is clicked
    getJMSGraphData(startDate,endDate,range.desc).then((res)=>{
      let gData = []
      if(res.data.obj.length > 0){
        const localTimezone = moment.tz.guess();
        
        //2024-09-21T01:46:31.000Z
        for(const e of res.data.obj){
            const utcDate = moment.utc(e.createdAt);
            let intervalFormat = 'HH:mm'
            if(range.id !== "1:hours")
                intervalFormat = 'MMM DD, HH:mm'
            const convertedLocalTime = utcDate.tz(localTimezone).format(intervalFormat);
            gData.push({name:convertedLocalTime, capacity:parseInt(e.stat)})
        }
        setGraphData(gData)
      }else{
        gData.push({name:moment(), capacity:0})
      }
      setGraphData(gData)
      setMessagesLoaded(false)
    })
  };
  useEffect(() => {
    let now = moment();
    const filteredTimeRange = timeRanges.filter(range => range.desc === activeRange);
    const dateSelectedSplitted = filteredTimeRange[0].id.split(':')
    let endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
    let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
    
    let startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
    getJMSGraphData(startDate,endDate,activeRange).then((res)=>{
      let gData = []
      if(res.data.obj.length > 0){ 
        const localTimezone = moment.tz.guess();
        //2024-09-21T01:46:31.000Z
        for(const e of res.data.obj){
            const utcDate = moment.utc(e.createdAt);
            let intervalFormat = 'HH:mm'
            if(filteredTimeRange[0].id !== "1:hours")
                intervalFormat = 'MMM DD, HH:mm'
            const convertedLocalTime = utcDate.tz(localTimezone).format(intervalFormat);
            gData.push({name:convertedLocalTime, capacity:parseInt(e.stat)})
        }
        
      }else{
        gData.push({name:moment(), capacity:0})
      }
      setGraphData(gData)
      setMessagesLoaded(false)
    })
  }, [refresh])
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
      
    >{graphData.length === 0 ?
      <FlexBox direction="Column" alignItems="Center" justifyContent="Start" fitContainer="true">
        <IllustratedMessage
          name="NoFilterResults"
          subtitleText="Crickets.."
        />
        <div className="time-range-container">
            <div className="time-range-selector">
                {timeRanges.map((range) => (
                    <button
                        key={range.desc}
                        className={range.desc === activeRange ? 'active' : ''}
                        onClick={(e) => handleRangeClick(range,e)}
                >
                {range.desc}
                </button>
            ))}
            </div>
          </div>
        </FlexBox>
      :
      <FlexBox direction="Column" alignItems="Center" justifyContent="Start" fitContainer="true">
        <LineChart loading={messagesLoaded} style={{height:"90%"}}
          dataset={graphData}
          dimensions={[
            {
              accessor: 'name'
            }
          ]}
          measures={[
            {
              accessor: 'capacity',
              label: 'Capacity',
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
                      onClick={(e) => handleRangeClick(range,e)}
              >
              {range.desc}
              </button>
          ))}
          </div>
        </div>
      </FlexBox>
    }
    </motion.div>
  );
}

export default MonitoringJMSGraph;
