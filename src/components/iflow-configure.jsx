import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Toolbar,Switch, Label, BusyIndicator, FlexBox} from '@ui5/webcomponents-react';
import React, { useEffect, useState,useRef } from 'react';
import {getArtifactDetails} from '../services/s-monitoring-configure'
import Modeler from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"

export default function IflowConfigure(props) {
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);
    const [ modeler, setModeler ] = useState(null)
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
    useEffect(() => {
        setLoading(true)
        const container = containerRef.current;
        const modelerInstance = new Modeler({
            container,
            keyboard: {
                bindTo: document
            }
        });
        getArtifactDetails(props.iflow.Id,props.iflow.Version).then((res)=>{
            setTimeout(() => {
                modelerInstance.importXML(res.data.obj).then(({ warnings }) => {
                    if (warnings.length) {
                        console.warn(warnings);
                    }
                    setLoading(false)
                    const canvas = modelerInstance.get("canvas")
                    canvas.zoom('fit-viewport');
                    var overlays = modelerInstance.get('overlays');
                    var eventBus = modelerInstance.get("eventBus");

                    eventBus.on("element.click", function(event) {
                        alert(event.element.id + " was clicked");
                    });
                });  
            }, 2000);
        })
      }, [])
       
      return (
        <BusyIndicator active={loading} style={{width:"100%", height:"100%"}} size="Medium">
            <FlexBox direction="Column" alignItems="Stretch" fitContainer="true">
                <motion.div style={{flex:"1 1 auto", display:"flex", flexDirection:"column"}}
                            variants={wrapperVariants}
                            initial="visible"
                            animate={!loading ? 'visible' : 'hidden'}
                            exit="exit">
                    <Toolbar style={{marginBottom:"10px", flex:"1 1 auto"}} alignContent={{End: 'End', Start: 'Start'}}>
                        <Switch onChange={function _a(){}} />
                        <Label>Add every "Start Event" and "End Event"</Label>
                        <Switch onChange={function _a(){}} />
                        <Label>Add every "Receiver" and "Sender"</Label>
                    </Toolbar>
                </motion.div>
                <div className="modeler-parent" style={{width:"100%", height:"100%"}}>
                    <div id="modeler-container" style={{width:"100%", height:"100%"}} ref={containerRef}></div>
                </div>
            </FlexBox>
        </BusyIndicator>
      );
}