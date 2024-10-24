import React, { useEffect, useState, useContext, useRef, Component } from 'react';
import { motion} from "framer-motion";
import { FlexBox,BusyIndicator,Bar,Table,TableHeaderRow,ObjectPageTitle,Switch,TableRow,Popover,TableCell,Text, ObjectPageHeader, ActionSheet,TableHeaderCell,Label,Title,Button,ObjectPage,ObjectPageSection, ObjectPageSubSection, Icon,} from '@ui5/webcomponents-react';
import BpmnModeler from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import $ from 'jquery';
import moment from 'moment'
import {reprocess,getPayload} from '../services/s-monitoring'
import MessageContext from "../helpers/message-context";
export default function MonitoringTileDetailsConfigure(props) {
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
    const containerRef = useRef(null);
    const [modeler, setModeler] = useState(null);
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const everyEvent = useRef(false);
    const everyReceiverSenderBefore = useRef(false);
    const everyReceiverSenderAfter = useRef(false);
    const keepPayloadAsDefault = useRef(false);
    const popoverRef1 = useRef(null);
    const popoverRef = useRef(null);
    const [open1, setOpen1] = useState(false);
    const selectedOverlay = useRef(null);
    let updatedAt = useRef(null);
    let updatedBy = useRef(null);
    let packageID = useRef(null);
    let description = useRef(null);
    let iflowName = useRef(null);
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);  
    let popoverBody  = useRef(null);  
    const {message,setMessage} = useContext(MessageContext);
    let monID = useRef(null);
    let iflowID = useRef(null);

    const [dialogStepShowPayload, setDialogStepShowPayload] = useState(false);
    useEffect(() => {
        setLoading(true)
        const decoded = atob(props.messageData.diagramData);
        drawDiagram(decoded, props.messageData.steps)
        packageID.current = props.messageData.packageID
        description.current = props.messageData.description
        iflowName.current = props.messageData.artifactName
        everyEvent.current.checked = props.messageData.everyEvent
        everyReceiverSenderBefore.current.checked = props.messageData.everyReceiverSenderBefore
        everyReceiverSenderAfter.current.checked = props.messageData.everyReceiverSenderAfter
        keepPayloadAsDefault.current.checked = props.messageData.keepPayloadAsDefault
        monID.current = props.messageData.id
        iflowID.current = props.messageData.id
        let updatedDate = props.messageData.updatedAt
        if(updatedDate !== "N/A")
            updatedDate = moment( props.messageData.updatedAt).format('MMMM Do YYYY, h:mm:ss a')
        if(updatedAt.current !== null)
            updatedAt.current.innerHTML = updatedDate
        if(updatedBy.current !== null)
            updatedBy.current.innerHTML = props.messageData.updatedBy
        let stepData = []
        
        props.messageData.steps.forEach(function(e) {
            const status = e.stepStatus

            stepData.push(<TableRow key={`${e.id}`}>
            <TableCell >
                <span>{e.stepNumber}</span>
            </TableCell>
            <TableCell>
                <span>{e.name}</span>
            </TableCell>
            <TableCell>
                <span>{e.desc}</span>
            </TableCell>
            <TableCell>
                <span>{e.parentName}</span>
            </TableCell>
            <TableCell>
                <span>{status}</span>
            </TableCell>
            <TableCell>
                <Switch disabled checked={e.keepPayload} />
            </TableCell>
          </TableRow>)
        })
        setSteps(stepData)
    }, [props])
    const setupOverlays = (steps, modelerInstance)=>{
        let m = null
        if(modelerInstance){
            m = modelerInstance
        }else{
            m = modeler
        }
        let overlays = m.get('overlays');
        const elementRegistry = m.get('elementRegistry');
        const elements = elementRegistry.getAll()
        elements.forEach(function(e) {
            overlays.remove({ element: e.id })
        });
        let stepOverLays = []
        steps.forEach(function(e) {
            let color = 'grey'
            let txt = "NA"
            if(e.stepStatus === "SUCCESS"){
                color = 'green'
                txt = "OK"
            }
            if(e.stepStatus === "ERROR"){
                color = 'red'
                txt = "ERR"
            }
            if(e.stepType === "MANUAL")
                color = 'blue'
            const result = e.stepNumber.match(/STEP_(\d+)/);
            const stepN = result ? result[1] : null;
            let overlay
            if(e.keepPayload){
                overlay = $('<div class="main_'+e.id+'" task="'+e.id+'" stepID="'+e.stepID+'" keepPayload="'+e.keepPayload+'" id="task_'+stepN+'" sequences='+e.sequences+' step="'+e.stepNumber+'" name="'+e.name+'" desc="'+e.desc+'" color:white;cursor: pointer;background-color:'+color+';border:1px solid black;height:20px;width:20px;border-radius:20px;padding:5px;opacity:0.5;display:flex;justify-content:center;align-items:center">'+
                    '<div id="task_'+stepN+'" task="'+e.id+'" style="color:white;cursor: pointer;background-color:'+color+';border:1px solid black;height:40px;width:40px;border-radius:20px;padding:5px;opacity:0.7;display:flex;justify-content:center;align-items:center">'+stepN+
                        '<div id="task_'+stepN+'" task="'+e.id+'" style="position:absolute;font-size:10px;font-weight:600;top:-3px;right:-3px;background-color:transparent;color:black;padding:1px;-webkit-border-radius: 5px;-moz-border-radius: 5px;border-radius: 5px;width:5px;height:5px;text-align:center;">P</div>'+
                    '</div>'+
                '</div>')
            }else{
                overlay = $('<div class="main_'+stepN+'" task="'+e.id+'" stepID="'+e.stepID+'" keepPayload="'+e.keepPayload+'" id="task_'+stepN+'" sequences='+e.sequences+' step="'+e.stepNumber+'" name="'+e.name+'" desc="'+e.desc+'" color:white;cursor: pointer;background-color:'+color+';border:1px solid black;height:20px;width:20px;border-radius:20px;padding:5px;opacity:0.5;display:flex;justify-content:center;align-items:center">'+
                    '<div id="task_'+stepN+'" task="'+e.id+'" style="color:white;cursor: pointer;background-color:'+color+';border:1px solid black;height:40px;width:40px;border-radius:20px;padding:5px;opacity:0.7;display:flex;justify-content:center;align-items:center">'+stepN+
                    '</div>'+
                '</div>')
            }
            let multiplier = 1
            let yy = e.y
            if(e.loopIndex !== "null"){
                multiplier = parseInt(e.loopIndex) + 1
                yy = (e.y-12)*multiplier
            }
            overlays.add(e.id, {
                id:stepN,
                position: {
                    top: yy,
                    left: e.x    
                },
                html: overlay
            });
            stepOverLays.push(e)
            overlay.click(function(event) {
                if($('.main_'+event.target.getAttribute('task')).attr("keeppayload")){
                    let customActionSheets = document.querySelectorAll("[id*=custom_actionsheet1_]")
                    for (let el of customActionSheets) {
                        document.body.removeChild(el)
                    }
                    let container = document.createElement('div');
                    container.style.display = 'block';
                    container.style.position = 'absolute';
                    container.style.left = event.originalEvent.clientX+'px'
                    container.style.top = event.originalEvent.clientY+'px'
                    container.id = "custom_actionsheet1_"+event.target.getAttribute('task');
                    document.body.appendChild(container);

                    if (popoverRef1.current) {
                        selectedOverlay.current = event.target
                        popoverRef1.current.opener = container.id
                        setOpen1((prev) => !prev);
                    }
                    setDialogStepShowPayload(false)
                }else{
                    setDialogStepShowPayload(true)
                }
                
            }); 
            overlay.hover(function(event) {
                    const canvas = m.get('canvas');
                    let itemId = event.target.getAttribute('task');
                    canvas.addMarker(itemId, 'highlight');
                }, function(event) {
                    const canvas = m.get('canvas');
                    let itemId = event.target.getAttribute('task');
                    canvas.removeMarker(itemId, 'highlight');
                }
            );
        });
        setLoading(false)
    }
    const resend  = (value) => {
        const messageId = props.messageData.messageId
        const stepNumber = $(selectedOverlay.current.parentNode).attr("step")
        reprocess(stepNumber,messageId).then((res)=>{
            setMessage({open:false, toastMessage:"Message will be reprocessed.", result:null, callback:null, toast:true})
        })

    }
    function isJsonString(str) {
        try {
          JSON.parse(str);
          return true;
        } catch (e) {
          return false;
        }
      }
    function isXmlString(str) {
        // Create a new DOM parser
        const parser = new DOMParser();
        
        // Parse the string into an XML document
        const xmlDoc = parser.parseFromString(str, "application/xml");
        
        // Check for parsing errors
        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length > 0) {
            return false; // Invalid XML
        }
        
        return true; // Valid XML
    }
    const showPayload  = (e) => {
        const messageId = props.messageData.messageId
        const stepNumber = $(selectedOverlay.current.parentNode).attr("stepID")
        const id = "custom_actionsheet1_"+$(selectedOverlay.current.parentNode).attr('task');
        popoverRef.current.opener = id
         
        getPayload(stepNumber,messageId).then((res)=>{
        if(res.data.obj != null && res.status === 200){
            const binaryString = window.atob(res.data.obj);
            let formattedOutput = binaryString
            if(isJsonString(binaryString)){
            // Parse the JSON string into an object
            const jsonObject = JSON.parse(binaryString);

            // Format the JSON object into a readable string with indentation
            formattedOutput = JSON.stringify(jsonObject, null, 2);
            }else if(isXmlString(binaryString)){
            // Parse the XML string
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(binaryString, "application/xml");

            // Serialize the XML back into a string with formatting
            const serializer = new XMLSerializer();
            formattedOutput = serializer.serializeToString(xmlDoc);
            }
            popoverBody.current.innerText=formattedOutput
            setPopoverIsOpen(true) 
        }else{
            popoverBody.current.innerText="No PAYLOAD."
            setPopoverIsOpen(false)  
            setMessage({open:false, toastMessage:"This STEP doesnt have payload..", result:null, callback:null, toast:true})
        }
        })
                // const binaryString = window.atob(res.data.obj);

                // // Create a byte array from the binary string
                // const len = binaryString.length;
                // const bytes = new Uint8Array(len);
                // for (let i = 0; i < len; i++) {
                //     bytes[i] = binaryString.charCodeAt(i);
                // }

                // // Create a Blob from the byte array
                // const blob = new Blob([bytes], { type: 'application/octet-stream' });

                // // Create a link element and trigger the download
                // const url = window.URL.createObjectURL(blob);
                // const link = document.createElement('a');
                // link.href = url;
                // link.setAttribute('download', messageId+".txt"); // Set the file name for download
                // document.body.appendChild(link);
                // link.click();
                // link.parentNode.removeChild(link); // Clean up the link element
        //     }else{
        //         setMessage({open:false, toastMessage:"This STEP doesnt have payload..", result:null, callback:null, toast:true})
        //     }
        // })
    }
    const drawDiagram  = (value, steps) => {
        const container = containerRef.current;
        let modelerInstance = null
        if(modeler == null){
            modelerInstance = new BpmnModeler({
                container,
                keyboard: {
                bindTo: window
                },
            });
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
                const canvas = modelerInstance.get("canvas")
                canvas.zoom('fit-viewport');
                // let modules = modelerInstance.getModules();
                let eventBus = modelerInstance.get("eventBus");
                //let modeling = modelerInstance.get("modeling");
                eventBus.on("element.click", function(event) {
                    if(event.element.type && event.element.type === "bpmn:SequenceFlow"){
                        let customActionSheets = document.querySelectorAll("[id*=custom_actionsheet_]")
                        for (let el of customActionSheets) {
                            document.body.removeChild(el)
                        }
                        let container = document.createElement('div');
                        container.style.display = 'block';
                        container.style.position = 'absolute';
                        container.style.left = event.originalEvent.clientX+'px'
                        container.style.top = event.originalEvent.clientY+'px'
                        container.id = "custom_actionsheet_"+event.element.id
                        document.body.appendChild(container);
                    }
                });
                setupOverlays(steps, modelerInstance)
            });  
            
        }, 2000);
    
    }
    
    return (
        <FlexBox direction="row" alignItems="Stretch" fitContainer="true">
            
            <ActionSheet ref={popoverRef} open={open}>
                <Button onClick={() => resend()} icon="add">Resend</Button>
            </ActionSheet>
            <ActionSheet ref={popoverRef1} open={open1}>
                <Button onClick={(e) => showPayload(e)} icon="show" disabled={dialogStepShowPayload} >Show Payload</Button>
                {/* <Button onClick={(e) => resend(e)} icon="restart" disabled={dialogStepReprocessing} >Reprocess</Button> */}
            </ActionSheet>
            <Popover ref={popoverRef}
                className="footerPartNoPadding"
                header={<FlexBox direction="Row" alignItems="Center" style={{height:"40px"}} justifyContent="Center" fitContainer="true"><Text>Payload</Text></FlexBox>}
                horizontalAlign="Start"
                onBeforeClose={function ks(){}}
                onBeforeOpen={function ks(){}}
                onOpen={function ks(){}}
                open={popoverIsOpen}
                allowTargetOverlap="true"
                onClose={() => {
                    setPopoverIsOpen(false);
                }}
                placement="Start"
                verticalAlign="Top">
                <FlexBox direction="Column" alignItems="Stretch" justifyContent="Center" fitContainer="true">
                    <Text style={{maxWidth:"500px"}} ref={popoverBody}></Text>
                </FlexBox>
            </Popover>
            <motion.div style={{flex:"1 1 auto", height:"100%", display:"flex", flexDirection:"column"}}
                        variants={wrapperVariants}
                        initial="visible"
                        animate='visible'
                        exit="exit">
                <Bar design="Header" style={{borderTopLeftRadius:"15px",borderTopRightRadius:"15px",width:"100%"}}>
                    <Button design="Transparent" icon="slim-arrow-left" slot="startContent" ui5-button="" icon-only="" has-icon="" onClick={props.onClick}>Back to List</Button>
                </Bar>
                <ObjectPage
                    headerArea={<ObjectPageHeader>
                            <FlexBox wrap="Wrap">
                                <FlexBox direction="Column">
                                    <Label>Package ID: {props.messageData.packageID}</Label>
                                    <Label>Version: {props.messageData.version}</Label>
                                    <Label >Updated On: <span ref={updatedAt}></span></Label>
                                    <Label >Updated By: <span ref={updatedBy}></span></Label>
                                </FlexBox>
                                <span style={{width: '1rem'}} />
                                {/* <FlexBox direction="Column">
                                    <Label>Availability:</Label>
                                    <ObjectStatus state="Success">In Stock</ObjectStatus>
                                </FlexBox> */}
                            </FlexBox>
                        </ObjectPageHeader>}
                    
                    titleArea={
                        <ObjectPageTitle style={{height:"80px", overflow:"hidden"}}
                            header={props.messageData.customStatus === "SUCCESS"?
                                    <FlexBox alignItems="Center" justifyContent="Start" fitContainer="true"><Icon style={{color:"green", borderLeft:"none", width:"24px",height:"24px", paddingRight:"10px"}} name="message-success" /><Title style={{fontSize: 'var(--sapObjectHeader_Title_FontSize)'}}>{iflowName.current}</Title></FlexBox>:
                                    <FlexBox alignItems="Center" justifyContent="Start" fitContainer="true"><Icon style={{color:"red", borderLeft:"none", width:"24px",height:"24px", paddingRight:"10px"}} name="message-error" /><Title style={{fontSize: 'var(--sapObjectHeader_Title_FontSize)'}}>{iflowName.current}</Title></FlexBox>} 
                            >
                        </ObjectPageTitle>}
                    style={{height: '100%',}}>
                    <ObjectPageSection
                        aria-label="Diagram Settings"
                        id="diagramSettings"
                        titleText="Diagram Settings" style={{height: '80px'}}>
                        <FlexBox direction="Row" alignItems="Center" justifyContent="Start" fitContainer="true" style={{paddingLeft:"10px",background:"var(--sapList_Background)",borderRadius:"10px"}}>
                            <BusyIndicator active={loading} style={{width:"100%", height:"100%"}} size="M">
                                <Switch disabled ref={everyEvent}/>
                                <Label>Add every "Start Event" and "End Event"</Label>
                                <Switch disabled ref={everyReceiverSenderBefore}/>
                                <Label>Add BEFORE every "Send"</Label>
                                <Switch disabled ref={everyReceiverSenderAfter}/>
                                <Label>Add AFTER every "Send"</Label>
                                {/* <Switch onChange={(d) => setReprocessingAsDefaultSwitch(d)} checked={reprocessingAsDefault} ref={dialogStepReprocessing}/>
                                <Label>Enable reprocessing for all steps</Label> */}
                                <Switch disabled ref={keepPayloadAsDefault}/>
                                <Label>Keep Payload for all steps</Label>
                            </BusyIndicator>
                        </FlexBox>
                    </ObjectPageSection>
                    <ObjectPageSection
                        aria-label="Diagram"
                        id="diagram"
                        titleText="Diagram" style={{height: '700px'}}>
                            <div style={{height: '600px',width: '100%'}}>
                                <FlexBox direction="Column" alignItems="Start" justifyContent="SpaceBetween" fitContainer="true">
                                    <BusyIndicator active={loading} style={{width:"100%", height:"100%"}} size="M">
                                        <FlexBox direction="Column" alignItems="Stretch" fitContainer="true">
                                            <motion.div style={{flex:"1 1 auto", display:"flex", flexDirection:"column"}}
                                                        variants={wrapperVariants}
                                                        initial="visible"
                                                        animate={!loading ? 'visible' : 'hidden'}
                                                        exit="exit">
                                                {/* <Toolbar style={{marginBottom:"10px", flex:"1 1 auto"}} alignContent={{End: 'End', Start: 'Start'}}>
                                                    <Switch onChange={(d) => setEveryEventSwitch(d)} checked={everyEvent}/>
                                                    <Label>Add every "Start Event" and "End Event"</Label>
                                                    <Switch onChange={(d) => setEveryReceiverSenderBeforeSwitch(d)} checked={everyReceiverSenderBefore}/>
                                                    <Label>Add BEFORE every "Send"</Label>
                                                    <Switch onChange={(d) => setEveryReceiverSenderAfterSwitch(d)} checked={everyReceiverSenderAfter}/>
                                                    <Label>Add AFTER every "Send"</Label>
                                                    <Switch onChange={props.occurence} />
                                                    <Label>Enable occurence monitoring</Label>
                                                </Toolbar> */}
                                            </motion.div>
                                            <div className="modeler-parent" style={{width:"100%", height:"100%"}}>
                                                <div id="modeler-container" style={{width:"100%", height:"100%"}} ref={containerRef}></div>
                                            </div>
                                        </FlexBox>
                                    </BusyIndicator>
                                </FlexBox>
                            </div>
                    </ObjectPageSection>
                    <ObjectPageSection
                        aria-label="Steps and Details"
                        id="monitoring-details"
                        titleText="Steps and Details">
                            <div style={{flex:"1 1 auto"}}>
                                <FlexBox direction="Column" alignItems="Start" justifyContent="SpaceBetween" flex="1 1 90%" style={{gap:"5px"}} fitContainer="true">
                                <Table style={{width:"100%"}} headerRow={<TableHeaderRow sticky>
                                        <TableHeaderCell maxWidth="150px"><span>STEP#</span></TableHeaderCell>
                                        <TableHeaderCell minWidth="100px"><span>Name</span></TableHeaderCell>
                                        <TableHeaderCell minWidth="400px"><span>Description</span></TableHeaderCell>
                                        <TableHeaderCell minWidth="200px"><span>Process Name</span></TableHeaderCell>
                                        <TableHeaderCell minWidth="200px"><span>Status</span></TableHeaderCell>
                                        <TableHeaderCell maxWidth="130px"><span>Keep Payload</span></TableHeaderCell>
                                    </TableHeaderRow>}
                                    onRowClick={function ks(){}}>
                                        {steps}
                                </Table>
                                </FlexBox>
                            </div>
                    </ObjectPageSection>
                </ObjectPage>
            </motion.div>
        </FlexBox>
    )
}