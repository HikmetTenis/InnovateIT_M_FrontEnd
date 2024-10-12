import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Panel,DynamicSideContent, FlexBox} from '@ui5/webcomponents-react';
import MonitoringPageDetails from "./monitoring-tile-details";

export default function MonitoringPage() {
   
    return (
        // <DynamicSideContent className='monitoring-content' hideSideContent="true" >
                    <MonitoringPageDetails  style={{width:"100%", height:"100%"}} className="monitoring-details" />

        // </DynamicSideContent>
            
    );
}