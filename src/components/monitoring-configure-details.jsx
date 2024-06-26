import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { DynamicPage, DynamicPageHeader,FlexBox,Bar,Label,DynamicPageTitle,Badge,Title,Breadcrumbs,MessageStrip,BreadcrumbsItem,ObjectStatus,Button} from '@ui5/webcomponents-react';
import React, { useEffect, useState,useRef } from 'react';
import {getArtifactRuntimeDetails} from '../services/s-monitoring-configure'
import IflowConfigure from "./iflow-configure";

export default function MonitoringConfigureDetails(props) {
    const [artifactRuntimeDetails, setArtifactRuntimeDetails] = useState({})
    useEffect(() => {
        getArtifactRuntimeDetails(props.iflow.Id).then((data)=>{
            const res = data.data.obj
            const respValue = {"DeployedOn":res.d.DeployedOn, "DeployedBy":res.d.DeployedBy, "Status":res.d.Status}
            setArtifactRuntimeDetails(respValue);
        })
    })
    return (
        <FlexBox direction="Column" alignItems="Start" fitContainer="true">
            <Bar design="Header">
                <Button design="Transparent" icon="slim-arrow-left" slot="startContent" ui5-button="" icon-only="" has-icon="" onClick={props.onClick}>Back</Button>
            </Bar>
            <DynamicPage headerContent={
                <DynamicPageHeader>
                    <FlexBox wrap="Wrap">
                        <FlexBox direction="Column">
                            <Label>Version: {props.iflow.Version}</Label>
                            <Label>Deployed Date: {artifactRuntimeDetails.DeployedOn}</Label>
                            <Label>Deployed By: {artifactRuntimeDetails.DeployedBy}</Label>
                        </FlexBox>
                        <span style={{width: '1rem'}} />
                        {/* <FlexBox direction="Column">
                            <Label>Availability:</Label>
                            <ObjectStatus state="Success">In Stock</ObjectStatus>
                        </FlexBox> */}
                    </FlexBox>
                </DynamicPageHeader>}
                headerTitle={
                    <DynamicPageTitle 
                        // <><Button design="Emphasized">Edit</Button>
                        // <Button design="Transparent">Delete</Button>
                        // <Button design="Transparent">Copy</Button>
                        // <Button design="Transparent" icon="action"/></>
                     
                // breadcrumbs={
                //     <Breadcrumbs>
                //         <BreadcrumbsItem>Home</BreadcrumbsItem>
                //         <BreadcrumbsItem>Page 1</BreadcrumbsItem>
                //         <BreadcrumbsItem>Page 2</BreadcrumbsItem>
                //         <BreadcrumbsItem>Page 3</BreadcrumbsItem>
                //     </Breadcrumbs>} 
                expandedContent={
                    <MessageStrip>Information (only visible if header content is expanded)</MessageStrip>} 
                header={
                    <Title>{props.iflow.Name}</Title>} 
                // navigationActions={<>
                //     <Button design="Transparent" icon="full-screen"/>
                //     <Button design="Transparent" icon="exit-full-screen"/>
                //     <Button design="Transparent" icon="decline"/></>} 
                snappedContent={
                    <MessageStrip>Information (only visible if header content is collapsed/snapped)</MessageStrip>} 
                subHeader={
                    <Label>Package Name: {props.packagename}</Label>}>
                <Badge>Status: {artifactRuntimeDetails.Status}</Badge>
            </DynamicPageTitle>}
                onPinnedStateChange={function _a(){}}
                onToggleHeaderContent={function _a(){}}
                style={{
                    maxHeight: '700px'
                }}>
                    <FlexBox direction="Column" alignItems="Start" fitContainer="true">
                        {<IflowConfigure style={{flex:"1 1 auto",height:"100%"}} iflow={props.iflow}></IflowConfigure>}
                    </FlexBox>
            </DynamicPage>
        </FlexBox>
    )
}