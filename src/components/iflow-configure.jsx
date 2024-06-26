import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Tree,TreeItem, BusyIndicator, Panel,TableColumn,Table, TableRow, TableCell, Icon, Button} from '@ui5/webcomponents-react';
import React, { useEffect, useState,useRef } from 'react';
import {getArtifacts, getArtifact, getArtifactDetails} from '../services/s-monitoring-configure'
import Modeler from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
//import Modeler from "bpmn-js/lib/Modeler";

export default function IflowConfigure(props) {
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);
    const [ modeler, setModeler ] = useState(null)
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
        <BusyIndicator active={loading} style={{width:"100%",height:"100%"}} size="Medium">
            <div className="modeler-parent" style={{width:"100%", height:"100%"}}>
                <div id="modeler-container" style={{width:"100%", height:"100%"}} ref={containerRef}></div>
            </div>
        </BusyIndicator>
      );
}