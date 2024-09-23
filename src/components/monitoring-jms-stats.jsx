import "@ui5/webcomponents-icons/dist/AllIcons.js";
import {Text} from '@ui5/webcomponents-react';
import {getJMSStats} from '../services/s-monitoring'
import moment from 'moment'
import React, { useState,useEffect,useRef } from 'react';
const JMSTile = props => {
    useEffect(() => {
        let now = moment();
        const endDate = moment.utc(now).format("YYYY-MM-DD HH:mm:ss")
        let past = now.subtract("1", "hours");
        const startDate = moment.utc(past).format("YYYY-MM-DD HH:mm:ss")
        getJMSStats(startDate,endDate,props.type).then((res)=>{
          
    
        })
    }, [])
    return (
        <div className="monitoring-tile" onClick={props.onClick}>
          <div className='tile-header'>
            <Text className='tile-header-text'>Messages</Text>
          </div>
          <div className='tile-text' >
            <span className='tile-text-text'>1</span>
          </div>
          <div className='tile-number'>
            <span className='tile-number-text'>0</span>
            <span className='tile-number-uom'>count</span>
          </div>
      </div>
    );
}
export default JMSTile;