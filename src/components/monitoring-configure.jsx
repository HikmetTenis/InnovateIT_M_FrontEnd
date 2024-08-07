import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { DynamicPage, DynamicPageHeader,FlexBox,BusyIndicator,Bar,Dialog,Form, Panel,FormGroup, ToolbarButton,ActionSheet,FormItem,Label,DynamicPageTitle,Title,Badge,Toolbar,MessageStrip,Button,ObjectPage,ObjectPageSection, ObjectPageSubSection, Switch,Icon,Input,Table,TableColumn, TableRow,TableCell} from '@ui5/webcomponents-react';
import React, { useEffect, useState,useRef } from 'react';
import {getPackages, getArtifacts} from '../services/s-monitoring-configure'
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
        getPackages().then((res)=>{
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
        getArtifacts(e.currentTarget.dataset.id).then((res)=>{
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
        <FlexBox direction="row" alignItems="Stretch" fitContainer="true">
            <motion.div style={{flex:"1 1 auto"}}
                                variants={wrapperVariants}
                                initial="visible"
                                animate={!loadArtifactDetails ? 'visible' : 'hidden'}
                                exit="exit">
                <ObjectPage className="packages"
                    headerTitle={
                        <DynamicPageTitle 
                            actions={
                                <motion.div style={{flex:"1 1 auto", height:"100%", display:"flex", flexDirection:"row"}}
                                    variants={wrapperVariants}
                                    initial="visible"
                                    animate={!loading ? 'visible' : 'hidden'}
                                    exit="exit">
                                    <Button design="Transparent" icon="refresh"/>
                                </motion.div>}
                             
                            header={<FlexBox direction="Column" alignItems="Start" fitContainer="true" style={{marginTop:"10px"}}>
                                        <FlexBox direction="row" alignItems="Center" fitContainer="true">
                                            <Icon name="database" mode="decorative" style={{height:"35px", width:"35px", marginRight:"10px",borderLeft:"none"}}/>
                                            <Title style={{fontSize: 'var(--sapObjectHeader_Title_FontSize)'}}>Packages</Title>
                                        </FlexBox>
                                        <Label style={{marginTop:"10px",marginLeft:"45px"}}>List of Packages</Label>
                                    </FlexBox>}
                             
                            
                            snappedContent>
                           
                        </DynamicPageTitle>}
                    
                    onBeforeNavigate={function _a(){}}
                    onPinnedStateChange={function _a(){}}
                    onSelectedSectionChange={function _a(){}}
                    onToggleHeaderContent={function _a(){}}
                              
                    style={{height: '100%',borderRadius:"10px"}}>
                    {artifacts.map((artifact) => {
                        return(
                            <Panel collapsed={artifact.Id !== currentItemID} data-id={artifact.Id} data-name={artifact.PackageName}
                                accessibleRole="Form" style={{marginBottom:"3px",width: '100%'}}
                                headerLevel="H2" 
                                header={<FlexBox direction="row" alignItems="Center"><Icon name="database" mode="decorative" style={{marginRight:"5px",borderLeft:"none"}}/>{artifact.PackageName}</FlexBox>}
                                onToggle={handleItemToggle}>
                            
                                {artifact.Id === currentItemID ? 
                                <BusyIndicator active={loading} style={{width:"100%"}} size="Medium">
                                    <Table
                                        columns={<><TableColumn style={{width: '80%'}}><span>Artifact Name</span></TableColumn><TableColumn minWidth={800} popinText="Supplier"><span>Version</span></TableColumn><TableColumn style={{width:"40px"}}><Button data-id={artifact.Id} data-name={artifact.PackageName} design="Transparent" onClick={(e) => handleItemToggle(e)} icon="refresh"/></TableColumn></>}
                                        onLoadMore={function _a(){}}
                                        onPopinChange={function _a(){}}
                                        onRowClick={function _a(){}}
                                        onSelectionChange={function _a(){}}>
                                        {lazyArtifacts}
                                    </Table>
                                </BusyIndicator>:[]}
                            </Panel>)
                    })}
                </ObjectPage>
            </motion.div>
            <motion.div style={{flex:"1 1 auto", height:"100%"}}
                        variants={wrapperVariants}
                        initial="visible"
                        animate={loadArtifactDetails ? 'visible' : 'hidden'}
                        exit="exit">
                {loadArtifactDetails && currentArtifact.Id === currentArtifactID?<MonitoringConfigureDetails style={{flex:"1 1 auto",height:"100%"}} iflow={currentArtifact} packagename={packageName} onClick={() => setLoadArtifactDetails(!loadArtifactDetails)} ></MonitoringConfigureDetails>:""}
                {/* {loadArtifactDetails && currentArtifact.Id === currentArtifactID?<IflowConfigure style={{flex:"1 1 auto",height:"100%"}} iflow={currentArtifact}></IflowConfigure>:""} */}
            </motion.div>
        </FlexBox>
        
    );
}