import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Tree,TreeItem, BusyIndicator, Panel,TableColumn,Table, TableRow, TableCell, Icon, Button} from '@ui5/webcomponents-react';
import React, { useEffect, useState,useRef } from 'react';
import {getArtifacts, getArtifact} from '../services/s-monitoring-configure'
import MonitoringConfigureDetails from "./monitoring-configure-details"
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
export default function MonitoringPage() {
    const [artifacts, setArtifacts] = useState([])
    const [loading, setLoading] = useState(false);
    const [loadArtifactDetails, setLoadArtifactDetails] = useState(false);
    const [lazyArtifacts, setLazyArtifacts] = useState(null);
    const [currentItemID, setCurrentItemID] = useState(0)
    const [currentArtifact, setCurrentArtifact] = useState(null)
    const [currentArtifactID, setCurrentArtifactID] = useState(null)
    const [packageName, setPackageName] = useState(null)
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
    useEffect(()=>{
        setLoading(true)
        getArtifacts().then((res)=>{
            setLoading(false)
            setArtifacts(res.data.obj)
            
        })
    },[])
    const loadArtifact = (iflow) => {
        setCurrentArtifact(iflow)
        setCurrentArtifactID(iflow.Id)
        
        setLoadArtifactDetails(true)
    }
    const handleItemToggle = (e) => {
        setLoading(true)
        setLazyArtifacts([])
        setCurrentItemID(e.currentTarget.dataset.id)
        setPackageName(e.currentTarget.dataset.name)
        getArtifact(e.currentTarget.dataset.id).then((res)=>{
            let listOfChildren = []
            for(const iflow of res.data.obj){
                listOfChildren.push(<TableRow>
                    <TableCell style={{width:"80%"}}>
                      <span>
                        {iflow.Name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span>
                        {iflow.Version}
                      </span>
                    </TableCell>
                    <TableCell>
                        <Button design="Transparent" icon="slim-arrow-right" ui5-button="" icon-only="" has-icon="" onClick={() => loadArtifact(iflow)}></Button>
                        {/* <Icon name="navigation-right-arrow" onClick={props.onClick} style={{border:"none"}}/> */}
                    </TableCell>
                  </TableRow>)
            }
            
            setTimeout(() => {
                setLoading(false)
                setLazyArtifacts(listOfChildren)
            }, 2000);
            
        })
    };
    return (
        <div style={{ display: 'flex',flexDirection: "column", justifyContent: "stretch", alignItems: "stretch",width:"100%" }}>
            {artifacts.map((artifact) => {
                return (
                    <motion.div style={{flex:"1 1 auto"}}
                        variants={wrapperVariants}
                        initial="visible"
                        animate={!loadArtifactDetails ? 'visible' : 'hidden'}
                        exit="exit">
                        <Panel collapsed={artifact.Id !== currentItemID} data-id={artifact.Id} data-name={artifact.PackageName}
                            accessibleRole="Form" style={{marginBottom:"3px",width: '100%'}}
                            headerLevel="H2" 
                            headerText={artifact.PackageName}
                            onToggle={handleItemToggle}>
                        
                            {artifact.Id === currentItemID ? 
                            <BusyIndicator active={loading} style={{width:"100%"}} size="Medium">
                                <Table
                                    columns={<><TableColumn style={{width: '80%'}}><span>Artifact Name</span></TableColumn><TableColumn minWidth={800} popinText="Supplier"><span>Version</span></TableColumn><TableColumn style={{width:"40px"}}></TableColumn></>}
                                    onLoadMore={function _a(){}}
                                    onPopinChange={function _a(){}}
                                    onRowClick={function _a(){}}
                                    onSelectionChange={function _a(){}}>
                                    {lazyArtifacts}
                                </Table>
                            </BusyIndicator>:[]}
                        </Panel>
                </motion.div>)
            })}
            <motion.div style={{flex:"1 1 auto", height:"100%"}}
                        variants={wrapperVariants}
                        initial="visible"
                        animate={loadArtifactDetails ? 'visible' : 'hidden'}
                        exit="exit">
                {loadArtifactDetails && currentArtifact.Id === currentArtifactID?<MonitoringConfigureDetails style={{flex:"1 1 auto",height:"100%"}} iflow={currentArtifact} packagename={packageName} onClick={() => setLoadArtifactDetails(!loadArtifactDetails)} ></MonitoringConfigureDetails>:""}
                {/* {loadArtifactDetails && currentArtifact.Id === currentArtifactID?<IflowConfigure style={{flex:"1 1 auto",height:"100%"}} iflow={currentArtifact}></IflowConfigure>:""} */}
            </motion.div>
        </div>
    );
}