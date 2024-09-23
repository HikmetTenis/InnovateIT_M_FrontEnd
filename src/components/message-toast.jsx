import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Toast} from '@ui5/webcomponents-react';
import React, { useContext,useState,useEffect } from 'react';
import MessageContext from "../helpers/message-context";
function MessageToastComponent(){
    const {message, setMessage} = useContext(MessageContext)
    const [showToast, setShowToast] = useState(false);
    useEffect(()=>{
        if(message.toast){
            setMessage(({open:false,toastMessage:message.toastMessage,result:null, callback:null, toast:false}))
            setShowToast(true);
            
        }
    },[message.toast]);
    return (
        <>
        <Toast open={showToast} duration={5000} placement="BottomCenter">{message.toastMessage}</Toast>
        </>
    );
  };
  export default MessageToastComponent;
  