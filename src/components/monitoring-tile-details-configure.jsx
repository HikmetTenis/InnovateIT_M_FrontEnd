import React, { useEffect, useState, useContext, useRef, Component } from 'react';
import { motion} from "framer-motion";
import { DynamicPageHeader,FlexBox,BusyIndicator,Bar,Dialog,Form, FormGroup, ActionSheet,FormItem,Label,DynamicPageTitle,Title,Badge,Toolbar,MessageStrip,Button,ObjectPage,ObjectPageSection, ObjectPageSubSection, Switch,Icon,Input,Table,TableColumn, TableRow,TableCell} from '@ui5/webcomponents-react';
import BpmnModeler from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import $ from 'jquery';
import moment from 'moment'
import {reprocess,getPayload} from '../services/s-monitoring'
import MessageContext from "../helpers/message-context";
export default function MonitoringTileDetailsConfigure(props) {
    const containerRef = useRef(null);
    const [modeler, setModeler] = useState(null);
    const [loading, setLoading] = useState(false);
    const popoverRef = useRef(null);
    const [open, setOpen] = useState(false);
    const popoverRef1 = useRef(null);
    const [open1, setOpen1] = useState(false);
    const selectedOverlay = useRef(null);
    let updatedAt = useRef(null);
    let updatedBy = useRef(null);
    let packageID = useRef(null);
    let description = useRef(null);
    let iflowName = useRef(null);
    const {message,setMessage} = useContext(MessageContext);
    let monID = useRef(null);
    let iflowID = useRef(null);
    const [dialogStepReprocessing, setDialogStepReprocessing] = useState(false);
    const [dialogStepShowPayload, setDialogStepShowPayload] = useState(false);
    useEffect(() => {
        setLoading(true)
        const decoded = atob(props.metadata.diagramData);
        drawDiagram(decoded, props.metadata.steps, props.messageData.steps)
        packageID.current = props.metadata.packageID
        description.current = props.metadata.description
        iflowName.current = props.metadata.monName
        monID.current = props.metadata.monID
        iflowID.current = props.metadata.id
        let updatedDate = props.metadata.updatedAt
        if(updatedDate !== "N/A")
            updatedDate = moment( props.metadata.updatedAt).format('MMMM Do YYYY, h:mm:ss a')
        updatedAt.current.innerHTML = updatedDate
        updatedBy.current.innerHTML = props.metadata.updatedBy
    }, [props])
    const setupOverlays = (steps, modelerInstance, runtimeSteps)=>{
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
            let runtimeStep = runtimeSteps.filter(m => parseInt(m.stepNumber) === parseInt(e.stepNumber));
            runtimeStep = runtimeStep[0]
            let color = 'grey'
            let txt = "NA"
            if(runtimeStep && runtimeStep.stepStatus === "SUCCESS"){
                color = 'green'
                txt = "OK"
            }
            if(runtimeStep && runtimeStep.stepStatus === "ERROR"){
                color = 'red'
                txt = "ERR"
            }
            if(e.stepType === "MANUAL")
                color = 'blue'
            let overlay
            if(e.keepPayload){
                overlay = $('<div class="main_'+e.id+'" keepPayload="'+e.keepPayload+'" id="'+e.id+'" sequences='+e.sequences+' step="'+e.stepNumber+'" name="'+e.name+'" desc="'+e.desc+'" color:white;cursor: pointer;background-color:'+color+';border:1px solid black;height:20px;width:20px;border-radius:20px;padding:5px;opacity:0.5;display:flex;justify-content:center;align-items:center">'+
                    '<div id="'+e.id+'" style="color:white;cursor: pointer;background-color:'+color+';border:1px solid black;height:20px;width:20px;border-radius:20px;padding:5px;opacity:0.5;display:flex;justify-content:center;align-items:center">'+txt+
                        '<div id="'+e.id+'" style="position:absolute;font-size:10px;font-weight:600;top:-3px;right:-3px;background-color:transparent;color:black;padding:1px;-webkit-border-radius: 5px;-moz-border-radius: 5px;border-radius: 5px;width:5px;height:5px;text-align:center;">P</div>'+
                    '</div>'+
                '</div>')
            }else{
                overlay = $('<div class="main_'+e.id+'" keepPayload="'+e.keepPayload+'" id="'+e.id+'" sequences='+e.sequences+' step="'+e.stepNumber+'" name="'+e.name+'" desc="'+e.desc+'" color:white;cursor: pointer;background-color:'+color+';border:1px solid black;height:20px;width:20px;border-radius:20px;padding:5px;opacity:0.5;display:flex;justify-content:center;align-items:center">'+
                    '<div id="'+e.id+'" style="color:white;cursor: pointer;background-color:'+color+';border:1px solid black;height:20px;width:20px;border-radius:20px;padding:5px;opacity:0.5;display:flex;justify-content:center;align-items:center">'+txt+
                    '</div>'+
                '</div>')
            }
            overlays.add(e.id, {
                id:e.id,
                position: {
                    top: e.y,
                    left: e.x    
                },
                html: overlay
            });
            stepOverLays.push(e)
            overlay.click(function(event) {
                if($('.main_'+event.target.id).attr("keeppayload")){
                    let customActionSheets = document.querySelectorAll("[id*=custom_actionsheet1_]")
                    for (let el of customActionSheets) {
                        document.body.removeChild(el)
                    }
                    let container = document.createElement('div');
                    container.style.display = 'block';
                    container.style.position = 'absolute';
                    container.style.left = event.originalEvent.clientX+'px'
                    container.style.top = event.originalEvent.clientY+'px'
                    container.id = "custom_actionsheet1_"+event.target.id
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
                if($('.main_'+event.target.id).attr("id").indexOf("StartEvent") === -1){
                    setDialogStepReprocessing(true)
                }else{
                    setDialogStepReprocessing(false)
                }
            }); 
            overlay.hover(function(event) {
                    const canvas = m.get('canvas');
                    let itemId = event.target.id
                    canvas.addMarker(itemId, 'highlight');
                }, function(event) {
                    const canvas = m.get('canvas');
                    let itemId = event.target.id
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
    const showPayload  = (value) => {
        const messageId = props.messageData.messageId
        const stepNumber = $(selectedOverlay.current.parentNode).attr("step")
        getPayload(stepNumber,messageId).then((res)=>{
            const binaryString = window.atob(res.data.obj.data);

            // Create a byte array from the binary string
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Create a Blob from the byte array
            const blob = new Blob([bytes], { type: 'application/octet-stream' });

            // Create a link element and trigger the download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', messageId+".txt"); // Set the file name for download
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link); // Clean up the link element
        })
    }
    const drawDiagram  = (value, steps, runtimeSteps) => {
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
                setupOverlays(steps, modelerInstance, runtimeSteps)
            });  
            
        }, 2000);
    
    }
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
    return (
        <FlexBox direction="row" alignItems="Stretch" fitContainer="true">
            
            <ActionSheet ref={popoverRef} open={open}>
                <Button onClick={() => resend()} icon="add">Resend</Button>
            </ActionSheet>
            <ActionSheet ref={popoverRef1} open={open1}>
                <Button onClick={(e) => showPayload(e)} icon="show" disabled={dialogStepShowPayload} >Show Payload</Button>
                <Button onClick={(e) => resend(e)} icon="restart" disabled={dialogStepReprocessing} >Reprocess</Button>
            </ActionSheet>
            <motion.div style={{flex:"1 1 auto", height:"100%", display:"flex", flexDirection:"column"}}
                        variants={wrapperVariants}
                        initial="visible"
                        animate='visible'
                        exit="exit">
                
                <ObjectPage
                    headerContent={<DynamicPageHeader>
                            <FlexBox wrap="Wrap">
                                <FlexBox direction="Column">
                                    <Label>Package ID: {props.metadata.packageID}</Label>
                                    <Label>Version: {props.metadata.version}</Label>
                                    <Label >Updated On: <span ref={updatedAt}></span></Label>
                                    <Label >Updated By: <span ref={updatedBy}></span></Label>
                                </FlexBox>
                                <span style={{width: '1rem'}} />
                                {/* <FlexBox direction="Column">
                                    <Label>Availability:</Label>
                                    <ObjectStatus state="Success">In Stock</ObjectStatus>
                                </FlexBox> */}
                            </FlexBox>
                        </DynamicPageHeader>}
                    headerContentPinnable
                    headerTitle={
                        <DynamicPageTitle style={{height:"80px", overflow:"hidden"}}
                            // actions={
                            //     <motion.div style={{flex:"1 1 auto", height:"100%", display:"flex", flexDirection:"row"}}
                            //         variants={wrapperVariants}
                            //         initial="visible"
                            //         animate={!loading ? 'visible' : 'hidden'}
                            //         exit="exit">
                            //         <><Button design="Emphasized" disabled={updateDisabled} onClick={() => openDialog()}>Save</Button><Button design="Transparent">Cancel</Button><Button design="Transparent" onClick={() => clearDiagram()} icon="action"/></>
                            //     </motion.div>}
                            expandedContent={<MessageStrip>Information (only visible if header content is expanded)</MessageStrip>} 
                            header={props.messageData.customStatus === "SUCCESS"?
                                    <FlexBox alignItems="Center" justifyContent="Start" fitContainer="true"><Icon style={{color:"green", borderLeft:"none", width:"24px",height:"24px", paddingRight:"10px"}} name="message-success" /><h4>{iflowName.current}</h4></FlexBox>:
                                    <FlexBox alignItems="Center" justifyContent="Start" fitContainer="true"><Icon style={{color:"red", borderLeft:"none", width:"24px",height:"24px", paddingRight:"10px"}} name="message-error" /><h4>{iflowName.current}</h4></FlexBox>} 
                            showSubHeaderRight 
                            snappedContent={<MessageStrip>Information (only visible if header content is collapsed/snapped)</MessageStrip>}>
                            {/* <FlexBox wrap="Wrap">
                                <Badge>Status: <span ref={status}></span></Badge>
                            </FlexBox> */}
                        </DynamicPageTitle>}
                    
                    onBeforeNavigate={function _a(){}}
                    onPinnedStateChange={function _a(){}}
                    onSelectedSectionChange={function _a(){}}
                    onToggleHeaderContent={function _a(){}}
                    selectedSectionId="goals"
                    showHideHeaderButton
                    style={{height: '100%',}}>
                    <ObjectPageSection
                        aria-label="Diagram"
                        id="diagram"
                        titleText="Diagram" style={{height: '700px'}}>
                        <ObjectPageSubSection style={{height: '100%',}}
                            actions={<><Button design="Transparent" icon="action-settings" tooltip="settings"/></>}
                            aria-label=""
                            id="monitoring-version"
                            titleText="">
                                <div style={{height: '600px',width: '100%'}}>
                                    <FlexBox direction="Column" alignItems="Start" justifyContent="SpaceBetween" fitContainer="true">
                                        <BusyIndicator active={loading} style={{width:"100%", height:"100%"}} size="Medium">
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
                        </ObjectPageSubSection>
                    </ObjectPageSection>
                    <ObjectPageSection
                        aria-label="Steps and Details"
                        id="monitoring-details"
                        titleText="Steps and Details">
                        <ObjectPageSubSection
                            actions={<><Button design="Transparent" icon="action-settings" tooltip="settings"/><Button design="Transparent" icon="refresh" tooltip="refresh"/></>}
                            aria-label="STEPs and Details"
                            id="steps"
                            titleText="STEPs and Details">
                                <div style={{flex:"1 1 auto"}}>
                                    <FlexBox direction="Column" alignItems="Start" justifyContent="SpaceBetween" flex="1 1 90%" style={{gap:"5px"}} fitContainer="true">
                                        {/* <Table  columns={<>
                                            <TableColumn>
                                                <span>STEP#</span>
                                            </TableColumn>
                                            <TableColumn>
                                                <span>Name</span>
                                            </TableColumn>
                                            <TableColumn>
                                                <span>Description</span>
                                            </TableColumn>
                                            <TableColumn>
                                                <span>Process Name</span>
                                            </TableColumn>
                                            <TableColumn>
                                                <span>Keep Payload</span>
                                            </TableColumn>
                                            </>}>
                                            {steps}
                                        </Table> */}
                                        {/* <FlexBox direction="Column" alignItems="Center" justifyContent="Center" flex="0 0 10%" fitContainer="true" style={{marginRight:"10px"}}>
                                            <Button design="Emphasized" icon="save" onClick={(d) =>  updateSteps()} disabled={updateDisabled}>Update Diagram</Button>
                                        </FlexBox> */}
                                    </FlexBox>
                                </div>
                            </ObjectPageSubSection>
                    </ObjectPageSection>
                </ObjectPage>
            </motion.div>
        </FlexBox>
    )
}