import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Panel,DynamicSideContent} from '@ui5/webcomponents-react';
import React, { useState } from 'react';
import MonitoringPageTiles from "./monitoring-page-tiles";
export default function MonitoringPage() {
   
    return (
        <DynamicSideContent className='monitoring-content' hideSideContent="true">
                <div className="monitoring-panel-content">
                    <MonitoringPageTiles />
                </div>
        </DynamicSideContent>
    );
}