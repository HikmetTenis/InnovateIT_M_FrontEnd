import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Panel,DynamicSideContent, FlexBox} from '@ui5/webcomponents-react';
import MonitoringPageTiles from "./monitoring-page-tiles";

export default function MonitoringPage() {
   
    return (
        <DynamicSideContent className='monitoring-content' hideSideContent="true">
                <div className="monitoring-panel-content">
                    <MonitoringPageTiles style={{width:"100%", height:"100%"}}/>
                </div>
        </DynamicSideContent>
            
    );
}