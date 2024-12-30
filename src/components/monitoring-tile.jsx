import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {getCountByStatus} from '../services/s-messages'
import moment from 'moment';
import {BusyIndicator} from '@ui5/webcomponents-react';
import MonitoringTileGraph from './monitoring-tile-graph'
import React, { useState,useEffect,useRef } from 'react';
import { useNotifications } from '../helpers/notification-context';
function MonitoringTile({ item, refresh, isExpanded, onExpand, handleRefresh,onDetails }) {
  const gridColumn = isExpanded ? 'span 6' : 'span 1';
  const gridRow = isExpanded ? 'span 3' : 'span 1';
  
  const style = {
    color:  item.color
  }
  
  let [messageCount,setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { notifications, addNotification } = useNotifications();
  useEffect(() => {
    setLoading(true)
    handleRefresh(true);
    let now = moment();
    const endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
    let past = now.subtract("1", "hours");
    const startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
    getCountByStatus(startDate,endDate,item.type).then((res)=>{
      setMessageCount(res.data.obj[0].totalcount)
      handleRefresh(false);
      setLoading(false)
    })
  }, [refresh])
  //Testing1
  const handleRangeClick = (range) => {
    setLoading(true)
    handleRefresh(true);
    const dateSelectedSplitted = range.id.split(":")
    let now = moment();
    let endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
    let past = now.subtract(dateSelectedSplitted[0], dateSelectedSplitted[1]);
    let startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
    getCountByStatus(startDate,endDate,item.type).then((res)=>{
      setMessageCount(res.data.obj[0].totalcount)
      handleRefresh(false);
      setLoading(false)
    })
  }
  return (
    <div
      className="grid-item"
      data-is-expanded={isExpanded}
      style={{
        gridColumnEnd: gridColumn,
        gridRowEnd: gridRow,
      }}>
      <div className="monitoring-tile">
        <div className='tile-text' style={style}>
          <span className='tile-text-text'>{item.type}</span><FontAwesomeIcon style={{fontSize:"12px", cursor:"hand", marginLeft:"5px", color:"grey"}} icon={['fas', 'fa-chart-pie']} onClick={(e) => {
            e.stopPropagation();
            onExpand(item.id);
          }}/>
          <FontAwesomeIcon style={{fontSize:"12px", cursor:"hand", marginLeft:"5px", color:"grey"}} icon={['fas', 'fa-circle-info']} onClick={(e) => {
            e.stopPropagation();
            onDetails(item.id);
          }}/>
        </div>
        <div className='tile-number'>
          <span className='tile-number-text'><BusyIndicator active={loading} style={{marginRight:"5px"}} delay={1000} size="S">{messageCount}</BusyIndicator></span>
          <span className='tile-number-uom'>count</span>
        </div>
        {isExpanded && (
          <div style={{flex:"1", width:"100%"}}>
            <MonitoringTileGraph style={{flex:"1", width:"100%"}} item={item} isExpanded={isExpanded} handleRangeChange={handleRangeClick}></MonitoringTileGraph>
          </div>
        )}
      </div>
    </div>
  );
}

export default MonitoringTile;
