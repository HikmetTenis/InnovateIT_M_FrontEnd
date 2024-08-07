import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { MessageBox, MessageBoxActions} from '@ui5/webcomponents-react';
import React, { useContext } from 'react';
import MessageContext from "../helpers/message-context";
import { motion} from "framer-motion"
function MessageBoxComponent(){
    const {message, setMessage} = useContext(MessageContext)
    const handleClose = (event) => {
        if (event.detail.action === MessageBoxActions.OK) {
            message.callback(MessageBoxActions.OK)
            setMessage({open:false, message:"", result:null, callback:null})
            
        } else if (event.detail.action === MessageBoxActions.Cancel) {
            //message.callback(MessageBoxActions.Cancel)
            setMessage({open:false, message:"", result:null, callback:null})
        } else {
          // do something on "Cancel" or "Abort" button click
        }
    }
    const wrapperVariants = {
        hidden: {
          opacity: 0,
          //x: '-5vw',
          transition: { ease: 'easeInOut', delay: 0.3 },
          //display: "block"
        },
        visible: {
          opacity: 1,
          //x: 0,
          transition: {
            duration: 0.2,
            delay: 0.1,
            ease: 'easeInOut'
          },
          //display: "block"
        },
        exit: {
          //x: '-5vh',
          opacity: 0,
          transition: { ease: 'easeInOut' },
        },
    };
    return (
        <motion.div 
                    variants={wrapperVariants}
                    initial="hidden"
                    animate={message.open ? 'visible' : 'hidden'}
                    exit="exit">
            <>
                <MessageBox open={message.open} onClose={handleClose} actions={[MessageBoxActions.OK, MessageBoxActions.Cancel]}>
                {message.message}
                </MessageBox>
            </>
        </motion.div>
    );
  };
  export default MessageBoxComponent;
  