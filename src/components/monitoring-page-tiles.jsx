import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Button, Panel} from '@ui5/webcomponents-react';
import MonitoringTile from './monitoring-tile';
import MonitoringPageDetails from "./monitoring-tile-details";
import React, { useState } from 'react';
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
export default function MonitoringPageHeader() {
    const [details, setDetails] = useState(false);
    const showDetails = (d) => {
        setDetails(d);
    };
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
    const controls = useAnimationControls();

    return (

        <AnimatePresence>
            <motion.div style={{flex:"1 1 auto"}}
                variants={wrapperVariants}
                initial="visible"
                animate={!details ? 'visible' : 'hidden'}
                exit="exit">
                    <Panel className='monitoring-panel'
                        accessibleRole="Form"
                        headerLevel="H2"
                        headerText="Messages"
                        onToggle={function _a(){}}>
                            <div className="monitoring-panel-content" >
                                <MonitoringTile type="SUCCESS" textColor="green" onClick={() => showDetails(!details)}></MonitoringTile>
                                <MonitoringTile type="ERROR" textColor="red"  onClick={() => showDetails(!details)}></MonitoringTile>
                            </div>
                    </Panel>
            </motion.div>
            <motion.div style={{flex:"1 1 auto",width:"100%", height:"100%"}}
                variants={wrapperVariants}
                initial="hidden"
                animate={details ? 'visible' : 'hidden'}
                exit="exit">
                    <MonitoringPageDetails  style={{width:"100%", height:"100%"}} className="monitoring-details" onClick={() => showDetails(!details)}/>
            </motion.div>
        </AnimatePresence>

    );
}