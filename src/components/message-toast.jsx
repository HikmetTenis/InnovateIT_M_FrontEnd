import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Toast} from '@ui5/webcomponents-react';
import React, { useContext,useRef,useEffect } from 'react';
import MessageContext from "../helpers/message-context";
function MessageToastComponent(){
    const {message, setMessage} = useContext(MessageContext)
    const toast = useRef(null);
    useEffect(()=>{
        if(message.toast){
            setMessage(({open:false,toastMessage:message.toastMessage,result:null, callback:null, toast:false}))
            toast.current.show();
            
        }
    },[message.toast]);
    return (
        <>
        <Toast ref={toast} duration={5000} placement="BottomCenter">{message.toastMessage}</Toast>
        </>
    );
  };
  export default MessageToastComponent;
  