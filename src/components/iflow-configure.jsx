import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Toolbar,Switch, Label, BusyIndicator, FlexBox} from '@ui5/webcomponents-react';
import React, { useEffect, useState,useRef } from 'react';
import {getArtifactDetails,modifyArtifact} from '../services/s-monitoring-configure'
import BpmnModeler from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import CustomModelingModule, { CustomCommandStackModule } from '../helpers/custom-modeling'
import { getMid } from 'diagram-js/lib/layout/LayoutUtil.js';
import { motion} from "framer-motion"
//import BpmnModeler from 'bpmn-js/lib/Modeler';
export default function IflowConfigure(props) {
    const [loading, setLoading] = useState(false);
    const [everyEvent, setEveryEvent] = useState(false);
    const [everyReceiverSender, setEveryReceiverSender] = useState(false);
    const [diagramXML, setDiagramXML] = useState(null);
    const [modeler, setModeler] = useState(null);
    const setEveryEventSwitch  = (value) => {
        setEveryEvent(value.target.checked)
        setLoading(true)
        const data ={
            xmlString:diagramXML,
            everyEvent: value.target.checked,
            everyReceiverSender: everyReceiverSender,
            steps:props.steplist.steps
        }
        modifyArtifact(data).then((res)=>{
            const resp = res.data.obj
            setDiagramXML(resp.xmlString)
            //drawDiagram(res.data.obj)
            setupOverlays(resp.steps)


        })
    }
    
    const setEveryReceiverSenderSwitch  = (value) => {
        setEveryReceiverSender(value.target.checked)
        setLoading(true)
        const data ={
            xmlString:diagramXML,
            everyEvent: everyEvent,
            everyReceiverSender: value.target.checked,
            steps:props.steplist.steps
        }
        modifyArtifact(data).then((res)=>{
            const resp = res.data.obj
            setDiagramXML(resp.xmlString)
            //drawDiagram(resp.xmlString)
            setupOverlays(resp.steps)

            
            // var shapes = [ shape1, shape2 ];

            // var distributeElements = bpmnModeler.get('distributeElements'),
            //     alignElements = bpmnModeler.get('alignElements');
            
            // distributeElements.trigger(shapes, 'horizontal');
            
            // alignElements.trigger(shapes, 'middle');
                // // eventBus.on("element.click", function(event) {
                // //     alert(event.element.id + " was clicked");
                // // });

        })
    }
    const setupOverlays = (steps)=>{
        
        let overlays = modeler.get('overlays');
        steps.forEach(function(e) {
            if(overlays.get({ element: e.id }).length === 0){
                // let x = 0
                // let y = 0
                // if(e.type === "ExternalEvent"){
                //     x =
                // }
                overlays.add(e.id, {
                    id:e.id,
                    position: {
                        top: e.y,
                        left: e.x    
                    },
                    html: '<div style="color:white;background-color:green;height:20px;width:50px;border-radius:5px;padding:5px;opacity:0.5;display:flex;justify-content:center;align-items:center">'+e.name+'</div>'
                });
            }
        });
        props.steps({steps:steps, overlays:overlays})
        setLoading(false)
    }
    const drawDiagram  = (value) => {
        const container = containerRef.current;
        let modelerInstance = null
        if(modeler == null){
            modelerInstance = new BpmnModeler({
                container,
                keyboard: {
                  bindTo: window
                },
                // additionalModules: [
                //     CustomCommandStackModule,
                //     CustomModelingModule,
                // ]
              });
            // modelerInstance = new Modeler({
            //     container,
            //     keyboard: {
            //         bindTo: document
            //     }
            // });
            setModeler(modelerInstance)
        }else{
            modelerInstance = modeler
        }
        
        setTimeout(() => {
            
            modelerInstance.importXML(value).then(({ warnings }) => {
                if (warnings.length) {
                    console.warn(warnings);
                }
                setLoading(false)
                props.handler();
                props.artifactData(value)
                const canvas = modelerInstance.get("canvas")
                canvas.zoom('fit-viewport');
                // let modules = modelerInstance.getModules();
                let eventBus = modelerInstance.get("eventBus");
                // let modeling = modelerInstance.get("modeling");
                eventBus.on("element.click", function(event) {
                    alert(event.element.id + " was clicked");
                });
                

                // attach an overlay to a node
                
                // connections.forEach((connection) => {
                //     modeling.updateWaypoints(connection, [
                //         getMid(connection.source),
                //         getMid(connection.target)
                //     ]);

                //     modeling.layoutConnection(connection, {
                //         connectionStart: getMid(connection.source),
                //         connectionEnd: getMid(connection.target)
                //     });
                // });
                // const alignElements = modelerInstance.get('alignElements');
                // const distributeElements = modelerInstance.get('distributeElements');
                // distributeElements.trigger(shapes, 'vertical');

                // alignElements.trigger(shapes, 'middle');
                // eventBus.on('elements.changed', function(event) {

                //     var elements = event.elements;

                // });
                // const elementRegistry = modelerInstance.get('elementRegistry');
                // const elements = elementRegistry.getAll()
                // let shapes = []
                // elements.forEach(function(e) {
                //     const businessObject = e.businessObject
                //     if(businessObject.name && businessObject.name.indexOf("STEP") != -1){
                //         shapes.push(e)
                //     }
                // });
                // //var distributeElements = modelerInstance.get('distributeElements'),
                // const alignElements = modelerInstance.get('alignElements');

                // //distributeElements.trigger(shapes, 'horizontal');

                // alignElements.trigger(shapes, 'middle');
            });  
        }, 2000);
       
    }
    const containerRef = useRef(null);
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
        getArtifactDetails(props.iflow.Id,props.iflow.Version).then((res)=>{
            const data = res.data.obj
            setDiagramXML(data.xmlString)
            drawDiagram(data.xmlString)
            setEveryEvent(data.everyEvent)
            setEveryReceiverSender(data.everyReceiverSender)
            // setTimeout(() => {
            //     modelerInstance.importXML(res.data.obj).then(({ warnings }) => {
            //         if (warnings.length) {
            //             console.warn(warnings);
            //         }
            //         setLoading(false)
            //         props.handler();
            //         props.artifactData(res.data.obj)
                    
            //         const canvas = modelerInstance.get("canvas")
            //         canvas.zoom('fit-viewport');
            //         // var overlays = modelerInstance.get('overlays');
            //         // var eventBus = modelerInstance.get("eventBus");

            //         // eventBus.on("element.click", function(event) {
            //         //     alert(event.element.id + " was clicked");
            //         // });
            //     });  
            // }, 2000);
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
                        <Switch onChange={(d) => setEveryEventSwitch(d)} value={everyEvent}/>
                        <Label>Add every "Start Event" and "End Event"</Label>
                        <Switch onChange={(d) => setEveryReceiverSenderSwitch(d)} value={everyReceiverSender}/>
                        <Label>Add AFTER every "Receiver" and "Sender"</Label>
                        <Switch onChange={props.occurence} />
                        <Label>Enable occurence monitoring</Label>
                    </Toolbar>
                </motion.div>
                <div className="modeler-parent" style={{width:"100%", height:"100%"}}>
                    <div id="modeler-container" style={{width:"100%", height:"100%"}} ref={containerRef}></div>
                </div>
            </FlexBox>
        </BusyIndicator>
      );
}