import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Toolbar,Switch, Label, BusyIndicator, FlexBox} from '@ui5/webcomponents-react';
import React, { useEffect, useState,useRef } from 'react';


export default function IntegrationNetwork(props) {
    const [loading, setLoading] = useState(false);
    
       
      return (
        <BusyIndicator active={loading} style={{width:"100%", height:"100%"}} size="Medium">
           
        </BusyIndicator>
      );
}