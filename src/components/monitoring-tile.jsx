import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {getCountByStatus} from '../services/s-messages'
import moment from 'moment';
import {BusyIndicator} from '@ui5/webcomponents-react';
import MonitoringTileGraph from './monitoring-tile-graph'
import React, { useState,useEffect,useRef } from 'react';
function MonitoringTile({ item, refresh, isExpanded, onExpand }) {
  const gridColumn = isExpanded ? 'span 6' : 'span 1';
  const gridRow = isExpanded ? 'span 3' : 'span 1';
  
  const style = {
    color:  item.color
  }
  
  let [messageCount,setMessageCount] = useState(0);
  const [messagesLoaded, setMessagesLoaded] = useState(true);

  useEffect(() => {
    setMessagesLoaded(true)
    let now = moment();
    const endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
    let past = now.subtract("1", "hours");
    const startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
    getCountByStatus(startDate,endDate,item.type).then((res)=>{
      setMessageCount(res.data.obj[0].totalcount)
      setMessagesLoaded(false)
    })
  }, [refresh])
  const handleRangeClick = (range) => {
    setMessagesLoaded(true)
    const dateSelectedSplitted = range.id.split(":")
    let now = moment();
    let endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
    let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
    let startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
    getCountByStatus(startDate,endDate,item.type).then((res)=>{
      setMessageCount(res.data.obj[0].totalcount)
      setMessagesLoaded(false)
    })
  }
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
      onClick={() => onExpand(item.id)}>
      <div className="monitoring-tile" onClick={() => onExpand(item.id)}>
        <div className='tile-text' style={style}>
          <span className='tile-text-text'>{item.type}</span><FontAwesomeIcon style={{fontSize:"12px", cursor:"hand", marginLeft:"5px", color:"grey"}} icon={['fas', 'fa-chart-pie']} onClick={(e) => {
            e.stopPropagation();
            onExpand(item.id);
          }}/>
        </div>
        <div className='tile-number'>
          <span className='tile-number-text'><BusyIndicator active={messagesLoaded} style={{marginRight:"5px"}} delay={1000} size="S">{messageCount}</BusyIndicator></span>
          <span className='tile-number-uom'>count</span>
        </div>
        {isExpanded && (
          <div style={{flex:"1", width:"100%"}}>
            <MonitoringTileGraph style={{flex:"1", width:"100%"}} item={item} isExpanded={isExpanded} handleRangeChange={handleRangeClick}></MonitoringTileGraph>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MonitoringTile;
