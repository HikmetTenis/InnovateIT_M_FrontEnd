import "@ui5/webcomponents-icons/dist/AllIcons.js";
import {getJMSStats} from '../services/s-monitoring'
import {BusyIndicator,FlexBox} from '@ui5/webcomponents-react';
import React, { useState,useEffect,useRef } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import MonitoringJMSGraph from './monitoring-jms-graph'
import { useNotifications } from '../helpers/notification-context';
function JMSTile({ name, refresh, handleRefresh}) {
    const [loading, setLoading] = useState(true);
    const [queueCount,setQueueCount] = useState(0);
    const [isExpanded,setIsExpanded] = useState(false);
    const [textColor1,setTextColor1] = useState({color:"green"});
    const [textColor2,setTextColor2] = useState({color:"green"});
    const [textColor3,setTextColor3] = useState({color:"green"});
    const [textColor4,setTextColor4] = useState({color:"green"});
    const [textColor5,setTextColor5] = useState({color:"green"});
    const [textColor6,setTextColor6] = useState({color:"green"});
    const [jmsProperties,setJmsProperties] = useState({});
    const gridColumn = isExpanded ? 'span 6' : 'span 1';
    const gridRow = isExpanded ? 'span 3' : 'span 1';
    const [showDetails,setShowDetails] = useState("T");
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
      const getJMS = async () => {
        setLoading(true)
      handleRefresh(true)
      try{
        const data = await getJMSStats(name)
        const result = data.data.obj.d
        setQueueCount(result.QueueNumber)
        setJmsProperties({
          capaticy: result.Capacity,
          isTransactedSessionsHigh:result.IsTransactedSessionsHigh,
          isConsumersHigh: result.IsConsumersHigh,
          isProducersHigh: result.IsProducersHigh,
          maxQueueNumber: result.MaxQueueNumber,
          capacityWarning: result.CapacityWarning,
          capacityError: result.CapacityError,
          isQueuesHigh: result.IsQueuesHigh,
          isMessageSpoolHigh: result.IsMessageSpoolHigh
        })
        if(result.IsConsumersHigh > 0){
          setTextColor1({color:"red"})
        }
        if(result.IsTransactedSessionsHigh > 0){
          setTextColor1({color:"red"})
        }
        if(result.IsProducersHigh > 0){
          setTextColor3({color:"red"})
        }
        if(result.CapacityWarning > 0){
          setTextColor4({color:"orange"})
        }
        if(result.CapacityError > 0){
          setTextColor4({color:"red"})
        }
        if(result.IsQueuesHigh > 0){
          setTextColor5({color:"red"})
        }
        if(result.IsMessageSpoolHigh > 0){
          setTextColor6({color:"red"})
        }
        setLoading(false)
        handleRefresh(false)
      }catch(err){
        setLoading(false)
        console.log(err)
      }
    }
    getJMS()
      
    }, [refresh])
    const handleExpand = (id) => {
        setIsExpanded(!isExpanded);
        setShowDetails(!showDetails)
    };
    return (
      <motion.div
        className="grid-item"
        layout
        initial={false}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        data-is-expanded={isExpanded}
        style={{
          gridColumnEnd: gridColumn,
          gridRowEnd: gridRow,
        }}
        onClick={() => handleExpand(name)}>
        <div className="monitoring-tile">
          <div className='tile-text'>
            <span className='tile-text-text'>{name}</span><FontAwesomeIcon style={{fontSize:"12px", cursor:"hand", marginLeft:"5px", color:"grey"}} icon={['fas', 'fa-circle-info']} onClick={(e) => {
              e.stopPropagation();
              handleExpand(name);
            }}/>
          </div>
            <motion.div style={{width:'100%'}}
                            variants={wrapperVariants}
                            initial="visible"
                            className='tile-number'
                            animate={showDetails? 'visible' : 'hidden'}
                            exit="exit">
                <span className='tile-number-text'><BusyIndicator active={loading} style={{marginRight:"5px"}} delay={1000} size="S">{queueCount}</BusyIndicator></span>
                <span className='tile-number-uom'>count</span>
            </motion.div>
            <motion.div style={{width:'100%', height:"300px"}}
                            variants={wrapperVariants}
                            initial="visible"
                            //className='tile-number'
                            animate={!showDetails? 'visible' : 'hidden'}
                            exit="exit">
              <FlexBox flexDirection="Row" alignItems="Start" justifyContent="Start" fitContainer >
                <div className="jms-grid-container">
                  <div style={{justifyContent:"Center"}}>
                    <div class="jms-property-value">Properties</div>
                  </div>
                  <div>
                    <div class="jms-property-key">Capacity</div>
                    <div class="jms-property-value">{jmsProperties.capaticy}</div>
                  </div>
                  <div>
                    <div class="jms-property-key">Max Queue Number</div>
                    <div class="jms-property-value">{jmsProperties.maxQueueNumber}</div>
                  </div>
                  <div>
                    <div class="jms-property-key">Consumer Status</div>
                    <div class="jms-property-value" style={textColor1}>{jmsProperties.isConsumersHigh === 0? "OK":"High"}</div>
                  </div>
                  <div>
                    <div class="jms-property-key">Producer Status</div>
                    <div class="jms-property-value" style={textColor3}>{jmsProperties.isProducersHigh === 0? "OK":"High"}</div>
                  </div>
                  <div>
                    <div class="jms-property-key">Transacted Sessions Status</div>
                    <div class="jms-property-value" style={textColor2}>{jmsProperties.isTransactedSessionsHigh === 0? "OK":"High"}</div>
                  </div>
                  <div>
                    <div class="jms-property-key">Capacity Status</div>
                    <div class="jms-property-value" style={textColor4}>{jmsProperties.capacityWarning === "0"? jmsProperties.capacityError === "0"?"OK":"High":"Warning"}</div>
                  </div>
                  <div>
                    <div class="jms-property-key">Queues Status</div>
                    <div class="jms-property-value" style={textColor5}>{jmsProperties.isQueuesHigh === 0?"OK": "High"}</div>
                  </div>
                  <div>
                    <div class="jms-property-key">Message Spool Status</div>
                    <div class="jms-property-value" style={textColor6}>{jmsProperties.isMessageSpoolHigh === 0?"OK": "High"}</div>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{flex:"1", width:"100%"}}>
                    <MonitoringJMSGraph style={{flex:"1", width:"100%"}} refresh={refresh} isExpanded={isExpanded}></MonitoringJMSGraph>
                  </div>
                )}
              </FlexBox>
            </motion.div>
        </div>
      </motion.div>
    );
}
export default JMSTile;