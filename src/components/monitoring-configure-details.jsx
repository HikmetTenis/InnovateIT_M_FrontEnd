import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { DynamicPageHeader,FlexBox,BusyIndicator,Bar,Dialog,Form, FormGroup, ActionSheet,FormItem,ObjectPageTitle, ObjectPageHeader,Label,DynamicPageTitle,Title,Tag,Toolbar,MessageStrip,Button,ObjectPage,ObjectPageSection, ObjectPageSubSection, Switch,Icon,Input,Table,TableHeaderRow,TableHeaderCell, TableRow,TableCell} from '@ui5/webcomponents-react';
import React, { useEffect, useState, useContext, useRef, Component } from 'react';
import {getArtifactRuntimeDetails, saveArtifact,getArtifactDetails,getProcessType, modifyOverlays} from '../services/s-monitoring-configure'
import { motion} from "framer-motion";
import MessageContext from "../helpers/message-context";
import BpmnModeler from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import $ from 'jquery';
import moment from 'moment'
import { useMsal } from '@azure/msal-react';
export default function MonitoringConfigureDetails(props) {
    const [loading, setLoading] = useState(false);
    const [everyEvent, setEveryEvent] = useState(false);
    const [everyReceiverSenderBefore, setEveryReceiverSenderBefore] = useState(false);
    const [everyReceiverSenderAfter, setEveryReceiverSenderAfter] = useState(false);
    const [keepPayloadAsDefault, setKeepPayloadAsDefault] = useState(false);
    const [reprocessingAsDefault, setReprocessingAsDefault] = useState(false);
    const {message,setMessage} = useContext(MessageContext);
    const [steps,setSteps] = useState([]);
    const [stepList,setStepList] = useState([]);
    const [updateDisabled, setUpdateDisabled] = useState(true);
    const [diagramXML, setDiagramXML] = useState(null);
    const [modeler, setModeler] = useState(null);
    const [filename, setFilename] = useState(null);
    const [headerText, setHeaderText] = useState(null);
    const popoverRef = useRef(null);
    const [open, setOpen] = useState(false);
    const popoverRef1 = useRef(null);
    const [open1, setOpen1] = useState(false);
    const containerRef = useRef(null);
    const dialogStepNumber = useRef(null);
    const dialogStepName = useRef(null);
    const dialogStepDesc = useRef(null);
    const dialogStepId2 = useRef(null);
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const dialogStepKeepPayload = useRef(null);
    const { instance, accounts } = useMsal();
    let packageID = useRef(null);
    let description = useRef(null);
    let iflowName = useRef(null);
    let status = useRef(null);
    let updatedAt = useRef(null);
    let updatedBy = useRef(null);
    let monID = useRef(null);
    let scriptNames = useRef(null);
    let iflowID = useRef(null);
    useEffect(() => {
        setLoading(true)
        getArtifactDetails(props.iflow.Id,props.iflow.Name,props.iflow.Version).then((res)=>{
            const data = res.data.obj
            const decoded = atob(data.xmlString);
            setDiagramXML(decoded)
            drawDiagram(decoded, data.steps)
            setEveryEvent(data.everyEvent)
            setEveryReceiverSenderBefore(data.everyReceiverSenderBefore)
            setEveryReceiverSenderAfter(data.everyReceiverSenderAfter)
            setKeepPayloadAsDefault(data.keepPayloadAsDefault)
            packageID.current = data.packageID
            description.current = data.description
            iflowName.current = data.name
            status.current.innerHTML = data.status
            scriptNames.current = data.scriptNames
            monID.current = data.monID
            iflowID.current = data.id
            let updatedDate = data.updatedAt
            if(updatedDate !== "N/A")
                updatedDate = moment( data.updatedAt).format('MMMM Do YYYY, h:mm:ss a')
            updatedAt.current.innerHTML = updatedDate
            updatedBy.current.innerHTML = data.updatedBy
            setStepList(data.steps)
            setFilename(data.filename)
           })
    }, [])
    const clearDiagram = ()=>{
        setMessage({open:true, message:"Do you want to clear the diagram? You will lose all the steps.", result:null, callback:clearDiagramConfirmed,toastMessage:message.toastMessage})
    }
    const clearDiagramConfirmed = ()=>{
        setLoading(true)
        getArtifactDetails(props.iflow.Id,props.iflow.Version).then((res)=>{
            const data = res.data.obj
            setDiagramXML(data.xmlString)
            drawDiagram(data.xmlString, true)
            setEveryEvent(false)
            setEveryReceiverSenderBefore(false)
            setEveryReceiverSenderAfter(false)
            setSteps(data.steps)
            setStepList(data.steps)
            setFilename(data.filename)
             
        })
    }
    const setEveryEventSwitch  = async(value) => {
        setEveryEvent(value.target.checked)
        setLoading(true)
        const mergedArray = await modifyOverlays(modeler,value.target.checked, everyReceiverSenderAfter,everyReceiverSenderBefore, keepPayloadAsDefault,reprocessingAsDefault)
        setStepList(previousValues => {
            let newSteps = []
            previousValues.forEach(function(e) {
                if(e.stepType === 'MANUAL')
                    newSteps.push(e)
            })
            newSteps = [...newSteps, ...mergedArray] 
            setupOverlays(newSteps)
            setLoading(false)
            return newSteps
        }) 
    }
    const setEveryReceiverSenderBeforeSwitch  = async(value) => {
        setEveryReceiverSenderBefore(value.target.checked)
        setLoading(true)
        const mergedArray = await modifyOverlays(modeler,everyEvent, everyReceiverSenderAfter,value.target.checked,keepPayloadAsDefault,reprocessingAsDefault)
        setStepList(previousValues => {
            let newSteps = []
            previousValues.forEach(function(e) {
                if(e.stepType === 'MANUAL')
                    newSteps.push(e)
            })
            newSteps = [...newSteps, ...mergedArray] 
            setupOverlays(newSteps)
            setLoading(false)
            return newSteps
        })
    }
    const setKeepPayloadAsDefaultSwitch = (event) => {
        setKeepPayloadAsDefault(event.target.checked)
        setStepList(previousValues => {
            let newSteps = []
            previousValues.forEach(function(e) {
                e.keepPayload = event.target.checked
                newSteps.push(e)
            })
            setupOverlays(newSteps)
            setStepData(newSteps)
            setUpdateDisabled(false)
            return newSteps
        })
        setUpdateDisabled(false)
    }
    const setReprocessingAsDefaultSwitch = (event) => {
        setReprocessingAsDefault(event.target.checked)
        setStepList(previousValues => {
            let newSteps = []
            previousValues.forEach(function(e) {
                e.reprocessing = event.target.checked
                newSteps.push(e)
            })
            setupOverlays(newSteps)
            setStepData(newSteps)
            setUpdateDisabled(false)
            return newSteps
        })
        setUpdateDisabled(false)
    }
    const setEveryReceiverSenderAfterSwitch  = async(value) => {
        setEveryReceiverSenderAfter(value.target.checked)
        setLoading(true)
        const mergedArray = await modifyOverlays(modeler,everyEvent, value.target.checked,everyReceiverSenderBefore,keepPayloadAsDefault, reprocessingAsDefault)
        setStepList(previousValues => {
            let newSteps = []
            previousValues.forEach(function(e) {
                if(e.stepType === 'MANUAL')
                    newSteps.push(e)
            })
            newSteps = [...newSteps, ...mergedArray] 
            setupOverlays(newSteps)
            setLoading(false)
            return newSteps
        })
    }
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
            let color = 'blue'
            if(e.stepType === "AUTO")
                color = 'green'
            let overlay = $('<div reprocessing="'+e.reprocessing+'" keepPayload="'+e.keepPayload+'" id="'+e.id+'" sequences='+e.sequences+' step="'+e.stepNumber+'" name="'+e.name+'" desc="'+e.desc+'" style="color:white;cursor: pointer;background-color:'+color+';border:1px solid black;height:40px;width:40px;border-radius:20px;padding:5px;opacity:0.7;display:flex;justify-content:center;align-items:center">'+e.stepNumber+'</div>')
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
                    let desc = event.target.getAttribute("desc")
                    let id = event.target.getAttribute("id")
                    let id2 = event.target.getAttribute("id2")
                    let name = event.target.getAttribute("name")
                    let stepNum = event.target.getAttribute("step")
                    let keepPayload = false
                    let reprocessing = false
                    dialogStepNumber.current.value = stepNum;
                    dialogStepDesc.current.value = desc;
                    dialogStepName.current.value = name;
                    if(event.target.getAttribute("keepPayload") === "true")
                        keepPayload = true
                    if(event.target.getAttribute("reprocessing") === "true")
                        reprocessing = true
                    dialogStepKeepPayload.current.checked = keepPayload
                    
                    dialogStepId2.current.value = id2;
                    setHeaderText(id);
                    popoverRef1.current.opener = container.id
                    setOpen1((prev) => !prev);
                }
                
            }); 
            overlay.hover(function(event) {
                    const canvas = m.get('canvas');
                    const itemId = event.target.id
                    canvas.addMarker(itemId, 'highlight');
                }, function(event) {
                    const canvas = m.get('canvas');
                    const itemId = event.target.id
                    canvas.removeMarker(itemId, 'highlight');
                }
            );
        });
        setStepData(stepOverLays)
        setLoading(false)
        setUpdateDisabled(false)
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

                        if (popoverRef.current) {
                            popoverRef.current.opener = container.id
                            setOpen((prev) => !prev);
                        }
                    }
                });
                setupOverlays(steps, modelerInstance)
            });  
            
        }, 2000);
       
    }
    const save = () => {
        
        const d ={
            id:iflowID.current,
            everyEvent: everyEvent,
            filename: filename,
            everyReceiverSenderAfter: everyReceiverSenderAfter,
            everyReceiverSenderBefore: everyReceiverSenderBefore,
            keepPayloadAsDefault: keepPayloadAsDefault,
            steps:stepList,
            name:props.iflow.Name,
            iflowName: iflowName.current,
            description: description.current,
            packageName:props.packagename,
            xmlString:diagramXML,
            scriptNames: scriptNames.current,
            version: props.iflow.Version,
            status: status.current.innerHTML,
            updatedBy: accounts[0].username
        }
        saveArtifact(d).then((data)=>{
            const res = data.data.obj
            // const respValue = {"updatedOn":res.updatedAt, "updatedBy":res.updatedBy, "status":res.status}
            // setArtifactRuntimeDetails(respValue);
            setMessage({open:false, toastMessage:"Artifact "+res+" saved.!", result:null, callback:null, toast:true})
            setUpdateDisabled(true)
        })
    }
    const openDialog = () => {
        setMessage({open:true, message:"Do you want to save it? It will create a copy of your IFLOW with Monitoring STEPS.", result:null, callback:save,toastMessage:message.toastMessage})
    }
    const updateOverlay = (e) =>{
        let overlays = modeler.get('overlays');
        const obj = overlays.get({ element: headerText })
        let stepNum = dialogStepNumber.current.value
        let desc = dialogStepDesc.current.value
        let name = dialogStepName.current.value;
        let id2 = dialogStepName.current.value;
        let keepPayload = dialogStepKeepPayload.current.checked
        if(dialogStepId2.current.value == null)
            id2 = headerText
        let id = headerText
        const data = {
            id:id,
            id2:id2,
            keepPayload:keepPayload,
            reprocessing:"false",
            stepNumber:stepNum,
            name:name,
            desc:desc
        }
        if(obj.length > 0){
            overlays.remove({ element: headerText })
            updateSteps(data, "UPDATE")
        }else{
            addNewStep(data, "ADD")
        }
        setDialogIsOpen(false);
    }
    const addNewStep = async(d) => {
        const elementRegistry = modeler.get('elementRegistry');
        const sequenceFlow = elementRegistry.get(headerText)
        const sourceElement = elementRegistry.get(sequenceFlow.businessObject.sourceRef.id)
        let ll = []
        ll.push(sequenceFlow.id)
        let processName
        let processType
        let parentID 
        if(sequenceFlow.businessObject){
            processName = sequenceFlow.businessObject.$parent.name
            parentID = sequenceFlow.businessObject.$parent.id
            processType = await getProcessType(sequenceFlow.businessObject.$parent)
        }else{
            processName = sequenceFlow.$parent.name
            parentID = sequenceFlow.$parent.id
            processType = await getProcessType(sequenceFlow.$parent)
        }
        let status = "SUCCESS"
        if(processType === "EP")
            status = "ERROR"
        sequenceFlow.businessObject.$parent.stepNumber++
        let x = sourceElement.width-7
        let y = sourceElement.height-7
        let isReprocessingPossible = true
        if(sourceElement.id.indexOf("StartEvent") === -1){
            isReprocessingPossible = false
        }
        const dd = {
            id:sourceElement.id,
            id2:sourceElement.id,
            sequences:ll,
            type:sourceElement.type,
            status: status,
            stepType: "MANUAL",
            stepNumber:dialogStepNumber.current.value,
            parentName:processName,
            parentID:parentID,
            reprocessing:"false",
            reprocessingpossible:isReprocessingPossible,
            keepPayload:dialogStepKeepPayload.current.checked,
            name:dialogStepName.current.value,
            x:x,
            y:y,
            desc:dialogStepDesc.current.value, 
        }
        setStepList(previousValues => {
            let newSteps = []
            previousValues.forEach(function(e) {
                newSteps.push(e)
            })
            newSteps.push(dd)
            setupOverlays(newSteps)
            return newSteps
        })
        setUpdateDisabled(false)
    }
    const stepDataChanged = (d, type) => {
        let name = null
        let desc = null
        let stepNumber = null
        let keepPayload = false
        if(type === "number")
            stepNumber = d.target.value
        if(type === "name")
            name = d.target.value
        if(type === "desc")
            desc = d.target.value
        if(type === "keepPayload")
            keepPayload = d.target.checked
        const data = {
            id:d.target.id,
            id2: d.target.getAttribute("id2"),
            keepPayload: keepPayload,
            stepNumber:stepNumber,
            name:name,
            desc:desc
        }
        updateSteps(data, "UPDATE")
    }
    const addManualOverlay = (data) => {
        let id = popoverRef.current.opener
        id = id.replaceAll("custom_actionsheet_", "")
        setHeaderText(id);
        const elementRegistry = modeler.get('elementRegistry');
        const sequenceFlow = elementRegistry.get(id)
        const sourceElement = elementRegistry.get(sequenceFlow.businessObject.sourceRef.id)
        let stepNumber = sequenceFlow.businessObject.$parent.stepNumber
        if(stepNumber){
            stepNumber++
        }else
            stepNumber = ''
        dialogStepNumber.current.value = stepNumber
        dialogStepName.current.value = ''
        dialogStepDesc.current.value = '' 
        
        $("#myModal").appendTo("body") 
        setDialogIsOpen(true);
    }
    const removeOverlay = (d) => {
        let stepNum = dialogStepNumber.current.value
        let desc = dialogStepDesc.current.value
        let name = dialogStepName.current.value
        let id2 = dialogStepId2.current.value
        const data = {
            id:headerText,
            id2: id2,
            stepNumber:stepNum,
            name:name,
            desc:desc
        }
        updateSteps(data, "REMOVE")
    }
    const editOverlay = (event) => {
        $("#myModal").appendTo("body") 
        setDialogIsOpen(true);
    }
    const updateSteps = (data, type) => {
        const id = data.id
        const id2 = data.id2
        const name = data.name
        const desc = data.desc
        const stepNumber = data.stepNumber
        const keepPayload = data.keepPayload
        const reprocessing = data.reprocessing
        setStepList(previousValues => {
            let newSteps = []
            previousValues.forEach(function(e) {
                if(e.id === id){
                    if(e.id === id && e.id2 === id2){
                        if(stepNumber != null)
                            e.stepNumber = stepNumber
                        if(name != null)
                            e.name = name
                        if(desc != null)
                            e.desc = desc
                        if(keepPayload != null)
                            e.keepPayload = keepPayload
                        if(reprocessing != null)
                            e.reprocessing = reprocessing
                    }
                    if(type != null && type !== "REMOVE")
                        newSteps.push(e)
                }else{
                    newSteps.push(e)
                }
            })
            setupOverlays(newSteps)
            setStepData(newSteps)
            setUpdateDisabled(false)
            return newSteps
        })
        setUpdateDisabled(false)
    }
    const setStepData = (d) => {
        let stepData = []
        //setStepList(d)
        d.forEach(function(e) {
            stepData.push(<TableRow key={`${e.id}`}>
            <TableCell >
                <Input style={{width:"100%"}} id={`${e.id}`} id2={`${e.id2}`} icon={<Icon name="flag-2" />} onChange={(d) =>  stepDataChanged(d, "number")} onInput={function _a(){}} onSuggestionItemPreview={function _a(){}} onSuggestionItemSelect={function _a(){}} type="Text" valueState="None" value={e.stepNumber}></Input>
            </TableCell>
            <TableCell>
                <Input style={{width:"100%"}} id={`${e.id}`} id2={`${e.id2}`} icon={<Icon name="flag-2" />} onChange={(d) =>  stepDataChanged(d, "name")} onInput={function _a(){}} onSuggestionItemPreview={function _a(){}} onSuggestionItemSelect={function _a(){}} type="Text" valueState="None" value={e.name}></Input>
            </TableCell>
            <TableCell>
                <Input style={{width:"100%"}} id={`${e.id}`} id2={`${e.id2}`} icon={<Icon name="receipt" />} onChange={(d) => stepDataChanged(d, "desc")} onInput={function _a(){}} onSuggestionItemPreview={function _a(){}} onSuggestionItemSelect={function _a(){}} type="Text" valueState="None" value={`${e.desc}`}></Input>
            </TableCell>
            <TableCell>
                {e.parentName}
            </TableCell>
            <TableCell>
                <Switch onChange={(d) => setUpdateDisabled(false)} checked={e.keepPayload} />
            </TableCell>
          </TableRow>)
        })
        setSteps(stepData)
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
            <Dialog id="myModal" className="headerPartNoPadding footerPartNoPadding" open={dialogIsOpen} style={{zIndex:104}} aria-modal="true" 
                    footer={<Bar design="Footer" endContent={
                        <div>
                            <Button  style={{marginRight:"3px"}} onClick={() => setDialogIsOpen(false)}>Close</Button>
                            {dialogStepName.current && dialogStepName.current.value !== ''
                            ?<Button design="Emphasized" onClick={(e) => updateOverlay(e)}>Update</Button>
                            :<Button design="Emphasized" onClick={(e) => updateOverlay(e)}>Add</Button>}
                        </div>}/>}
                    headerText={headerText}
                    onAfterClose={function _a(){}}
                    onAfterOpen={function _a(){}}
                    onBeforeClose={function _a(){}}
                    onBeforeOpen={function _a(){}}>
                <Form
                    backgroundDesign="Transparent"
                    columnsL={1}
                    columnsM={1}
                    columnsS={1}
                    columnsXL={2}
                    labelSpanL={4}
                    labelSpanM={2}
                    labelSpanS={12}
                    labelSpanXL={4}
                    style={{
                        alignItems: 'center'
                    }}
                    titleText=""
                    >
                    <FormGroup titleText="Step Details">
                        <FormItem label="Step Number">
                            <Input ref={dialogStepNumber} icon={null} type="Text"></Input>
                        </FormItem>
                        <FormItem label="Step Name">
                            <Input ref={dialogStepName} icon={null} type="Text"></Input>
                        </FormItem>
                        <FormItem label="Step Description">
                            <Input ref={dialogStepDesc} icon={null} type="Text"></Input>
                            <Input ref={dialogStepId2} icon={null} type="Text" hidden></Input>
                        </FormItem>
                        <FormItem>
                            <FlexBox direction="Column" alignItems="Center" fitContainer="true">
                                <FlexBox direction="row" alignItems="Center" fitContainer="true">
                                    <Switch ref={dialogStepKeepPayload} onChange={(d) => setUpdateDisabled(false)}/>
                                    <Label>Keep Payload</Label>
                                </FlexBox>
                                {/* <FlexBox direction="row" alignItems="Center" fitContainer="true">
                                    <Switch ref={dialogStepReprocessing} onChange={(d) => setUpdateDisabled(false)}/>
                                    <Label>Enable reprocessing</Label>
                                </FlexBox> */}
                            </FlexBox>
                        </FormItem>
                    </FormGroup>
                </Form>
            </Dialog>
            <ActionSheet ref={popoverRef} open={open}>
                <Button onClick={() => addManualOverlay()} icon="add">Add</Button>
            </ActionSheet>
            <ActionSheet ref={popoverRef1} open={open1}>
                <Button onClick={(e) => editOverlay(e)} icon="add">Update</Button>
                <Button onClick={(e) => removeOverlay(e)} icon="delete">Remove</Button>
            </ActionSheet>
            <motion.div style={{flex:"1 1 auto", height:"100%", display:"flex", flexDirection:"column"}}
                        variants={wrapperVariants}
                        initial="visible"
                        animate='visible'
                        exit="exit">
                <Bar design="Header" style={{borderTopLeftRadius:"15px",borderTopRightRadius:"15px",width:"100%"}}>
                    <Button design="Transparent" icon="slim-arrow-left" slot="startContent" ui5-button="" icon-only="" has-icon="" onClick={props.onClick}>Back</Button>
                </Bar>
                <ObjectPage
                    headerArea={<ObjectPageHeader>
                            <FlexBox wrap="Wrap">
                                <FlexBox direction="Column">
                                    <Label>Package ID: {props.packagename}</Label>
                                    <Label>Version: {props.iflow.Version}</Label>
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
                    headerContentPinnable
                    
                    titleArea={
                        <ObjectPageTitle  
                            actionsBar={
                                <motion.div style={{flex:"1 1 auto", height:"100%", width:"100%", display:"flex", flexDirection:"row", alignItems:"Center", justifyContent:"End"}}
                                    variants={wrapperVariants}
                                    initial="visible"
                                    animate={!loading ? 'visible' : 'hidden'}
                                    exit="exit">
                                    <><Button design="Emphasized" disabled={updateDisabled} onClick={() => openDialog()}>Save</Button><Button design="Transparent">Cancel</Button><Button design="Transparent" onClick={() => clearDiagram()} icon="action"/></>
                                </motion.div>}
                            // expandedContent={
                            //     <MessageStrip>Information (only visible if header content is expanded)</MessageStrip>} 
                            header={<Title style={{fontSize: 'var(--sapObjectHeader_Title_FontSize)'}}>{props.iflow.Name}</Title>} 
                           
                            snappedContent={
                                <MessageStrip>Information (only visible if header content is collapsed/snapped)</MessageStrip>}>
                            <Tag>Status: <span ref={status}></span></Tag>
                        </ObjectPageTitle>}
                    style={{height: '100%',}}>
                    <ObjectPageSection
                        aria-label="Diagram Settings"
                        id="diagramSettings"
                        titleText="Diagram Settings" style={{height: '80px'}}>
                        <FlexBox direction="Row" alignItems="Center" justifyContent="Start" fitContainer="true" style={{paddingLeft:"10px",background:"var(--sapList_Background)",borderRadius:"10px"}}>
                            <BusyIndicator active={loading} style={{width:"100%", height:"100%"}} size="M">
                                <Switch onChange={(d) => setEveryEventSwitch(d)} checked={everyEvent}/>
                                <Label>Add every "Start Event" and "End Event"</Label>
                                <Switch onChange={(d) => setEveryReceiverSenderBeforeSwitch(d)} checked={everyReceiverSenderBefore}/>
                                <Label>Add BEFORE every "Send"</Label>
                                <Switch onChange={(d) => setEveryReceiverSenderAfterSwitch(d)} checked={everyReceiverSenderAfter}/>
                                <Label>Add AFTER every "Send"</Label>
                                {/* <Switch onChange={(d) => setReprocessingAsDefaultSwitch(d)} checked={reprocessingAsDefault} ref={dialogStepReprocessing}/>
                                <Label>Enable reprocessing for all steps</Label> */}
                                <Switch onChange={(d) => setKeepPayloadAsDefaultSwitch(d)} checked={keepPayloadAsDefault}/>
                                <Label>Keep Payload for all steps</Label>
                            </BusyIndicator>
                        </FlexBox>
                    </ObjectPageSection>
                    <ObjectPageSection
                        aria-label="Diagram"
                        id="diagram"
                        titleText="Diagram" style={{height: '700px'}}>
                        <div style={{height: '600px',width: '100%'}}>
                            <FlexBox direction="Column" alignItems="Start" justifyContent="SpaceBetween" fitContainer="true" style={{marginTop:"10px",background:"var(--sapList_Background)",borderRadius:"10px"}}>
                                <BusyIndicator active={loading} style={{width:"100%", height:"100%"}} size="M">
                                    <FlexBox direction="Column" alignItems="Stretch" fitContainer="true">
                                
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
                            <FlexBox direction="Column" alignItems="Start" justifyContent="SpaceBetween" flex="1 1 90%" style={{marginTop:"10px",background:"var(--sapList_Background)",borderRadius:"10px",padding:"5px"}} fitContainer="true">
                                <Table style={{width:"100%"}} headerRow={
                                    <TableHeaderRow sticky>
                                        <TableHeaderCell maxWidth="100px"><span>STEP#</span></TableHeaderCell>
                                        <TableHeaderCell minWidth="100px"><span>Name</span></TableHeaderCell>
                                        <TableHeaderCell minWidth="400px"><span>Description</span></TableHeaderCell>
                                        <TableHeaderCell minWidth="200px"><span>Process Name</span></TableHeaderCell>
                                        {/* <TableHeaderCell maxWidth="100px"><span>Reprocessing</span></TableHeaderCell> */}
                                        <TableHeaderCell maxWidth="130px"><span>Keep Payload</span></TableHeaderCell>
                                    </TableHeaderRow>}>
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